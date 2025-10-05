import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight, Zap, Building2, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const Pricing = () => {
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
                    <span>£10-£50 per profile unlock (view full candidate details)</span>
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
                    <span>Connect with candidates in 48 hours</span>
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

        {/* Pricing Tiers */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {/* Candidates - Free */}
          <Card className="border-border shadow-card hover:scale-105 transition-transform animate-slide-up">
            <CardHeader className="p-5 md:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-secondary/10 p-2 md:p-3 rounded-lg">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-base md:text-lg">Candidates</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Entry to Senior Level</CardDescription>
                </div>
              </div>
              <div className="mt-3 md:mt-4">
                <span className="text-3xl md:text-4xl font-bold">Free</span>
                <span className="text-sm md:text-base text-muted-foreground ml-2">Forever</span>
              </div>
            </CardHeader>
            <CardContent className="p-5 md:p-6 pt-0">
              <ul className="space-y-2 md:space-y-3 mb-5 md:mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Unlimited job applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Skills & certifications showcase</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Leaderboard visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Direct messaging with employers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">XP & achievement system</span>
                </li>
              </ul>
              <Link to="/auth">
                <Button className="w-full" variant="outline" size="lg">
                  Sign Up Free
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Small Teams */}
          <Card className="border-2 border-primary shadow-card hover:scale-105 transition-transform animate-slide-up relative sm:col-span-2 lg:col-span-1" style={{animationDelay: '0.1s'}}>
            <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap">
              Most Popular
            </div>
            <CardHeader className="p-5 md:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 md:p-3 rounded-lg">
                  <Zap className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base md:text-lg">Small Teams</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Startups & SMBs</CardDescription>
                </div>
              </div>
              <div className="mt-3 md:mt-4">
                <span className="text-3xl md:text-4xl font-bold">£10</span>
                <span className="text-sm md:text-base text-muted-foreground ml-2">per unlock</span>
              </div>
            </CardHeader>
            <CardContent className="p-5 md:p-6 pt-0">
              <ul className="space-y-2 md:space-y-3 mb-5 md:mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Unlock full candidate profiles</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Direct contact information</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Application pipeline management</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Post up to 5 active jobs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Basic analytics</span>
                </li>
              </ul>
              <Link to="/auth">
                <Button className="w-full gap-2" size="lg">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card className="border-border shadow-card hover:scale-105 transition-transform animate-slide-up sm:col-span-2 lg:col-span-1" style={{animationDelay: '0.2s'}}>
            <CardHeader className="p-5 md:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-accent/10 p-2 md:p-3 rounded-lg">
                  <Building2 className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-base md:text-lg">Enterprise</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Large Organizations</CardDescription>
                </div>
              </div>
              <div className="mt-3 md:mt-4">
                <span className="text-3xl md:text-4xl font-bold">Custom</span>
                <span className="text-sm md:text-base text-muted-foreground ml-2">pricing</span>
              </div>
            </CardHeader>
            <CardContent className="p-5 md:p-6 pt-0">
              <ul className="space-y-2 md:space-y-3 mb-5 md:mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Bulk unlock discounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Unlimited job postings</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Advanced analytics & reporting</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Custom integrations & API access</span>
                </li>
              </ul>
              <Link to="/contact">
                <Button className="w-full" variant="outline" size="lg">
                  Contact Sales
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

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
                  <p className="text-2xl md:text-3xl font-bold text-primary">£200</p>
                  <p className="text-xs md:text-sm text-muted-foreground">View 20 candidates @ £10 each</p>
                </div>
                <div className="text-xs md:text-sm space-y-1">
                  <p className="text-primary">✓ Zero upfront costs</p>
                  <p className="text-primary">✓ 48-hour candidate access</p>
                  <p className="text-primary">✓ Full profile transparency</p>
                </div>
                <div className="pt-3 md:pt-4 border-t">
                  <p className="text-xl md:text-2xl font-bold text-primary">Save £12,300</p>
                  <p className="text-xs md:text-sm text-muted-foreground">98% cost reduction per hire</p>
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
