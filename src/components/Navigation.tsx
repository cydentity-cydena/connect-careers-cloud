import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, LogOut, Menu, X, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavLink {
  to: string;
  label: string;
  showForRoles?: string[];
  hideForRoles?: string[];
}

/**
 * Navigation Component
 * 
 * SECURITY NOTE: Client-side role filtering is used ONLY for UI/UX purposes 
 * (showing/hiding navigation links). This does NOT provide security.
 * 
 * Backend authorization is enforced independently via:
 * - RLS policies using has_role() function (database level)
 * - Edge Functions validating roles from database (API level)
 * 
 * Even if a user bypasses client-side checks, they cannot access protected
 * data or perform privileged operations due to server-side enforcement.
 */
const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  // NOTE: userRoles is used for UI rendering only - not for security
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const unreadCount = useUnreadMessages();

  useEffect(() => {
    const fetchUserRoles = async (userId: string) => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      setUserRoles(data?.map(r => r.role) || []);
      setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
      if (session?.user) {
        fetchUserRoles(session.user.id);
      } else {
        setUserRoles([]);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user);
      if (session?.user) {
        setIsLoading(true);
        fetchUserRoles(session.user.id);
      } else {
        setUserRoles([]);
        setIsLoading(false);
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
    { to: "/bounties", label: "Bounties" },
    { to: "/marketplace", label: "Marketplace" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/ctf", label: "CTF" },
    { to: "/profiles", label: "Profiles" },
    { to: "/jobs", label: "Jobs" },
    { to: "/career-assistant", label: "AI Assistant", showForRoles: ["candidate"] },
    { to: "/training", label: "Training" },
    { to: "/certifications-catalog", label: "Certifications" },
    { to: "/pricing", label: "Pricing" },
    { to: "/community", label: "Community" },
    { to: "/contact", label: "Contact" },
  ];

  console.log('Current user roles:', userRoles, 'isLoading:', isLoading);
  
  const navLinks = allNavLinks.filter(link => {
    console.log(`Checking ${link.label}:`, { 
      hideForRoles: link.hideForRoles, 
      showForRoles: link.showForRoles,
      userRoles 
    });
    
    // Special handling: Community is visible to candidates, staff, and admin only
    if (link.to === "/community") {
      const allowedRoles = ["candidate", "staff", "admin"];
      const hasAllowedRole = userRoles.some(role => allowedRoles.includes(role));
      console.log(`Community access check:`, { userRoles, hasAllowedRole });
      return hasAllowedRole;
    }
    
    // Hide if hideForRoles includes any of the user's roles
    if (link.hideForRoles && userRoles.some(role => link.hideForRoles?.includes(role))) {
      console.log(`✓ Hiding ${link.label} for roles:`, userRoles);
      return false;
    }
    // Show only if showForRoles includes any of the user's roles (or if no showForRoles specified)
    if (link.showForRoles && !userRoles.some(role => link.showForRoles?.includes(role))) {
      console.log(`✗ Not showing ${link.label} - role requirement not met`);
      return false;
    }
    return true;
  });

  return (
    <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50 bg-background/95">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0" onClick={handleNavClick}>
            <img 
              src="/logos/cydena-logo.png" 
              alt="Cydena" 
              className="h-8 md:h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <TooltipProvider>
            <div className="hidden lg:flex items-center gap-5 xl:gap-7 ml-8">
              {!isLoading && navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-semibold transition-colors duration-150 whitespace-nowrap ${
                    location.pathname === link.to 
                      ? "text-accent" 
                      : "text-foreground/80 hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  {(userRoles.includes('staff') || userRoles.includes('admin')) && (
                    <Link to="/staff/funnel">
                      <Button variant="hero" size="sm" className="font-semibold">
                        Staff Funnel
                      </Button>
                    </Link>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to="/messages" className="relative">
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                          {unreadCount > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                            >
                              {unreadCount}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Messages{unreadCount > 0 ? ` (${unreadCount} unread)` : ''}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Link to="/dashboard">
                    <Button variant="hero" size="sm" className="font-semibold">
                      Dashboard
                    </Button>
                  </Link>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleSignOut}
                        className="flex flex-col items-center gap-0.5 h-auto py-1.5 px-3"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-xs">Sign Out</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sign out of your account</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="hero" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </TooltipProvider>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center gap-1.5 flex-shrink-0">
            {user && (
              <Link to="/messages" onClick={handleNavClick} className="relative">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Mail className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden h-9 w-9 p-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-[350px]">
                <div className="flex flex-col gap-6 mt-6">
                  {/* Mobile Auth Actions - Prioritized */}
                  {user && (
                    <div className="flex flex-col gap-3">
                      {(userRoles.includes('staff') || userRoles.includes('admin')) && (
                        <Link to="/staff/funnel" onClick={handleNavClick}>
                          <Button variant="hero" className="w-full font-semibold">
                            Staff Funnel
                          </Button>
                        </Link>
                      )}
                      <Link to="/dashboard" onClick={handleNavClick}>
                        <Button variant="hero" className="w-full font-semibold">
                          Dashboard
                        </Button>
                      </Link>
                      <Link to="/messages" onClick={handleNavClick}>
                        <Button variant="outline" className="w-full relative justify-start">
                          <Mail className="h-4 w-4 mr-2" />
                          Messages
                          {unreadCount > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="ml-auto"
                            >
                              {unreadCount}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    </div>
                  )}
                  
                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col gap-3 pt-4 border-t border-border">
                    {!isLoading && navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={handleNavClick}
                        className={`text-base font-semibold transition-colors duration-150 py-2 px-1 rounded ${
                          location.pathname === link.to 
                            ? "text-accent bg-accent/10" 
                            : "text-foreground/80 hover:text-primary hover:bg-muted/50"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* Sign Out / Sign In */}
                  <div className="pt-4 border-t border-border">
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
