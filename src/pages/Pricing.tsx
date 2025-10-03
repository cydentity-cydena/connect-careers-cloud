import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Sparkles, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Pricing() {
  const navigate = useNavigate();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const bundles = [
    {
      id: 'starter',
      name: 'Starter Pack',
      price: 499,
      unlocks: 25,
      perUnlock: 20,
      expiry: '14 days',
      description: 'Perfect for trying out the platform',
      icon: Sparkles,
      stripePriceId: 'STRIPE_PRICE_BUNDLE_STARTER',
    },
    {
      id: 'growth',
      name: 'Growth Pack',
      price: 999,
      unlocks: 75,
      perUnlock: 13,
      expiry: '30 days',
      description: 'Best for active recruiting',
      popular: true,
      icon: TrendingUp,
      stripePriceId: 'STRIPE_PRICE_BUNDLE_GROWTH',
    },
    {
      id: 'scale',
      name: 'Scale Pack',
      price: 1499,
      unlocks: 150,
      perUnlock: 10,
      expiry: '60 days',
      description: 'For large-scale hiring',
      icon: Users,
      stripePriceId: 'STRIPE_PRICE_BUNDLE_SCALE',
    },
  ];

  const subscriptions = [
    {
      id: 'essential',
      name: 'Essential',
      price: 499,
      unlocks: 25,
      description: 'For steady hiring needs',
      features: [
        '25 unlocks per month',
        'Unlimited candidate browsing',
        'Full profile access',
        'Cancel anytime',
      ],
      stripePriceId: 'STRIPE_PRICE_SUBS_ESSENTIAL',
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 999,
      unlocks: 75,
      description: 'For growing teams',
      popular: true,
      features: [
        '75 unlocks per month',
        'Unlimited candidate browsing',
        'Featured employer branding',
        'Analytics dashboard',
        'Priority support',
      ],
      stripePriceId: 'STRIPE_PRICE_SUBS_PROFESSIONAL',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 1999,
      unlocks: 200,
      description: 'For large organizations',
      features: [
        '200 unlocks per month',
        'Unlimited candidate browsing',
        'API access for ATS integration',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
      ],
      stripePriceId: 'STRIPE_PRICE_SUBS_ENTERPRISE',
    },
  ];

  const handleCheckout = async (priceId: string, isSubscription: boolean) => {
    setLoadingPriceId(priceId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to continue");
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { priceId, isSubscription },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || "Failed to start checkout");
    } finally {
      setLoadingPriceId(null);
    }
  };

  return (
    <>
      <SEO
        title="Pricing - Recruit Cyber Talent Without Agency Fees"
        description="Transparent pricing for cybersecurity recruitment. Pay-as-you-go bundles or monthly subscriptions. No contracts, cancel anytime."
        keywords="recruitment pricing, cybersecurity jobs, talent acquisition costs, no agency fees"
      />
      <Navigation />

      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Recruit Cyber Talent Without Agency Fees
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Transparent pricing, no contracts, cancel anytime.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="hero" onClick={() => navigate('/auth')}>
              Start Hiring
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/profiles')}>
              View Candidates
            </Button>
          </div>
        </section>

        {/* Pay-As-You-Go Bundles */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Pay-As-You-Go Bundles</h2>
            <p className="text-xl text-muted-foreground">
              Buy credits when you need them, no monthly commitment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {bundles.map((bundle) => {
              const Icon = bundle.icon;
              return (
                <Card
                  key={bundle.id}
                  className={`relative ${bundle.popular ? 'border-primary border-2 shadow-lg' : ''}`}
                >
                  {bundle.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <Icon className="h-12 w-12 mb-4 text-primary" />
                    <CardTitle className="text-2xl">{bundle.name}</CardTitle>
                    <CardDescription>{bundle.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-4xl font-bold">£{bundle.price}</p>
                      <p className="text-muted-foreground mt-1">
                        £{bundle.perUnlock} per unlock
                      </p>
                      <p className="text-2xl font-bold text-primary mt-3">
                        {bundle.unlocks} Profile Unlocks
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Expires in {bundle.expiry}
                      </p>
                    </div>

                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">Full profile view</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">CV/Resume access</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">Verified certifications</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">Leaderboard ranking</span>
                      </li>
                    </ul>

                    <Button
                      className="w-full"
                      variant={bundle.popular ? "default" : "outline"}
                      onClick={() => handleCheckout(bundle.stripePriceId, false)}
                      disabled={loadingPriceId === bundle.stripePriceId}
                    >
                      {loadingPriceId === bundle.stripePriceId ? "Loading..." : "Buy Bundle"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Monthly Subscriptions */}
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Monthly Subscriptions</h2>
            <p className="text-xl text-muted-foreground">
              Recurring credits for consistent hiring needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subscriptions.map((sub) => (
              <Card
                key={sub.id}
                className={`relative ${sub.popular ? 'border-primary border-2 shadow-lg' : ''}`}
              >
                {sub.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{sub.name}</CardTitle>
                  <CardDescription>{sub.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-4xl font-bold">£{sub.price}</p>
                    <p className="text-muted-foreground">per month</p>
                    <p className="text-2xl font-bold text-primary mt-3">
                      {sub.unlocks} unlocks/month
                    </p>
                  </div>

                  <ul className="space-y-2">
                    {sub.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={sub.popular ? "default" : "outline"}
                    onClick={() => handleCheckout(sub.stripePriceId, true)}
                    disabled={loadingPriceId === sub.stripePriceId}
                  >
                    {loadingPriceId === sub.stripePriceId ? "Loading..." : "Subscribe"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Cydent vs Agencies / LinkedIn?
          </h2>

          <div className="overflow-x-auto max-w-5xl mx-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="p-4 text-left"></th>
                  <th className="p-4 text-center">Traditional Agencies</th>
                  <th className="p-4 text-center">LinkedIn Job Post</th>
                  <th className="p-4 text-center bg-primary/10">
                    <span className="font-bold">Cydent Platform</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-semibold">Cost per hire</td>
                  <td className="p-4 text-center">£7.5k–£15k+</td>
                  <td className="p-4 text-center">£250–£500/post</td>
                  <td className="p-4 text-center bg-primary/5 font-bold">£10–£20 per candidate</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-semibold">Upfront fees</td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                  <td className="p-4 text-center"><X className="h-5 w-5 text-destructive mx-auto" /></td>
                  <td className="p-4 text-center bg-primary/5"><Check className="h-5 w-5 text-primary mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-semibold">Time to hire</td>
                  <td className="p-4 text-center">6–8 weeks</td>
                  <td className="p-4 text-center">4–6 weeks</td>
                  <td className="p-4 text-center bg-primary/5 font-bold">48 hours</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-semibold">Transparency</td>
                  <td className="p-4 text-center">Limited view</td>
                  <td className="p-4 text-center">CV only</td>
                  <td className="p-4 text-center bg-primary/5 font-bold">Full verified profiles</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-semibold">Flexibility</td>
                  <td className="p-4 text-center">Lock-in contracts</td>
                  <td className="p-4 text-center">Post expires</td>
                  <td className="p-4 text-center bg-primary/5 font-bold">Cancel anytime</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <h2 className="text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What happens when I run out of unlocks?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You can buy another bundle or upgrade to a subscription anytime. Your account
                  never expires, and unused credits roll over until their expiry date.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What if I don't hire anyone?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No problem. You only pay for profile unlocks, not placements. There are no
                  success fees or recruitment commissions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Do I need to commit long-term?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No. Pay-as-you-go bundles have no recurring commitment. Subscriptions can be
                  cancelled anytime with no penalties.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What's included in a profile unlock?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Full candidate profile, CV/resume download, verified certifications, skill
                  scores, leaderboard ranking, and direct contact information.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to hire top cybersecurity talent?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start with a bundle or subscribe for consistent hiring
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="hero" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
              Contact Sales
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
