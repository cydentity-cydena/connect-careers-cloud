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
}

export const MFAVerification = ({ onCancel }: MFAVerificationProps) => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
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
      navigate("/dashboard");
    } catch (error: any) {
      console.error("MFA verification error:", error);
      toast.error(error.message || "Invalid verification code");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Enter the 6-digit code from your authenticator app
      </p>
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mfa-code">Verification Code</Label>
          <Input
            id="mfa-code"
            type="text"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={verifying} className="flex-1">
            {verifying && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Verify
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
