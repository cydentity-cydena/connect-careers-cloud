import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, LogOut, Loader2, Menu, X } from "lucide-react";
import { toast } from "sonner";
import CandidateDashboard from "@/components/dashboard/CandidateDashboard";
import EmployerDashboard from "@/components/dashboard/EmployerDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import RecruiterDashboard from "@/components/dashboard/RecruiterDashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      setUser(session.user);

      // Get all user roles (user may have multiple)
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (roleError) {
        console.error("Error fetching role:", roleError);
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
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
                Cydena
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
                Leaderboard
              </Link>
              <Link to="/community" className="text-sm font-medium hover:text-primary transition-colors">
                Community
              </Link>
              <Link to="/profiles" className="text-sm font-medium hover:text-primary transition-colors">
                Profiles
              </Link>
              <Link to="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
                Jobs
              </Link>
              {userRole === 'candidate' && (
                <Link to="/career-assistant" className="text-sm font-medium hover:text-primary transition-colors">
                  AI Assistant
                </Link>
              )}
              <Link to="/training" className="text-sm font-medium hover:text-primary transition-colors">
                Training
              </Link>
              <Link to="/certifications-catalog" className="text-sm font-medium hover:text-primary transition-colors">
                Certifications
              </Link>
              {userRole !== 'candidate' && (
                <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                  Pricing
                </Link>
              )}
              <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </Link>

              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex xl:hidden items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="xl:hidden mt-4 pb-4 space-y-3">
              <Link 
                to="/" 
                className="block text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/leaderboard" 
                className="block text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Leaderboard
              </Link>
              <Link 
                to="/community" 
                className="block text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Community
              </Link>
              <Link 
                to="/profiles" 
                className="block text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profiles
              </Link>
              <Link 
                to="/jobs" 
                className="block text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Jobs
              </Link>
              {userRole === 'candidate' && (
                <Link 
                  to="/career-assistant" 
                  className="block text-sm font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AI Assistant
                </Link>
              )}
              <Link 
                to="/training" 
                className="block text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Training
              </Link>
              <Link 
                to="/certifications-catalog" 
                className="block text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Certifications
              </Link>
              {userRole !== 'candidate' && (
                <Link 
                  to="/pricing" 
                  className="block text-sm font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
              )}
              <Link 
                to="/contact" 
                className="block text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">{user?.email}</p>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        {userRole === "candidate" && <CandidateDashboard />}
        {userRole === "employer" && <EmployerDashboard />}
        {userRole === "recruiter" && <RecruiterDashboard />}
        {userRole === "admin" && <AdminDashboard />}
        {!userRole && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Setting up your account...</h2>
            <p className="text-muted-foreground">This should only take a moment.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
