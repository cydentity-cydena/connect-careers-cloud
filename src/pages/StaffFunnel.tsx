import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Download, Upload, FileText, Star, X } from "lucide-react";
import { format } from "date-fns";
import AddCandidateToPipeline from "@/components/admin/AddCandidateToPipeline";
import Navigation from "@/components/Navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  profiles: {
    full_name: string;
    email: string;
    avatar_url: string | null;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from("candidate_pipeline")
        .select(`
          *,
          profiles!candidate_pipeline_candidate_id_fkey (
            full_name,
            email,
            avatar_url
          )
        `)
        .order("moved_to_stage_at", { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
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

      // Store the file path (not public URL) in the database
      const { error: updateError } = await supabase
        .from('candidate_pipeline')
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
      // Generate a signed URL for secure access
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(cvPath, 3600); // 1 hour expiry

      if (error) throw error;
      
      setViewingResumeUrl(data.signedUrl);
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
      const { error } = await supabase
        .from('candidate_pipeline')
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
      const { error } = await supabase
        .from('candidate_pipeline')
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
    try {
      const { error } = await supabase
        .from("candidate_pipeline")
        .update({
          stage: newStage,
          moved_to_stage_at: new Date().toISOString(),
        })
        .eq("id", candidateId);

      if (error) throw error;

      // Insert stage history
      await supabase.from("pipeline_stage_history").insert({
        pipeline_id: candidateId,
        from_stage: candidates.find((c) => c.id === candidateId)?.stage,
        to_stage: newStage,
        moved_by: (await supabase.auth.getUser()).data.user?.id,
      });

      toast({
        title: "Stage updated",
        description: "Candidate moved successfully",
      });

      fetchCandidates();
    } catch (error: any) {
      toast({
        title: "Error updating stage",
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
      candidate.desired_role?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || candidate.desired_role === roleFilter;
    const matchesSource = sourceFilter === "all" || candidate.source === sourceFilter;

    return matchesSearch && matchesRole && matchesSource;
  });

  const getCandidatesByStage = (stage: string) => {
    return filteredCandidates.filter((c) => c.stage === stage);
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Name", "Email", "Stage", "Role", "Source", "Priority", "Chosen", "SLA Due"],
      ...filteredCandidates.map((c) => [
        c.profiles?.full_name || "",
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
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Funnel Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-6 gap-4">
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
          <DialogContent className="max-w-5xl h-[90vh]">
            <DialogHeader>
              <DialogTitle>{viewingCandidateName} - Resume</DialogTitle>
            </DialogHeader>
            <div className="flex-1 h-full">
              {viewingResumeUrl && (
                <iframe
                  src={viewingResumeUrl}
                  className="w-full h-full border rounded-lg"
                  title="Resume Viewer"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Kanban Board */}
        <div className="grid grid-cols-5 gap-4">
          {STAGES.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage.name);
            return (
              <div key={stage.name} className={`rounded-lg border ${stage.color} p-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{formatStageName(stage.name)}</h3>
                  <Badge variant="secondary">{stageCandidates.length}</Badge>
                </div>
                <div className="space-y-3">
                  {stageCandidates.map((candidate) => (
                    <Card key={candidate.id} className="p-3 hover:shadow-md transition-shadow">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Button
                              variant={candidate.is_founding_20 ? "default" : "ghost"}
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => toggleChosen(candidate.id, candidate.is_founding_20)}
                            >
                              <Star className={`h-3 w-3 ${candidate.is_founding_20 ? 'fill-current' : ''}`} />
                            </Button>
                            <div className="font-medium text-sm truncate">
                              {candidate.profiles?.full_name || "Unknown"}
                            </div>
                          </div>
                          {candidate.is_priority && (
                            <Badge 
                              variant="destructive" 
                              className="text-xs shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => togglePriority(candidate.id, candidate.is_priority)}
                            >
                              Priority
                            </Badge>
                          )}
                        </div>
                        {candidate.desired_role && (
                          <Badge variant="outline" className="text-xs">
                            {candidate.desired_role}
                          </Badge>
                        )}
                        {candidate.source && (
                          <div className="text-xs text-muted-foreground">
                            Source: {candidate.source}
                          </div>
                        )}
                        {candidate.is_founding_20 && (
                          <Badge variant="default" className="text-xs">Chosen</Badge>
                        )}
                        {candidate.sla_due_at && (
                          <div className="text-xs text-muted-foreground">
                            Due: {format(new Date(candidate.sla_due_at), "MMM dd")}
                          </div>
                        )}
                        
                        {/* CV Upload/View */}
                        <div className="flex gap-2">
                          {candidate.cv_url ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs flex-1"
                              onClick={() => handleViewCV(candidate.cv_url!, candidate.profiles?.full_name || "Unknown")}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              View CV
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs flex-1"
                              onClick={() => triggerFileUpload(candidate.id)}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Upload CV
                            </Button>
                          )}
                        </div>

                        <Select
                          value={candidate.stage}
                          onValueChange={(value) => handleStageChange(candidate.id, value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
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
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}
