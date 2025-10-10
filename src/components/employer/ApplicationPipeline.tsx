import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, Clock, UserCheck, FileCheck, XCircle, CheckCircle2, Users, Search, Eye, MessageCircle, GripVertical } from "lucide-react";
import { ApplicationCard } from "./ApplicationCard";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type PipelineStage = "applied" | "screening" | "interview" | "offer" | "rejected" | "hired";

interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
  stage: PipelineStage;
  applied_at: string;
  cover_letter: string | null;
  status_notes: string | null;
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
}

interface UnlockedCandidate {
  id: string;
  candidate_id: string;
  unlocked_at: string;
  profile: {
    full_name: string;
    username: string;
    avatar_url: string | null;
  };
  candidate_profile: {
    title: string;
    years_experience: number;
  };
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
  const [draggedItem, setDraggedItem] = useState<{ id: string; type: 'application' | 'unlock' } | null>(null);
  const [userRole, setUserRole] = useState<'employer' | 'recruiter' | null>(null);

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
    await Promise.all([fetchApplications(), fetchUnlockedCandidates()]);
  };

  const fetchUnlockedCandidates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get unlocked candidates
      const { data: unlocks, error } = await supabase
        .from('profile_unlocks')
        .select(`
          id,
          candidate_id,
          unlocked_at,
          profiles!profile_unlocks_candidate_id_fkey(
            full_name,
            username,
            avatar_url
          ),
          candidate_profiles!candidate_profiles_user_id_fkey(
            title,
            years_experience
          )
        `)
        .eq('employer_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) {
        console.error('Error fetching unlocked candidates:', error);
        throw error;
      }

      // Transform the data to match the interface
      const transformedUnlocks = (unlocks || []).map(unlock => ({
        id: unlock.id,
        candidate_id: unlock.candidate_id,
        unlocked_at: unlock.unlocked_at,
        profile: Array.isArray(unlock.profiles) ? unlock.profiles[0] : unlock.profiles,
        candidate_profile: Array.isArray(unlock.candidate_profiles) ? unlock.candidate_profiles[0] : unlock.candidate_profiles
      }));

      // Filter out candidates who already have applications
      const candidatesWithoutApps = transformedUnlocks.filter(unlock => 
        !applications.some(app => app.candidate_id === unlock.candidate_id)
      );

      setUnlockedCandidates(candidatesWithoutApps as any);
      console.log('Unlocked candidates fetched:', candidatesWithoutApps.length);
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

      // Now fetch applications for those jobs
      let query = supabase
        .from('applications')
        .select(`
          *,
          candidate_profile:candidate_profiles!applications_candidate_id_fkey(
            title,
            years_experience
          ),
          profile:profiles!applications_candidate_id_fkey(
            full_name,
            avatar_url
          ),
          job:jobs!applications_job_id_fkey(
            title
          )
        `)
        .in('job_id', jobIds)
        .order('applied_at', { ascending: false });

      if (selectedJob) {
        query = query.eq('job_id', selectedJob);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApplications(data as any || []);
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
    }
    
    setDraggedItem(null);
  };

  const getApplicationsByStage = (stage: PipelineStage) => {
    return applications.filter(app => {
      const matchesStage = app.stage === stage;
      const matchesSearch = searchQuery === "" || 
        app.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.job.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStage && matchesSearch;
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
        
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1 whitespace-nowrap">
              {applications.length} Applications
            </Badge>
            <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1 border-primary text-primary whitespace-nowrap">
              {unlockedCandidates.length} In Talent Pool
            </Badge>
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
                      className="p-3 hover:border-primary/50 transition-all cursor-move"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{candidate.profile.full_name}</h4>
                            {candidate.candidate_profile?.title && (
                              <p className="text-xs text-muted-foreground truncate">{candidate.candidate_profile.title}</p>
                            )}
                            {candidate.candidate_profile?.years_experience > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {candidate.candidate_profile.years_experience} yrs exp
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs"
                            onClick={() => navigate(`/profiles/${candidate.candidate_id}`)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1 h-8 text-xs"
                            onClick={() => {
                              toast({
                                title: "Coming Soon",
                                description: "Direct messaging feature will be available soon",
                              });
                            }}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                        </div>
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
                  <ScrollArea className="h-[500px] pr-2">
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
    </div>
  );
};
