import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasMFA, setHasMFA] = useState(false);
  const [mfaChecked, setMfaChecked] = useState(false);
  const [needsMfaVerify, setNeedsMfaVerify] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      const isSecuritySettings = location.pathname === '/security-settings' || location.pathname === '/security';
      const isMfaRoute = location.pathname === '/mfa';

      if (session && !(isSecuritySettings || isMfaRoute)) {
        // Check MFA setup
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const hasVerifiedMFA = factors?.totp?.some((f) => f.status === 'verified');
        setHasMFA(!!hasVerifiedMFA);

        if (!hasVerifiedMFA) {
          // No MFA configured at all → require setup
          toast.warning('Two-factor authentication setup is required to access your account.');
        } else {
          // MFA configured → verify AAL level and require challenge if needed
          const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
          const isAAL2 = aalData?.currentLevel === 'aal2';
          setNeedsMfaVerify(!isAAL2);
          if (!isAAL2) {
            toast.message('Please complete two-factor verification to continue.');
          }
        }
      } else {
        // Allow access to security and MFA routes regardless of current AAL
        setHasMFA(true);
      }
      
      setMfaChecked(true);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setHasMFA(false);
        setMfaChecked(false);
        setNeedsMfaVerify(false);
      } else {
        // Defer to avoid deadlocks per best practices
        setTimeout(() => {
          checkAuth();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect if MFA configured but current session isn't verified at AAL2
  if (mfaChecked && hasMFA && needsMfaVerify && location.pathname !== '/mfa') {
    return <Navigate to="/mfa" state={{ from: location }} replace />;
  }

  // Redirect to MFA setup if not configured (except on security settings or MFA page)
  if (mfaChecked && !hasMFA && location.pathname !== '/security-settings') {
    return <Navigate to="/security-settings" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
