import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight, DollarSign, Users, Zap, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Schema from "@/components/Schema";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const PRICING_IDS = {
  employer_starter: {
    monthly: 'price_1SG35MDOcfakZuIamZqqT7mn',
    annual: 'price_1STqS4FnZFXoJvyLDyLk7HL7',
  },
  employer_growth: {
    monthly: 'price_1SG365DOcfakZuIaYxbAFBdh',
    annual: 'price_1STqSMDOcfakZuIaR9wdVJmh',
  },
  employer_scale: {
    monthly: 'price_1SG36IDOcfakZuIaRFQhbM5M',
    annual: 'price_1STqSkDOcfakZuIap8GfIy8S',
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
          {/* Two Service Models */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-primary">
              <CardHeader>
                <Badge className="w-fit mb-2">Self-Service Platform</Badge>
                <CardTitle className="text-2xl">Subscription Access</CardTitle>
                <CardDescription className="text-base">
                  Browse, search, and hire independently with our platform tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">What&apos;s Included:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Annual unlock allocation (10-100 depending on tier)</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Full platform access and advanced filters</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Direct candidate messaging</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>Pipeline management tools</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>£8 per unlock after allocation used</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold text-primary">Perfect for: Companies with in-house recruiters</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50/50 to-background">
              <CardHeader>
                <Badge className="w-fit mb-2 bg-purple-600">Managed Service</Badge>
                <CardTitle className="text-2xl">Full Recruitment Support</CardTitle>
                <CardDescription className="text-base">
                  We handle the entire recruitment process for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">What&apos;s Included:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>Dedicated recruiter assigned to your role</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>Candidate curation and pre-screening</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>Interview coordination and scheduling</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>Offer negotiation support</span>
                    </li>
                    <li className="flex gap-2">
                      <Check className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>90-day placement guarantee</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-2xl font-bold mb-1">10-12%</div>
                  <p className="text-sm text-muted-foreground">of first year salary (success fee only)</p>
                  <p className="text-xs text-purple-600 font-semibold mt-2">50% less than traditional agencies (20-25%)</p>
                </div>
                <div className="pt-2">
                  <p className="text-sm font-semibold text-purple-600">Perfect for: High-priority roles or companies without recruiters</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Need Managed Recruitment?</h3>
            <p className="text-muted-foreground mb-4">Contact us to discuss your hiring needs and get a custom quote</p>
            <Button variant="outline" size="lg" onClick={() => navigate('/contact')}>
              Get a Quote for Managed Service
            </Button>
          </div>

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
                      <span className="text-4xl font-bold">£{Math.round(getPricing(99))}</span>
                      <span className="text-muted-foreground">/year</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        £{Math.round(getMonthlyEquivalent(99))}/mo
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">£99</span>
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
                    <span>£8 per additional unlock</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Evidence profiles</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Pipeline tools</span>
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
                <CardTitle>Team</CardTitle>
                <CardDescription>Hiring teams</CardDescription>
                <div className="mt-4">
                  {billingPeriod === 'annual' ? (
                    <>
                      <span className="text-4xl font-bold">£{Math.round(getPricing(249))}</span>
                      <span className="text-muted-foreground">/year</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        £{Math.round(getMonthlyEquivalent(249))}/mo
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">£249</span>
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
                    <span>£8 per additional unlock</span>
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
                  Choose Team
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-2 border-primary/50 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600">
                <Sparkles className="h-3 w-3 mr-1" />
                Best Value
              </Badge>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>Agencies & high-volume</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Let&apos;s Talk</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>10+ seats</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-semibold">Custom unlocks</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>SLA guarantees</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Volume discounts</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>White-label options</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => navigate('/contact')}
                >
                  Contact Sales
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

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
