import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight, Zap, Building2, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useState } from "react";

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const getPricing = (monthly: number) => {
    const annual = Math.round(monthly * 0.85); // 15% discount
    return billingPeriod === 'monthly' ? monthly : annual;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing - Cydena | Transparent Cybersecurity Recruitment Costs"
        description="Simple, transparent pricing for cybersecurity recruitment. No long-term contracts, no retainer fees. Pay only for what you use with our credit-based system."
        keywords="cybersecurity recruitment pricing, tech recruitment costs, hire cybersecurity talent, recruitment fees, pay per hire"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 px-2">
            Simple, Transparent <span className="bg-gradient-cyber bg-clip-text text-transparent">Pricing</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            No long-term contracts. No retainer fees. Pay only for what you use.
          </p>
        </div>

        {/* Comparison with Traditional Recruitment */}
        <Card className="mb-12 md:mb-16 border-2 border-primary/20 bg-gradient-card animate-slide-up">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Why Cydena vs Traditional Recruitment?</CardTitle>
            <CardDescription className="text-sm md:text-base">See the difference in cost and speed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
                  <X className="h-4 w-4 md:h-5 md:w-5 text-destructive flex-shrink-0" />
                  Traditional Recruitment Agency
                </h3>
                <ul className="space-y-2 md:space-y-3 text-muted-foreground text-sm md:text-base">
                  <li className="flex items-start gap-2">
                    <X className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                    <span>15-25% of first year salary (£7,500-£15,000+ per hire)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                    <span>Retainer fees upfront (£2,000-£5,000)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                    <span>Exclusive contracts locking you in</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                    <span>Average 6-8 weeks to fill role</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="h-4 w-4 text-destructive mt-1 flex-shrink-0" />
                    <span>Limited visibility into candidate pipeline</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  Cydena Platform
                </h3>
                <ul className="space-y-2 md:space-y-3 text-sm md:text-base">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>£199-£999/month with bundled unlocks (£3.98-£4.99 per unlock)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Zero upfront costs - pay as you go</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>No contracts - cancel anytime</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Connect with candidates instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Full transparency - see rankings, skills, certifications</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ROI Calculator CTA */}
        <Card className="mb-12 md:mb-16 border-green-500/30 bg-gradient-to-br from-green-500/5 to-primary/5 animate-slide-up">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                  <Zap className="h-6 w-6 text-green-500" />
                  Calculate Your Exact Savings
                </h3>
                <p className="text-muted-foreground">
                  See precisely how much you'll save vs traditional recruitment agencies with our interactive ROI calculator
                </p>
              </div>
              <Link to="/roi-calculator">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                  Try ROI Calculator
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <div className="inline-flex border border-border rounded-full p-1 bg-card">
            <Button
              variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingPeriod('monthly')}
              className="rounded-full"
            >
              Monthly
            </Button>
            <Button
              variant={billingPeriod === 'annual' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingPeriod('annual')}
              className="rounded-full gap-2"
            >
              Annual <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full">Save 15%</span>
            </Button>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12 md:mb-16">
          {/* Employer: Starter */}
          <Card className="border-border shadow-card hover:scale-105 transition-transform animate-slide-up">
            <CardHeader className="p-5">
              <CardTitle className="text-base mb-1">Employer — Starter</CardTitle>
              <div className="mt-3">
                <span className="text-3xl font-bold">£{getPricing(199)}</span>
                <span className="text-sm text-muted-foreground ml-2">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>1 hiring seat</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div>50 verified unlocks</div>
                    <div className="text-xs text-muted-foreground">(annual allocation, ~£3.98 ea)</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Candidate bookmarks & notes</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Email support</span>
                </li>
              </ul>
              <Link to="/auth">
                <Button className="w-full" size="sm">Choose Starter</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Employer: Growth (Most Popular) */}
          <Card className="border-2 border-primary shadow-card hover:scale-105 transition-transform animate-slide-up relative" style={{animationDelay: '0.1s'}}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
              Most Popular
            </div>
            <CardHeader className="p-5">
              <CardTitle className="text-base mb-1">Employer — Growth</CardTitle>
              <div className="mt-3">
                <span className="text-3xl font-bold">£{getPricing(499)}</span>
                <span className="text-sm text-muted-foreground ml-2">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>3 hiring seats</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div>100 verified unlocks</div>
                    <div className="text-xs text-muted-foreground">(annual allocation, ~£4.99 ea)</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Application pipeline management</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Link to="/auth">
                <Button className="w-full gap-2" size="sm">Choose Growth <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>

          {/* Employer: Scale */}
          <Card className="border-border shadow-card hover:scale-105 transition-transform animate-slide-up" style={{animationDelay: '0.2s'}}>
            <CardHeader className="p-5">
              <CardTitle className="text-base mb-1">Employer — Scale</CardTitle>
              <div className="mt-3">
                <span className="text-3xl font-bold">£{getPricing(999)}</span>
                <span className="text-sm text-muted-foreground ml-2">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>6 hiring seats</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div>250 verified unlocks</div>
                    <div className="text-xs text-muted-foreground">(annual allocation, ~£3.99 ea)</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Talent pool sharing & role pipelines</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Advanced analytics</span>
                </li>
              </ul>
              <Link to="/auth">
                <Button className="w-full" size="sm">Choose Scale</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recruiter: Pro */}
          <Card className="border-border shadow-card hover:scale-105 transition-transform animate-slide-up" style={{animationDelay: '0.3s'}}>
            <CardHeader className="p-5">
              <CardTitle className="text-base mb-1">Recruiter — Pro</CardTitle>
              <div className="mt-3">
                <span className="text-3xl font-bold">£{getPricing(699)}</span>
                <span className="text-sm text-muted-foreground ml-2">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>3 recruiter seats</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Advanced filters & saved searches</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div>100 unlocks</div>
                    <div className="text-xs text-muted-foreground">(annual allocation)</div>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Bulk candidate actions</span>
                </li>
              </ul>
              <Link to="/auth">
                <Button className="w-full" variant="outline" size="sm">Choose Recruiter Pro</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card className="border-border shadow-card hover:scale-105 transition-transform animate-slide-up" style={{animationDelay: '0.4s'}}>
            <CardHeader className="p-5">
              <CardTitle className="text-base mb-1">Enterprise</CardTitle>
              <div className="mt-3">
                <span className="text-3xl font-bold">Custom</span>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Unlimited seats & SSO</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Private talent pools & internal mobility</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>ATS integrations & API access</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Dedicated CSM & SLAs</span>
                </li>
              </ul>
              <Link to="/contact">
                <Button className="w-full" variant="outline" size="sm">Talk to Sales</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Value Banner */}
        <Card className="mb-8 border-primary/20 bg-card/50 animate-fade-in">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground text-center">
              <strong className="text-foreground">Compare:</strong> Typical agency fee 15–25% of salary (≈ £9k–£15k per hire). 
              Cydena replaces that with flat monthly subscriptions and <strong>annual unlock allocations</strong> — predictable, budgetable costs.
            </p>
          </CardContent>
        </Card>

        {/* Add-ons */}
        <Card className="mb-12 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl">Add-ons</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Extra unlocks:</strong> £499 / 100 unlocks (shared team pool)</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Pay-per-hire option:</strong> £999 success fee (optional, risk-free)</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Training credits:</strong> Real LMS cohort vouchers (bulk discounts)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* ROI Calculator */}
        <Card className="border-primary/20 bg-gradient-card animate-fade-in">
          <CardHeader className="p-5 md:p-6">
            <CardTitle className="text-xl md:text-2xl">Calculate Your Savings</CardTitle>
            <CardDescription className="text-sm md:text-base">See how much you save vs traditional recruitment</CardDescription>
          </CardHeader>
          <CardContent className="p-5 md:p-6 pt-0">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-3 md:space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm md:text-base">Traditional Recruitment Cost</h4>
                  <p className="text-2xl md:text-3xl font-bold text-destructive">£12,500</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Average for £50k salary role (25% fee)</p>
                </div>
                <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                  <p>+ £3,000 retainer upfront</p>
                  <p>+ 6-8 weeks hiring time</p>
                  <p>+ Limited candidate visibility</p>
                </div>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm md:text-base">Cydena Platform Cost</h4>
                  <p className="text-2xl md:text-3xl font-bold text-primary">£2,388</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Starter plan: £199/mo with 50 unlocks/year</p>
                </div>
                <div className="text-xs md:text-sm space-y-1">
                  <p className="text-primary">✓ Zero upfront costs</p>
                  <p className="text-primary">✓ 48-hour candidate access</p>
                  <p className="text-primary">✓ Full profile transparency</p>
                </div>
                <div className="pt-3 md:pt-4 border-t">
                  <p className="text-xl md:text-2xl font-bold text-primary">Save £10,112</p>
                  <p className="text-xs md:text-sm text-muted-foreground">81% cost reduction per hire</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Link */}
        <div className="text-center mt-12 md:mt-16">
          <p className="text-muted-foreground mb-4 text-sm md:text-base">Have questions about pricing?</p>
          <Link to="/faq">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              View FAQ <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
