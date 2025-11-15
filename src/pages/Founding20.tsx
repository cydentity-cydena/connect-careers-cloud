import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Shield, CheckCircle2, ArrowRight, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

export default function Founding20() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [spacesLeft, setSpacesLeft] = useState<number | null>(null);
  const [isFull, setIsFull] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const { data, error } = await supabase.rpc('check_founding_200_availability');
      
      if (error) throw error;

      const available = data as boolean;
      setIsFull(!available);

      // Get current count
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_founding_200', true);

      if (count !== null) {
        setSpacesLeft(200 - count);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignUpClick = () => {
    if (isFull) {
      toast({
        title: "Program Full",
        description: "Early Access 200 has reached capacity. Join our waitlist instead!",
        variant: "destructive",
      });
      return;
    }
    // Redirect to signup with founding200 parameter
    navigate('/auth?founding200=true&mode=signup');
  };

  return (
    <>
      <SEO 
        title="Early Access 200 - Exclusive for Cybersecurity Professionals"
        description="Join the exclusive Early Access 200 program - lifetime free access, verified profile badge, early ranking in search results, and priority onboarding. Limited to first 200 cyber professionals."
        keywords="cybersecurity jobs, elite talent, early access 200, verified professionals, priority hiring, cyber security careers, early access"
      />
      <Navigation />
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  🚀 Early Access Now Open — Limited to 200
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                Early Access 200 Cybersecurity Professionals
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Early access for the first 200 cyber professionals
              </p>

              {!isChecking && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg mb-8">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {isFull ? (
                      "Program Full - Join Waitlist"
                    ) : spacesLeft !== null ? (
                      `${spacesLeft} Spots Remaining`
                    ) : (
                      "Limited Spots Available"
                    )}
                  </span>
                </div>
              )}

              <div className="space-y-3 max-w-2xl mx-auto text-left bg-card/50 p-8 rounded-lg border border-primary/20 mb-8">
                <p className="text-base text-foreground font-medium mb-4">This cohort gets:</p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Lifetime free access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Early ranking in recruiter search results</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Verified profile badge</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>First look at transparency features (profile view alerts, pipeline visibility, etc.)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Priority onboarding before public launch</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground mt-6 pt-4 border-t border-border">
                  <strong className="text-primary">Limited early-access window</strong> — once the 200 places are filled, that's it.
                </p>
              </div>

              <Button 
                size="lg" 
                className="text-lg px-8 py-6 gap-2"
                onClick={handleSignUpClick}
                disabled={isChecking}
              >
                {isFull ? "Join Waitlist" : "Claim Your Spot Now"}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Why Join Section */}
        <section className="py-16 px-4 bg-card/30 backdrop-blur">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Join Early Access 200?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-primary/40 transition-all">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Lifetime Benefits</h3>
                  <p className="text-muted-foreground">
                    Get permanent access to all premium features without ever paying a subscription fee
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/40 transition-all">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Verified Status</h3>
                  <p className="text-muted-foreground">
                    Stand out with an exclusive verified badge that showcases your elite status
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/40 transition-all">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Priority Access</h3>
                  <p className="text-muted-foreground">
                    Be first in line for new features, opportunities, and direct employer connections
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Create your account now to secure your spot in Early Access 200
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 gap-2"
              onClick={handleSignUpClick}
              disabled={isChecking}
            >
              {isFull ? "Join Waitlist" : "Get Started - It's Free"}
              <ArrowRight className="h-5 w-5" />
            </Button>
            {!isChecking && !isFull && spacesLeft !== null && (
              <p className="text-sm text-muted-foreground mt-4">
                Only {spacesLeft} spots remaining
              </p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
