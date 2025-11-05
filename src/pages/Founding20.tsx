import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Award, Target, Zap, TrendingUp, Users, Briefcase, Shield, CheckCircle2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";

export default function Founding20() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    yearsExperience: "",
    currentTitle: "",
    topCertifications: "",
    keySkills: "",
    availability: "",
    salaryExpectations: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    whyTopTwenty: "",
    consentVerification: false,
    consentContact: false,
  });

  const benefits = [
    {
      icon: Target,
      title: "Exclusive Exposure",
      description: "Featured profiles shown to vetted HR professionals and employers actively hiring"
    },
    {
      icon: Zap,
      title: "Fast-Track Hiring",
      description: "Priority placement and direct introductions to hiring managers - skip the queue"
    },
    {
      icon: Award,
      title: "Elite Recognition",
      description: "Badge and designation as verified top-tier cybersecurity talent in our ecosystem"
    },
    {
      icon: TrendingUp,
      title: "Quality Opportunities",
      description: "Access to pre-screened, high-quality job openings from our trusted partners"
    },
    {
      icon: Users,
      title: "Direct Access",
      description: "Get noticed first - employers see your profile before anyone else"
    },
    {
      icon: Briefcase,
      title: "Career Boost",
      description: "Stand out in a competitive market with verified credentials and elite status"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consentVerification || !formData.consentContact) {
      toast({
        title: "Consent Required",
        description: "Please accept both consent checkboxes to proceed",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call edge function to handle the submission
      const { data, error } = await supabase.functions.invoke('founding-20-application', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: "Application Submitted! 🎉",
        description: "We'll review your application and contact you within 48 hours.",
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        yearsExperience: "",
        currentTitle: "",
        topCertifications: "",
        keySkills: "",
        availability: "",
        salaryExpectations: "",
        linkedinUrl: "",
        githubUrl: "",
        portfolioUrl: "",
        whyTopTwenty: "",
        consentVerification: false,
        consentContact: false,
      });

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO 
        title="Founding 20 - Elite Cybersecurity Talent Program"
        description="Join the exclusive Founding 20 program and get fast-tracked to top cybersecurity opportunities. Elite recognition, priority placement, and direct access to hiring managers."
        keywords="cybersecurity jobs, elite talent, founding 20, verified professionals, priority hiring, cyber security careers"
      />
      <Navigation />
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary">Limited Spots Available</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                Join the Founding 20
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4">
                Become part of an elite group of verified cybersecurity professionals with exclusive access to top-tier opportunities
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                <span className="text-sm font-medium text-primary">🇬🇧 UK Candidates Only</span>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-2 hover:border-primary/40 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form Section */}
        <section className="py-16 px-4 bg-card/50 backdrop-blur">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">Apply Now</CardTitle>
                <CardDescription className="text-base">
                  Complete the form below to be considered for the Founding 20 program (UK candidates only)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Personal Information
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (UK)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+44 7XXX XXXXXX"
                      />
                    </div>
                  </div>

                  {/* Professional Background */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Professional Background
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yearsExperience">Years of Experience *</Label>
                        <Input
                          id="yearsExperience"
                          type="number"
                          required
                          min="0"
                          value={formData.yearsExperience}
                          onChange={(e) => setFormData({...formData, yearsExperience: e.target.value})}
                          placeholder="5"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="currentTitle">Current Job Title *</Label>
                        <Input
                          id="currentTitle"
                          required
                          value={formData.currentTitle}
                          onChange={(e) => setFormData({...formData, currentTitle: e.target.value})}
                          placeholder="Security Analyst"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="topCertifications">Top 3 Certifications *</Label>
                      <Textarea
                        id="topCertifications"
                        required
                        value={formData.topCertifications}
                        onChange={(e) => setFormData({...formData, topCertifications: e.target.value})}
                        placeholder="e.g., CISSP, CEH, Security+"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keySkills">Key Technical Skills *</Label>
                      <Textarea
                        id="keySkills"
                        required
                        value={formData.keySkills}
                        onChange={(e) => setFormData({...formData, keySkills: e.target.value})}
                        placeholder="e.g., Penetration Testing, SIEM, Cloud Security, Python..."
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Availability & Expectations */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Availability & Expectations
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="availability">Availability *</Label>
                        <Input
                          id="availability"
                          required
                          value={formData.availability}
                          onChange={(e) => setFormData({...formData, availability: e.target.value})}
                          placeholder="Immediate / 2 weeks / 1 month"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="salaryExpectations">Salary Expectations (GBP) *</Label>
                        <Input
                          id="salaryExpectations"
                          required
                          value={formData.salaryExpectations}
                          onChange={(e) => setFormData({...formData, salaryExpectations: e.target.value})}
                          placeholder="£50,000 - £70,000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Online Presence */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Online Presence
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                      <Input
                        id="linkedinUrl"
                        type="url"
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                        placeholder="https://linkedin.com/in/johndoe"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="githubUrl">GitHub Profile URL</Label>
                        <Input
                          id="githubUrl"
                          type="url"
                          value={formData.githubUrl}
                          onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                          placeholder="https://github.com/johndoe"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="portfolioUrl">Portfolio/Website URL</Label>
                        <Input
                          id="portfolioUrl"
                          type="url"
                          value={formData.portfolioUrl}
                          onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                          placeholder="https://johndoe.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Why You? */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Your Story
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="whyTopTwenty">Why should you be part of the Founding 20? *</Label>
                      <Textarea
                        id="whyTopTwenty"
                        required
                        value={formData.whyTopTwenty}
                        onChange={(e) => setFormData({...formData, whyTopTwenty: e.target.value})}
                        placeholder="Tell us what makes you exceptional and why you deserve to be in the top 20..."
                        rows={6}
                      />
                    </div>
                  </div>

                  {/* Consent Checkboxes */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="consentVerification"
                        checked={formData.consentVerification}
                        onCheckedChange={(checked) => 
                          setFormData({...formData, consentVerification: checked as boolean})
                        }
                      />
                      <label
                        htmlFor="consentVerification"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I consent to verification of my credentials, certifications, and background as part of the Founding 20 selection process. *
                      </label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="consentContact"
                        checked={formData.consentContact}
                        onCheckedChange={(checked) => 
                          setFormData({...formData, consentContact: checked as boolean})
                        }
                      />
                      <label
                        htmlFor="consentContact"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to be contacted by the Cydena team and partnered employers regarding opportunities. *
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By submitting this form, you acknowledge that all information provided is accurate and complete.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Questions About the Program?</h2>
            <p className="text-muted-foreground mb-8">
              We're here to help. Reach out to our team for more information.
            </p>
            <Button variant="outline" size="lg" onClick={() => navigate("/contact")}>
              Contact Us
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
