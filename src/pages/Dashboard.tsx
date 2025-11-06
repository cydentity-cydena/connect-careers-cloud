import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import CandidateDashboard from "@/components/dashboard/CandidateDashboard";
import EmployerDashboard from "@/components/dashboard/EmployerDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import RecruiterDashboard from "@/components/dashboard/RecruiterDashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      } else if (event === 'SIGNED_IN' && session) {
        checkUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async (retryCount = 0) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get all user roles (user may have multiple)
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (roleError) {
        console.error("Error fetching role:", roleError);
        setIsLoading(false);
        return;
      }

      // Priority: admin > recruiter > employer > candidate
      let selectedRole = null;
      if (roleData && roleData.length > 0) {
        const roles = roleData.map(r => r.role);
        if (roles.includes('admin')) {
          selectedRole = 'admin';
        } else if (roles.includes('recruiter')) {
          selectedRole = 'recruiter';
        } else if (roles.includes('employer')) {
          selectedRole = 'employer';
        } else if (roles.includes('candidate')) {
          selectedRole = 'candidate';
        }
      }

      // If no role found and we haven't retried too many times, retry after a delay
      if (!selectedRole && retryCount < 3) {
        console.log(`No role found, retrying (${retryCount + 1}/3)...`);
        setTimeout(() => checkUser(retryCount + 1), 1000);
        return;
      }

      setUserRole(selectedRole);
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking user:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Checking your account…</h2>
            <p className="text-muted-foreground">One moment while we load your dashboard.</p>
          </div>
        ) : (
          <>
            {userRole === "candidate" && <CandidateDashboard />}
            {userRole === "employer" && <EmployerDashboard />}
            {userRole === "recruiter" && <RecruiterDashboard />}
            {userRole === "admin" && <AdminDashboard />}
            {!userRole && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-xl font-semibold mb-2">Almost there…</h2>
                <p className="text-muted-foreground">We couldn't detect a role yet. Please refresh or contact support.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
