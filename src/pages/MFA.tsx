import SEO from "@/components/SEO";
import { MFAVerification } from "@/components/auth/MFAVerification";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "@/components/Footer";

const MFA = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Two-Factor Verification | Cydena" description="Verify your sign-in with a 6-digit code" />
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">Verify your identity</h1>
          </div>
          <MFAVerification onCancel={() => navigate(from)} />
          <div className="mt-4 text-sm text-muted-foreground">
            Lost access? You can disable or reset MFA from Security Settings.
          </div>
          <div className="mt-2">
            <Button variant="link" onClick={() => navigate("/security-settings")}>Go to Security Settings</Button>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default MFA;
