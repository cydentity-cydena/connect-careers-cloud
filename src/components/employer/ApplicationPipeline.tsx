import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Clock, UserCheck, FileCheck, XCircle, CheckCircle2, Users, Search, Eye, MessageCircle, Download, Star, StickyNote, Filter, Shield, MapPin, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ApplicationCard } from "./ApplicationCard";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditVerificationDrawer } from "@/components/hrready/EditVerificationDrawer";
import { BadgesRow, BadgeItem, BadgeStatus } from "@/components/hrready/BadgesRow";

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
    resume_url?: string | null;
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
  is_starred?: boolean;
  notes?: string | null;
  profile: {
    full_name: string;
    username: string;
    avatar_url: string | null;
    location?: string | null;
  };
  candidate_profile: {
    title: string;
    years_experience: number;
    resume_url?: string | null;
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

const getVerificationStatus = (status: string | null): BadgeStatus => {
  if (!status) return "grey";
  if (status === "green" || status === "amber" || status === "red" || status === "grey") {
    return status as BadgeStatus;
  }
  return "grey";
};

const getCertificationStatus = (certifications: any): BadgeStatus => {
  if (!certifications || (Array.isArray(certifications) && certifications.length === 0)) {
    return "grey";
  }
  
  const certArray = Array.isArray(certifications) ? certifications : [];
  if (certArray.length === 0) return "grey";
  
  let hasRed = false;
  let hasAmber = false;
  let hasGrey = false;
  let hasGreen = false;
  
  certArray.forEach((cert: any) => {
    const status = cert.status || "grey";
    if (status === "red") hasRed = true;
    else if (status === "amber") hasAmber = true;
    else if (status === "grey") hasGrey = true;
    else if (status === "green") hasGreen = true;
  });
  
  if (hasRed) return "red";
  if (hasAmber) return "amber";
  if (hasGrey) return "grey";
  if (hasGreen) return "green";
  
  return "grey";
};

const getVerificationBadges = (verifications: any): BadgeItem[] => {
  const badges: BadgeItem[] = [];
  
  badges.push({
    label: "ID",
    status: getVerificationStatus(verifications?.identity_status || null),
    tooltip: verifications?.identity_status 
      ? `Identity: ${verifications.identity_status}` 
      : "Identity: Not verified"
  });
  
  badges.push({
    label: "RTW",
    status: getVerificationStatus(verifications?.rtw_status || null),
    tooltip: verifications?.rtw_status 
      ? `Right to Work: ${verifications.rtw_status}` 
      : "Right to Work: Not verified"
  });
  
  const certStatus = getCertificationStatus(verifications?.certifications);
  const certs = verifications?.certifications;
  const certCount = Array.isArray(certs) ? certs.length : 0;
  
  badges.push({
    label: "Cert",
    status: certStatus,
    tooltip: certCount > 0 
      ? `Certifications: ${certCount} cert${certCount !== 1 ? 's' : ''} (${certStatus})` 
      : "No certifications"
  });
  
  if (verifications?.logistics_status) {
    badges.push({
      label: "Logistics",
      status: getVerificationStatus(verifications.logistics_status),
      tooltip: verifications.logistics_location 
        ? `Location: ${verifications.logistics_location}`
        : "Logistics verified"
    });
  }
  
  return badges;
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
  const [userRole, setUserRole] = useState<'employer' | 'recruiter' | null>(null);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [notesDialog, setNotesDialog] = useState<{ open: boolean; applicationId: string; currentNotes: string; isUnlockedCandidate?: boolean }>({
    open: false,
    applicationId: "",
    currentNotes: "",
    isUnlockedCandidate: false
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
  const [editingVerification, setEditingVerification] = useState<{ candidateId: string; verification: any } | null>(null);

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
      }, async () => {
        await fetchApplications();
        await fetchUnlockedCandidates(); // Refresh talent pool after new application
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
    await fetchJobs();
    await fetchApplications();
    // Fetch unlocked candidates AFTER applications so the filter works correctly
    await fetchUnlockedCandidates();
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
        .select('id, candidate_id, unlocked_at, is_starred, notes')
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
          .select('user_id, title, years_experience, resume_url')
          .in('user_id', candidateIds),
        supabase
          .from('candidate_verifications')
          .select('*')
          .in('candidate_id', candidateIds),
      ]);

      if (profilesRes.error) {
        console.error('Profiles query error:', profilesRes.error);
        throw profilesRes.error;
      }
      if (candidateProfilesRes.error) {
        console.error('Candidate profiles query error:', candidateProfilesRes.error);
        throw candidateProfilesRes.error;
      }
      if (verificationsRes.error) {
        console.error('Verifications query error (talent pool):', verificationsRes.error);
        // Continue without verifications instead of failing completely
      }

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
        is_starred: u.is_starred || false,
        notes: u.notes || null,
        profile: profileMap.get(u.candidate_id) || { full_name: 'Unknown', username: '', avatar_url: null, location: null },
        candidate_profile: candidateProfileMap.get(u.candidate_id) || { title: '', years_experience: 0 },
        candidate_verifications: verificationMap.get(u.candidate_id) || null,
      }));

      // Filter out candidates that already have any application in the backend (authoritative)
      let appsSet = new Set<string>();
      try {
        const { data: appsForUnlocks } = await supabase
          .from('applications')
          .select('candidate_id')
          .in('candidate_id', candidateIds);
        appsSet = new Set((appsForUnlocks || []).map((a: any) => a.candidate_id));
      } catch (e) {
        console.warn('Unable to fetch apps for unlock filter, falling back to client state');
        appsSet = new Set(applications.map(a => a.candidate_id));
      }

      const candidatesWithoutApps = merged.filter((unlock: any) => !appsSet.has(unlock.candidate_id));

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
      if (jobsError) {
        console.error('Jobs query error:', jobsError);
        setApplications([]);
        setLoading(false);
        return;
      }

      const jobIds = employerJobs?.map(j => j.id) || [];
      
      if (jobIds.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Fetch applications (base rows only), then join related data in parallel to avoid FK join errors
      let appsQuery = supabase
        .from('applications')
        .select('id, candidate_id, job_id, stage, applied_at, cover_letter, status_notes, is_starred')
        .in('job_id', jobIds)
        .order('applied_at', { ascending: false });

      if (selectedJob) {
        appsQuery = appsQuery.eq('job_id', selectedJob);
      }

      const { data: appRows, error: appsError } = await appsQuery;
      if (appsError) {
        console.error('Applications query error:', appsError);
        throw appsError;
      }

      const applications = (appRows as any[])?.map((app) => ({
        ...app,
        is_starred: app.is_starred ?? false,
      })) || [];

      if (applications.length === 0) {
        setApplications([] as any);
        return;
      }

      const candidateIds = applications.map((app: any) => app.candidate_id);
      const appJobIds = applications.map((app: any) => app.job_id);

      const [profilesRes, candProfilesRes, jobsRes, verRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, username, avatar_url').in('id', candidateIds),
        supabase.from('candidate_profiles').select('user_id, title, years_experience, resume_url').in('user_id', candidateIds),
        supabase.from('jobs').select('id, title').in('id', appJobIds),
        supabase.from('candidate_verifications').select('*').in('candidate_id', candidateIds),
      ]);

      if (profilesRes.error) console.error('Profiles join error:', profilesRes.error);
      if (candProfilesRes.error) console.error('Candidate profiles join error:', candProfilesRes.error);
      if (jobsRes.error) console.error('Jobs join error:', jobsRes.error);
      if (verRes.error) console.error('Verifications join error:', verRes.error);

      const profileMap = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));
      const candProfileMap = new Map((candProfilesRes.data || []).map((cp: any) => [cp.user_id, cp]));
      const jobsMap = new Map((jobsRes.data || []).map((j: any) => [j.id, j]));
      const verMap = new Map((verRes.data || []).map((v: any) => [v.candidate_id, v]));

      const mergedApps = applications.map((app: any) => ({
        ...app,
        candidate_profile: candProfileMap.get(app.candidate_id) || { title: '', years_experience: 0 },
        profile: {
          full_name: profileMap.get(app.candidate_id)?.full_name || 'Unknown',
          username: profileMap.get(app.candidate_id)?.username || null,
          avatar_url: profileMap.get(app.candidate_id)?.avatar_url || null,
        },
        job: { title: jobsMap.get(app.job_id)?.title || '' },
        candidate_verifications: verMap.get(app.candidate_id) || null,
      }));

      setApplications(mergedApps as any);
    } catch (error) {
      console.error('Error fetching applications:', error);
      // Fallback: show empty pipeline without noisy error toast
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (applicationId: string, newStage: PipelineStage) => {
    const appToMove = applications.find(app => app.id === applicationId);
    if (!appToMove) return;

    // Optimistically update UI
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId ? { ...app, stage: newStage } : app
      )
    );

    try {
      const { error } = await supabase
        .from('applications')
        .update({ stage: newStage })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Application Updated",
        description: `Moved existing application to ${stageConfig[newStage].title}`,
      });
    } catch (error) {
      // Revert optimistic update on error
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? appToMove : app
        )
      );

      console.error('Error updating stage:', error);
      toast({
        title: "Error",
        description: "Failed to update application stage",
        variant: "destructive"
      });
    }
  };

  const createApplication = async (candidateId: string, jobId: string, stage: PipelineStage) => {
    // Talent Pool candidates cannot be moved to "Applied" stage
    if (stage === 'applied') {
      toast({
        title: "Invalid Stage",
        description: "Talent Pool candidates cannot be moved to Applied. They can only move to Screening or later stages.",
        variant: "destructive"
      });
      return;
    }

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
          .select('full_name, username, avatar_url, location')
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
        profile: profileRes.data || { full_name: 'Unknown', username: null, avatar_url: null, location: null },
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

  const toggleUnlockedCandidateStar = async (unlockId: string, currentStarred: boolean) => {
    try {
      const { error } = await supabase
        .from('profile_unlocks')
        .update({ is_starred: !currentStarred })
        .eq('id', unlockId);

      if (error) throw error;

      setUnlockedCandidates(prev =>
        prev.map(candidate => 
          candidate.id === unlockId 
            ? { ...candidate, is_starred: !currentStarred } 
            : candidate
        )
      );

      toast({
        title: "Success",
        description: currentStarred ? "Candidate unstarred" : "Candidate starred"
      });
    } catch (error) {
      console.error('Error toggling star:', error);
      toast({
        title: "Error",
        description: "Failed to update star status",
        variant: "destructive"
      });
    }
  };

  const updateUnlockedCandidateNotes = async (unlockId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('profile_unlocks')
        .update({ notes })
        .eq('id', unlockId);

      if (error) throw error;

      setUnlockedCandidates(prev =>
        prev.map(candidate => 
          candidate.id === unlockId ? { ...candidate, notes } : candidate
        )
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
    return unlockedCandidates.filter(candidate => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        candidate.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.profile.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.candidate_profile?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Starred filter
      const matchesStarred = !filterStarred || candidate.is_starred;
      
      return matchesSearch && matchesStarred;
    });
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
                placeholder="Search by name, role, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-[100] max-h-[300px]">
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="analyst">Security Analyst</SelectItem>
                  <SelectItem value="engineer">Security Engineer</SelectItem>
                  <SelectItem value="architect">Security Architect</SelectItem>
                  <SelectItem value="penetration">Penetration Tester</SelectItem>
                  <SelectItem value="soc">SOC Analyst</SelectItem>
                  <SelectItem value="incident">Incident Response</SelectItem>
                  <SelectItem value="threat">Threat Intelligence</SelectItem>
                  <SelectItem value="grc">GRC Analyst</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="ciso">CISO/Manager</SelectItem>
                  <SelectItem value="consultant">Security Consultant</SelectItem>
                  <SelectItem value="researcher">Security Researcher</SelectItem>
                  <SelectItem value="forensics">Digital Forensics</SelectItem>
                  <SelectItem value="devsecops">DevSecOps</SelectItem>
                  <SelectItem value="appsec">Application Security</SelectItem>
                  <SelectItem value="cloud">Cloud Security</SelectItem>
                  <SelectItem value="network">Network Security</SelectItem>
                  <SelectItem value="iam">IAM/Identity</SelectItem>
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

      {/* Kanban Board with Horizontal Scroll */}
      <div className="w-full">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* Talent Pool Column */}
          <Card className="border-2 border-primary/50 bg-primary/5 w-[300px] flex-shrink-0">
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
              <ScrollArea className="h-[calc(100vh-280px)] min-h-[500px] max-h-[800px] pr-2">
                <div className="space-y-2">
                  {getFilteredUnlockedCandidates().map((candidate) => (
                    <Card 
                      key={candidate.id} 
                      className={`hover:shadow-lg transition-all duration-200 border-2 relative ${candidate.is_starred ? 'border-amber-400 shadow-amber-100 dark:shadow-amber-900/20' : 'border-border/50 hover:border-border'}`}
                    >
                      {candidate.is_starred && (
                        <div className="absolute -top-1 -right-1 z-10 bg-background rounded-full p-0.5">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        </div>
                      )}
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-14 w-14 flex-shrink-0 ring-2 ring-background shadow-md">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-base font-semibold">
                              {candidate.profile.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "??"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 pr-6">
                            {candidate.profile.username ? (
                              <a 
                                href={`/profile/${candidate.candidate_id}`}
                                className="font-bold text-base leading-tight mb-1.5 text-foreground hover:text-primary transition-colors cursor-pointer block"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {candidate.profile.full_name}
                                <span className="text-muted-foreground font-normal text-sm"> (@{candidate.profile.username})</span>
                              </a>
                            ) : (
                              <h4 className="font-bold text-base leading-tight mb-1.5 text-foreground">
                                {candidate.profile.full_name}
                                <span className="text-muted-foreground font-normal text-sm"> (No profile yet)</span>
                              </h4>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
                              {candidate.candidate_profile?.title || "No title"}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0 absolute top-2 right-2">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
                              <DropdownMenuItem onClick={(e) => { 
                                e.stopPropagation(); 
                                setEditingVerification({ 
                                  candidateId: candidate.candidate_id, 
                                  verification: candidate.candidate_verifications 
                                }); 
                              }}>
                                <Shield className="h-4 w-4 mr-2" />
                                Edit Verification
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { 
                                e.stopPropagation(); 
                                toggleUnlockedCandidateStar(candidate.id, candidate.is_starred || false); 
                              }}>
                                <Star className={`h-4 w-4 mr-2 ${candidate.is_starred ? "fill-current" : ""}`} />
                                {candidate.is_starred ? "Unstar" : "Star"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { 
                                e.stopPropagation(); 
                                setNotesDialog({ 
                                  open: true, 
                                  applicationId: candidate.id, 
                                  currentNotes: candidate.notes || "",
                                  isUnlockedCandidate: true
                                }); 
                              }}>
                                <StickyNote className="h-4 w-4 mr-2" />
                                {candidate.notes ? "Edit Notes" : "Add Notes"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Verification Status Badges */}
                        <div className="py-1">
                          <BadgesRow 
                            items={getVerificationBadges(candidate.candidate_verifications)} 
                            showHrReady={candidate.candidate_verifications?.hr_ready || false}
                          />
                        </div>

                        <div className="space-y-2.5 pt-1">
                          <div className="flex flex-wrap gap-2 items-center">
                            {/* Years of Experience Badge */}
                            {candidate.candidate_profile?.years_experience !== undefined && (
                              <Badge variant="secondary" className="text-xs px-2.5 py-1 font-medium">
                                <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                                {candidate.candidate_profile.years_experience} yrs
                              </Badge>
                            )}
                            
                            {/* Notes indicator */}
                            {candidate.notes && (
                              <Badge variant="secondary" className="text-xs px-2.5 py-1 font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                                <StickyNote className="h-3.5 w-3.5 mr-1.5" />
                                Notes
                              </Badge>
                            )}
                          </div>

                          {/* Location if available */}
                          {(candidate.candidate_verifications?.logistics_location || candidate.profile.location) && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground/90">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate font-medium">{candidate.candidate_verifications?.logistics_location || candidate.profile.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2 min-w-0">
                          {candidate.candidate_profile?.resume_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-10 text-xs font-medium px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                const { data } = supabase.storage
                                  .from('resumes')
                                  .getPublicUrl(candidate.candidate_profile!.resume_url!);
                                window.open(data.publicUrl, '_blank');
                              }}
                            >
                              <Download className="h-4 w-4 mr-1.5" />
                              <span className="truncate">CV</span>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-10 text-xs font-medium px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/profiles/${candidate.candidate_id}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1.5" />
                            <span className="truncate">View</span>
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 h-10 text-xs font-medium px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMessageDialog({
                                open: true,
                                recipientId: candidate.candidate_id,
                                recipientName: candidate.profile.full_name
                              });
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-1.5" />
                            <span className="truncate">Message</span>
                          </Button>
                        </div>

                        {/* Stage Selection Dropdown */}
                        <Select
                          onValueChange={(value) => {
                            const targetStage = value as PipelineStage;
                            if (!selectedJob) {
                              setJobSelectDialog({
                                open: true,
                                candidateId: candidate.candidate_id,
                                candidateName: candidate.profile.full_name,
                                targetStage
                              });
                            } else {
                              createApplication(candidate.candidate_id, selectedJob, targetStage);
                            }
                          }}
                        >
                          <SelectTrigger className="h-10 text-sm w-full bg-muted/30 border-border hover:bg-muted/50 transition-colors font-medium">
                            <SelectValue placeholder="Add to stage..." />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border z-[100]">
                            <SelectItem value="screening" className="cursor-pointer hover:bg-accent text-sm font-medium">Screening</SelectItem>
                            <SelectItem value="interview" className="cursor-pointer hover:bg-accent text-sm font-medium">Interview</SelectItem>
                            <SelectItem value="offer" className="cursor-pointer hover:bg-accent text-sm font-medium">Offer</SelectItem>
                            <SelectItem value="hired" className="cursor-pointer hover:bg-accent text-sm font-medium">Hired</SelectItem>
                            <SelectItem value="rejected" className="cursor-pointer hover:bg-accent text-sm font-medium">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardContent>
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
                className="border-2 w-[300px] flex-shrink-0"
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
                  <ScrollArea className="h-[calc(100vh-280px)] min-h-[500px] max-h-[800px] pr-2">
                    <div className="space-y-2">
                      {stageApplications.map((application) => (
                        <ApplicationCard
                          key={application.id}
                          application={application}
                          onStageChange={handleStageChange}
                          onToggleStar={() => toggleStar(application.id)}
                          onAddNotes={() => setNotesDialog({
                            open: true,
                            applicationId: application.id,
                            currentNotes: application.status_notes || ""
                          })}
                          onEditVerification={() => setEditingVerification({ 
                            candidateId: application.candidate_id, 
                            verification: application.candidate_verifications 
                          })}
                        />
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
            <Button onClick={() => {
              if (notesDialog.isUnlockedCandidate) {
                updateUnlockedCandidateNotes(notesDialog.applicationId, notesDialog.currentNotes);
              } else {
                updateNotes(notesDialog.applicationId, notesDialog.currentNotes);
              }
            }}>
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

      {/* Edit Verification Drawer */}
      {editingVerification && (
        <EditVerificationDrawer
          open={!!editingVerification}
          onOpenChange={(open) => !open && setEditingVerification(null)}
          candidateId={editingVerification.candidateId}
          verification={editingVerification.verification}
          onSuccess={fetchApplications}
        />
      )}
    </div>
  );
};
