import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Menu, Mail, Briefcase, GraduationCap, Users, Building2, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import React from "react";

interface NavGroup {
  label: string;
  icon: React.ElementType;
  links: { to: string; label: string; description?: string; showForRoles?: string[]; hideForRoles?: string[] }[];
}

/**
 * Navigation Component
 * 
 * SECURITY NOTE: Client-side role filtering is used ONLY for UI/UX purposes 
 * (showing/hiding navigation links). This does NOT provide security.
 * Backend authorization is enforced via RLS policies and Edge Functions.
 */
const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
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

  // Grouped navigation structure
  const navGroups: NavGroup[] = [
    {
      label: "Explore",
      icon: Briefcase,
      links: [
        { to: "/jobs", label: "Jobs", description: "Browse cybersecurity roles" },
        { to: "/profiles", label: "Talent", description: "Browse verified professionals" },
        { to: "/marketplace", label: "Marketplace", description: "On-demand talent engagements" },
      ],
    },
    {
      label: "Learn",
      icon: GraduationCap,
      links: [
        { to: "/training", label: "Training", description: "Courses and resources" },
        { to: "/certifications-catalog", label: "Certifications", description: "Industry certifications catalog" },
        { to: "/ctf", label: "CTF Challenges", description: "Test your skills with challenges" },
        { to: "/courses", label: "Courses", description: "Structured training with challenges" },
        { to: "/learning-paths", label: "Learning Paths", description: "Free curated YouTube courses" },
        { to: "/career-assistant", label: "AI Assistant", description: "AI-powered career guidance", showForRoles: ["candidate"] },
      ],
    },
    {
      label: "Community",
      icon: Users,
      links: [
        { to: "/leaderboard", label: "Leaderboard", description: "Top-ranked professionals" },
        { to: "/community", label: "Forum", description: "Discuss and share with peers", showForRoles: ["candidate", "staff", "admin"] },
      ],
    },
    {
      label: "Company",
      icon: Building2,
      links: [
        { to: "/why-cydena", label: "Why Cydena", description: "How we compare to volume platforms" },
        { to: "/pricing", label: "Pricing", description: "Plans and features" },
        { to: "/contact", label: "Contact", description: "Get in touch with us" },
        { to: "/partnerships", label: "Partners", description: "Partnership opportunities" },
      ],
    },
  ];

  // Filter links based on roles
  const filterLink = (link: { showForRoles?: string[]; hideForRoles?: string[] }) => {
    if (link.hideForRoles && userRoles.some(role => link.hideForRoles?.includes(role))) return false;
    if (link.showForRoles && !userRoles.some(role => link.showForRoles?.includes(role))) return false;
    return true;
  };

  const filteredGroups = navGroups.map(group => ({
    ...group,
    links: group.links.filter(filterLink),
  })).filter(group => group.links.length > 0);

  // Check if a path is active (exact or starts with for nested routes)
  const isActivePath = (path: string) => location.pathname === path;
  const isGroupActive = (group: NavGroup) => group.links.some(link => isActivePath(link.to));

  return (
    <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50 bg-background/95">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between min-w-0">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0" onClick={handleNavClick}>
            <img 
              src="/logos/cydena-logo.png" 
              alt="Cydena" 
              className="h-8 md:h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation - Grouped */}
          <TooltipProvider>
            <div className="hidden xl:flex items-center gap-1 ml-4 flex-shrink-0">
              {!isLoading && (
                <>
                  <Link
                    to="/"
                    className={cn(
                      "text-sm font-semibold px-3 py-2 rounded-md transition-colors",
                      location.pathname === "/" ? "text-accent" : "text-foreground/80 hover:text-primary"
                    )}
                  >
                    Home
                  </Link>

                  {filteredGroups.map((group, index) => (
                    <NavDropdown
                      key={group.label}
                      group={group}
                      isActive={isGroupActive(group)}
                      isActivePath={isActivePath}
                      alignRight={index >= filteredGroups.length - 1}
                    />
                  ))}
                </>
              )}

              {/* Auth actions */}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border flex-shrink-0">
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
            </div>
          </TooltipProvider>

          {/* Mobile Menu */}
          <div className="xl:hidden flex items-center gap-1.5 flex-shrink-0">
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
                <Button variant="ghost" size="sm" className="xl:hidden h-9 w-9 p-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-[350px]">
                <div className="flex flex-col gap-4 mt-6">
                  {/* Mobile Auth Actions */}
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
                            <Badge variant="destructive" className="ml-auto">
                              {unreadCount}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    </div>
                  )}
                  
                  {/* Mobile Navigation - Grouped */}
                  <div className="flex flex-col gap-1 pt-4 border-t border-border">
                    <Link
                      to="/"
                      onClick={handleNavClick}
                      className={cn(
                        "text-base font-semibold py-2 px-3 rounded transition-colors",
                        location.pathname === "/" ? "text-accent bg-accent/10" : "text-foreground/80 hover:text-primary hover:bg-muted/50"
                      )}
                    >
                      Home
                    </Link>

                    {!isLoading && filteredGroups.map((group) => (
                      <MobileNavGroup 
                        key={group.label} 
                        group={group} 
                        currentPath={location.pathname}
                        onNavClick={handleNavClick}
                      />
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

// Desktop hover dropdown
const NavDropdown = ({ group, isActive, isActivePath, alignRight }: {
  group: NavGroup;
  isActive: boolean;
  isActivePath: (path: string) => boolean;
  alignRight?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-md transition-colors",
          isActive ? "text-accent" : "text-foreground/80 hover:text-primary"
        )}
      >
        {group.label}
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className={cn("absolute top-full mt-1.5 w-[280px] rounded-md border bg-popover text-popover-foreground shadow-lg z-50 p-3", alignRight ? "right-0" : "left-0")}>
          <ul className="grid gap-1">
            {group.links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/10 hover:text-accent focus:bg-accent/10",
                    isActivePath(link.to) && "bg-accent/10 text-accent"
                  )}
                >
                  <div className="text-sm font-semibold leading-none mb-1">{link.label}</div>
                  {link.description && (
                    <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                      {link.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Mobile collapsible nav group
const MobileNavGroup = ({ group, currentPath, onNavClick }: { 
  group: NavGroup; 
  currentPath: string; 
  onNavClick: () => void;
}) => {
  const [open, setOpen] = useState(() => group.links.some(l => l.to === currentPath));
  const Icon = group.icon;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between text-base font-semibold py-2 px-3 rounded transition-colors",
          group.links.some(l => l.to === currentPath)
            ? "text-accent"
            : "text-foreground/80 hover:text-primary hover:bg-muted/50"
        )}
      >
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {group.label}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="ml-6 mt-1 space-y-1">
          {group.links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onNavClick}
              className={cn(
                "block text-sm py-1.5 px-3 rounded transition-colors",
                currentPath === link.to
                  ? "text-accent bg-accent/10 font-semibold"
                  : "text-muted-foreground hover:text-primary hover:bg-muted/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Navigation;
