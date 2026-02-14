import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Check, Star, TrendingUp, Users, BarChart, Sparkles, ArrowRight, Award, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Partnerships = () => {
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
                Partnership Opportunities
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Featured Training & Certification Partnerships
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
                            <p className="text-sm text-muted-foreground">Listed in category sections with direct links to your courses.</p>
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
                            <p className="text-sm text-muted-foreground">Premium top-of-page section with logo display and custom branding.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                <div className="text-center">
                  <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white text-sm px-4 py-1">
                    <Star className="h-4 w-4 mr-1" />
                    PREMIUM DASHBOARD PLACEMENT
                  </Badge>
                </div>

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

                <div className="flex justify-center">
                  <Button size="lg" className="text-lg" onClick={handleContactSales}>
                    Get Boost Dashboard Placement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </TabsContent>

              {/* Certification Providers Tab */}
              <TabsContent value="certifications" className="space-y-12">
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
                      Standard placement lists you in the relevant category sections. Featured placement upgrades you to the premium top-of-page section with logo display, custom branding, and guaranteed visibility. Contact our team for details.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How many featured slots are available?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Only a limited number of featured slots are available at any time for each category (training, certifications, and dashboard boost) to maintain exclusivity. Contact us to check current availability.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Can I upgrade or extend my partnership?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Yes! You can upgrade to a longer duration or extend your partnership at any time. Contact our sales team to discuss your options.
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
