import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavLink {
  to: string;
  label: string;
  showForRoles?: string[];
  hideForRoles?: string[];
}

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserRole = async (userId: string) => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      setUserRole(data?.role || null);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const allNavLinks: NavLink[] = [
    { to: "/", label: "Home" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/profiles", label: "Profiles" },
    { to: "/community", label: "Community", hideForRoles: ["employer", "recruiter"] },
    { to: "/jobs", label: "Jobs" },
    { to: "/career-assistant", label: "AI Assistant", showForRoles: ["candidate"] },
    { to: "/training", label: "Training" },
    { to: "/certifications-catalog", label: "Certifications" },
    { to: "/pricing", label: "Pricing", hideForRoles: ["candidate"] },
    { to: "/roi-calculator", label: "ROI Calculator", hideForRoles: ["candidate"] },
    { to: "/contact", label: "Contact" },
  ];

  const navLinks = allNavLinks.filter(link => {
    // Hide if hideForRoles includes current role
    if (link.hideForRoles && userRole && link.hideForRoles.includes(userRole)) {
      return false;
    }
    // Show only if showForRoles includes current role (or if no showForRoles specified)
    if (link.showForRoles && (!userRole || !link.showForRoles.includes(userRole))) {
      return false;
    }
    return true;
  });

  return (
    <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50 bg-background/95">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0" onClick={handleNavClick}>
            <img 
              src="/logos/cydena-logo.png" 
              alt="Cydena Logo" 
              className="h-8 md:h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors whitespace-nowrap ${
                  location.pathname === link.to 
                    ? "text-accent hover:text-accent/80 font-semibold" 
                    : "hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="hero" size="sm" className="font-semibold">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="flex flex-col items-center gap-0.5 h-auto py-1.5 px-3"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-xs">Sign Out</span>
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="hero" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center gap-2">
            {user && (
              <Link to="/dashboard" onClick={handleNavClick}>
                <Button variant="hero" size="sm" className="font-semibold">
                  Dashboard
                </Button>
              </Link>
            )}
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="flex flex-col gap-6 mt-8">
                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={handleNavClick}
                        className={`text-base font-medium transition-colors py-2 ${
                          location.pathname === link.to 
                            ? "text-accent hover:text-accent/80 font-semibold" 
                            : "hover:text-primary"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Auth Actions */}
                  <div className="pt-4 border-t border-border flex flex-col gap-3">
                    {user ? (
                      <Button variant="outline" onClick={handleSignOut} className="w-full">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    ) : (
                      <Link to="/auth" onClick={handleNavClick}>
                        <Button variant="hero" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
