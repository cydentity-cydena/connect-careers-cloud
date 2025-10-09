import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Check, Star, TrendingUp, Users, BarChart, Sparkles, ArrowRight, Award, GraduationCap, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PricingTier {
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  weeks: number;
  popular?: boolean;
}

const Partnerships = () => {
  const [availableTrainingSlots, setAvailableTrainingSlots] = useState<number[]>([]);
  const [availableCertSlots, setAvailableCertSlots] = useState<number[]>([]);
  const [availableBoostSlots, setAvailableBoostSlots] = useState(6);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAvailableSlots = async () => {
      const now = new Date().toISOString();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      // Check which training slot positions have availability
      const { data: trainingData } = await supabase
        .from("featured_training_partners")
        .select("slot_position, start_date, end_date")
        .gte("end_date", now)
        .lte("start_date", oneYearFromNow.toISOString())
        .eq("payment_status", "completed");
      
      if (trainingData) {
        const occupiedSlots = new Set(trainingData.map(d => d.slot_position));
        const available = [1, 2, 3, 4].filter(pos => !occupiedSlots.has(pos));
        setAvailableTrainingSlots(available);
      } else {
        setAvailableTrainingSlots([1, 2, 3, 4]);
      }

      // Check which certification slot positions have availability
      const { data: certData } = await supabase
        .from("featured_certifications")
        .select("slot_position, start_date, end_date")
        .gte("end_date", now)
        .lte("start_date", oneYearFromNow.toISOString())
        .eq("payment_status", "completed");
      
      if (certData) {
        const occupiedSlots = new Set(certData.map(d => d.slot_position));
        const available = [1, 2, 3, 4].filter(pos => !occupiedSlots.has(pos));
        setAvailableCertSlots(available);
      } else {
        setAvailableCertSlots([1, 2, 3, 4]);
      }

      // Check boost placement slots
      const { data: boostData } = await supabase
        .from("partner_courses")
        .select("id")
        .eq("boost_featured", true)
        .eq("boost_payment_status", "completed")
        .lte("boost_start_date", now)
        .gte("boost_end_date", now);
      
      if (boostData) {
        setAvailableBoostSlots(Math.max(0, 6 - boostData.length));
      }
    };

    checkAvailableSlots();
  }, []);

  // Base placement pricing (Standard listing on Training/Cert pages)
  const basePricingTiers: PricingTier[] = [
    {
      name: "Weekly",
      duration: "1-3 Weeks",
      price: 149,
      weeks: 1,
    },
    {
      name: "Monthly",
      duration: "4 Weeks",
      price: 537,
      originalPrice: 596,
      discount: "10% OFF",
      weeks: 4,
      popular: true,
    },
    {
      name: "Quarterly",
      duration: "12 Weeks",
      price: 1522,
      originalPrice: 1788,
      discount: "15% OFF",
      weeks: 12,
    },
    {
      name: "Annual",
      duration: "52 Weeks",
      price: 6197,
      originalPrice: 7748,
      discount: "20% OFF",
      weeks: 52,
    },
  ];

  // Dashboard Boost placement pricing (Premium dashboard visibility)
  const boostPricingTiers: PricingTier[] = [
    {
      name: "Weekly",
      duration: "1 Week",
      price: 499,
      weeks: 1,
    },
    {
      name: "Monthly",
      duration: "4 Weeks",
      price: 1796,
      originalPrice: 1996,
      discount: "10% OFF",
      weeks: 4,
      popular: true,
    },
    {
      name: "Quarterly",
      duration: "12 Weeks",
      price: 5093,
      originalPrice: 5988,
      discount: "15% OFF",
      weeks: 12,
    },
    {
      name: "Annual",
      duration: "52 Weeks",
      price: 20748,
      originalPrice: 25948,
      discount: "20% OFF",
      weeks: 52,
    },
  ];

  const benefits = [
    {
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      title: "Premium Placement",
      description: "Top-of-page featured section with eye-catching design and logo display",
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: "Direct Candidate Pipeline",
      description: "Reach active job seekers completing cybersecurity training and certifications",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      title: "Brand Authority",
      description: "Position your organization as a trusted training provider in the cybersecurity community",
    },
    {
      icon: <BarChart className="h-6 w-6 text-purple-500" />,
      title: "Performance Analytics",
      description: "Track impressions, clicks, and engagement metrics for your featured placement",
    },
  ];

  const boostBenefits = [
    {
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      title: "Dashboard Priority",
      description: "First section every candidate sees when they log in—maximum visibility guaranteed",
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: "Engaged Learners",
      description: "Candidates actively looking to boost their skills and earn points—highly motivated audience",
    },
    {
      icon: <Award className="h-6 w-6 text-purple-500" />,
      title: "Auto-Verification",
      description: "OpenBadge integration means instant verification and immediate value for candidates",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-yellow-500" />,
      title: "Free-to-Paid Funnel",
      description: "Candidates try your free course, see the value, then upgrade to paid offerings",
    },
  ];

  const features = [
    "Featured slot with custom logo and branding",
    "Prominent placement above all standard listings",
    "Direct link to your website and courses",
    "Custom description and value proposition",
    "Priority positioning in all search results",
    "Dedicated slot guarantee (no rotation)",
    "Monthly performance reports",
    "Co-marketing opportunities",
  ];

  const handleContactSales = () => {
    window.location.href = "/contact?subject=Featured%20Partnership%20Inquiry";
  };

  return (
    <>
      <SEO 
        title="Featured Training Partnerships - Cydena"
        description="Become a featured training partner on Cydena and reach thousands of cybersecurity professionals actively seeking training and certifications."
        keywords="cybersecurity training partnership, featured training provider, cybersecurity education marketing"
      />
      <Navigation />
      
      <div className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4" variant="secondary">
                <Sparkles className="h-3 w-3 mr-1" />
                Limited Slots Available
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Become a Featured Partner
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Reach thousands of cybersecurity professionals with premium visibility for your training courses or certifications.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg" onClick={handleContactSales}>
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/training">View Example Placement</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Partnership Type Tabs */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="training" className="w-full max-w-6xl mx-auto">
              <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 mb-12">
                <TabsTrigger value="training" className="gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Training Page
                </TabsTrigger>
                <TabsTrigger value="boost" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Boost Dashboard
                </TabsTrigger>
                <TabsTrigger value="certifications" className="gap-2">
                  <Award className="h-4 w-4" />
                  Cert Catalog
                </TabsTrigger>
              </TabsList>

              {/* Training Partners Tab */}
              <TabsContent value="training" className="space-y-12">
                {/* Slot Availability Alert */}
                {availableTrainingSlots.length === 0 ? (
                  <Alert className="border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <AlertTitle className="text-red-700 dark:text-red-400">All Featured Slots Currently Booked</AlertTitle>
                    <AlertDescription className="text-red-600 dark:text-red-300 space-y-3">
                      <p>All featured training slots are currently reserved. Join our waitlist to be notified when slots become available.</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-500/50 hover:bg-red-500/20"
                        onClick={handleContactSales}
                      >
                        Join Waitlist
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : availableTrainingSlots.length <= 2 ? (
                  <Alert className="border-yellow-500/50 bg-yellow-500/10">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <AlertTitle className="text-yellow-700 dark:text-yellow-400">Limited Availability</AlertTitle>
                    <AlertDescription className="text-yellow-600 dark:text-yellow-300">
                      Only {availableTrainingSlots.length} featured slot position{availableTrainingSlots.length === 1 ? '' : 's'} currently available: 
                      {availableTrainingSlots.map(slot => ` Slot ${slot}`).join(',')}. Book now to secure your premium placement!
                    </AlertDescription>
                  </Alert>
                ) : null}

                {/* Pricing Explanation */}
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                  <CardContent className="pt-6">
                    <h3 className="text-2xl font-bold mb-4 text-center">Training Page Placement Options</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="bg-muted p-2 rounded-lg">
                            <Check className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-bold">Standard Placement</h4>
                            <p className="text-sm text-muted-foreground">Listed in category sections. Base pricing starting at $149/week.</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Star className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-bold">Featured Upgrade</h4>
                            <p className="text-sm text-muted-foreground">Premium top-of-page section with logo. +$100-250/week based on slot position (1-4).</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Base Pricing */}
                <div>
                  <h3 className="text-2xl font-bold text-center mb-8">Standard Training Page Placement</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {basePricingTiers.map((tier) => (
                      <Card 
                        key={tier.name} 
                        className={`relative ${tier.popular ? 'border-2 border-primary shadow-lg scale-105' : ''}`}
                      >
                        {tier.popular && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="text-center">{tier.name}</CardTitle>
                          <CardDescription className="text-center">{tier.duration}</CardDescription>
                          {tier.discount && (
                            <Badge variant="secondary" className="w-fit mx-auto mt-2">
                              {tier.discount}
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="text-center mb-6">
                            {tier.originalPrice && (
                              <p className="text-sm text-muted-foreground line-through">
                                ${tier.originalPrice.toLocaleString()}
                              </p>
                            )}
                            <p className="text-4xl font-bold">${tier.price.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              ${Math.round(tier.price / tier.weeks)}/week
                            </p>
                          </div>
                          <Button 
                            className="w-full" 
                            variant={tier.popular ? "default" : "outline"}
                            onClick={handleContactSales}
                          >
                            Select Plan
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Featured Slot Upgrades */}
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-center mb-4">Upgrade to Featured Top Section</h3>
                  <p className="text-center text-muted-foreground mb-8">
                    Add premium visibility with logo display and top-of-page placement. Pricing is per week, on top of base placement.
                  </p>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-4 border-yellow-500 bg-gradient-to-br from-yellow-500/15 to-yellow-500/5">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-xl">Slot 1</CardTitle>
                          <Badge className="bg-yellow-500">PREMIUM</Badge>
                        </div>
                        <CardDescription>Maximum visibility</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <p className="text-4xl font-bold text-yellow-600 mb-1">+$250</p>
                          <p className="text-sm text-muted-foreground">/week upgrade</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-3 border-orange-500/70 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-xl">Slot 2</CardTitle>
                          <Badge className="bg-orange-500">FEATURED</Badge>
                        </div>
                        <CardDescription>High visibility</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <p className="text-4xl font-bold text-orange-600 mb-1">+$200</p>
                          <p className="text-sm text-muted-foreground">/week upgrade</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-500/60 bg-gradient-to-br from-blue-500/8 to-blue-500/3">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-xl">Slot 3</CardTitle>
                          <Badge className="bg-blue-500">FEATURED</Badge>
                        </div>
                        <CardDescription>Prominent position</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <p className="text-4xl font-bold text-blue-600 mb-1">+$150</p>
                          <p className="text-sm text-muted-foreground">/week upgrade</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-transparent">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-xl">Slot 4</CardTitle>
                          <Badge className="bg-purple-500">FEATURED</Badge>
                        </div>
                        <CardDescription>Featured placement</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <p className="text-4xl font-bold text-purple-600 mb-1">+$100</p>
                          <p className="text-sm text-muted-foreground">/week upgrade</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Volume Discounts Applied Automatically
                    </h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>4-11 weeks: <strong>10% off</strong> total price</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>12-51 weeks: <strong>15% off</strong> total price</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>52+ weeks: <strong>20% off</strong> total price</span>
                      </li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">
                      <strong>Example:</strong> Standard placement (4 weeks at $537) + Slot 1 Featured upgrade (4 weeks × $250 = $1,000) = $1,537 total
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="text-lg" onClick={handleContactSales}>
                    Get Started as Training Partner
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/training">View Training Example</Link>
                  </Button>
                </div>
              </TabsContent>

              {/* Boost Dashboard Placement Tab */}
              <TabsContent value="boost" className="space-y-12">
                {/* Premium Badge */}
                <div className="text-center">
                  <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white text-sm px-4 py-1">
                    <Star className="h-4 w-4 mr-1" />
                    PREMIUM DASHBOARD PLACEMENT
                  </Badge>
                </div>

                {/* Slot Availability Alert */}
                {availableBoostSlots <= 3 && (
                  <div className="py-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                        ⚠️ Only {availableBoostSlots} dashboard {availableBoostSlots === 1 ? 'slot' : 'slots'} remaining!
                      </p>
                    </div>
                  </div>
                )}

                {/* Value Proposition */}
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <TrendingUp className="h-8 w-8 text-primary flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold mb-2">Most Valuable Real Estate</h3>
                        <p className="text-muted-foreground">
                          Your course appears directly on every candidate's dashboard in the "Boost Your Score" section—the first thing they see when they log in. Maximum visibility, maximum engagement.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Boost Benefits Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {boostBenefits.map((benefit, index) => (
                    <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                      <CardContent className="pt-6">
                        <div className="mb-4">{benefit.icon}</div>
                        <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pricing Grid for Boost */}
                <div>
                  <h3 className="text-2xl font-bold text-center mb-8">Dashboard Placement Pricing</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {boostPricingTiers.map((tier) => (
                      <Card 
                        key={tier.name} 
                        className={`relative ${tier.popular ? 'border-2 border-primary shadow-lg scale-105' : ''}`}
                      >
                        {tier.popular && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="text-center">{tier.name}</CardTitle>
                          <CardDescription className="text-center">{tier.duration}</CardDescription>
                          {tier.discount && (
                            <Badge variant="secondary" className="w-fit mx-auto mt-2">
                              {tier.discount}
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="text-center mb-6">
                            {tier.originalPrice && (
                              <p className="text-sm text-muted-foreground line-through">
                                ${tier.originalPrice.toLocaleString()}
                              </p>
                            )}
                            <p className="text-4xl font-bold">${tier.price.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              ${Math.round(tier.price / tier.weeks)}/week
                            </p>
                          </div>
                          <Button 
                            className="w-full" 
                            variant={tier.popular ? "default" : "outline"}
                            onClick={handleContactSales}
                          >
                            Select Plan
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="text-lg" onClick={handleContactSales}>
                    Get Boost Dashboard Placement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="https://www.loom.com" target="_blank" rel="noopener noreferrer">View Dashboard Demo</a>
                  </Button>
                </div>
              </TabsContent>

              {/* Certification Providers Tab */}
              <TabsContent value="certifications" className="space-y-12">
                {/* Slot Availability Alert */}
                {availableCertSlots.length === 0 ? (
                  <Alert className="border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <AlertTitle className="text-red-700 dark:text-red-400">All Featured Slots Currently Booked</AlertTitle>
                    <AlertDescription className="text-red-600 dark:text-red-300 space-y-3">
                      <p>All featured certification slots are currently reserved. Join our waitlist to be notified when slots become available.</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-500/50 hover:bg-red-500/20"
                        onClick={handleContactSales}
                      >
                        Join Waitlist
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : availableCertSlots.length <= 2 ? (
                  <Alert className="border-yellow-500/50 bg-yellow-500/10">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <AlertTitle className="text-yellow-700 dark:text-yellow-400">Limited Availability</AlertTitle>
                    <AlertDescription className="text-yellow-600 dark:text-yellow-300">
                      Only {availableCertSlots.length} featured slot position{availableCertSlots.length === 1 ? '' : 's'} currently available:
                      {availableCertSlots.map(slot => ` Slot ${slot}`).join(',')}. Book now to secure your premium placement!
                    </AlertDescription>
                  </Alert>
                ) : null}

                {/* Partnership Details */}
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                  <CardHeader>
                    <CardTitle className="text-2xl">Become a Featured Certification Provider</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                      Are you a certification provider? Get premium visibility and reach thousands of cybersecurity professionals actively pursuing certifications.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Prime Visibility</h3>
                          <p className="text-sm text-muted-foreground">Featured placement at top of catalog</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Star className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Targeted Audience</h3>
                          <p className="text-sm text-muted-foreground">Reach active job seekers and professionals</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Brand Authority</h3>
                          <p className="text-sm text-muted-foreground">Position as trusted certification body</p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Plans */}
                    <div className="pt-6 border-t border-border">
                      <h3 className="text-2xl font-bold text-center mb-6">Featured Placement Plans</h3>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* Standard Placement */}
                        <div className="space-y-3 p-6 rounded-lg border-2 border-border bg-card">
                          <div className="flex items-center gap-2 mb-4">
                            <Award className="h-6 w-6 text-primary" />
                            <h4 className="text-xl font-bold">Standard Listing</h4>
                          </div>
                          <p className="text-muted-foreground mb-4">
                            Free standard listing in our certification catalog with basic visibility.
                          </p>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">Listed in certification catalog</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">Searchable by candidates</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">Basic certification details</span>
                            </li>
                          </ul>
                          <div className="pt-4">
                            <div className="text-3xl font-bold">FREE</div>
                            <p className="text-sm text-muted-foreground">No cost to list</p>
                          </div>
                        </div>

                        {/* Featured Upgrade */}
                        <div className="space-y-3 p-6 rounded-lg border-4 border-primary bg-primary/5 relative">
                          <Badge className="absolute top-4 right-4 bg-primary">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                          <div className="flex items-center gap-2 mb-4">
                            <Star className="h-6 w-6 text-primary" />
                            <h4 className="text-xl font-bold">Featured Placement</h4>
                          </div>
                          <p className="text-muted-foreground mb-4">
                            Premium featured placement at the top of the certification catalog.
                          </p>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-sm font-semibold">Everything in Standard</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-sm">Top of page placement</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-sm">Enhanced visual design</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-sm">Logo display</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-sm">Premium badge</span>
                            </li>
                          </ul>
                          <div className="pt-4">
                            <div className="text-3xl font-bold">From $149<span className="text-base font-normal text-muted-foreground">/week</span></div>
                            <p className="text-sm text-muted-foreground">+ position upgrade</p>
                          </div>
                        </div>
                      </div>

                      {/* Slot Position Pricing */}
                      <div className="pt-4 border-t border-border">
                        <h4 className="text-lg font-semibold mb-4 text-center">Featured Slot Positions</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 rounded-lg bg-yellow-500/10 border-2 border-yellow-500/50">
                            <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500 fill-yellow-500" />
                            <div className="font-bold">Slot 1</div>
                            <div className="text-2xl font-bold mt-2">+$250</div>
                            <div className="text-xs text-muted-foreground">per week</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-orange-500/10 border-2 border-orange-500/50">
                            <Star className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                            <div className="font-bold">Slot 2</div>
                            <div className="text-2xl font-bold mt-2">+$200</div>
                            <div className="text-xs text-muted-foreground">per week</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-blue-500/10 border-2 border-blue-500/50">
                            <Star className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                            <div className="font-bold">Slot 3</div>
                            <div className="text-2xl font-bold mt-2">+$150</div>
                            <div className="text-xs text-muted-foreground">per week</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-purple-500/10 border-2 border-purple-500/50">
                            <Star className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                            <div className="font-bold">Slot 4</div>
                            <div className="text-2xl font-bold mt-2">+$100</div>
                            <div className="text-xs text-muted-foreground">per week</div>
                          </div>
                        </div>
                        <p className="text-sm text-center text-muted-foreground mt-4">
                          Total cost = Base ($149) + Slot position premium. Volume discounts apply automatically for longer terms.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="text-lg" onClick={handleContactSales}>
                    Get Started as Certification Provider
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/certifications-catalog">View Cert Catalog</Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Slot Availability Alert - Removed old version */}

        {/* Benefits Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Partner With Cydena?</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Connect with motivated cybersecurity professionals who are actively investing in their education and career growth
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="mb-4">{benefit.icon}</div>
                      <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section - Now handled in tabs above */}

        {/* Features List */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                Everything Included in Your Featured Partnership
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-lg">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Stats */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">10,000+</div>
                  <p className="text-muted-foreground">Monthly Active Users</p>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">5x</div>
                  <p className="text-muted-foreground">Average CTR Increase vs Standard Listing</p>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">92%</div>
                  <p className="text-muted-foreground">Users Actively Job Seeking</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                Frequently Asked Questions
              </h2>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What's the difference between standard and featured placement?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Standard placement lists you in the relevant category sections at $149/week base rate. Featured placement upgrades you to the premium top-of-page section with logo display, custom branding, and guaranteed visibility for an additional $100-250/week (depending on slot position 1-4). Volume discounts apply automatically.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How many featured slots are available?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Only 4 featured slots are available at any time for each category (training and certifications) to maintain exclusivity. Training: {availableTrainingSlots} available. Certifications: {availableCertSlots} available. Dashboard boost placements have 6 slots available.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can I upgrade or extend my partnership?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Yes! You can upgrade to a longer duration or extend your partnership at any time. Contact our sales team to discuss your options and receive preferential pricing for extensions.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What kind of ROI can I expect?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Featured partners typically see 5x higher click-through rates compared to standard listings. With our audience of active job seekers and career advancers, you're reaching highly motivated candidates at the perfect moment in their learning journey.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How do I get started?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Simply contact our sales team using the button below. We'll discuss your goals, help you choose the right plan, and get your featured placement live within 48 hours.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Become a Featured Partner?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join the leading cybersecurity training providers and reach thousands of motivated professionals today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg" onClick={handleContactSales}>
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Partnerships;
