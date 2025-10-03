import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ProofSubmissionDialogProps {
  course: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProofSubmissionDialog = ({
  course,
  isOpen,
  onClose,
  onSuccess,
}: ProofSubmissionDialogProps) => {
  const { toast } = useToast();
  const [proofType, setProofType] = useState<string>(course.expected_proof || 'openbadge');
  const [proofUrl, setProofUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!proofUrl.trim() && proofType !== 'none') {
      toast({
        title: "Missing proof",
        description: "Please provide proof of completion",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('boost-complete', {
        body: {
          partnerCourseId: course.id,
          proofType,
          proofUrl: proofUrl.trim() || null,
        },
      });

      if (error) throw error;

      if (data.status === 'VERIFIED') {
        toast({
          title: "✅ Verified",
          description: `+${data.awardedPoints} pts added to your balance!`,
        });
      } else {
        toast({
          title: "⏳ Submitted",
          description: `We'll verify shortly for +${course.reward_amount} pts.`,
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Submission failed",
        description: error.message || 'Please try again',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Proof of Completion</DialogTitle>
          <DialogDescription>
            {course.title} - {course.partner_slug}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Proof Type</Label>
            <RadioGroup value={proofType} onValueChange={setProofType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="openbadge" id="openbadge" />
                <Label htmlFor="openbadge" className="font-normal cursor-pointer">
                  OpenBadge Link
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="font-normal cursor-pointer">
                  Certificate PDF URL
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="screenshot" id="screenshot" />
                <Label htmlFor="screenshot" className="font-normal cursor-pointer">
                  Screenshot URL
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proofUrl">
              {proofType === 'openbadge' ? 'Badge URL' : 
               proofType === 'pdf' ? 'PDF URL' : 
               'Screenshot URL'}
            </Label>
            <Input
              id="proofUrl"
              type="url"
              placeholder="https://..."
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              required={proofType !== 'none'}
            />
            {course.badge_hint && (
              <p className="text-xs text-muted-foreground">{course.badge_hint}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
