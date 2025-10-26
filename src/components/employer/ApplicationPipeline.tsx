import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Clock, UserCheck, FileCheck, XCircle, CheckCircle2, Users, Search, Eye, MessageCircle, GripVertical, Download, Star, StickyNote, Filter, Shield, Award, MapPin, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ApplicationCard } from "./ApplicationCard";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type PipelineStage = "applied" | "screening" | "interview" | "offer" | "rejected" | "hired";

interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
  stage: PipelineStage;
  applied_at: string;
  cover_letter: string | null;
  status_notes: string | null;
  is_starred: boolean;
  candidate_profile: {
    title: string;
    years_experience: number;
  };
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
  job: {
    title: string;
  };
  candidate_verifications?: {
    hr_ready: boolean;
    identity_status: string | null;
    rtw_status: string | null;
    logistics_status: string | null;
    logistics_location: string | null;
    certifications: any;
  } | null;
}

interface UnlockedCandidate {
  id: string;
  candidate_id: string;
  unlocked_at: string;
  profile: {
    full_name: string;
    username: string;
    avatar_url: string | null;
    location?: string | null;
  };
  candidate_profile: {
    title: string;
    years_experience: number;
  };
  candidate_verifications?: {
    hr_ready: boolean;
    identity_status: string | null;
    rtw_status: string | null;
    logistics_status: string | null;
    logistics_location: string | null;
    certifications: any;
  } | null;
}

const stageConfig = {
  applied: {
    title: "Applied",
    icon: Briefcase,
    color: "bg-blue-500",
    textColor: "text-blue-600"
  },
  screening: {
    title: "Screening",
    icon: Clock,
    color: "bg-yellow-500",
    textColor: "text-yellow-600"
  },
  interview: {
    title: "Interview",
    icon: UserCheck,
    color: "bg-purple-500",
    textColor: "text-purple-600"
  },
  offer: {
    title: "Offer",
    icon: FileCheck,
    color: "bg-orange-500",
    textColor: "text-orange-600"
  },
  rejected: {
    title: "Rejected",
    icon: XCircle,
    color: "bg-red-500",
    textColor: "text-red-600"
  },
  hired: {
    title: "Hired",
    icon: CheckCircle2,
    color: "bg-green-500",
    textColor: "text-green-600"
  }
};

