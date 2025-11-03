import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

const ASSESSMENT_TYPES = [
  {
    id: "soc_analyst",
    title: "SOC Analyst",
    description: "Security Operations Center analyst role assessment",
    icon: "🛡️",
  },
  {
    id: "penetration_tester",
    title: "Penetration Tester",
    description: "Offensive security and penetration testing skills",
    icon: "🔐",
  },
  {
    id: "security_engineer",
    title: "Security Engineer",
    description: "Infrastructure and application security engineering",
    icon: "⚙️",
  },
];

export default function SkillsAssessment() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const startAssessment = async (type: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("skills-assessment", {
        body: { action: "getQuestions", assessmentType: type },
      });

      if (error) throw error;

      setSelectedType(type);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(""));
      setCurrentQuestion(0);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const submitAssessment = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("skills-assessment", {
        body: {
          action: "gradeAssessment",
          assessmentType: selectedType,
          answers: answers,
        },
      });

      if (error) throw error;

      toast({
        title: "Assessment Complete!",
        description: `You scored ${data.score}%. Results saved to your profile.`,
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedType) {
    return (
      <div className="min-h-screen bg-background py-12">
        <SEO
          title="AI Skills Assessment"
          description="Validate your cybersecurity skills with AI-powered technical assessments"
        />
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Brain className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">AI Skills Assessment</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Validate your expertise with AI-powered technical assessments. Get instant feedback and add results to your profile.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {ASSESSMENT_TYPES.map((type) => (
              <Card key={type.id} className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <div className="text-4xl mb-2">{type.icon}</div>
                  <CardTitle>{type.title}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => startAssessment(type.id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Start Assessment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    5 questions • ~20 minutes
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline">
                Question {currentQuestion + 1} of {questions.length}
              </Badge>
              <div className="flex gap-1">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 w-8 rounded ${
                      idx <= currentQuestion ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            <CardTitle className="text-2xl">{questions[currentQuestion]}</CardTitle>
            <CardDescription>
              Provide a detailed answer demonstrating your technical knowledge and experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="answer">Your Answer</Label>
              <Textarea
                id="answer"
                placeholder="Type your answer here..."
                value={answers[currentQuestion]}
                onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                className="min-h-[200px]"
              />
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              {currentQuestion < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  disabled={!answers[currentQuestion]?.trim()}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={submitAssessment}
                  disabled={!answers[currentQuestion]?.trim() || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Grading...
                    </>
                  ) : (
                    <>
                      Submit Assessment
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}