import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MFAVerificationProps {
  onCancel: () => void;
  onSuccess?: () => void | Promise<void>;
  returnUrl?: string;
}

export const MFAVerification = ({ onCancel, onSuccess, returnUrl }: MFAVerificationProps) => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Get return URL from props or query params
  const getReturnUrl = () => {
    if (returnUrl) return returnUrl;
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('returnTo') || '/dashboard';
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || (code.length !== 6 && code.length !== 8)) {
      toast.error("Please enter a valid 6-digit code or 8-character backup code");
      return;
    }

    setVerifying(true);
    try {
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) throw factors.error;

      const totpFactor = factors.data?.totp?.[0];
      if (!totpFactor) {
        throw new Error("No MFA factor found");
      }

      // Check if it's a backup code (8 characters) or regular TOTP (6 digits)
      if (code.length === 8) {
        // Verify backup code
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const { verifyBackupCode } = await import("@/lib/backupCodes");
        const isValid = await verifyBackupCode(user.id, code);
        
        if (!isValid) {
          throw new Error("Invalid or already used backup code");
        }

        toast.success("Backup code verified successfully!");
        if (onSuccess) {
          await onSuccess();
        } else {
          navigate(getReturnUrl());
        }
      } else {
        // Regular TOTP verification
        const challenge = await supabase.auth.mfa.challenge({ 
          factorId: totpFactor.id 
        });
        if (challenge.error) throw challenge.error;

        const verify = await supabase.auth.mfa.verify({
          factorId: totpFactor.id,
          challengeId: challenge.data.id,
          code: code,
        });

        if (verify.error) throw verify.error;

        toast.success("Verification successful!");
        if (onSuccess) {
          await onSuccess();
        } else {
          navigate(getReturnUrl());
        }
      }
    } catch (error: any) {
      console.error("MFA verification error:", error);
      toast.error(error.message || "Invalid verification code");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Enter Verification Code
        </h3>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app, or use a backup code
        </p>
      </div>
      
      <form onSubmit={handleVerify} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="mfa-code" className="text-sm font-medium">
            Authentication Code
          </Label>
          <Input
            id="mfa-code"
            type="text"
            maxLength={8}
            placeholder="000000 or backup code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^A-Z0-9]/gi, "").toUpperCase())}
            autoFocus
            className="text-center text-2xl tracking-widest font-mono h-14"
          />
          <p className="text-xs text-muted-foreground text-center">
            6-digit app code or 8-character backup code
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button type="submit" disabled={verifying} className="flex-1 h-11">
            {verifying && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Verify & Continue
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="h-11">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