export const ApplicationPipeline = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [unlockedCandidates, setUnlockedCandidates] = useState<UnlockedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStarred, setFilterStarred] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ id: string; type: 'application' | 'unlock' } | null>(null);
  const [userRole, setUserRole] = useState<'employer' | 'recruiter' | null>(null);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [notesDialog, setNotesDialog] = useState<{ open: boolean; applicationId: string; currentNotes: string }>({
    open: false,
    applicationId: "",
    currentNotes: ""
  });
  const [messageDialog, setMessageDialog] = useState<{ open: boolean; recipientId: string; recipientName: string }>({
    open: false,
    recipientId: "",
    recipientName: ""
  });
  const [jobSelectDialog, setJobSelectDialog] = useState<{
    open: boolean;
    candidateId: string;
    candidateName: string;
    targetStage: PipelineStage;
  }>({
    open: false,
    candidateId: "",
    candidateName: "",
    targetStage: "applied"
  });

  useEffect(() => {
    checkUserRole();
    fetchData();

    // Subscribe to real-time updates for new applications
    const applicationsChannel = supabase
      .channel('applications_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'applications' 
      }, () => {
        fetchApplications();
      })
      .subscribe();

    // Subscribe to real-time updates for profile unlocks
    const unlocksChannel = supabase
      .channel('unlocks_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'profile_unlocks' 
      }, () => {
        fetchUnlockedCandidates();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(applicationsChannel);
      supabase.removeChannel(unlocksChannel);
    };
  }, [selectedJob]);

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roles?.some(r => r.role === 'recruiter')) {
      setUserRole('recruiter');
    } else {
      setUserRole('employer');
    }
  };

  const fetchData = async () => {
    await Promise.all([fetchJobs(), fetchApplications(), fetchUnlockedCandidates()]);
  };

  const fetchJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let jobsQuery = supabase.from('jobs').select('id, title').eq('is_active', true);
      
      if (userRole === 'recruiter') {
        const { data: clients } = await supabase
          .from('clients')
          .select('id')
          .eq('recruiter_id', user.id);
        
        const clientIds = clients?.map(c => c.id) || [];
        jobsQuery = jobsQuery.in('client_id', clientIds);
      } else {
        jobsQuery = jobsQuery.eq('created_by', user.id);
      }

      const { data, error } = await jobsQuery;
      if (error) throw error;
      
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchUnlockedCandidates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1) Fetch unlock rows (no joins to avoid relationship/FK name issues)
      const { data: unlocks, error: unlocksError } = await supabase
        .from('profile_unlocks')
        .select('id, candidate_id, unlocked_at')
        .eq('employer_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (unlocksError) throw unlocksError;

      const candidateIds = (unlocks || []).map((u: any) => u.candidate_id);
      if (candidateIds.length === 0) {
        setUnlockedCandidates([]);
        return;
      }

      // 2) Fetch profile info, candidate profile info, and verifications in parallel
      const [profilesRes, candidateProfilesRes, verificationsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, location')
          .in('id', candidateIds),
        supabase
          .from('candidate_profiles')
          .select('user_id, title, years_experience')
          .in('user_id', candidateIds),
        supabase
          .from('candidate_verifications')
          .select('*')
          .in('candidate_id', candidateIds),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (candidateProfilesRes.error) throw candidateProfilesRes.error;
      if (verificationsRes.error) throw verificationsRes.error;

      const profiles = profilesRes.data || [];
      const candidateProfiles = candidateProfilesRes.data || [];
      const verifications = verificationsRes.data || [];

      const profileMap = new Map(profiles.map((p: any) => [p.id, p]));
      const candidateProfileMap = new Map(candidateProfiles.map((cp: any) => [cp.user_id, cp]));
      const verificationMap = new Map(verifications.map((v: any) => [v.candidate_id, v]));

      // 3) Merge and filter out candidates that already have applications
      const merged = (unlocks || []).map((u: any) => ({
        id: u.id,
        candidate_id: u.candidate_id,
        unlocked_at: u.unlocked_at,
        profile: profileMap.get(u.candidate_id) || { full_name: 'Unknown', username: '', avatar_url: null, location: null },
        candidate_profile: candidateProfileMap.get(u.candidate_id) || { title: '', years_experience: 0 },
        candidate_verifications: verificationMap.get(u.candidate_id) || null,
      }));

      const candidatesWithoutApps = merged.filter((unlock: any) =>
        !applications.some(app => app.candidate_id === unlock.candidate_id)
      );

      setUnlockedCandidates(candidatesWithoutApps as any);
    } catch (error) {
      console.error('Error fetching unlocked candidates:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get jobs for both employers and recruiters
      let jobsQuery = supabase.from('jobs').select('id, client_id');
      
      if (userRole === 'recruiter') {
        // Get client IDs for this recruiter
        const { data: clients } = await supabase
          .from('clients')
          .select('id')
          .eq('recruiter_id', user.id);
        
        const clientIds = clients?.map(c => c.id) || [];
        jobsQuery = jobsQuery.in('client_id', clientIds);
      } else {
        jobsQuery = jobsQuery.eq('created_by', user.id);
      }

      const { data: employerJobs, error: jobsError } = await jobsQuery;
      if (jobsError) throw jobsError;

      const jobIds = employerJobs?.map(j => j.id) || [];
      
      if (jobIds.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Now fetch applications for those jobs with verifications
      let query = supabase
        .from('applications')
        .select(`
          *,
          candidate_profile:candidate_profiles!candidate_id(
            title,
            years_experience
          ),
          profile:profiles!candidate_id(
            full_name,
            avatar_url
          ),
          job:jobs!job_id(
            title
          )
        `)
        .in('job_id', jobIds)
        .order('applied_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Add is_starred if doesn't exist and fetch verifications
      const applications = (data as any[])?.map(app => ({
        ...app,
        is_starred: app.is_starred ?? false
      })) || [];

      if (selectedJob) {
        // Fetch verifications for filtered candidates
        const candidateIds = applications.map((app: any) => app.candidate_id);
        if (candidateIds.length > 0) {
          const { data: verifications } = await supabase
            .from('candidate_verifications')
            .select('*')
            .in('candidate_id', candidateIds);
          
          const verificationMap = new Map(verifications?.map(v => [v.candidate_id, v]) || []);
          const appsWithVerifications = applications.map((app: any) => ({
            ...app,
            candidate_verifications: verificationMap.get(app.candidate_id) || null
          }));
          setApplications(appsWithVerifications as any);
        } else {
          setApplications(applications as any);
        }
      } else {
        // Fetch verifications for all candidates
        const candidateIds = applications.map((app: any) => app.candidate_id);
        if (candidateIds.length > 0) {
          const { data: verifications } = await supabase
            .from('candidate_verifications')
            .select('*')
            .in('candidate_id', candidateIds);
          
          const verificationMap = new Map(verifications?.map(v => [v.candidate_id, v]) || []);
          const appsWithVerifications = applications.map((app: any) => ({
            ...app,
            candidate_verifications: verificationMap.get(app.candidate_id) || null
          }));
          setApplications(appsWithVerifications as any);
        } else {
          setApplications(applications as any);
        }
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (applicationId: string, newStage: PipelineStage) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ stage: newStage })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, stage: newStage } : app
        )
      );

      toast({
        title: "Success",
        description: `Application moved to ${stageConfig[newStage].title}`,
      });
    } catch (error) {
      console.error('Error updating stage:', error);
      toast({
        title: "Error",
        description: "Failed to update application stage",
        variant: "destructive"
      });
    }
  };

  const handleDragStart = (id: string, type: 'application' | 'unlock') => {
    setDraggedItem({ id, type });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.type === 'application') {
      await handleStageChange(draggedItem.id, targetStage);
    } else if (draggedItem.type === 'unlock') {
      // Moving from Talent Pool - create an application
      const candidate = unlockedCandidates.find(c => c.id === draggedItem.id);
      if (!candidate) return;

      if (!selectedJob) {
        // Show job selection dialog
        setJobSelectDialog({
          open: true,
          candidateId: candidate.candidate_id,
          candidateName: candidate.profile.full_name,
          targetStage
        });
      } else {
        // Create application directly
        await createApplication(candidate.candidate_id, selectedJob, targetStage);
      }
    }
    
    setDraggedItem(null);
  };

  const createApplication = async (candidateId: string, jobId: string, stage: PipelineStage) => {
    try {
      console.log('Creating application:', { candidateId, jobId, stage });
      
      // First, check if an application already exists for this candidate+job
      const { data: existingApp, error: checkError } = await supabase
        .from('applications')
        .select('id, stage')
        .eq('candidate_id', candidateId)
        .eq('job_id', jobId)
        .maybeSingle();

      if (checkError) {
        console.error('Check error:', checkError);
        throw checkError;
      }

      // If application exists, just update its stage
      if (existingApp) {
        await handleStageChange(existingApp.id, stage);
        toast({
          title: "Application Updated",
          description: "Moved existing application to " + stageConfig[stage].title,
        });
        return;
      }
      
      // Create new application if it doesn't exist
      const { data: newApp, error: insertError } = await supabase
        .from('applications')
        .insert({
          candidate_id: candidateId,
          job_id: jobId,
          stage: stage
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('Application inserted:', newApp);

      // Then fetch the related data separately
      const [profileRes, candidateProfileRes, jobRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, avatar_url, location')
          .eq('id', candidateId)
          .single(),
        supabase
          .from('candidate_profiles')
          .select('title, years_experience')
          .eq('user_id', candidateId)
          .single(),
        supabase
          .from('jobs')
          .select('title')
          .eq('id', jobId)
          .single()
      ]);

      // Construct the full application object
      const fullApplication = {
        ...newApp,
        profile: profileRes.data || { full_name: 'Unknown', avatar_url: null, location: null },
        candidate_profile: candidateProfileRes.data || { title: '', years_experience: 0 },
        job: jobRes.data || { title: 'Unknown' }
      };

      console.log('Full application constructed:', fullApplication);

      // Add to applications list
      setApplications(prev => [fullApplication as any, ...prev]);

      // Remove from talent pool
      setUnlockedCandidates(prev => prev.filter(c => c.candidate_id !== candidateId));

      toast({
        title: "Success",
        description: `Candidate added to ${stageConfig[stage].title}`,
      });
    } catch (error: any) {
      console.error('Error creating application:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to add candidate to pipeline",
        variant: "destructive"
      });
    }
  };

  const toggleStar = async (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    const newStarred = !app.is_starred;
    
    // Update locally first for instant feedback
    setApplications(prev =>
      prev.map(a => a.id === applicationId ? { ...a, is_starred: newStarred } : a)
    );

    try {
      const { error } = await supabase
        .from('applications')
        .update({ is_starred: newStarred })
        .eq('id', applicationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling star:', error);
      // Revert on error
      setApplications(prev =>
        prev.map(a => a.id === applicationId ? { ...a, is_starred: app.is_starred } : a)
      );
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive"
      });
    }
  };

  const updateNotes = async (applicationId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status_notes: notes })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app => app.id === applicationId ? { ...app, status_notes: notes } : app)
      );

      toast({
        title: "Success",
        description: "Notes updated successfully"
      });
      setNotesDialog({ open: false, applicationId: "", currentNotes: "" });
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: "Error",
        description: "Failed to update notes",
        variant: "destructive"
      });
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Title", "Years Experience", "Job", "Stage", "Applied Date", "Notes"];
    const rows = applications.map(app => [
      app.profile.full_name,
      app.candidate_profile?.title || "",
      app.candidate_profile?.years_experience?.toString() || "",
      app.job.title,
      app.stage,
      new Date(app.applied_at).toLocaleDateString(),
      app.status_notes || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getApplicationsByStage = (stage: PipelineStage) => {
    return applications.filter(app => {
      const matchesStage = app.stage === stage;
      
      // Advanced search with filters
      let matchesSearch = true;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = app.profile.full_name.toLowerCase().includes(query);
        const jobMatch = app.job.title.toLowerCase().includes(query);
        const roleMatch = app.candidate_profile?.title?.toLowerCase().includes(query);
        
        // Support has:hr_ready filter
        if (query.includes('has:hr_ready')) {
          matchesSearch = app.candidate_verifications?.hr_ready === true;
        } else if (query.includes('rtw:green')) {
          matchesSearch = app.candidate_verifications?.rtw_status === 'verified';
        } else if (query.includes('rtw:amber')) {
          matchesSearch = app.candidate_verifications?.rtw_status === 'pending';
        } else if (query.includes('rtw:red')) {
          matchesSearch = !app.candidate_verifications?.rtw_status || app.candidate_verifications?.rtw_status === 'rejected';
        } else {
          matchesSearch = nameMatch || jobMatch || roleMatch;
        }
      }
      
      // Role filter
      const matchesRole = filterRole === "all" || app.candidate_profile?.title?.toLowerCase().includes(filterRole.toLowerCase());
      
      // Starred filter
      const matchesStarred = !filterStarred || app.is_starred;
      
      return matchesStage && matchesSearch && matchesRole && matchesStarred;
    });
  };

  const getFilteredUnlockedCandidates = () => {
    if (searchQuery === "") return unlockedCandidates;
    return unlockedCandidates.filter(candidate =>
      candidate.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.profile.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.candidate_profile?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading pipeline...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Application Pipeline</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Track candidates through customizable pipeline stages</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search: name, has:hr_ready, rtw:green..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="engineer">Engineer</SelectItem>
                  <SelectItem value="architect">Architect</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedJob || "all"} onValueChange={(value) => setSelectedJob(value === "all" ? null : value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={filterStarred ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStarred(!filterStarred)}
              >
                <Star className={`h-4 w-4 ${filterStarred ? "fill-current" : ""}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1 whitespace-nowrap">
              {applications.length} Applications
            </Badge>
            <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1 border-primary text-primary whitespace-nowrap">
              {unlockedCandidates.length} In Talent Pool
            </Badge>
            {filterStarred && (
              <Badge variant="default" className="text-xs sm:text-sm px-2 sm:px-3 py-1 whitespace-nowrap">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Starred Only
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 overflow-x-auto pb-4">
        <div className="flex gap-4 lg:flex-1">
          {/* Talent Pool Column */}
          <Card className="border-2 border-primary/50 bg-primary/5 min-w-[280px] lg:min-w-0 lg:flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <div className="bg-primary rounded-full p-1.5">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <span className="whitespace-nowrap">Talent Pool</span>
                </div>
                <Badge variant="outline" className="text-primary">
                  {getFilteredUnlockedCandidates().length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[500px] pr-2">
                <div className="space-y-2">
                  {getFilteredUnlockedCandidates().map((candidate) => (
                    <Card 
                      key={candidate.id} 
                      draggable
                      onDragStart={() => handleDragStart(candidate.id, 'unlock')}
                      className="p-3 hover:border-primary/50 transition-all cursor-move overflow-hidden"
                    >
                      <div className="flex items-start gap-2 mb-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={candidate.profile.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {candidate.profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm leading-tight mb-1">{candidate.profile.full_name}</h4>
                          {candidate.candidate_profile?.title && (
                            <p className="text-xs text-muted-foreground line-clamp-1 leading-tight">{candidate.candidate_profile.title}</p>
                          )}
                        </div>
                      </div>

                      {/* Verification Badges */}
                      {candidate.candidate_verifications && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {candidate.candidate_verifications.hr_ready && (
                            <Badge variant="default" className="text-xs px-1.5 py-0.5 bg-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              HR Ready
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            <Shield className={`h-3 w-3 mr-1 ${
                              !candidate.candidate_verifications.identity_status ? "text-red-500" :
                              candidate.candidate_verifications.identity_status === "verified" ? "text-green-500" :
                              candidate.candidate_verifications.identity_status === "pending" ? "text-amber-500" :
                              "text-red-500"
                            }`} />
                            ID
                          </Badge>
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            {(() => {
                              const rtwStatus = candidate.candidate_verifications.rtw_status;
                              const Icon = !rtwStatus ? XCircle :
                                rtwStatus === "verified" ? CheckCircle2 :
                                rtwStatus === "pending" ? AlertCircle : XCircle;
                              const color = !rtwStatus ? "text-red-500" :
                                rtwStatus === "verified" ? "text-green-500" :
                                rtwStatus === "pending" ? "text-amber-500" :
                                "text-red-500";
                              return <Icon className={`h-3 w-3 mr-1 ${color}`} />;
                            })()}
                            RTW
                          </Badge>
                          {candidate.candidate_verifications.certifications && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              <Award className="h-3 w-3 mr-1 text-blue-500" />
                              Cert
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Experience and Location */}
                      <div className="space-y-1.5 mb-3">
                        {candidate.candidate_profile?.years_experience > 0 && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {candidate.candidate_profile.years_experience} yrs
                          </Badge>
                        )}
                        {(candidate.candidate_verifications?.logistics_location || candidate.profile.location) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{candidate.candidate_verifications?.logistics_location || candidate.profile.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1.5 min-w-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 text-xs px-2 min-w-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profiles/${candidate.candidate_id}`);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline truncate">View</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1 h-8 text-xs px-2 min-w-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMessageDialog({
                              open: true,
                              recipientId: candidate.candidate_id,
                              recipientName: candidate.profile.full_name
                            });
                          }}
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline truncate">Message</span>
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {getFilteredUnlockedCandidates().length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      {searchQuery ? "No matching candidates" : "No unlocked candidates yet"}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Pipeline Stages */}
          {(Object.keys(stageConfig) as PipelineStage[]).map((stage) => {
            const config = stageConfig[stage];
            const stageApplications = getApplicationsByStage(stage);
            const Icon = config.icon;

            return (
              <Card 
                key={stage} 
                className="border-2 min-w-[280px] lg:min-w-0 lg:flex-1"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <div className={`${config.color} rounded-full p-1.5`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="whitespace-nowrap">{config.title}</span>
                    </div>
                    <Badge variant="outline" className={config.textColor}>
                      {stageApplications.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ScrollArea className="h-[500px] pr-2" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage)}>
                    <div className="space-y-2">
                      {stageApplications.map((application) => (
                        <div
                          key={application.id}
                          draggable
                          onDragStart={() => handleDragStart(application.id, 'application')}
                          className="cursor-move"
                        >
                          <ApplicationCard
                            application={application}
                            onStageChange={handleStageChange}
                            onToggleStar={() => toggleStar(application.id)}
                            onAddNotes={() => setNotesDialog({
                              open: true,
                              applicationId: application.id,
                              currentNotes: application.status_notes || ""
                            })}
                          />
                        </div>
                      ))}
                      {stageApplications.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          {searchQuery ? "No matching applications" : "No applications"}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <SendMessageDialog
        open={messageDialog.open}
        onOpenChange={(open) => setMessageDialog({ ...messageDialog, open })}
        recipientId={messageDialog.recipientId}
        recipientName={messageDialog.recipientName}
      />

      <Dialog open={notesDialog.open} onOpenChange={(open) => setNotesDialog({ ...notesDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Notes</DialogTitle>
            <DialogDescription>
              Add internal notes about this candidate that only your team can see.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={notesDialog.currentNotes}
            onChange={(e) => setNotesDialog({ ...notesDialog, currentNotes: e.target.value })}
            placeholder="Enter notes about this candidate..."
            className="min-h-[150px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialog({ ...notesDialog, open: false })}>
              Cancel
            </Button>
            <Button onClick={() => updateNotes(notesDialog.applicationId, notesDialog.currentNotes)}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={jobSelectDialog.open} onOpenChange={(open) => setJobSelectDialog({ ...jobSelectDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Job for {jobSelectDialog.candidateName}</DialogTitle>
            <DialogDescription>
              Choose which job position to add this candidate to in the {stageConfig[jobSelectDialog.targetStage]?.title || 'Applied'} stage.
            </DialogDescription>
          </DialogHeader>
          <Select
            value={selectedJob || ""}
            onValueChange={(value) => setSelectedJob(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a job position" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setJobSelectDialog({ ...jobSelectDialog, open: false })}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (selectedJob) {
                  await createApplication(
                    jobSelectDialog.candidateId,
                    selectedJob,
                    jobSelectDialog.targetStage
                  );
                  setJobSelectDialog({ ...jobSelectDialog, open: false });
                } else {
                  toast({
                    title: "No Job Selected",
                    description: "Please select a job position",
                    variant: "destructive"
                  });
                }
              }}
              disabled={!selectedJob}
            >
              Add to Pipeline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
