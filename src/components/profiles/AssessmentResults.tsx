import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AssessmentIntegrityBadge } from "./AssessmentIntegrityBadge";

interface AssessmentResultsProps {
  candidateId: string;
}

export const AssessmentResults = ({ candidateId }: AssessmentResultsProps) => {
  const { data: assessments, isLoading } = useQuery({
    queryKey: ["skills-assessments", candidateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills_assessments")
        .select("*")
        .eq("candidate_id", candidateId)
        .order("completed_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !assessments || assessments.length === 0) {
    return null;
  }

  const getAssessmentTitle = (type: string) => {
    const titles: Record<string, string> = {
      soc_analyst: "SOC Analyst",
      penetration_tester: "Penetration Tester",
      security_engineer: "Security Engineer"
    };
    return titles[type] || type;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>AI Skills Assessments</CardTitle>
        </div>
        <CardDescription>
          Technical assessments graded by AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {assessments.map((assessment) => (
          <div
            key={assessment.id}
            className="p-4 rounded-lg border bg-card space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {getAssessmentTitle(assessment.assessment_type)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AssessmentIntegrityBadge 
                  integrityScore={
                    typeof assessment.ai_feedback === 'object' && 
                    assessment.ai_feedback !== null && 
                    'integrityScore' in assessment.ai_feedback
                      ? (assessment.ai_feedback as any).integrityScore
                      : undefined
                  } 
                />
                <Badge variant="outline" className={getScoreColor(assessment.score)}>
                  {assessment.score}%
                </Badge>
              </div>
            </div>
            <Progress value={assessment.score} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Completed {new Date(assessment.completed_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};