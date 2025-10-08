import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Search, XCircle, Gift, Briefcase, Eye, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

type PipelineStage = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired';
type CandidateStage = 'applied' | 'under_review' | 'offer' | 'closed';

interface Application {
  id: string;
  job_id: string;
  stage: PipelineStage;
  applied_at: string;
  updated_at: string;
  cover_letter: string | null;
  status_notes: string | null;
  job: {
    title: string;
    company_id: string;
    location: string | null;
    job_type: string;
    companies: {
      name: string;
      logo_url: string | null;
    } | null;
  };
}

const mapToCandidateStage = (stage: PipelineStage): CandidateStage => {
  switch (stage) {
    case 'applied':
      return 'applied';
    case 'screening':
    case 'interview':
      return 'under_review';
    case 'offer':
      return 'offer';
    case 'rejected':
    case 'hired':
      return 'closed';
    default:
      return 'applied';
  }
};

const stageConfig = {
  applied: {
    label: 'Applied',
    icon: CheckCircle,
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    iconColor: 'text-blue-500'
  },
  under_review: {
    label: 'Under Review',
    icon: Search,
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    iconColor: 'text-purple-500'
  },
  offer: {
    label: 'Offer Extended',
    icon: Gift,
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    iconColor: 'text-green-500'
  },
  closed: {
    label: 'Application Closed',
    icon: XCircle,
    color: 'bg-muted text-muted-foreground border-border',
    iconColor: 'text-muted-foreground'
  }
};

export const ApplicationTracker = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();

    const channel = supabase
      .channel('candidate-applications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications'
        },
        () => loadApplications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs!applications_job_id_fkey(
            title,
            company_id,
            location,
            job_type,
            companies:companies!jobs_company_id_fkey(
              name,
              logo_url
            )
          )
        `)
        .eq('candidate_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications(data as any || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-secondary" />
            Active Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Loading applications...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card className="border-border shadow-card hover:scale-105 transition-transform">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-secondary" />
            Active Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-primary mb-2">0</p>
            <p className="text-sm text-muted-foreground mb-4">Applications</p>
            <Button variant="hero" size="sm" onClick={() => navigate('/jobs')}>
              Browse Jobs
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-card lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-secondary" />
            Active Applications
          </div>
          <Badge variant="secondary" className="text-lg px-3">
            {applications.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {applications.map((app) => {
              const candidateStage = mapToCandidateStage(app.stage);
              const config = stageConfig[candidateStage];
              const Icon = config.icon;
              const daysAgo = Math.floor(
                (Date.now() - new Date(app.applied_at).getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <Card key={app.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        {app.job.companies?.logo_url && (
                          <img
                            src={app.job.companies.logo_url}
                            alt={app.job.companies.name}
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{app.job.title}</h4>
                          {app.job.companies && (
                            <p className="text-sm text-muted-foreground">
                              {app.job.companies.name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Applied {daysAgo === 0 ? 'today' : `${daysAgo} days ago`}</span>
                          </div>
                        </div>
                      </div>

                      <Badge variant="outline" className={`${config.color} gap-1.5`}>
                        <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} />
                        {config.label}
                      </Badge>

                      {app.status_notes && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs">
                          <span className="font-medium">Note: </span>
                          {app.status_notes}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/jobs/${app.job_id}`)}
                      className="flex-shrink-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
