import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Question {
  id: string;
  text: string;
  expectedCriteria: string;
}

interface CreateCustomAssessmentDialogProps {
  onSuccess?: () => void;
  monthlyQuota?: number;
  usedThisMonth?: number;
}

export const CreateCustomAssessmentDialog = ({ 
  onSuccess, 
  monthlyQuota = 1, 
  usedThisMonth = 0 
}: CreateCustomAssessmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [assessmentName, setAssessmentName] = useState("");
  const [assessmentType, setAssessmentType] = useState("Custom");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", text: "", expectedCriteria: "" }
  ]);

  const remainingQuota = monthlyQuota - usedThisMonth;
  const needsCredits = remainingQuota <= 0;

  const addQuestion = () => {
    setQuestions([...questions, { 
      id: Date.now().toString(), 
      text: "", 
      expectedCriteria: "" 
    }]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: 'text' | 'expectedCriteria', value: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleCreate = async () => {
    if (!assessmentName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an assessment name",
        variant: "destructive",
      });
      return;
    }

    const validQuestions = questions.filter(q => q.text.trim() && q.expectedCriteria.trim());
    if (validQuestions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one complete question with evaluation criteria",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-custom-assessment', {
        body: {
          assessment_name: assessmentName,
          assessment_type: assessmentType,
          description,
          questions: validQuestions.map(q => ({
            question: q.text,
            expected_criteria: q.expectedCriteria,
          })),
        },
      });

      if (error) throw error;

      if (!data.success) {
        if (data.requiresCredits) {
          toast({
            title: "Credits Required",
            description: data.message,
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      toast({
        title: "Assessment Created!",
        description: data.creditsUsed > 0 
          ? `Assessment created using ${data.creditsUsed} credits. ${data.remainingQuota} free assessments remaining this month.`
          : `Assessment created! ${data.remainingQuota} free assessments remaining this month.`,
      });

      setOpen(false);
      setAssessmentName("");
      setAssessmentType("Custom");
      setDescription("");
      setQuestions([{ id: "1", text: "", expectedCriteria: "" }]);
      
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error('Error creating assessment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create assessment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Sparkles className="mr-2 h-4 w-4" />
          Create Custom Assessment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Custom Assessment</DialogTitle>
          <DialogDescription>
            Create a tailored technical assessment for your candidates.
            {needsCredits ? (
              <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ You've used {usedThisMonth}/{monthlyQuota} free assessments this month. 
                Additional assessments cost 10 credits each.
              </span>
            ) : (
              <span className="block mt-2 text-green-600 dark:text-green-400">
                ✓ {remainingQuota} free assessment{remainingQuota !== 1 ? 's' : ''} remaining this month
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Assessment Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Senior SOC Analyst Technical Assessment"
                value={assessmentName}
                onChange={(e) => setAssessmentName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="type">Assessment Type</Label>
              <Select value={assessmentType} onValueChange={setAssessmentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Custom">Custom</SelectItem>
                  <SelectItem value="SOC Analyst">SOC Analyst</SelectItem>
                  <SelectItem value="Penetration Tester">Penetration Tester</SelectItem>
                  <SelectItem value="Security Engineer">Security Engineer</SelectItem>
                  <SelectItem value="Security Architect">Security Architect</SelectItem>
                  <SelectItem value="Incident Responder">Incident Responder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of what this assessment evaluates..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Questions</Label>
              <Button onClick={addQuestion} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>

            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Question {index + 1}</Label>
                    {questions.length > 1 && (
                      <Button
                        onClick={() => removeQuestion(question.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  
                  <Textarea
                    placeholder="Enter your question here..."
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                    rows={3}
                  />

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Evaluation Criteria (What makes a good answer?)
                    </Label>
                    <Textarea
                      placeholder="E.g., Should mention specific tools, frameworks, or methodologies. Should demonstrate hands-on experience..."
                      value={question.expectedCriteria}
                      onChange={(e) => updateQuestion(question.id, 'expectedCriteria', e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : needsCredits ? "Create (10 Credits)" : "Create Assessment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
