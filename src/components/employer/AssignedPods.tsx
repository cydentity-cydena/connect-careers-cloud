import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Eye, AlertCircle } from "lucide-react";
import { useState } from "react";
import { PodCandidatesView } from "./PodCandidatesView";
import { format } from "date-fns";

export const AssignedPods = () => {
  const [selectedPodId, setSelectedPodId] = useState<string | null>(null);
  const [viewCandidatesOpen, setViewCandidatesOpen] = useState(false);

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["my-pod-assignments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: assignmentData, error } = await supabase
        .from("pod_assignments")
        .select(`
          *,
          candidate_pods (
            id,
            name,
            description,
            pod_members (count)
          )
        `)
        .eq("assigned_to", user.id)
        .order("assigned_at", { ascending: false });

      if (error) throw error;

      // Filter out expired assignments
      const now = new Date();
      return assignmentData?.filter(a => !a.expires_at || new Date(a.expires_at) > now) || [];
    },
  });

  const handleViewCandidates = (podId: string) => {
    setSelectedPodId(podId);
    setViewCandidatesOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading assigned pods...</p>
        </CardContent>
      </Card>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assigned Candidate Pods
          </CardTitle>
          <CardDescription>
            No candidate pods have been assigned to you yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Contact your account manager to get access to curated candidate pools.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Assigned Candidate Pods</h2>
          <p className="text-muted-foreground">
            View curated groups of candidates assigned to you
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((assignment) => {
            const pod = assignment.candidate_pods;
            if (!pod) return null;

            const memberCount = pod.pod_members?.[0]?.count || 0;
            const expiresAt = assignment.expires_at ? new Date(assignment.expires_at) : null;
            const daysUntilExpiry = expiresAt 
              ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{pod.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {pod.description || "No description"}
                      </CardDescription>
                    </div>
                    {expiresAt && (
                      <Badge variant={daysUntilExpiry && daysUntilExpiry < 7 ? "destructive" : "secondary"}>
                        {daysUntilExpiry && daysUntilExpiry < 7 ? `${daysUntilExpiry}d left` : "Active"}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {memberCount} candidate{memberCount !== 1 ? "s" : ""}
                    </span>
                    {expiresAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Expires {format(expiresAt, "MMM d, yyyy")}
                      </span>
                    )}
                  </div>

                  {assignment.notes && (
                    <div className="text-sm p-3 bg-muted rounded-md">
                      <p className="font-medium mb-1">Notes:</p>
                      <p className="text-muted-foreground">{assignment.notes}</p>
                    </div>
                  )}

                  <Button 
                    onClick={() => handleViewCandidates(pod.id)}
                    className="w-full gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Candidates
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {selectedPodId && (
        <PodCandidatesView
          podId={selectedPodId}
          open={viewCandidatesOpen}
          onOpenChange={setViewCandidatesOpen}
        />
      )}
    </>
  );
};
