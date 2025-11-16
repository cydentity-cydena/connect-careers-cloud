import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Loader2, QrCode, Key, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QRCode from "qrcode";

const SecuritySettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    await checkMFAStatus();
    setLoading(false);
  };

  const checkMFAStatus = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      console.error("Error checking MFA status:", error);
      return;
    }
    
    const totpFactor = data?.totp?.find((f) => f.status === "verified");
    setMfaEnabled(!!totpFactor);
  };

  const handleEnrollMFA = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });

      if (error) throw error;

      if (data) {
        setFactorId(data.id);
        setSecret(data.totp.secret);
        
        // Generate QR code
        const qrCodeUrl = data.totp.qr_code;
        setQrCode(qrCodeUrl);
      }
    } catch (error: any) {
      console.error("Error enrolling MFA:", error);
      toast.error(error.message || "Failed to enroll MFA");
      setEnrolling(false);
    }
  };

  const handleVerifyMFA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: factorId,
        code: verificationCode,
      });

      if (error) throw error;

      toast.success("MFA enabled successfully!");
      setMfaEnabled(true);
      setEnrolling(false);
      setVerificationCode("");
      setQrCode("");
      setSecret("");
    } catch (error: any) {
      console.error("Error verifying MFA:", error);
      toast.error(error.message || "Invalid verification code");
    } finally {
      setVerifying(false);
    }
  };

  const handleDisableMFA = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.find((f) => f.status === "verified");
      
      if (!totpFactor) {
        toast.error("No MFA factor found");
        return;
      }

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: totpFactor.id,
      });

      if (error) throw error;

      toast.success("MFA disabled successfully");
      setMfaEnabled(false);
    } catch (error: any) {
      console.error("Error disabling MFA:", error);
      toast.error(error.message || "Failed to disable MFA");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Security Settings</h1>
          <p className="text-muted-foreground">
            Manage your account security and two-factor authentication
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {mfaEnabled ? (
              <div className="space-y-4">
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-500">
                    Two-factor authentication is enabled on your account
                  </AlertDescription>
                </Alert>
                <Button variant="destructive" onClick={handleDisableMFA}>
                  Disable 2FA
                </Button>
              </div>
            ) : enrolling ? (
              <div className="space-y-6">
                <Alert>
                  <QrCode className="h-4 w-4" />
                  <AlertDescription>
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </AlertDescription>
                </Alert>

                {qrCode && (
                  <div className="flex flex-col items-center space-y-4">
                    <img src={qrCode} alt="MFA QR Code" className="w-64 h-64" />
                    
                    <div className="w-full max-w-sm space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Or enter this code manually:
                      </Label>
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {secret}
                        </code>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="verify-code">Enter 6-digit code from your app</Label>
                  <Input
                    id="verify-code"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleVerifyMFA} disabled={verifying}>
                    {verifying && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Verify & Enable
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEnrolling(false);
                      setVerificationCode("");
                      setQrCode("");
                      setSecret("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication adds an extra layer of security to your account. 
                  You'll need to enter a code from your authenticator app every time you sign in.
                </p>
                <Button onClick={handleEnrollMFA}>
                  <Shield className="h-4 w-4 mr-2" />
                  Enable 2FA
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SecuritySettings;
