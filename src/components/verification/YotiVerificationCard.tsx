import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, ShieldCheck, ShieldAlert, QrCode, Loader2, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { useYotiVerification, VerificationType } from "@/hooks/useYotiVerification";

interface YotiVerificationCardProps {
  userId: string;
  /** Which types to show — defaults to both */
  types?: VerificationType[];
  /** Compact single-line mode */
  compact?: boolean;
}

export function YotiVerificationCard({ userId, types = ["identity", "rtw"], compact = false }: YotiVerificationCardProps) {
  const {
    identityVerification,
    rtwVerification,
    isLoading,
    creating,
    createSession,
    simulateComplete,
    identityStatus,
    rtwStatus,
  } = useYotiVerification(userId);

  const [activeSession, setActiveSession] = useState<{
    type: VerificationType;
    qr_code_url: string;
    verification_id: string;
    session_id: string;
  } | null>(null);

  const handleStartVerification = async (type: VerificationType) => {
    const result = await createSession(type);
    if (result) {
      setActiveSession({
        type,
        qr_code_url: result.qr_code_url,
        verification_id: result.verification_id,
        session_id: result.session_id,
      });
    }
  };

  const handleSimulateComplete = async () => {
    if (!activeSession) return;
    await simulateComplete(activeSession.verification_id);
    setActiveSession(null);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
      case "pending":
      case "in_progress":
        return <Badge variant="outline" className="border-yellow-500/30 text-yellow-400"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      case "expired":
        return <Badge variant="outline" className="text-muted-foreground"><Clock className="h-3 w-3 mr-1" /> Expired</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Not Started</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const allCompleted = 
    (!types.includes("identity") || identityStatus === "completed") &&
    (!types.includes("rtw") || rtwStatus === "completed");

  return (
    <>
      <Card className={`border-border/50 ${allCompleted ? "border-green-500/30 bg-green-500/5" : "border-primary/20"}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {allCompleted ? (
              <ShieldCheck className="h-5 w-5 text-green-400" />
            ) : (
              <Shield className="h-5 w-5 text-primary" />
            )}
            Yoti Identity Verification
          </CardTitle>
          <CardDescription>
            {allCompleted
              ? "Your identity has been verified via Yoti"
              : "Verify your identity by scanning a QR code with the Yoti app"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {types.includes("identity") && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Identity Check</p>
                  <p className="text-xs text-muted-foreground">Passport or driving licence</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(identityStatus)}
                {identityStatus !== "completed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartVerification("identity")}
                    disabled={creating || identityStatus === "pending"}
                  >
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4 mr-1" />}
                    {identityStatus === "pending" ? "Resume" : "Verify"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {types.includes("rtw") && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-secondary" />
                <div>
                  <p className="font-medium text-sm">Right to Work (UK)</p>
                  <p className="text-xs text-muted-foreground">Home Office compliant RTW check</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(rtwStatus)}
                {rtwStatus !== "completed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartVerification("rtw")}
                    disabled={creating || rtwStatus === "pending"}
                  >
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4 mr-1" />}
                    {rtwStatus === "pending" ? "Resume" : "Verify"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {!allCompleted && (
            <p className="text-xs text-muted-foreground">
              Powered by Yoti — automated, UK Home Office compliant. £2.50 verification fee applies.
            </p>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={!!activeSession} onOpenChange={(open) => !open && setActiveSession(null)}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Scan with Yoti App
            </DialogTitle>
            <DialogDescription>
              {activeSession?.type === "identity"
                ? "Open the Yoti app on your phone and scan this QR code to verify your identity"
                : "Open the Yoti app on your phone and scan this QR code to verify your Right to Work"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {activeSession?.qr_code_url && (
              <div className="bg-white p-4 rounded-xl">
                <img
                  src={activeSession.qr_code_url}
                  alt="Yoti verification QR code"
                  className="w-64 h-64"
                />
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Session: <code className="text-[10px]">{activeSession?.session_id}</code></p>
              <p>This QR code expires in 30 minutes</p>
            </div>

            {/* Mock completion button — only shown in dev/mock mode */}
            <div className="border-t border-border/50 pt-4 w-full">
              <p className="text-xs text-muted-foreground mb-2">
                🧪 <strong>Development Mode</strong> — simulate a successful verification
              </p>
              <Button
                onClick={handleSimulateComplete}
                variant="default"
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Simulate Successful Verification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
