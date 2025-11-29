import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Shield, AlertTriangle, CheckCircle, XCircle, User, ArrowLeft, Eye } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";

const AssessmentReview = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [expandedAssessment, setExpandedAssessment] = useState<string | null>(null);

  const { data: flaggedAssessments, isLoading } = useQuery({
    queryKey: ["flagged-assessments-admin"],
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
      queryClient.invalidateQueries({ queryKey: ["flagged-assessments-admin"] });
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

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Assessment Review - Admin"
        description="Review flagged assessments for AI-generated content"
      />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Assessment Review Queue
          </h1>
          <p className="text-muted-foreground mt-2">
            Review assessments flagged for potential AI-generated content
          </p>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground">Loading flagged assessments...</div>
        ) : !flaggedAssessments || flaggedAssessments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium">All Clear!</h3>
              <p className="text-muted-foreground">
                No assessments pending review.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              {flaggedAssessments.length} assessment(s) pending review
            </p>
            
            {flaggedAssessments.map((assessment) => {
              const integrityScore = getIntegrityScore(assessment);
              const profile = assessment.profiles as any;
              const questions = assessment.questions as any[];
              const answers = assessment.answers as any;
              const feedback = assessment.ai_feedback as any;
              
              return (
                <Card key={assessment.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30">
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
                        <div className="flex items-center gap-2 flex-wrap">
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
                  </CardHeader>
                  
                  <CardContent className="pt-4 space-y-4">
                    {/* Questions and Answers */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="answers">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Questions & Answers ({questions?.length || 0} questions)
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            {questions?.map((q, idx) => {
                              const answer = answers?.[idx] || "No answer provided";
                              const qFeedback = feedback?.questionFeedback?.[idx];
                              const isFlagged = qFeedback?.aiDetected;
                              
                              return (
                                <div 
                                  key={idx} 
                                  className={`p-4 rounded-lg border ${
                                    isFlagged ? 'border-red-500/30 bg-red-500/5' : 'border-border'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <p className="font-medium text-sm">
                                      Q{idx + 1}: {q.question}
                                    </p>
                                    {isFlagged && (
                                      <Badge variant="outline" className="border-red-500/50 text-red-600 shrink-0 ml-2">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        AI Detected
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="bg-muted/50 p-3 rounded text-sm whitespace-pre-wrap">
                                    {answer}
                                  </div>
                                  {qFeedback?.feedback && (
                                    <p className="text-xs text-muted-foreground mt-2 italic">
                                      AI Analysis: {qFeedback.feedback}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* AI Summary */}
                    {feedback?.overallFeedback && (
                      <div className="text-sm bg-muted/50 p-3 rounded">
                        <p className="font-medium mb-1">AI Summary:</p>
                        <p className="text-muted-foreground">{feedback.overallFeedback}</p>
                      </div>
                    )}

                    {/* Review Notes */}
                    <Textarea
                      placeholder="Review notes (optional) - explain your decision"
                      value={reviewNotes[assessment.id] || ""}
                      onChange={(e) => setReviewNotes(prev => ({ 
                        ...prev, 
                        [assessment.id]: e.target.value 
                      }))}
                      className="text-sm"
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
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
                        Clear Flag (Authentic)
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
                        Confirm AI-Generated
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AssessmentReview;
