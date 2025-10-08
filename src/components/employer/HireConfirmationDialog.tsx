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
      // Call edge function to create payment session
      const { data, error } = await supabase.functions.invoke('create-hire-payment', {
        body: {
          application_id: applicationId,
          candidate_id: candidateId,
          job_id: jobId,
          position_title: positionTitle,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Update application status to hired
        await supabase
          .from('applications')
          .update({ stage: 'hired' })
          .eq('id', applicationId);

        // Open payment page in new tab
        window.open(data.url, '_blank');
        
        toast.success('Hire confirmed! Complete payment to finalize.');
        setOpen(false);
        onHireComplete?.();
      }
    } catch (error: any) {
      console.error('Error creating hire payment:', error);
      toast.error(error.message || 'Failed to process hire confirmation');
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
            <h4 className="font-semibold text-lg mb-2">Pay-Per-Hire Option</h4>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Success fee: <span className="text-2xl font-bold text-primary ml-2">£999</span>
              </p>
              <p className="text-muted-foreground">
                Only pay when you successfully hire. No monthly fees, no risk.
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
            <p>✓ One-time payment - no subscriptions</p>
            <p>✓ Risk-free - pay only on successful hire</p>
            <p>✓ 90% cheaper than agency fees (typically £7,500+)</p>
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
                Confirm & Pay £999
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
