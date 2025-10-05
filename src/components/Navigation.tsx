import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navigation = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user);
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

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/profiles", label: "Profiles" },
    { to: "/community", label: "Community" },
    { to: "/jobs", label: "Jobs" },
    { to: "/training", label: "Training" },
    { to: "/certifications-catalog", label: "Certifications" },
    { to: "/pricing", label: "Pricing" },
    { to: "/roi-calculator", label: "ROI Calculator" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50 bg-background/95">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0" onClick={handleNavClick}>
            <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <span className="text-xl md:text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
              Cydena
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
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
                <Button variant="ghost" size="sm">
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
                        className="text-base font-medium hover:text-primary transition-colors py-2"
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
