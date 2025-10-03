import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase, Clock, UserCheck, FileCheck, XCircle, CheckCircle2 } from "lucide-react";
import { ApplicationCard } from "./ApplicationCard";
import { toast } from "@/hooks/use-toast";

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
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [selectedJob]);

  const fetchApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
            title,
            created_by
          )
        `)
        .eq('jobs.created_by', user.id)
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

  const getApplicationsByStage = (stage: PipelineStage) => {
    return applications.filter(app => app.stage === stage);
  };

  if (loading) {
    return <div className="text-center py-8">Loading pipeline...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Application Pipeline</h2>
          <p className="text-muted-foreground">Track candidates through customizable pipeline stages</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {applications.length} Total Applications
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {(Object.keys(stageConfig) as PipelineStage[]).map((stage) => {
          const config = stageConfig[stage];
          const stageApplications = getApplicationsByStage(stage);
          const Icon = config.icon;

          return (
            <Card key={stage} className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <div className={`${config.color} rounded-full p-1.5`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span>{config.title}</span>
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
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        onStageChange={handleStageChange}
                      />
                    ))}
                    {stageApplications.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No applications
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
  );
};
