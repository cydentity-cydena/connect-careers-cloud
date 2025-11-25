import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight, DollarSign, Users, Zap, Sparkles, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Schema from "@/components/Schema";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const PRICING_IDS = {
  employer_starter: {
    monthly: 'price_1SG2n2FnZFXoJvyLkjI5aoMI',
    annual: 'price_1SWuPZDOcfakZuIayVMDAWmO',
  },
  employer_growth: {
    monthly: 'price_1SG2nbFnZFXoJvyLkAKznYqi',
    annual: 'price_1SWuQ6FnZFXoJvyLolWy7fSK',
  },
  employer_scale: {
    monthly: 'price_1SG35iDOcfakZuIaarlVZp2y',
    annual: 'price_1SWuRdDOcfakZuIagcO6GWxx',
  }
};

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { createCheckout } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setCheckingAuth(false);
    });
  }, []);

  const getPricing = (monthly: number) => {
    if (billingPeriod === 'annual') {
      return monthly * 12 * 0.83;
    }
    return monthly;
  };

  const getMonthlyEquivalent = (monthly: number) => {
    if (billingPeriod === 'annual') {
      return (monthly * 12 * 0.83) / 12;
    }
    return monthly;
  };

  const handleTierSelect = async (tierKey: keyof typeof PRICING_IDS) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    const priceId = PRICING_IDS[tierKey][billingPeriod];
    await createCheckout(priceId);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Pricing - Cydena | No Agency Fees"
        description="Simple subscription pricing for cybersecurity recruitment. From £99/month. No 20% agency fees."
        keywords="cybersecurity recruitment pricing, no agency fees, tech hiring costs"
      />
      <Schema type="breadcrumb" data={{
        items: [
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" }
        ]
      }} />
      <Navigation />

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-cyber bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Verified cyber talent and evidence-first profiles for your hiring needs.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Label htmlFor="billing-toggle">Monthly</Label>
            <Switch
              id="billing-toggle"
              checked={billingPeriod === 'annual'}
              onCheckedChange={(checked) => setBillingPeriod(checked ? 'annual' : 'monthly')}
            />
            <Label htmlFor="billing-toggle">
              Annual <Badge variant="secondary" className="ml-2">Save 17%</Badge>
            </Label>
          </div>
        </div>

        <div className="space-y-16">
          {/* Value Props */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Verified Talent, Transparent Pricing</CardTitle>
              <CardDescription>
                Access pre-verified, HR-ready cybersecurity professionals. No agency fees.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold mb-1">Pre-Verified</h4>
                  <p className="text-sm text-muted-foreground">Identity, clearances, certifications checked</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold mb-1">Pay for Value</h4>
                  <p className="text-sm text-muted-foreground">Only unlock who you contact</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold mb-1">70% Savings</h4>
                  <p className="text-sm text-muted-foreground">compared to hidden hiring costs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-center mb-6">Self-Service Subscription Tiers</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Individual recruiters</CardDescription>
                <div className="mt-4">
                  {billingPeriod === 'annual' ? (
                    <>
                      <span className="text-4xl font-bold">£{Math.round(getPricing(149))}</span>
                      <span className="text-muted-foreground">/year</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        £{Math.round(getMonthlyEquivalent(149))}/mo
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">£149</span>
                      <span className="text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>1 seat</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>10 unlocks/year included</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>£75 per additional unlock</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Advanced filters</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>ATS integration</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Pipeline management</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Direct messaging</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleTierSelect('employer_starter')}
                  disabled={checkingAuth}
                >
                  Choose Starter
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-primary relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
              <CardHeader>
                <CardTitle>Growth</CardTitle>
                <CardDescription>Growing teams</CardDescription>
                <div className="mt-4">
                  {billingPeriod === 'annual' ? (
                    <>
                      <span className="text-4xl font-bold">£{Math.round(getPricing(399))}</span>
                      <span className="text-muted-foreground">/year</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        £{Math.round(getMonthlyEquivalent(399))}/mo
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">£399</span>
                      <span className="text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>5 seats</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>30 unlocks/year included</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>£75 per additional unlock</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Pipeline management</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>All Starter features</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Team collaboration</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleTierSelect('employer_growth')}
                  disabled={checkingAuth}
                >
                  Choose Growth
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scale</CardTitle>
                <CardDescription>High-volume hiring</CardDescription>
                <div className="mt-4">
                  {billingPeriod === 'annual' ? (
                    <>
                      <span className="text-4xl font-bold">£{Math.round(getPricing(799))}</span>
                      <span className="text-muted-foreground">/year</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        £{Math.round(getMonthlyEquivalent(799))}/mo
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">£799</span>
                      <span className="text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>10 seats</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>100 unlocks/year included</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>£75 per additional unlock</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Pipeline management</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>All Growth features</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Custom assessments</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Dedicated support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleTierSelect('employer_scale')}
                  disabled={checkingAuth}
                >
                  Choose Scale
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

          {/* Expert Assist Add-On */}
        <Card className="border border-orange-200 bg-gradient-to-br from-orange-50/30 to-background mt-8">
          <CardHeader className="text-center">
            <Badge className="w-fit mx-auto mb-2 bg-orange-600">Optional Add-On</Badge>
            <CardTitle className="text-xl">Expert Assist Service</CardTitle>
            <CardDescription className="text-base">
              Need specialist help with a complex or urgent cybersecurity role?
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">When You Need It:</h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>Executive security roles (CISO, Director)</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>Niche specializations (OT security, crypto)</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>Urgent critical hires</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>First-time hiring for security roles</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">What We Do:</h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground mb-4">
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>Deep market expertise</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>Candidate shortlisting</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>Skills & experience matching</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>Targeted candidate sourcing</span>
                  </li>
                </ul>
                <div className="bg-white rounded-lg p-3 border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600 mb-1">8-10%</div>
                  <p className="text-xs text-muted-foreground">success fee for complex or urgent roles</p>
                </div>
              </div>
            </div>
            <div className="text-center pt-4 border-t border-orange-100 mt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Contact us to discuss your role and get expert assistance
              </p>
              <Link to="/contact?subject=Expert%20Assist%20Inquiry">
                <Button variant="outline" className="border-orange-300 hover:bg-orange-50">
                  Contact for Expert Assist
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recruiter Partnership Section */}
        <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50/30 to-background mt-8">
          <CardHeader className="text-center">
            <Badge className="w-fit mx-auto mb-2 bg-purple-600">For Recruiters</Badge>
            <CardTitle className="text-2xl">Partner With Cydena</CardTitle>
            <CardDescription className="text-base">
              Use our verified candidate pool for your placements. We handle verification, you handle recruiting.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <h4 className="font-semibold">What You Get:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Access to pre-verified candidate pool</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Client management tools</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Placement tracking & reporting</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>No verification overhead</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Partnership Model:</h4>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-muted-foreground mb-3">
                    Subscription access + small platform fee on your placements
                  </p>
                  <div className="text-2xl font-bold text-purple-600 mb-1">2-3%</div>
                  <p className="text-xs text-muted-foreground">platform fee on successful placements</p>
                </div>
                <p className="text-xs text-purple-600 font-semibold">
                  You keep 97-98% of your placement fee
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Example: £50k salary = £7,500 placement = £150-225 platform fee
                </p>
              </div>
            </div>
            <div className="text-center pt-4 border-t">
              <Button size="lg" onClick={() => navigate('/contact')} className="bg-purple-600 hover:bg-purple-700">
                Become a Partner Recruiter
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">Questions about pricing?</p>
          <Button variant="outline" onClick={() => navigate('/faq')}>
            View FAQ <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
