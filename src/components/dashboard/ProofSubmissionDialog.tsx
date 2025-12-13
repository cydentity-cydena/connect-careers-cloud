import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

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
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }
      setScreenshot(file);
    }
  };

  const uploadScreenshot = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `course-proofs/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('course-proofs')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('course-proofs')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent, proofType: 'openbadge' | 'screenshot') => {
    e.preventDefault();
    
    if (proofType === 'openbadge' && !proofUrl.trim()) {
      toast({
        title: "Missing badge URL",
        description: "Please provide your OpenBadge link",
        variant: "destructive",
      });
      return;
    }

    if (proofType === 'screenshot' && !screenshot) {
      toast({
        title: "Missing screenshot",
        description: "Please upload a screenshot of your completion",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalProofUrl = proofUrl.trim();
      
      if (proofType === 'screenshot' && screenshot) {
        setIsUploading(true);
        finalProofUrl = await uploadScreenshot(screenshot);
        setIsUploading(false);
      }

      const { data, error } = await supabase.functions.invoke('boost-complete', {
        body: {
          partnerCourseId: course.id,
          proofType: proofType,
          proofUrl: finalProofUrl,
        },
      });

      if (error) {
        // Try to extract error message from edge function response
        const errorMessage = error.message || 'Please try again';
        throw new Error(errorMessage);
      }

      // Check if the response contains an error (non-2XX can still return data)
      if (data?.error) {
        throw new Error(data.error);
      }

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
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Proof of Completion</DialogTitle>
          <DialogDescription>
            {course.title} - {course.partner_slug}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="badge" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="badge">OpenBadge URL</TabsTrigger>
            <TabsTrigger value="screenshot">Screenshot</TabsTrigger>
          </TabsList>
          
          <TabsContent value="badge" className="space-y-4">
            <form onSubmit={(e) => handleSubmit(e, 'openbadge')} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proofUrl">Badge URL</Label>
                <Input
                  id="proofUrl"
                  type="url"
                  placeholder="https://www.credly.com/badges/..."
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
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
          </TabsContent>

          <TabsContent value="screenshot" className="space-y-4">
            <form onSubmit={(e) => handleSubmit(e, 'screenshot')} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="screenshot">Completion Screenshot</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="cursor-pointer"
                  />
                  {screenshot && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setScreenshot(null)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {screenshot && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {screenshot.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload a screenshot showing your course completion. This will be manually reviewed by our team.
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {(isSubmitting || isUploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isUploading ? 'Uploading...' : 'Submit'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
