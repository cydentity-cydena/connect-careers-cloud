import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, CheckCircle } from "lucide-react";

interface Question {
  question: string;
  options?: string[];
  correctAnswer?: string;
  type?: string;
}

interface Assessment {
  id: string;
  assessment_name: string;
  assessment_type: string;
  description: string | null;
  questions: Question[];
  is_active: boolean;
  times_used: number;
  created_at: string;
}

interface ViewAssessmentDialogProps {
  assessment: Assessment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewAssessmentDialog = ({ assessment, open, onOpenChange }: ViewAssessmentDialogProps) => {
  if (!assessment) return null;

  const questions = Array.isArray(assessment.questions) ? assessment.questions : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {assessment.assessment_name}
          </DialogTitle>
          <DialogDescription>
            {assessment.description || 'No description provided'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline">{assessment.assessment_type}</Badge>
          <Badge variant={assessment.is_active ? "default" : "secondary"}>
            {assessment.is_active ? "Active" : "Inactive"}
          </Badge>
          <span className="text-sm text-muted-foreground ml-auto">
            Used {assessment.times_used} times
          </span>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {questions.map((q, index) => (
              <div key={index} className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 space-y-3">
                    <p className="font-medium">{q.question}</p>
                    
                    {q.options && q.options.length > 0 && (
                      <div className="space-y-2">
                        {q.options.map((option, optIndex) => (
                          <div 
                            key={optIndex} 
                            className={`flex items-center gap-2 p-2 rounded text-sm ${
                              q.correctAnswer === option 
                                ? 'bg-green-500/10 border border-green-500/30' 
                                : 'bg-background border'
                            }`}
                          >
                            {q.correctAnswer === option && (
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            )}
                            <span>{option}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type && (
                      <Badge variant="outline" className="text-xs">
                        {q.type}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No questions in this assessment
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
