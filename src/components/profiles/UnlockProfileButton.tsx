import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UnlockProfileButtonProps {
  candidateId: string;
  isUnlocked: boolean;
  onUnlock: () => void;
  remainingCredits: number;
}

export const UnlockProfileButton = ({
  candidateId,
  isUnlocked,
  onUnlock,
  remainingCredits,
}: UnlockProfileButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUnlock = async () => {
    if (remainingCredits < 1) {
      toast.error("Insufficient credits. Please purchase more credits to unlock profiles.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('unlock-profile', {
        body: { candidateId },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast.success("Profile unlocked! You can now view full contact details.");
      onUnlock();
    } catch (error: any) {
      console.error('Unlock error:', error);
      toast.error(error.message || "Failed to unlock profile");
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  if (isUnlocked) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Unlock className="h-4 w-4" />
        Unlocked
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        disabled={isLoading || remainingCredits < 1}
        className="gap-2"
        variant="default"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Unlocking...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Unlock Profile (1 Credit)
          </>
        )}
      </Button>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock Candidate Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This will use 1 credit to unlock full access to this candidate's profile, including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Email address</li>
                <li>Phone number (if provided)</li>
                <li>Resume download</li>
                <li>Portfolio and GitHub links</li>
                <li>Full work history</li>
              </ul>
              <p className="mt-3 font-semibold">
                Remaining credits after unlock: {remainingCredits - 1}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlock}>
              Unlock Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};