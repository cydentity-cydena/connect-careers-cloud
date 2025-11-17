import SEO from "@/components/SEO";
import { MFAVerification } from "@/components/auth/MFAVerification";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

const MFA = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95 flex flex-col">
      <SEO title="Two-Factor Verification | Cydena" description="Verify your sign-in with a 6-digit code" />
      <Navigation />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Verify Your Identity</h1>
            <p className="text-muted-foreground">
              Two-factor authentication adds an extra layer of security to your account
            </p>
          </div>
          
          <Card className="p-8 shadow-2xl border-border/50 backdrop-blur-sm bg-card/50">
            <MFAVerification onCancel={() => navigate(from)} />
            
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>Lost access to your device? Use a backup code or visit Security Settings for help.</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/security-settings")}
                className="w-full"
              >
                Go to Security Settings
              </Button>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MFA;
