import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "resent">("loading");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const type = searchParams.get("type");

      // If no token, show resend option
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        // Handle different verification types
        const verifyType = type === "signup" ? "signup" : type === "invite" ? "invite" : "email";
        
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: verifyType,
        });

        if (error) {
          console.error("Verification error:", error);
          setStatus("error");
        } else {
          setStatus("success");
          setTimeout(() => {
            navigate("/dashboard");
          }, 3000);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleResendVerification = async () => {
    if (!email) {
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) throw error;

      setStatus("resent");
    } catch (error: any) {
      console.error("Resend error:", error);
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <SEO
        title="Verify Email - Cydena"
        description="Verify your Cydena account email address"
      />
      <Navigation />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {status === "loading" && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                <CardTitle>Verifying your email...</CardTitle>
                <CardDescription>Please wait while we verify your email address</CardDescription>
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <CardTitle>Email Verified!</CardTitle>
                <CardDescription>
                  Your email has been successfully verified. Redirecting you to your dashboard...
                </CardDescription>
              </>
            )}
            {status === "error" && (
              <>
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <CardTitle>Verification Failed</CardTitle>
                <CardDescription>
                  The verification link is invalid or has expired. Please request a new one.
                </CardDescription>
              </>
            )}
            {status === "resent" && (
              <>
                <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
                <CardTitle>Verification Email Sent</CardTitle>
                <CardDescription>
                  Check your inbox for a new verification email.
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {status === "success" && (
              <Button onClick={() => navigate("/dashboard")} className="w-full">
                Go to Dashboard
              </Button>
            )}
            {status === "error" && (
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <Button
                  onClick={handleResendVerification}
                  disabled={resending || !email}
                  className="w-full"
                >
                  {resending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Resend Verification Email
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  variant="outline"
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default VerifyEmail;
