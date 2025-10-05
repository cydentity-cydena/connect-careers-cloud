import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Users, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ROICalculator() {
  const navigate = useNavigate();
  const [hires, setHires] = useState(10);
  const [salary, setSalary] = useState(60000);
  const [agencyPct, setAgencyPct] = useState(20);
  const [subPrice, setSubPrice] = useState(499);
  const [unlockPackPrice, setUnlockPackPrice] = useState(499);
  const [unlocksPerHire, setUnlocksPerHire] = useState(4);
  const [seats, setSeats] = useState(3);

  const [recruiterCost, setRecruiterCost] = useState(0);
  const [cydenaCost, setCydenaCost] = useState(0);
  const [savings, setSavings] = useState(0);
  const [savingsPct, setSavingsPct] = useState(0);
  const [totalUnlocks, setTotalUnlocks] = useState(0);

  useEffect(() => {
    calculateCosts();
  }, [hires, salary, agencyPct, subPrice, unlockPackPrice, unlocksPerHire]);

  const calculateCosts = () => {
    // Traditional recruiter cost
    const recruiterTotal = hires * salary * (agencyPct / 100);

    // Cydena costs
    const subsAnnual = subPrice * 12;
    const unlocks = hires * unlocksPerHire;
    const packs = Math.ceil(unlocks / 100);
    const unlocksAnnual = packs * unlockPackPrice;
    const cydenaTotal = subsAnnual + unlocksAnnual;

    const savingsTotal = Math.max(recruiterTotal - cydenaTotal, 0);
    const pct = recruiterTotal > 0 ? Math.round((savingsTotal / recruiterTotal) * 100) : 0;

    setRecruiterCost(recruiterTotal);
    setCydenaCost(cydenaTotal);
    setSavings(savingsTotal);
    setSavingsPct(pct);
    setTotalUnlocks(unlocks);
  };

  const formatCurrency = (amount: number) => {
    return '£' + amount.toLocaleString('en-GB', { maximumFractionDigits: 0 });
  };

  const arrScenarios = [
    { stage: 'MVP', employers: 200, avgPrice: 400, arr: 200 * 400 * 12 },
    { stage: 'Growth', employers: 800, avgPrice: 500, arr: 800 * 500 * 12 },
    { stage: 'Scale', employers: 2000, avgPrice: 500, arr: 2000 * 500 * 12 },
    { stage: 'Global', employers: 5000, avgPrice: 700, arr: 5000 * 700 * 12 },
  ];

  const pricingTiers = [
    {
      name: 'Starter',
      price: '£299',
      period: '/mo',
      features: ['1 seat', '50 unlocks / year', 'Verified profiles', 'Email support'],
      cta: 'Choose Starter',
      link: '/auth?mode=signup',
    },
    {
      name: 'Growth',
      price: '£499',
      period: '/mo',
      popular: true,
      features: ['3 seats', '100 unlocks / year', 'ATS export & basic analytics', 'Priority support'],
      cta: 'Choose Growth',
      link: '/auth?mode=signup',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: ['Unlimited seats', 'Private talent pools', 'Advanced analytics & SSO', 'Dedicated CSM'],
      cta: 'Talk to Sales',
      link: '/contact',
    },
  ];

  return (
    <>
      <SEO 
        title="ROI Calculator - See Your Hiring Savings | Cydena"
        description="Calculate how much you can save by hiring verified cybersecurity talent directly on Cydena vs traditional recruitment agencies. Compare costs and see your ROI."
      />
      <Navigation />
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <Badge className="mb-4" variant="outline">
              <Calculator className="w-3 h-3 mr-1" />
              Value Calculator
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Recruitment Cost & ROI Comparison
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See the savings you achieve by hiring verified cybersecurity talent directly on Cydena — cut agency fees by up to 90%
            </p>
          </div>

          <Tabs defaultValue="comparison" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="comparison">
                <TrendingUp className="w-4 h-4 mr-2" />
                Cost Comparison
              </TabsTrigger>
              <TabsTrigger value="pricing">
                <Users className="w-4 h-4 mr-2" />
                Pricing Plans
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calculator Inputs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Hiring Parameters</CardTitle>
                    <CardDescription>Adjust the values to match your hiring needs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="hires">Number of hires per year</Label>
                      <Input
                        id="hires"
                        type="number"
                        min="1"
                        value={hires}
                        onChange={(e) => setHires(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Average base salary per role (£)</Label>
                      <Input
                        id="salary"
                        type="number"
                        min="10000"
                        step="1000"
                        value={salary}
                        onChange={(e) => setSalary(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agencyPct">Agency fee (% of salary)</Label>
                      <Input
                        id="agencyPct"
                        type="number"
                        min="5"
                        max="35"
                        value={agencyPct}
                        onChange={(e) => setAgencyPct(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subPrice">Cydena subscription (£/month)</Label>
                      <Input
                        id="subPrice"
                        type="number"
                        min="0"
                        value={subPrice}
                        onChange={(e) => setSubPrice(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unlockPackPrice">Unlock bundle (£ per 100 unlocks)</Label>
                      <Input
                        id="unlockPackPrice"
                        type="number"
                        min="0"
                        value={unlockPackPrice}
                        onChange={(e) => setUnlockPackPrice(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unlocksPerHire">Average unlocks per hire</Label>
                      <Input
                        id="unlocksPerHire"
                        type="number"
                        min="1"
                        value={unlocksPerHire}
                        onChange={(e) => setUnlocksPerHire(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seats">Seats included in subscription</Label>
                      <Input
                        id="seats"
                        type="number"
                        min="1"
                        value={seats}
                        onChange={(e) => setSeats(Number(e.target.value))}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Results Summary */}
                <div className="space-y-4">
                  <Card className="border-muted">
                    <CardHeader>
                      <CardTitle className="text-lg">Traditional Recruiter Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold mb-2">{formatCurrency(recruiterCost)}</p>
                      <p className="text-sm text-muted-foreground">
                        {hires} hires × {formatCurrency(salary)} × {agencyPct}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Cydena Direct Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold mb-2 text-primary">{formatCurrency(cydenaCost)}</p>
                      <p className="text-sm text-muted-foreground">
                        Subscription + {totalUnlocks} unlocks
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-500/50 bg-green-500/5">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        Your Estimated Savings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold mb-2 text-green-500">{formatCurrency(savings)}</p>
                      <p className="text-sm text-muted-foreground">
                        {savingsPct}% savings vs agency fees
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Assumptions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>• Agency fee defaults to <strong>{agencyPct}%</strong> of salary</p>
                    <p>• Cydena subscription <strong>{formatCurrency(subPrice)}/mo</strong> includes <strong>{seats} seats</strong></p>
                    <p>• Unlocks shared across seats; bundle is <strong>{formatCurrency(unlockPackPrice)} / 100 unlocks</strong></p>
                    <p>• Assumes <strong>{totalUnlocks.toLocaleString()} unlocks/year</strong> for the team</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Key Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>• Verified cyber talent reduces CV noise</p>
                    <p>• Direct hire avoids 15–25% agency commissions</p>
                    <p>• Budgetable, predictable sourcing costs</p>
                    <p>• Faster time-to-shortlist with pre-verified candidates</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base">Ready to Save?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">Cut hiring costs by up to 90% while accessing verified cybersecurity talent.</p>
                    <Button className="w-full" onClick={() => navigate('/auth?mode=signup')}>
                      Start with Cydena
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-8">
              {/* Pricing Tiers */}
              <div className="grid md:grid-cols-3 gap-6">
                {pricingTiers.map((tier) => (
                  <Card 
                    key={tier.name}
                    className={tier.popular ? 'border-primary shadow-lg shadow-primary/20' : ''}
                  >
                    {tier.popular && (
                      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center py-2 rounded-t-lg text-sm font-semibold">
                        Most Popular
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{tier.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">{tier.price}</span>
                        {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <ul className="space-y-3">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full"
                        variant={tier.popular ? 'default' : 'outline'}
                        onClick={() => navigate(tier.link)}
                      >
                        {tier.cta}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* ARR Scenarios */}
              <Card>
                <CardHeader>
                  <CardTitle>Illustrative ARR Scenarios (Employer-led)</CardTitle>
                  <CardDescription>Business growth projections based on employer subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {arrScenarios.map((scenario) => (
                      <Card key={scenario.stage} className="bg-muted/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-muted-foreground">{scenario.stage}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold mb-2">{formatCurrency(scenario.arr)}</p>
                          <p className="text-xs text-muted-foreground">
                            {scenario.employers.toLocaleString()} employers × {formatCurrency(scenario.avgPrice)}/mo
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
