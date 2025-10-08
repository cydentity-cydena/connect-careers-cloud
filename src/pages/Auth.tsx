import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { z } from "zod";

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

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      if (functionError) throw functionError;
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
      
      if (errorMessage.includes('already registered') || errorMessage.includes('already taken') || errorMessage.includes('email_exists')) {
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
      <Navigation />
      
      <div className="flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
          <Shield className="h-10 w-10 text-primary animate-glow-pulse" />
          <span className="text-3xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
            Cydena
          </span>
        </div>

        <Card className="border-border shadow-card animate-slide-up">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
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

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: 'google',
                          options: {
                            redirectTo: `${window.location.origin}/dashboard`
                          }
                        });
                        if (error) toast.error(error.message);
                      }}
                    >
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: 'linkedin_oidc',
                          options: {
                            redirectTo: `${window.location.origin}/dashboard`
                          }
                        });
                        if (error) toast.error(error.message);
                      }}
                    >
                      LinkedIn
                    </Button>
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
                    <Label htmlFor="signup-name">Full Name (private)</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">
                      Username (public) {userRole === "candidate" && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="cyber_pro"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      required={userRole === "candidate"}
                      minLength={3}
                      maxLength={20}
                    />
                    <p className="text-xs text-muted-foreground">
                      3-20 characters: letters, numbers, underscores only
                      {(userRole === "employer" || userRole === "recruiter") && " (optional for employers & recruiters)"}
                    </p>
                  </div>
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
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
