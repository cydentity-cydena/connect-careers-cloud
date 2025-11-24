import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";

interface HireConfirmationDialogProps {
  applicationId: string;
  candidateId: string;
  jobId: string;
  positionTitle: string;
  candidateName: string;
  onHireComplete?: () => void;
}

export function HireConfirmationDialog({
  applicationId,
  candidateId,
  jobId,
  positionTitle,
  candidateName,
  onHireComplete,
}: HireConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleConfirmHire = async () => {
    setProcessing(true);
    try {
      // Update application status to hired
      const { error } = await supabase
        .from('applications')
        .update({ stage: 'hired' })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('Candidate marked as hired successfully!');
      setOpen(false);
      onHireComplete?.();
    } catch (error: any) {
      console.error('Error confirming hire:', error);
      toast.error(error.message || 'Failed to confirm hire');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Mark as Hired
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Confirm Hire
          </DialogTitle>
          <DialogDescription>
            You're about to confirm hiring {candidateName} for {positionTitle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-gray-700">
              This will mark {candidateName} as successfully hired for the position of {positionTitle}.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
            <p>✓ Application status will be updated to "Hired"</p>
            <p>✓ You can track this placement in your dashboard</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmHire}
            disabled={processing}
            className="gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm Hire
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
