import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Shield, AlertTriangle, CheckCircle, XCircle, User } from "lucide-react";
import { format } from "date-fns";

export const AssessmentReviewQueue = () => {
  const queryClient = useQueryClient();
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const { data: flaggedAssessments, isLoading } = useQuery({
    queryKey: ["flagged-assessments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills_assessments")
        .select(`
          *,
          profiles:candidate_id (
            full_name,
            email,
            username
          )
        `)
        .is("human_review_status", null)
        .order("completed_at", { ascending: false });

      if (error) throw error;
      
      // Filter to only show assessments with low integrity scores
      return data?.filter((a) => {
        const feedback = a.ai_feedback as any;
        return feedback?.integrityScore !== undefined && feedback.integrityScore < 80;
      }) || [];
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ 
      assessmentId, 
      status, 
      notes 
    }: { 
      assessmentId: string; 
      status: 'verified' | 'flagged' | 'cleared'; 
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("skills_assessments")
        .update({
          human_review_status: status,
          human_reviewed_by: user?.id,
          human_reviewed_at: new Date().toISOString(),
          review_notes: notes || null,
        })
        .eq("id", assessmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flagged-assessments"] });
      toast.success("Assessment reviewed successfully");
    },
    onError: () => {
      toast.error("Failed to review assessment");
    },
  });

  const getIntegrityScore = (assessment: any) => {
    const feedback = assessment.ai_feedback as any;
    return feedback?.integrityScore;
  };

  const getAssessmentTitle = (type: string) => {
    const titles: Record<string, string> = {
      soc_analyst: "SOC Analyst",
      penetration_tester: "Penetration Tester",
      security_engineer: "Security Engineer",
      incident_responder: "Incident Responder",
      threat_intel_analyst: "Threat Intelligence Analyst",
      cloud_security: "Cloud Security Engineer",
      grc_analyst: "GRC Analyst",
      security_architect: "Security Architect",
      appsec_engineer: "AppSec Engineer"
    };
    return titles[type] || type;
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading flagged assessments...</div>;
  }

  if (!flaggedAssessments || flaggedAssessments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Assessment Review Queue
          </CardTitle>
          <CardDescription>No assessments pending review</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All flagged assessments have been reviewed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Assessment Review Queue
        </CardTitle>
        <CardDescription>
          Review assessments flagged for potential AI-generated content ({flaggedAssessments.length} pending)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {flaggedAssessments.map((assessment) => {
          const integrityScore = getIntegrityScore(assessment);
          const profile = assessment.profiles as any;
          
          return (
            <div
              key={assessment.id}
              className="p-4 rounded-lg border bg-card space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {profile?.full_name || profile?.username || "Unknown"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({profile?.email})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {getAssessmentTitle(assessment.assessment_type)}
                    </span>
                    <Badge variant="outline">Score: {assessment.score}%</Badge>
                    <Badge 
                      variant="outline" 
                      className={
                        integrityScore < 60 
                          ? "border-red-500/50 text-red-600" 
                          : "border-yellow-500/50 text-yellow-600"
                      }
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Integrity: {integrityScore}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Completed {format(new Date(assessment.completed_at), "PPp")}
                  </p>
                </div>
              </div>

              {/* Show AI feedback details */}
              {assessment.ai_feedback && (
                <div className="text-sm bg-muted/50 p-3 rounded space-y-2">
                  <p className="font-medium">AI Analysis:</p>
                  {(assessment.ai_feedback as any).questionFeedback?.map((qf: any, idx: number) => (
                    qf.aiDetected && (
                      <div key={idx} className="text-xs text-muted-foreground">
                        <span className="text-red-500">Q{idx + 1}:</span> {qf.feedback}
                      </div>
                    )
                  ))}
                </div>
              )}

              <Textarea
                placeholder="Review notes (optional)"
                value={reviewNotes[assessment.id] || ""}
                onChange={(e) => setReviewNotes(prev => ({ 
                  ...prev, 
                  [assessment.id]: e.target.value 
                }))}
                className="text-sm"
              />

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-500/50 text-green-600 hover:bg-green-500/10"
                  onClick={() => reviewMutation.mutate({
                    assessmentId: assessment.id,
                    status: "cleared",
                    notes: reviewNotes[assessment.id],
                  })}
                  disabled={reviewMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Clear Flag
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500/50 text-red-600 hover:bg-red-500/10"
                  onClick={() => reviewMutation.mutate({
                    assessmentId: assessment.id,
                    status: "flagged",
                    notes: reviewNotes[assessment.id],
                  })}
                  disabled={reviewMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Confirm Flagged
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
