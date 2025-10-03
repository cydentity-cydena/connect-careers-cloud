import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import { z } from "zod";

// Validation schemas
const emailSchema = z.string().email("Invalid email address").max(255, "Email too long");
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

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userRole, setUserRole] = useState<"candidate" | "employer">("candidate");

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
      emailSchema.parse(email);
      passwordSchema.parse(password);
      nameSchema.parse(fullName);
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
      
      if (error.message?.includes('already registered')) {
        toast.error("This email is already registered. Please sign in instead.");
      } else if (error.message?.includes('Invalid email')) {
        toast.error("Please enter a valid email address.");
      } else if (error.message?.includes('Password')) {
        toast.error("Password does not meet requirements. Use 12+ characters with mixed case, numbers, and symbols.");
      } else {
        toast.error(error.message || "Failed to create account. Please try again.");
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

  const handleSeedDemoCandidates = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-candidates');
      
      if (error) throw error;
      
      toast.success(data.message || "Demo candidates created successfully! You can now log in with demo credentials.");
    } catch (error: any) {
      console.error('Seed error:', error);
      toast.error(error.message || "Failed to seed demo candidates");
    } finally {
      setIsSeeding(false);
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
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
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
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
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
                  <div className="space-y-2">
                    <Label htmlFor="role">I am a...</Label>
                    <Select value={userRole} onValueChange={(v: any) => setUserRole(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="candidate">Candidate</SelectItem>
                        <SelectItem value="employer">Employer</SelectItem>
                      </SelectContent>
                    </Select>
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

        {/* Demo Candidates Seeding */}
        <Card className="border-blue-500/50 bg-blue-950/20">
          <CardHeader>
            <CardTitle className="text-sm">Demo Mode</CardTitle>
            <CardDescription className="text-xs">
              Seed the platform with 20 demo cybersecurity candidates to explore features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleSeedDemoCandidates}
              disabled={isSeeding}
              variant="outline"
              className="w-full"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Demo Candidates...
                </>
              ) : (
                "Seed 20 Demo Candidates"
              )}
            </Button>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>After seeding, login with:</strong></p>
              <p>Email: john.smith.demo@cydena.com</p>
              <p>Password: Demo123!</p>
              <p className="text-blue-400">Or any other demo account email</p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
