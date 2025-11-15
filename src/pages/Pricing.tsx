import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, ArrowRight, TrendingDown, DollarSign, Users, Zap, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Schema from "@/components/Schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROICalculator } from "@/components/pricing/ROICalculator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { createCheckout, tier: currentTier, loading: subscriptionLoading } = useSubscription();
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

  const handleTierSelect = async (tierKey: string) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    await createCheckout(tierKey);
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
            No 20% agency fees. Just verified cyber talent and evidence-first profiles.
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

        <Tabs defaultValue="pricing" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="pricing">Pricing Plans</TabsTrigger>
            <TabsTrigger value="roi">ROI Calculator</TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="space-y-12">
            {/* Comparison with Traditional Recruitment */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  Why Cydena vs Traditional Recruitment?
                </CardTitle>
                <CardDescription>
                  See the difference in cost and speed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                      <X className="w-5 h-5 text-red-500" />
                      Traditional Agency
                    </h3>
                    <ul className="list-none space-y-3">
                      <li className="text-muted-foreground flex items-center gap-2">
                        <X className="w-4 h-4 text-red-500" />
                        15-25% of first year salary (£7,500-£15,000+)
                      </li>
                      <li className="text-muted-foreground flex items-center gap-2">
                        <X className="w-4 h-4 text-red-500" />
                        Retainer fees upfront (£2,000-£5,000)
                      </li>
                      <li className="text-muted-foreground flex items-center gap-2">
                        <X className="w-4 h-4 text-red-500" />
                        Exclusive contracts locking you in
                      </li>
                      <li className="text-muted-foreground flex items-center gap-2">
                        <X className="w-4 h-4 text-red-500" />
                        6-8 weeks to fill role
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                      <Check className="w-5 h-5 text-green-500" />
                      Cydena Platform
                    </h3>
                    <ul className="list-none space-y-3">
                      <li className="text-muted-foreground flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        £99-£699/month + pay-per-unlock after allocation
                      </li>
                      <li className="text-muted-foreground flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Zero upfront costs - pay as you go
                      </li>
                      <li className="text-muted-foreground flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        No contracts - cancel anytime
                      </li>
                       <li className="text-muted-foreground flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Real-time candidate tracking pipeline
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Starter Plan */}
              <Card className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col justify-between">
                <div>
                  <CardHeader className="px-6 py-4">
                    <CardTitle className="text-xl font-semibold">
                      Starter
                    </CardTitle>
                    <CardDescription>
                      For individuals and small teams getting started.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 py-4">
                    <div className="mb-4">
                      <div className="font-bold text-2xl">
                        £{getPricing(99).toFixed(0)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        £{getMonthlyEquivalent(99).toFixed(0)}/month
                      </div>
                    </div>
                    <ul className="list-none space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        1 user
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        10 unlocks per year
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Community support
                      </li>
                    </ul>
                  </CardContent>
                </div>
                <CardFooter className="px-6 py-4">
                  <Button className="w-full" onClick={() => handleTierSelect('employer_starter')} disabled={checkingAuth || currentTier === 'employer_starter'}>
                    {subscriptionLoading ? "Loading..." : (currentTier === 'employer_starter' ? "Current Plan" : "Choose Starter")}
                  </Button>
                </CardFooter>
              </Card>

              {/* Growth Plan */}
              <Card className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col justify-between">
                <div>
                  <CardHeader className="px-6 py-4">
                    <CardTitle className="text-xl font-semibold">
                      Growth
                      <Badge className="ml-2">Popular</Badge>
                    </CardTitle>
                    <CardDescription>
                      For growing teams that need more features.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 py-4">
                    <div className="mb-4">
                      <div className="font-bold text-2xl">
                        £{getPricing(299).toFixed(0)}
                      </div>
                       <div className="text-sm text-muted-foreground">
                        £{getMonthlyEquivalent(299).toFixed(0)}/month
                      </div>
                    </div>
                    <ul className="list-none space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        5 users
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        30 unlocks per year
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Priority support
                      </li>
                    </ul>
                  </CardContent>
                </div>
                <CardFooter className="px-6 py-4">
                  <Button className="w-full" onClick={() => handleTierSelect('employer_growth')} disabled={checkingAuth || currentTier === 'employer_growth'}>
                    {subscriptionLoading ? "Loading..." : (currentTier === 'employer_growth' ? "Current Plan" : "Choose Growth")}
                  </Button>
                </CardFooter>
              </Card>

              {/* Scale Plan */}
              <Card className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col justify-between">
                <div>
                  <CardHeader className="px-6 py-4">
                    <CardTitle className="text-xl font-semibold">
                      Scale
                    </CardTitle>
                    <CardDescription>
                      For larger organizations with advanced needs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 py-4">
                    <div className="mb-4">
                      <div className="font-bold text-2xl">
                        £{getPricing(699).toFixed(0)}
                      </div>
                       <div className="text-sm text-muted-foreground">
                        £{getMonthlyEquivalent(699).toFixed(0)}/month
                      </div>
                    </div>
                    <ul className="list-none space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Unlimited users
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Unlimited unlocks
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        24/7 support
                      </li>
                    </ul>
                  </CardContent>
                </div>
                <CardFooter className="px-6 py-4">
                  <Button className="w-full" onClick={() => handleTierSelect('employer_scale')} disabled={checkingAuth || currentTier === 'employer_scale'}>
                    {subscriptionLoading ? "Loading..." : (currentTier === 'employer_scale' ? "Current Plan" : "Choose Scale")}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="roi">
            <ROICalculator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Pricing;
