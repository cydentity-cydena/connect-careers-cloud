import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Download, Upload, FileText, Star, X, Trash2, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import AddCandidateToPipeline from "@/components/admin/AddCandidateToPipeline";
import Navigation from "@/components/Navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { BadgesRow, BadgeItem } from "@/components/hrready/BadgesRow";
import { VerificationPanel } from "@/components/hrready/VerificationPanel";
import { EditVerificationDrawer } from "@/components/hrready/EditVerificationDrawer";

interface PipelineCandidate {
  id: string;
  candidate_id: string;
  stage: string;
  source: string | null;
  desired_role: string | null;
  sla_due_at: string | null;
  is_priority: boolean;
  is_founding_20: boolean;
  staff_notes: string | null;
  moved_to_stage_at: string;
  cv_url: string | null;
  compliance_score: number | null;
  profiles: {
    full_name: string;
    username?: string;
    email: string;
    avatar_url: string | null;
  };
  verification?: {
    hr_ready: boolean;
    identity_status: string | null;
    rtw_status: string | null;
    logistics_status: string | null;
    certifications: any;
    compliance_score: number;
  };
  candidate_profile?: {
    resume_url: string | null;
  };
}

interface Stage {
  name: string;
  position: number;
  color: string;
}

const STAGES: Stage[] = [
  { name: "invited", position: 1, color: "bg-muted" },
  { name: "applied", position: 2, color: "bg-primary/20" },
  { name: "needs_info", position: 3, color: "bg-yellow-500/20" },
  { name: "verified", position: 4, color: "bg-green-500/20" },
  { name: "published", position: 5, color: "bg-purple-500/20" },
  { name: "rejected", position: 6, color: "bg-red-500/20" },
];

