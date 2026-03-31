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
  const [isCandidateOnly, setIsCandidateOnly] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      const isSecuritySettings = location.pathname === '/security-settings' || location.pathname === '/security';
      const isMfaRoute = location.pathname === '/mfa';

      if (session && !(isSecuritySettings || isMfaRoute)) {
        // Check user role — MFA is optional for candidates
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id);
        
        const userRoles = roles?.map(r => r.role) || [];
        const candidateOnly = userRoles.length > 0 && userRoles.every(r => r === 'candidate');
        setIsCandidateOnly(candidateOnly);

        // Check MFA setup
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const hasVerifiedMFA = factors?.totp?.some((f) => f.status === 'verified');
        setHasMFA(!!hasVerifiedMFA);

        // MFA is optional for all roles — but if set up, require AAL2 verification
        if (hasVerifiedMFA) {
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
        setIsCandidateOnly(false);
      } else {
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

  // MFA setup is optional — no forced redirect to security-settings

  return <>{children}</>;
};

export default ProtectedRoute;
