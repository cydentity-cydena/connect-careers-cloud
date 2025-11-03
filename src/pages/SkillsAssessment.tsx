import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Brain, ArrowRight, CheckCircle2, Loader2, X, Save } from "lucide-react";
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
  {
    id: "incident_responder",
    title: "Incident Responder",
    description: "Incident response and digital forensics specialist",
    icon: "🚨",
  },
  {
    id: "threat_intel_analyst",
    title: "Threat Intelligence Analyst",
    description: "Threat hunting and intelligence analysis",
    icon: "🎯",
  },
  {
    id: "cloud_security",
    title: "Cloud Security Engineer",
    description: "AWS, Azure, and multi-cloud security",
    icon: "☁️",
  },
  {
    id: "grc_analyst",
    title: "GRC Analyst",
    description: "Governance, risk, and compliance management",
    icon: "📋",
  },
  {
    id: "security_architect",
    title: "Security Architect",
    description: "Enterprise security architecture and design",
    icon: "🏗️",
  },
  {
    id: "appsec_engineer",
    title: "AppSec Engineer",
    description: "Application security and secure development",
    icon: "💻",
  },
];

export default function SkillsAssessment() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [questionStartTimes, setQuestionStartTimes] = useState<number[]>([]);
  const [questionTimeSpent, setQuestionTimeSpent] = useState<number[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('skills-assessment-progress');
    if (savedProgress) {
      try {
        const { type, questions: savedQuestions, answers: savedAnswers, currentQ, timeSpent, startTimes } = JSON.parse(savedProgress);
        setSelectedType(type);
        setQuestions(savedQuestions);
        setAnswers(savedAnswers);
        setCurrentQuestion(currentQ);
        setQuestionTimeSpent(timeSpent || []);
        setQuestionStartTimes(startTimes || []);
      } catch (e) {
        console.error('Error loading saved progress:', e);
      }
    }
  }, []);

  // Track time spent on current question
  useEffect(() => {
    if (selectedType && questions.length > 0) {
      const now = Date.now();
      setQuestionStartTimes(prev => {
        const newTimes = [...prev];
        newTimes[currentQuestion] = now;
        return newTimes;
      });
    }
  }, [currentQuestion, selectedType, questions.length]);

  // Auto-save progress when answers change
  useEffect(() => {
    if (selectedType && questions.length > 0) {
      // Calculate time spent on current question
      const now = Date.now();
      const startTime = questionStartTimes[currentQuestion];
      if (startTime) {
        const timeSpent = [...questionTimeSpent];
        timeSpent[currentQuestion] = (timeSpent[currentQuestion] || 0) + (now - startTime) / 1000;
        setQuestionTimeSpent(timeSpent);
      }

      localStorage.setItem('skills-assessment-progress', JSON.stringify({
        type: selectedType,
        questions,
        answers,
        currentQ: currentQuestion,
        timeSpent: questionTimeSpent,
        startTimes: questionStartTimes
      }));
    }
  }, [selectedType, questions, answers, currentQuestion]);

  const startAssessment = async (type: string) => {
    setLoading(true);
    try {
      // Clear any saved progress when starting new assessment
      localStorage.removeItem('skills-assessment-progress');
      
      const { data, error } = await supabase.functions.invoke("skills-assessment", {
        body: { action: "getQuestions", assessmentType: type },
      });

      if (error) throw error;

      setSelectedType(type);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(""));
      setCurrentQuestion(0);
      setQuestionStartTimes(new Array(data.questions.length).fill(0));
      setQuestionTimeSpent(new Array(data.questions.length).fill(0));
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

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    localStorage.removeItem('skills-assessment-progress');
    navigate('/dashboard');
  };

  const saveAndExit = () => {
    toast({
      title: "Progress Saved",
      description: "You can continue this assessment later from your dashboard.",
    });
    navigate('/dashboard');
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const submitAssessment = async () => {
    setSubmitting(true);
    try {
      // Calculate average time per question for integrity check
      const avgTimePerQuestion = questionTimeSpent.reduce((a, b) => a + b, 0) / questionTimeSpent.length;

      const { data, error } = await supabase.functions.invoke("skills-assessment", {
        body: {
          action: "gradeAssessment",
          assessmentType: selectedType,
          answers: answers,
          metadata: {
            timeSpent: questionTimeSpent,
            avgTimePerQuestion,
            totalTime: questionTimeSpent.reduce((a, b) => a + b, 0)
          }
        },
      });

      if (error) throw error;

      // Clear saved progress after successful submission
      localStorage.removeItem('skills-assessment-progress');

      // Show integrity warning if detected
      if (data.feedback?.integrityScore < 60) {
        toast({
          title: "Assessment Complete",
          description: `Score: ${data.score}%. Note: Some answers flagged for review by employers.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Assessment Complete!",
          description: `You scored ${data.score}%. Results saved to your profile.`,
        });
      }

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
          title="Technical Skills Assessment"
          description="Validate your cybersecurity skills with professional technical assessments"
        />
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Brain className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Technical Skills Assessment</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
              Validate your expertise with professional technical assessments. Get instant feedback and add results to your profile.
            </p>
            <div className="max-w-2xl mx-auto bg-muted/50 border border-primary/20 rounded-lg p-4 text-sm text-left">
              <p className="font-semibold mb-2">⚠️ Academic Integrity Notice</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Answers should reflect your personal experience and knowledge</li>
                <li>• Using external tools to generate responses defeats the purpose and will be flagged</li>
                <li>• Employers use these as initial screenings, not replacements for interviews</li>
                <li>• Inauthentic responses receive significantly reduced scores</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="flex items-center gap-3">
                <Badge variant="outline">
                  Question {currentQuestion + 1} of {questions.length}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={saveAndExit}
                  className="text-muted-foreground"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save & Exit
                </Button>
              </div>
              <div className="flex items-center gap-3">
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
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

        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Assessment?</AlertDialogTitle>
              <AlertDialogDescription>
                Your progress will be permanently lost. Would you like to save your progress instead?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Assessment</AlertDialogCancel>
              <Button variant="outline" onClick={saveAndExit}>
                <Save className="h-4 w-4 mr-2" />
                Save & Exit
              </Button>
              <AlertDialogAction onClick={confirmCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Discard Progress
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}