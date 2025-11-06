import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Shield, Loader2, CheckCircle, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Validation schemas
const publicEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'mail.com', 'protonmail.com', 'live.com', 'msn.com'];

const emailSchema = z.string().email("Invalid email address").max(255, "Email too long");

const professionalEmailSchema = z.string()
  .email("Invalid email address")
  .max(255, "Email too long")
  .refine((email) => {
    const domain = email.split('@')[1]?.toLowerCase();
    return !publicEmailDomains.includes(domain);
  }, { message: "Please use a professional/company email address, not a personal email" });
const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");
const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");
const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be 20 characters or less")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState<"candidate" | "employer" | "recruiter">("candidate");
  const [inviteOnlyMessage, setInviteOnlyMessage] = useState<string | null>(null);
  const oauthProfileStarted = useRef(false);

  useEffect(() => {
    // Check if user is already logged in and has a role
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Check if user has a role assigned
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (roleData?.role) {
          // User has a role, redirect to dashboard
          navigate("/dashboard");
        } else {
          // New OAuth user without role - complete profile setup
          console.log('New OAuth user detected, completing profile...');
          if (!oauthProfileStarted.current) {
            oauthProfileStarted.current = true;
            await completeOAuthProfile(session.user);
          }
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check if user has a role assigned
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (roleData?.role) {
          navigate('/dashboard');
        } else {
          // New OAuth user - complete profile
          console.log('OAuth sign-in detected, completing profile...');
          if (!oauthProfileStarted.current) {
            oauthProfileStarted.current = true;
            await completeOAuthProfile(session.user);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const completeOAuthProfile = async (user: any) => {
    try {
      setIsLoading(true);

      // Extract name from user metadata or use email
      const fullName = user.user_metadata?.full_name || 
                      user.user_metadata?.name || 
                      user.email?.split('@')[0] || 
                      'User';

      console.log('Completing OAuth profile for:', user.email, 'with name:', fullName);

      // Call secure-signup edge function to complete profile
      // Username will be auto-generated in the edge function
      const { data, error } = await supabase.functions.invoke('secure-signup', {
        body: {
          email: user.email,
          fullName: fullName,
          role: 'candidate', // OAuth users are always candidates
          isOAuthCompletion: true
        }
      });

      if (error) {
        let msg = error.message;
        try {
          if (error instanceof FunctionsHttpError) {
            const err = await error.context.json();
            msg = err?.error || err?.message || msg;
          }
        } catch {}
        console.error('Secure signup error:', error, msg);
        throw new Error(msg);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to complete profile');
      }

      toast.success("Welcome! Your account has been set up successfully.");
      navigate('/dashboard');
    } catch (error: any) {
      console.error('OAuth profile completion error:', error);
      toast.error(error.message || "Failed to complete profile setup. Please contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'linkedin_oidc') => {
    try {
      setIsLoading(true);

      const redirectUrl = `${window.location.origin}/auth`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('OAuth error:', error);
      toast.error(error.message || "Failed to sign in with OAuth");
      setIsLoading(false);
    }
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    // Reset any previous invite-only message
    setInviteOnlyMessage(null);
    
    // Validate inputs
    try {
      // Use professional email validation for employers/recruiters
      if (userRole === 'employer' || userRole === 'recruiter') {
        professionalEmailSchema.parse(email);
      } else {
        emailSchema.parse(email);
      }
      passwordSchema.parse(password);
      nameSchema.parse(fullName);
      
      // Username is required for candidates, optional for employers and recruiters
      if (userRole === "candidate") {
        usernameSchema.parse(username);
        
        // Check if username contains parts of the user's name
        const nameParts = fullName.trim().toLowerCase().split(/\s+/);
        const usernameToCheck = username.trim().toLowerCase();
        
        for (const part of nameParts) {
          // Check name parts that are at least 3 characters long
          if (part.length >= 3 && usernameToCheck.includes(part)) {
            toast.error("Username cannot contain parts of your name");
            return;
          }
        }
      } else if (username.trim()) {
        // If employer/recruiter provides username, validate it
        usernameSchema.parse(username);
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    if (!userRole) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting secure signup process...');
      
      // Call secure signup edge function
      const { data, error: functionError } = await supabase.functions.invoke('secure-signup', {
        body: {
          email: email.trim().toLowerCase(),
          password,
          fullName: fullName.trim(),
          username: username.trim().toLowerCase(),
          role: userRole,
        },
      });

      if (functionError) {
        let msg = functionError.message;
        try {
          if (functionError instanceof FunctionsHttpError) {
            const err = await functionError.context.json();
            msg = err?.error || err?.message || msg;
          }
        } catch {}
        throw new Error(msg);
      }
      if (!data.success) throw new Error(data.error || 'Signup failed');

      console.log('Signup successful, now signing in...');

      // Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) throw signInError;

      toast.success("Account created successfully! Welcome to Cydena.");
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Signup error:', error);
      
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('invite-only') || errorMessage.includes('request access')) {
        setInviteOnlyMessage("Signups are invite-only right now. If you're on the Founding 20 or early access list, use your approved email or contact us.");
      } else if (errorMessage.includes('already registered') || errorMessage.includes('already taken') || errorMessage.includes('email_exists')) {
        toast.error("This email is already registered. Please sign in or use a different email.");
      } else if (errorMessage.includes('Username already taken')) {
        toast.error("Username already taken. Please choose another.");
      } else if (errorMessage.includes('Invalid email')) {
        toast.error("Please enter a valid email address.");
      } else if (errorMessage.includes('Password') || errorMessage.includes('password')) {
        toast.error("Password does not meet requirements. Use 12+ characters with mixed case, numbers, and symbols.");
      } else if (errorMessage.includes('Username') || errorMessage.includes('username')) {
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage || "Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    try {
      emailSchema.parse(email);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      if (error.message?.includes('Invalid login credentials')) {
        toast.error("Invalid email or password. Please try again.");
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error("Please confirm your email before signing in.");
      } else {
        toast.error(error.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Sign In - Cydena Cybersecurity Jobs Platform"
        description="Sign in or create your free Cydena account. Access cybersecurity jobs, showcase certifications, and connect with top employers. 100% free for candidates."
        keywords="cybersecurity jobs login, security analyst signup, infosec careers, penetration tester account"
      />
      <Navigation />
      
      <div className="flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-center mb-8 animate-fade-in">
            <img 
              src="/logos/cydena-logo.png" 
              alt="Cydena Cybersecurity Recruitment Platform" 
              className="h-12 w-auto animate-pulse drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
            />
          </div>

          {/* Info Section */}
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Join the Cybersecurity Recruitment Revolution</h1>
            <p className="text-muted-foreground mb-6">
              Create your free account to access exclusive cybersecurity job opportunities, showcase your verified certifications, and connect directly with top employers. No recruitment fees, no barriers - just opportunities.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-card/50 border border-border rounded-lg p-4">
                <CheckCircle className="h-6 w-6 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">100% Free for Candidates</h3>
                <p className="text-xs text-muted-foreground">Full access to all features. No credit card required.</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-4">
                <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Verified Certifications</h3>
                <p className="text-xs text-muted-foreground">Showcase CISSP, CEH, Security+, and more.</p>
              </div>
              <div className="bg-card/50 border border-border rounded-lg p-4">
                <CheckCircle className="h-6 w-6 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Direct Employer Access</h3>
                <p className="text-xs text-muted-foreground">Skip recruiters, message hiring managers directly.</p>
              </div>
            </div>
          </div>

        <div className="max-w-md mx-auto">
        <Card className="border-border shadow-card animate-slide-up">
          <CardHeader>
            <CardTitle>Welcome to Cydena</CardTitle>
            <CardDescription>
              Sign in to your cybersecurity career dashboard or create your free account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  {/* Google OAuth temporarily disabled during invite-only period */}
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-xs text-center text-muted-foreground">
                      <span className="font-medium">Google Sign-In temporarily unavailable.</span><br />
                      Signups are invite-only. If you're on the approved list, please use email/password above.
                    </p>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                {/* Free for Candidates Badge */}
                {userRole === "candidate" && (
                  <div className="mb-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="font-medium text-green-700 dark:text-green-400">
                        100% Free - No credit card required
                      </span>
                    </div>
                  </div>
                )}
                
                {inviteOnlyMessage && (
                  <Alert className="mb-4 border-primary/30">
                    <AlertTitle>Invite-only signups</AlertTitle>
                    <AlertDescription>{inviteOnlyMessage}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">I am a...</Label>
                    <Select value={userRole} onValueChange={(v: any) => setUserRole(v)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border z-50">
                        <SelectItem value="candidate">Candidate (Free) ✨</SelectItem>
                        <SelectItem value="employer">Employer</SelectItem>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">
                      Full Name {userRole === 'candidate' ? '(private)' : '(public)'}
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  {userRole === 'candidate' && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-username">
                        Username (public) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="cyber_pro"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        required
                        minLength={3}
                        maxLength={20}
                      />
                      <p className="text-xs text-muted-foreground">
                        3-20 characters: letters, numbers, underscores only
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={(userRole === 'employer' || userRole === 'recruiter') ? "you@yourcompany.com" : "you@example.com"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {(userRole === 'employer' || userRole === 'recruiter') && (
                      <p className="text-xs text-muted-foreground">
                        Professional/company email required (not Gmail, Yahoo, etc.)
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={12}
                      placeholder="Min 12 chars with uppercase, lowercase, number & special char"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  {/* Google OAuth temporarily disabled during invite-only period */}
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-xs text-center text-muted-foreground">
                      <span className="font-medium">Google Sign-In temporarily unavailable.</span><br />
                      Signups are invite-only. If you're on the approved list, please use email/password above.
                    </p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </div>

        {/* Additional SEO Content - Collapsible */}
        <Collapsible className="mt-12 max-w-3xl mx-auto">
          <Card className="border-2">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="space-y-1 text-left">
                  <CardTitle className="text-xl">About Cydena Cybersecurity Recruitment</CardTitle>
                  <CardDescription>
                    Learn more about our specialized cybersecurity recruitment platform
                  </CardDescription>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 [&[data-state=open]]:rotate-180" />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0 text-muted-foreground">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      For Cybersecurity Professionals
                    </h3>
                    <p className="text-sm leading-relaxed">
                      Cydena is a specialized recruitment platform designed exclusively for cybersecurity professionals and employers. Our platform connects security analysts, penetration testers, security engineers, SOC analysts, GRC specialists, and CISOs with companies seeking to strengthen their cybersecurity posture.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Skills-Based Matching
                    </h3>
                    <p className="text-sm leading-relaxed">
                      Our platform prioritizes verified certifications (CISSP, CEH, OSCP, Security+, CISM, etc.) and practical experience over traditional credentials. Connect directly with employers seeking your specific skills and expertise.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Free for Candidates</h3>
                    <p className="text-sm leading-relaxed">
                      For cybersecurity professionals, signing up is completely free with no hidden costs. Create your profile, upload your certifications for verification, and start applying to relevant positions immediately. Track your applications in real-time through our transparent pipeline system, and communicate directly with hiring managers through our in-platform messaging.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">For Employers & Recruiters</h3>
                    <p className="text-sm leading-relaxed">
                      Employers and recruiters benefit from access to a curated talent pool of pre-screened cybersecurity professionals with verified credentials. Our subscription plans offer unlimited job postings, advanced candidate search, application management tools, and direct communication channels - all at a fraction of traditional recruitment costs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
        </div>
      </div>

    </div>
  );
};

export default Auth;
