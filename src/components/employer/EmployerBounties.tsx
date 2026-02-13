import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, MapPin, Clock, Users } from "lucide-react";
import { PostBountyDialog } from "./PostBountyDialog";
import { format } from "date-fns";

const urgencyColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  urgent: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  normal: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  flexible: "bg-muted text-muted-foreground",
};

const statusColors: Record<string, string> = {
  open: "bg-emerald-500/20 text-emerald-400",
  invite_only: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-amber-500/20 text-amber-400",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/20 text-destructive",
};

export const EmployerBounties = () => {
  const { data: bounties, isLoading, refetch } = useQuery({
    queryKey: ["employer-bounties"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("task_bounties")
        .select(`
          *,
          category:category_id (name, slug)
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Work Bounties</h2>
          <p className="text-muted-foreground">
            Post task bounties for qualified cybersecurity professionals to apply
          </p>
        </div>
        <PostBountyDialog onSuccess={refetch} />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading bounties...</div>
      ) : !bounties?.length ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <h3 className="font-semibold mb-1">No bounties yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Post your first bounty to find qualified talent for your security needs.
            </p>
            <PostBountyDialog onSuccess={refetch} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {bounties.map((b: any) => (
            <Card key={b.id} className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{b.title}</h3>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <Badge className={urgencyColors[b.urgency] || ""}>
                      {b.urgency}
                    </Badge>
                    <Badge className={statusColors[b.status] || ""}>
                      {b.status === "invite_only" ? "Invite Only" : b.status}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{b.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {b.category && (
                    <Badge variant="secondary" className="text-xs">{b.category.name}</Badge>
                  )}
                  {b.required_clearance && b.required_clearance !== "none" && (
                    <Badge variant="outline" className="text-xs">{b.required_clearance} Required</Badge>
                  )}
                  {b.location_requirement && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {b.location_requirement}
                      {b.location_city && ` — ${b.location_city}`}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border text-sm">
                  <span className="font-semibold text-primary">
                    {b.budget_min_gbp || b.budget_max_gbp
                      ? `£${Number(b.budget_min_gbp || 0).toLocaleString()} – £${Number(b.budget_max_gbp || 0).toLocaleString()}`
                      : "Budget TBD"}
                  </span>
                  <div className="flex items-center gap-3 text-muted-foreground text-xs">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {b.current_applicants || 0}/{b.max_applicants || 10}
                    </span>
                    {b.deadline && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(b.deadline), "dd MMM")}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
