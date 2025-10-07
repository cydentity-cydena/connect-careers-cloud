import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Briefcase } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface ProfileView {
  id: string;
  employer_id: string;
  viewed_at: string;
  job_id?: string;
  employer: {
    full_name: string;
    avatar_url?: string;
  };
  job?: {
    title: string;
    company_id: string;
  };
}

export const ProfileViewsNotification = () => {
  const [views, setViews] = useState<ProfileView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileViews();
  }, []);

  const loadProfileViews = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile views
      const { data: viewsData, error: viewsError } = await supabase
        .from("profile_views")
        .select("id, employer_id, viewed_at, job_id")
        .eq("candidate_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(5);

      if (viewsError) throw viewsError;
      if (!viewsData || viewsData.length === 0) {
        setViews([]);
        return;
      }

      // Fetch employer profiles and jobs separately
      const employerIds = viewsData.map(v => v.employer_id);
      const jobIds = viewsData.filter(v => v.job_id).map(v => v.job_id);

      const [{ data: employers }, { data: jobs }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", employerIds),
        jobIds.length > 0
          ? supabase.from("jobs").select("id, title, company_id").in("id", jobIds)
          : Promise.resolve({ data: [] })
      ]);

      // Combine the data
      const combinedData = viewsData.map(view => {
        const employer = employers?.find(e => e.id === view.employer_id);
        const job = jobs?.find(j => j.id === view.job_id);
        return {
          ...view,
          employer: {
            full_name: employer?.full_name || "Unknown",
            avatar_url: employer?.avatar_url
          },
          job: job ? { title: job.title, company_id: job.company_id } : undefined
        };
      });

      setViews(combinedData);
    } catch (error) {
      console.error("Error loading profile views:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || views.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Recent Profile Views
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {views.map((view) => (
          <div key={view.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <Avatar className="h-10 w-10">
              <AvatarImage src={view.employer.avatar_url} />
              <AvatarFallback>{view.employer.full_name?.[0] || "E"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {view.employer.full_name}
              </p>
              {view.job && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Briefcase className="h-3 w-3" />
                  <span className="truncate">{view.job.title}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(view.viewed_at), { addSuffix: true })}
              </p>
            </div>
            <Link
              to={`/jobs?employer=${view.employer_id}`}
              className="text-xs text-primary hover:underline whitespace-nowrap"
            >
              View Jobs
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
