import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight, Users, Zap, Shield, MessageSquare, Building2, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import Schema from "@/components/Schema";

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Pricing - Cydena | No Agency Fees"
        description="Access verified cybersecurity talent without traditional agency fees. Contact us for tailored solutions."
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
          <Badge className="mb-4" variant="secondary">No Agency Fees</Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-cyber bg-clip-text text-transparent">
            Tailored Solutions for Your Hiring Needs
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Access verified cybersecurity talent without traditional agency fees. 
            We'll work with you to find the right solution for your team.
          </p>
        </div>

        <div className="space-y-16">
          {/* Value Props */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Verified Talent, No Hidden Costs</CardTitle>
              <CardDescription>
                Access pre-verified, HR-ready cybersecurity professionals
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
                  <h4 className="font-semibold mb-1">Quality Talent Pool</h4>
                  <p className="text-sm text-muted-foreground">Curated cybersecurity professionals</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold mb-1">No Agency Fees</h4>
                  <p className="text-sm text-muted-foreground">Eliminate traditional 20%+ placement fees</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Solutions Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-2">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>For Employers</CardTitle>
                <CardDescription>Direct access to verified talent</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Advanced candidate filters</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Pre-verified profiles</span>
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
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>Team collaboration</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/contact?subject=Employer%20Inquiry')}
                >
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary relative hover:border-primary transition-colors">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Popular</Badge>
              <CardHeader>
                <div className="p-3 rounded-lg bg-orange-500/10 w-fit mb-2">
                  <UserCheck className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Expert Assist</CardTitle>
                <CardDescription>Specialist help for complex roles</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-orange-600 shrink-0" />
                    <span>Executive security roles</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-orange-600 shrink-0" />
                    <span>Niche specializations</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-orange-600 shrink-0" />
                    <span>Urgent critical hires</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-orange-600 shrink-0" />
                    <span>Deep market expertise</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-orange-600 shrink-0" />
                    <span>Candidate shortlisting</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-orange-600 shrink-0" />
                    <span>Targeted sourcing</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={() => navigate('/contact?subject=Expert%20Assist%20Inquiry')}
                >
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="p-3 rounded-lg bg-purple-500/10 w-fit mb-2">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>For Recruiters</CardTitle>
                <CardDescription>Partnership opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-purple-600 shrink-0" />
                    <span>Pre-verified candidate pool</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-purple-600 shrink-0" />
                    <span>Client management tools</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-purple-600 shrink-0" />
                    <span>Placement tracking</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-purple-600 shrink-0" />
                    <span>No verification overhead</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-purple-600 shrink-0" />
                    <span>Partner dashboard</span>
                  </li>
                  <li className="flex gap-2">
                    <Check className="h-5 w-5 text-purple-600 shrink-0" />
                    <span>Revenue sharing</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => navigate('/contact?subject=Recruiter%20Partnership')}
                >
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-br from-primary/5 to-background border-primary/20">
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-3xl font-bold mb-4">Let's Talk</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                Every team is different. Whether you're hiring one specialist or building 
                an entire security team, we'll help you find the right approach.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" onClick={() => navigate('/contact')}>
                  Get in Touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/faq')}>
                  View FAQ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
