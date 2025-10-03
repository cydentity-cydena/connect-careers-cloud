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

      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">
            Simple, Transparent <span className="bg-gradient-cyber bg-clip-text text-transparent">Pricing</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No long-term contracts. No retainer fees. Pay only for what you use.
          </p>
        </div>

        {/* Comparison with Traditional Recruitment */}
        <Card className="mb-16 border-2 border-primary/20 bg-gradient-card animate-slide-up">
          <CardHeader>
            <CardTitle className="text-2xl">Why Cydena vs Traditional Recruitment?</CardTitle>
            <CardDescription>See the difference in cost and speed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <X className="h-5 w-5 text-destructive" />
                  Traditional Recruitment Agency
                </h3>
                <ul className="space-y-3 text-muted-foreground">
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
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Cydena Platform
                </h3>
                <ul className="space-y-3">
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

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Candidates - Free */}
          <Card className="border-border shadow-card hover:scale-105 transition-transform animate-slide-up">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <CardTitle>Candidates</CardTitle>
                  <CardDescription>Entry to Senior Level</CardDescription>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">Free</span>
                <span className="text-muted-foreground ml-2">Forever</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Unlimited job applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Skills & certifications showcase</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Leaderboard visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Direct messaging with employers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>XP & achievement system</span>
                </li>
              </ul>
              <Link to="/auth">
                <Button className="w-full" variant="outline">
                  Sign Up Free
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Small Teams */}
          <Card className="border-2 border-primary shadow-card hover:scale-105 transition-transform animate-slide-up relative" style={{animationDelay: '0.1s'}}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </div>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Small Teams</CardTitle>
                  <CardDescription>Startups & SMBs</CardDescription>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">£10</span>
                <span className="text-muted-foreground ml-2">per unlock</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Unlock full candidate profiles</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Direct contact information</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Application pipeline management</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Post up to 5 active jobs</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Basic analytics</span>
                </li>
              </ul>
              <Link to="/auth">
                <Button className="w-full gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card className="border-border shadow-card hover:scale-105 transition-transform animate-slide-up" style={{animationDelay: '0.2s'}}>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <Building2 className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>Large Organizations</CardDescription>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold">Custom</span>
                <span className="text-muted-foreground ml-2">pricing</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Bulk unlock discounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Unlimited job postings</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Advanced analytics & reporting</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Custom integrations & API access</span>
                </li>
              </ul>
              <Link to="/contact">
                <Button className="w-full" variant="outline">
                  Contact Sales
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* ROI Calculator */}
        <Card className="border-primary/20 bg-gradient-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl">Calculate Your Savings</CardTitle>
            <CardDescription>See how much you save vs traditional recruitment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Traditional Recruitment Cost</h4>
                  <p className="text-3xl font-bold text-destructive">£12,500</p>
                  <p className="text-sm text-muted-foreground">Average for £50k salary role (25% fee)</p>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>+ £3,000 retainer upfront</p>
                  <p>+ 6-8 weeks hiring time</p>
                  <p>+ Limited candidate visibility</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Cydena Platform Cost</h4>
                  <p className="text-3xl font-bold text-primary">£200</p>
                  <p className="text-sm text-muted-foreground">View 20 candidates @ £10 each</p>
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-primary">✓ Zero upfront costs</p>
                  <p className="text-primary">✓ 48-hour candidate access</p>
                  <p className="text-primary">✓ Full profile transparency</p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-2xl font-bold text-primary">Save £12,300</p>
                  <p className="text-sm text-muted-foreground">98% cost reduction per hire</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Link */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">Have questions about pricing?</p>
          <Link to="/faq">
            <Button variant="outline" className="gap-2">
              View FAQ <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
