import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "confirm">("confirm");
  const [error, setError] = useState<string | null>(null);
  
  const token = searchParams.get("token");

  const handleUnsubscribe = async () => {
    if (!token) {
      setStatus("error");
      setError("Invalid unsubscribe link. Please check your email for the correct link.");
      return;
    }

    setStatus("loading");
    
    try {
      const { data, error } = await supabase.functions.invoke("unsubscribe-email", {
        body: { token },
      });

      if (error) throw error;

      setStatus("success");
    } catch (err: any) {
      console.error("Unsubscribe error:", err);
      setStatus("error");
      setError(err.message || "Failed to unsubscribe. Please try again.");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEO title="Unsubscribe | Cydena" description="Manage your email preferences" />
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle>Invalid Link</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                This unsubscribe link is invalid or expired. Please use the link from your email.
              </p>
              <Button onClick={() => navigate("/")}>Go Home</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Unsubscribe | Cydena" description="Manage your email preferences" />
      <Navigation />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full">
          {status === "confirm" && (
            <>
              <CardHeader className="text-center">
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Unsubscribe from Emails</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Are you sure you want to unsubscribe from Cydena emails? You will no longer receive daily challenges and community updates.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Cancel
                  </Button>
                  <Button onClick={handleUnsubscribe}>
                    Unsubscribe
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {status === "loading" && (
            <>
              <CardHeader className="text-center">
                <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                <CardTitle>Processing...</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Please wait while we update your preferences.
                </p>
              </CardContent>
            </>
          )}

          {status === "success" && (
            <>
              <CardHeader className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle>Successfully Unsubscribed</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  You have been unsubscribed from Cydena emails. You can re-enable notifications anytime from your dashboard settings.
                </p>
                <Button onClick={() => navigate("/")}>Go Home</Button>
              </CardContent>
            </>
          )}

          {status === "error" && (
            <>
              <CardHeader className="text-center">
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <CardTitle>Something Went Wrong</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  {error}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Go Home
                  </Button>
                  <Button onClick={handleUnsubscribe}>
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Unsubscribe;