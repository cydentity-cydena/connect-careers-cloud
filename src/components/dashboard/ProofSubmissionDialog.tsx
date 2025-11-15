import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [proofUrl, setProofUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!proofUrl.trim()) {
      toast({
        title: "Missing badge URL",
        description: "Please provide your OpenBadge link",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('boost-complete', {
        body: {
          partnerCourseId: course.id,
          proofType: 'openbadge',
          proofUrl: proofUrl.trim(),
        },
      });

      if (error) throw error;

      if (data.status === 'VERIFIED') {
        toast({
          title: "✅ Auto-Verified!",
          description: data.validationMessage || `+${data.awardedPoints} pts added to your balance!`,
        });
      } else {
        toast({
          title: "⏳ Pending Review",
          description: data.validationMessage || `We'll verify shortly for +${course.reward_amount} pts.`,
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
          <div className="space-y-2">
            <Label htmlFor="proofUrl">Badge URL</Label>
            <Input
              id="proofUrl"
              type="url"
              placeholder="https://www.credly.com/badges/..."
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Complete and import your OpenBadge to auto-verify. Works with Credly and any OpenBadge-compliant platform.
            </p>
            {course.badge_hint && (
              <p className="text-xs text-muted-foreground mt-1">{course.badge_hint}</p>
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