const formatStageName = (stage: string) => {
  return stage.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function StaffFunnel() {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<PipelineCandidate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [uploadingCandidateId, setUploadingCandidateId] = useState<string | null>(null);
  const [viewingResumeUrl, setViewingResumeUrl] = useState<string | null>(null);
  const [viewingCandidateName, setViewingCandidateName] = useState<string>("");
  const [deletingCandidateId, setDeletingCandidateId] = useState<string | null>(null);
  const [hrReadyFilter, setHrReadyFilter] = useState<boolean | null>(null);
  const [rtwFilter, setRtwFilter] = useState<string>("all");
  const [editingVerification, setEditingVerification] = useState<{ candidateId: string; verification: any } | null>(null);
  const [viewingVerification, setViewingVerification] = useState<{ candidateId: string; verification: any } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      // Fetch from candidate_pipeline (existing candidates with profiles)
      const { data: pipelineData, error: pipelineError } = await supabase
        .from("candidate_pipeline")
        .select(`
          *,
          profiles!candidate_pipeline_candidate_id_fkey (
            full_name,
            username,
            email,
            avatar_url
          )
        `)
        .order("moved_to_stage_at", { ascending: false });

      if (pipelineError) throw pipelineError;

      // Fetch from pipeline_candidates (Founding 20 applications without profiles)
      const { data: applicationsData, error: applicationsError } = await supabase
        .from("pipeline_candidates")
        .select("*")
        .order("created_at", { ascending: false });

      if (applicationsError) throw applicationsError;

      // Transform pipeline_candidates to match the structure
      const transformedApplications = (applicationsData || []).map(app => ({
        id: app.id,
        candidate_id: app.profile_id || app.id, // Use profile_id if exists, otherwise use id
        stage: app.stage,
        source: app.application_source,
        desired_role: app.current_title,
        sla_due_at: null,
        is_priority: app.is_priority || false,
        is_founding_20: app.is_founding_20 || false,
        staff_notes: app.notes,
        moved_to_stage_at: app.updated_at || app.created_at,
        cv_url: app.cv_url,
        compliance_score: null,
        source_table: 'pipeline_candidates', // Track which table this came from
        profiles: {
          full_name: app.full_name,
          username: null, // Pipeline candidates don't have usernames yet
          email: app.email,
          avatar_url: null
        }
      }));

      // Add source_table to existing pipeline data
      const pipelineWithSource = (pipelineData || []).map(item => ({
        ...item,
        source_table: 'candidate_pipeline'
      }));

      // Merge both datasets
      const allCandidates = [...pipelineWithSource, ...transformedApplications];

      // Fetch candidate_profiles for primary CV (resume_url)
      const candidateIds = allCandidates.map(c => c.candidate_id).filter(Boolean);
      const { data: candidateProfiles } = await supabase
        .from("candidate_profiles")
        .select("user_id, resume_url")
        .in("user_id", candidateIds);

      const profilesMap = new Map(
        (candidateProfiles || []).map(cp => [cp.user_id, cp])
      );

      // Fetch verification data for each candidate
      const candidatesWithVerification = await Promise.all(
        allCandidates.map(async (candidate) => {
          const { data: verification } = await supabase
            .from("candidate_verifications")
            .select("*")
            .eq("candidate_id", candidate.candidate_id)
            .maybeSingle();
          
          return { 
            ...candidate, 
            verification,
            candidate_profile: profilesMap.get(candidate.candidate_id) || null
          };
        })
      );

      setCandidates(candidatesWithVerification);
    } catch (error: any) {
      toast({
        title: "Error loading candidates",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCVUpload = async (file: File) => {
    if (!uploadingCandidateId) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uploadingCandidateId}-${Date.now()}.${fileExt}`;
      const filePath = `pipeline-cvs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Find which table this candidate is from
      const candidate = candidates.find(c => c.id === uploadingCandidateId);
      const tableName = (candidate as any)?.source_table || 'candidate_pipeline';

      // Store the file path (not public URL) in the database
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ cv_url: filePath })
        .eq('id', uploadingCandidateId);

      if (updateError) throw updateError;

      toast({
        title: "CV uploaded",
        description: "Resume uploaded successfully",
      });

      fetchCandidates();
      setUploadingCandidateId(null);
    } catch (error: any) {
      toast({
        title: "Error uploading CV",
        description: error.message,
        variant: "destructive",
      });
      setUploadingCandidateId(null);
    }
  };

  const triggerFileUpload = (candidateId: string) => {
    setUploadingCandidateId(candidateId);
    fileInputRef.current?.click();
  };

  const handleViewCV = async (cvPath: string, candidateName: string) => {
    try {
      // Normalize to storage path if a full public URL was stored previously
      const derivePath = (value: string) => {
        try {
          if (value.startsWith("http")) {
            const url = new URL(value);
            const match = url.pathname.match(/\/object\/(?:public|sign)\/resumes\/(.*)$/);
            if (match?.[1]) return match[1];
          }
        } catch {}
        return value;
      };

      const filePath = derivePath(cvPath);

      // Generate a signed URL for secure access
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error || !data?.signedUrl) throw error || new Error("Unable to generate signed URL");
      
      // Force the PDF to fill the viewer width
      const signed = data.signedUrl;
      const separator = signed.includes('#') ? '&' : '#';
      const zoomUrl = `${signed}${separator}zoom=page-width`;
      setViewingResumeUrl(zoomUrl);
      setViewingCandidateName(candidateName);
    } catch (error: any) {
      toast({
        title: "Error loading CV",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleChosen = async (candidateId: string, currentValue: boolean) => {
    try {
      const candidate = candidates.find(c => c.id === candidateId);
      const tableName = (candidate as any)?.source_table || 'candidate_pipeline';
      
      const { error } = await supabase
        .from(tableName)
        .update({ is_founding_20: !currentValue })
        .eq('id', candidateId);

      if (error) throw error;

      toast({
        title: currentValue ? "Removed from Chosen" : "Added to Chosen",
        description: currentValue ? "Candidate unmarked" : "Candidate marked as chosen",
      });

      fetchCandidates();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const togglePriority = async (candidateId: string, currentValue: boolean) => {
    try {
      const candidate = candidates.find(c => c.id === candidateId);
      const tableName = (candidate as any)?.source_table || 'candidate_pipeline';
      
      const { error } = await supabase
        .from(tableName)
        .update({ is_priority: !currentValue })
        .eq('id', candidateId);

      if (error) throw error;

      toast({
        title: currentValue ? "Priority removed" : "Priority added",
        description: currentValue ? "Candidate unmarked as priority" : "Candidate marked as priority",
      });

      fetchCandidates();
    } catch (error: any) {
      toast({
        title: "Error updating priority",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStageChange = async (candidateId: string, newStage: string) => {
    const candidateToMove = candidates.find((c) => c.id === candidateId);
    if (!candidateToMove) return;
    
    // Optimistically update UI
    setCandidates(prevCandidates =>
      prevCandidates.map(c =>
        c.id === candidateId
          ? { ...c, stage: newStage, moved_to_stage_at: new Date().toISOString() }
          : c
      )
    );

    try {
      // Update the correct table based on source
      const tableName = (candidateToMove as any).source_table || 'candidate_pipeline';
      
      const { error } = await supabase
        .from(tableName)
        .update({
          stage: newStage,
          ...(tableName === 'candidate_pipeline' 
            ? { moved_to_stage_at: new Date().toISOString() }
            : { updated_at: new Date().toISOString() }
          )
        })
        .eq("id", candidateId);

      if (error) throw error;

      // Insert stage history only for candidate_pipeline
      if (tableName === 'candidate_pipeline') {
        await supabase.from("pipeline_stage_history").insert({
          pipeline_id: candidateId,
          from_stage: candidateToMove.stage,
          to_stage: newStage,
          moved_by: (await supabase.auth.getUser()).data.user?.id,
        });
      }

      toast({
        title: "Application Updated",
        description: `Moved existing application to ${formatStageName(newStage)}`,
      });

      // Refresh to ensure consistency
      fetchCandidates();
    } catch (error: any) {
      // Revert optimistic update on error
      setCandidates(prevCandidates =>
        prevCandidates.map(c =>
          c.id === candidateId
            ? candidateToMove
            : c
        )
      );
      
      toast({
        title: "Error updating stage",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      const candidateToDelete = candidates.find(c => c.id === candidateId);
      const tableName = (candidateToDelete as any)?.source_table || 'candidate_pipeline';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", candidateId);

      if (error) throw error;

      toast({
        title: "Candidate deleted",
        description: "Candidate removed from pipeline",
      });

      fetchCandidates();
      setDeletingCandidateId(null);
    } catch (error: any) {
      toast({
        title: "Error deleting candidate",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      !searchQuery ||
      candidate.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.desired_role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchQuery.toLowerCase().includes('has:hr_ready') && candidate.verification?.hr_ready ||
      searchQuery.toLowerCase().includes('rtw:green') && candidate.verification?.rtw_status === 'green';

    const matchesRole = roleFilter === "all" || candidate.desired_role === roleFilter;
    const matchesSource = sourceFilter === "all" || candidate.source === sourceFilter;
    const matchesHrReady = hrReadyFilter === null || candidate.verification?.hr_ready === hrReadyFilter;
    const matchesRtw = rtwFilter === "all" || candidate.verification?.rtw_status === rtwFilter;

    return matchesSearch && matchesRole && matchesSource && matchesHrReady && matchesRtw;
  });

  const getCandidatesByStage = (stage: string) => {
    return filteredCandidates.filter((c) => c.stage === stage);
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Name", "Username", "Email", "Stage", "Role", "Source", "Priority", "Chosen", "SLA Due"],
      ...filteredCandidates.map((c) => [
        c.profiles?.full_name || "",
        c.profiles?.username || "",
        c.profiles?.email || "",
        c.stage,
        c.desired_role || "",
        c.source || "",
        c.is_priority ? "Yes" : "No",
        c.is_founding_20 ? "Chosen" : "No",
        c.sla_due_at ? format(new Date(c.sla_due_at), "yyyy-MM-dd") : "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff-funnel-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background p-3 sm:p-6 overflow-x-hidden">
        <div className="w-full space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Funnel Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          {STAGES.map((stage) => {
            const count = getCandidatesByStage(stage.name).length;
            return (
              <Card key={stage.name} className="p-4">
                <div className="text-sm text-muted-foreground">{formatStageName(stage.name)}</div>
                <div className="text-2xl font-bold mt-1">{count}</div>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={hrReadyFilter === null ? "all" : hrReadyFilter.toString()} onValueChange={(v) => setHrReadyFilter(v === "all" ? null : v === "true")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="HR-Ready Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Candidates</SelectItem>
                <SelectItem value="true">✓ HR-Ready</SelectItem>
                <SelectItem value="false">Not HR-Ready</SelectItem>
              </SelectContent>
            </Select>
            <Select value={rtwFilter} onValueChange={setRtwFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="RTW Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All RTW</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="amber">Amber</SelectItem>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="grey">Not Checked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="SOC / DFIR">SOC / DFIR</SelectItem>
                <SelectItem value="GRC / ISO">GRC / ISO</SelectItem>
                <SelectItem value="Cloud Sec">Cloud Sec</SelectItem>
                <SelectItem value="AppSec">AppSec</SelectItem>
                <SelectItem value="Pen Testing">Pen Testing</SelectItem>
                <SelectItem value="Security Engineer">Security Engineer</SelectItem>
                <SelectItem value="Threat Intel">Threat Intel</SelectItem>
                <SelectItem value="Risk Management">Risk Management</SelectItem>
                <SelectItem value="Security Architect">Security Architect</SelectItem>
                <SelectItem value="Incident Response">Incident Response</SelectItem>
                <SelectItem value="Vuln Management">Vuln Management</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Community">Community</SelectItem>
                <SelectItem value="Academy">Academy</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={exportToCSV}>
              <Download className="h-4 w-4" />
            </Button>
            <AddCandidateToPipeline onSuccess={fetchCandidates} />
          </div>
        </Card>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleCVUpload(file);
            e.target.value = ''; // Reset input
          }}
        />

        {/* Resume Viewer Dialog */}
        <Dialog open={!!viewingResumeUrl} onOpenChange={(open) => !open && setViewingResumeUrl(null)}>
          <DialogContent className="max-w-none w-screen h-screen p-0 sm:rounded-none flex flex-col">
            <DialogHeader className="px-4 py-3 border-b">
              <DialogTitle>{viewingCandidateName} - Resume</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              {viewingResumeUrl && (
                <iframe
                  src={viewingResumeUrl}
                  className="w-full h-full border-0"
                  title="Resume Viewer"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingCandidateId} onOpenChange={(open) => !open && setDeletingCandidateId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete this candidate from the pipeline? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingCandidateId && handleDeleteCandidate(deletingCandidateId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* HR-Ready Pool - Curated Candidates */}
        {filteredCandidates.filter(c => c.stage === 'published' && c.verification?.hr_ready).length > 0 && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">HR-Ready Pool</h2>
                  <p className="text-sm text-muted-foreground">Curated candidates verified and ready for interviews</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-600 text-white text-lg px-4 py-1">
                {filteredCandidates.filter(c => c.stage === 'published' && c.verification?.hr_ready).length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCandidates
                .filter(c => c.stage === 'published' && c.verification?.hr_ready)
                .map((candidate) => {
                  const badgeItems: BadgeItem[] = [
                    {
                      label: 'ID',
                      status: (candidate.verification?.identity_status as any) || 'grey',
                      tooltip: candidate.verification?.identity_status 
                        ? `Identity: ${candidate.verification.identity_status}` 
                        : 'Identity not verified'
                    },
                    {
                      label: 'Cert',
                      status: (() => {
                        if (!candidate.verification?.certifications) return 'grey';
                        const certs = candidate.verification.certifications;
                        const certArray = typeof certs === 'string' ? JSON.parse(certs) : certs;
                        if (!Array.isArray(certArray) || certArray.length === 0) return 'grey';
                        const hasGreen = certArray.some((c: any) => c.status === 'green');
                        const hasAmber = certArray.some((c: any) => c.status === 'amber');
                        const hasRed = certArray.some((c: any) => c.status === 'red');
                        if (hasGreen) return 'green';
                        if (hasAmber) return 'amber';
                        if (hasRed) return 'red';
                        return 'grey';
                      })() as any,
                      tooltip: 'Certifications verified'
                    },
                    {
                      label: 'RTW',
                      status: (candidate.verification?.rtw_status as any) || 'grey',
                      tooltip: candidate.verification?.rtw_status 
                        ? `Right to Work: ${candidate.verification.rtw_status}` 
                        : 'RTW not verified'
                    },
                    {
                      label: 'Logistics',
                      status: (candidate.verification?.logistics_status as any) || 'grey',
                      tooltip: candidate.verification?.logistics_status 
                        ? `Logistics: ${candidate.verification.logistics_status}` 
                        : 'Logistics not confirmed'
                    }
                  ];

                  return (
                    <Card key={candidate.id} className="p-4 hover:shadow-lg transition-shadow border-green-500/20">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {candidate.profiles.full_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            {(candidate.profiles as any).username ? (
                              <Link 
                                to={`/profiles/${candidate.candidate_id}`}
                                className="block hover:opacity-80 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold truncate hover:text-primary">
                                    {candidate.profiles.full_name}
                                  </h4>
                                  {candidate.is_founding_20 && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                                </div>
                                <div className="text-xs text-primary truncate">@{(candidate.profiles as any).username}</div>
                                {candidate.desired_role && (
                                  <p className="text-xs font-medium text-muted-foreground mt-1">{candidate.desired_role}</p>
                                )}
                              </Link>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold truncate">
                                    {candidate.profiles.full_name}
                                  </h4>
                                  {candidate.is_founding_20 && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">No profile yet</div>
                                {candidate.desired_role && (
                                  <p className="text-xs font-medium text-primary mt-1">{candidate.desired_role}</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      <div className="mb-3">
                        <BadgesRow items={badgeItems} showHrReady />
                      </div>
                      {candidate.compliance_score !== null && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Compliance Score</span>
                            <span className="font-semibold text-green-600">{candidate.compliance_score}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all" 
                              style={{ width: `${candidate.compliance_score}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        {candidate.cv_url ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleViewCV(candidate.cv_url!, candidate.profiles.full_name)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            View CV
                          </Button>
                        ) : candidate.candidate_profile?.resume_url ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleViewCV(candidate.candidate_profile!.resume_url!, candidate.profiles.full_name)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Primary CV
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setEditingVerification({ candidateId: candidate.candidate_id, verification: candidate.verification })}
                        >
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </Card>
        )}

        {/* Kanban Board */}
        <div className="overflow-x-auto pb-4">
          <div className="flex lg:grid lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-3">
          {STAGES.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage.name);
            return (
              <div key={stage.name} className={`rounded-lg border ${stage.color} p-3 sm:p-4 w-[300px] lg:w-auto flex-shrink-0`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{formatStageName(stage.name)}</h3>
                  <Badge variant="secondary">{stageCandidates.length}</Badge>
                </div>
                <div className="space-y-3">
                  {stageCandidates.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-8">No applications</div>
                  ) : stageCandidates.map((candidate) => {
                    // Prepare badge items for HR verification display
                    const badgeItems: BadgeItem[] = [
                      {
                        label: 'ID',
                        status: (candidate.verification?.identity_status as any) || 'grey',
                        tooltip: candidate.verification?.identity_status 
                          ? `Identity: ${candidate.verification.identity_status}` 
                          : 'Identity not verified'
                      },
                      {
                        label: 'Cert',
                        status: (() => {
                          if (!candidate.verification?.certifications) return 'grey';
                          const certs = candidate.verification.certifications;
                          if (Array.isArray(certs) && certs.some((c: any) => c.status === 'green')) return 'green';
                          if (Array.isArray(certs) && certs.some((c: any) => c.status === 'amber')) return 'amber';
                          return 'grey';
                        })() as any,
                        tooltip: 'Certifications status'
                      },
                      {
                        label: 'RTW',
                        status: (candidate.verification?.rtw_status as any) || 'grey',
                        tooltip: candidate.verification?.rtw_status 
                          ? `Right to Work: ${candidate.verification.rtw_status}` 
                          : 'Right to work not verified'
                      },
                      {
                        label: 'Logistics',
                        status: (candidate.verification?.logistics_status as any) || 'grey',
                        tooltip: candidate.verification?.logistics_status 
                          ? `Logistics: ${candidate.verification.logistics_status}` 
                          : 'Logistics not confirmed'
                      }
                    ];

                    return (
                    <Card key={candidate.id} className="p-4 hover:shadow-md transition-shadow w-full">
                      <div className="space-y-3">
                        {/* Header with name and actions */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                            <Button
                              variant={candidate.is_founding_20 ? "default" : "ghost"}
                              size="sm"
                              className="h-7 w-7 p-0 shrink-0"
                              onClick={() => toggleChosen(candidate.id, candidate.is_founding_20)}
                            >
                              <Star className={`h-3.5 w-3.5 ${candidate.is_founding_20 ? 'fill-current' : ''}`} />
                            </Button>
                            <div className="flex-1 min-w-0">
                              {candidate.profiles?.username ? (
                                <Link 
                                  to={`/profiles/${candidate.candidate_id}`}
                                  className="block hover:opacity-80 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="font-semibold text-sm truncate hover:text-primary">
                                    {candidate.profiles?.full_name || "Unknown"}
                                  </div>
                                  <div className="text-xs text-primary truncate">@{candidate.profiles.username}</div>
                                </Link>
                              ) : (
                                <>
                                  <div className="font-semibold text-sm truncate">
                                    {candidate.profiles?.full_name || "Unknown"}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">No profile yet</div>
                                </>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeletingCandidateId(candidate.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        
                        {/* HR-Ready Badges Row */}
                        <BadgesRow items={badgeItems} showHrReady={candidate.verification?.hr_ready} />

                        {/* Role and metadata */}
                        <div className="flex flex-wrap gap-2">
                          {candidate.is_priority && (
                            <Badge 
                              variant="destructive" 
                              className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => togglePriority(candidate.id, candidate.is_priority)}
                            >
                              Priority
                            </Badge>
                          )}
                          {candidate.desired_role && (
                            <Badge variant="outline" className="text-xs">
                              {candidate.desired_role}
                            </Badge>
                          )}
                          {candidate.is_founding_20 && (
                            <Badge variant="default" className="text-xs">Chosen</Badge>
                          )}
                        </div>

                        {candidate.source && (
                          <div className="text-xs text-muted-foreground truncate">
                            Source: {candidate.source}
                          </div>
                        )}
                        
                        {candidate.sla_due_at && (
                          <div className="text-xs text-muted-foreground truncate">
                            Due: {format(new Date(candidate.sla_due_at), "MMM dd")}
                          </div>
                        )}

                        {stage.name === 'verified' && candidate.verification?.hr_ready && (
                          <div className="text-xs text-primary font-medium">✅ Ready to Present</div>
                        )}
                        
                        {/* Actions */}
                        <div className="space-y-2 pt-2 border-t">
                          {candidate.cv_url ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs w-full"
                              onClick={() => handleViewCV(candidate.cv_url!, candidate.profiles?.full_name || "Unknown")}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              View CV
                            </Button>
                          ) : candidate.candidate_profile?.resume_url ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs w-full"
                              onClick={() => handleViewCV(candidate.candidate_profile!.resume_url!, candidate.profiles?.full_name || "Unknown")}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download Primary CV
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs w-full"
                              onClick={() => triggerFileUpload(candidate.id)}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Upload CV
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs w-full"
                            onClick={() => setEditingVerification({ candidateId: candidate.candidate_id, verification: candidate.verification })}
                          >
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Edit Verification
                          </Button>

                          <Select
                            value={candidate.stage}
                            onValueChange={(value) => handleStageChange(candidate.id, value)}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Move to stage..." />
                            </SelectTrigger>
                            <SelectContent>
                              {STAGES.map((s) => (
                                <SelectItem key={s.name} value={s.name}>
                                  {formatStageName(s.name)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  );
                  })}
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Edit Verification Drawer */}
        {editingVerification && (
          <EditVerificationDrawer
            open={!!editingVerification}
            onOpenChange={(open) => !open && setEditingVerification(null)}
            candidateId={editingVerification.candidateId}
            verification={editingVerification.verification}
            onSuccess={fetchCandidates}
          />
        )}
      </div>
    </div>
    </>
  );
}
