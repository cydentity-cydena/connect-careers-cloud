import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Loader2, QrCode, Key, CheckCircle, Copy, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QRCode from "qrcode";
import { generateBackupCodes, getRemainingBackupCodes } from "@/lib/backupCodes";

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
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [remainingCodes, setRemainingCodes] = useState(0);

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
    
    // Check remaining backup codes
    if (totpFactor) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const count = await getRemainingBackupCodes(user.id);
        setRemainingCodes(count);
      }
    }
  };

  const handleEnrollMFA = async () => {
    setEnrolling(true);
    try {
      // Clear any previous in-progress TOTP factor to avoid name conflicts
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const pendingTotp = factorsData?.totp?.find((f) => f.status !== "verified");
      if (pendingTotp) {
        await supabase.auth.mfa.unenroll({ factorId: pendingTotp.id });
      }

      const friendlyName = `Cydena ${new Date().toISOString()}`;
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "Cydena",
        friendlyName,
      });

      if (error) throw error;

      if (data) {
        setFactorId(data.id);
        setSecret(data.totp.secret);
        
        // Generate QR code image from the otpauth:// URI
        const otpauthUri = data.totp.qr_code;
        console.log('OTP Auth URI:', otpauthUri);
        
        if (otpauthUri) {
          try {
            // Simplified QR code generation
            const qrCodeDataUrl = await QRCode.toDataURL(otpauthUri);
            console.log('QR Code generated successfully');
            setQrCode(qrCodeDataUrl);
          } catch (err) {
            console.error('Error generating QR code:', err);
            console.error('Error details:', JSON.stringify(err, null, 2));
            toast.error('Failed to generate QR code. Please use manual entry.');
          }
        } else {
          console.error('No otpauth URI provided');
          toast.error('No QR code URI available. Please use manual entry.');
        }
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

      // Generate backup codes
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const codes = await generateBackupCodes(user.id);
        setBackupCodes(codes);
        setShowBackupCodes(true);
      }

      toast.success("MFA enabled successfully! Please save your backup codes.");
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

  const handleResetEnrollment = async () => {
    try {
      setEnrolling(true);
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const pending = data?.totp?.filter((f) => f.status !== "verified") || [];
      for (const f of pending) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }

      toast.success("Pending MFA setup reset. Please enroll again.");
      await handleEnrollMFA();
    } catch (err: any) {
      console.error("Error resetting MFA enrollment:", err);
      toast.error(err.message || "Failed to reset MFA setup");
      setEnrolling(false);
    }
  };

  const handleDisableMFA = async () => {
    toast.error("Two-factor authentication is mandatory for all users on this security platform and cannot be disabled.");
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
                <CardTitle>Two-Factor Authentication (2FA) - Required</CardTitle>
                <CardDescription>
                  Mandatory security requirement for all platform users
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {showBackupCodes ? (
              <div className="space-y-6">
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <Key className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-500">
                    <strong>Important:</strong> Save these backup codes now. They won't be shown again and can be used if you lose access to your authenticator app.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Your Backup Codes</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(backupCodes.join('\n'));
                          toast.success('Backup codes copied to clipboard');
                        }}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'cydena-backup-codes.txt';
                          a.click();
                          toast.success('Backup codes downloaded');
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg border">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center gap-2 font-mono text-sm">
                        <span className="text-muted-foreground">{index + 1}.</span>
                        <code className="bg-background px-2 py-1 rounded">{code}</code>
                      </div>
                    ))}
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Each backup code can only be used once. Store them securely in a password manager or safe location.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={() => {
                      setShowBackupCodes(false);
                      setBackupCodes([]);
                      checkMFAStatus();
                    }}
                    className="w-full"
                  >
                    I've Saved My Backup Codes
                  </Button>
                </div>
              </div>
            ) : mfaEnabled ? (
              <div className="space-y-4">
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-500">
                    Two-factor authentication is enabled and protecting your account
                  </AlertDescription>
                </Alert>
                {remainingCodes > 0 && (
                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertDescription>
                      You have {remainingCodes} unused backup code{remainingCodes !== 1 ? 's' : ''} remaining.
                    </AlertDescription>
                  </Alert>
                )}
                <Alert variant="destructive">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    MFA is mandatory for all users on this cybersecurity platform and cannot be disabled.
                  </AlertDescription>
                </Alert>
              </div>
            ) : enrolling ? (
              <div className="space-y-6">
                <Alert>
                  <QrCode className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Step 1:</strong> Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
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
                        <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                          {secret}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(secret);
                            toast.success('Secret code copied to clipboard');
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Use this code if you can't scan the QR code
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="verify-code"><strong>Step 2:</strong> Enter the 6-digit code from your authenticator app</Label>
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
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Mandatory Security Requirement:</strong> Two-factor authentication is required for all users on this cybersecurity platform. You must enable 2FA to access your account.
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-muted-foreground">
                  You'll need to scan a QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.) and enter a 6-digit verification code.
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleEnrollMFA}>
                    <Shield className="h-4 w-4 mr-2" />
                    Set Up 2FA Now
                  </Button>
                  <Button variant="outline" onClick={handleResetEnrollment}>
                    Reset pending setup
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SecuritySettings;
