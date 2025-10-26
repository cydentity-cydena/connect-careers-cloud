import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send, Bug, ChevronDown, Clock, AlertCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import Schema from "@/components/Schema";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) {
        throw error;
      }

      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Contact Cydena - Cybersecurity Recruitment Support"
        description="Get in touch with Cydena's support team. Contact us for candidate support, employer inquiries, training partnerships, or technical assistance."
        keywords="contact cydena, cybersecurity recruitment support, customer service, employer inquiries"
      />
      <Schema type="breadcrumb" data={{
        items: [
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" }
        ]
      }} />
      <Navigation />

      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Contact Cydena Support</h1>
          
          <Collapsible className="mb-6">
            <Card className="border-border shadow-card">
              <CardHeader className="pb-3">
                <CollapsibleTrigger className="flex w-full items-center justify-between hover:opacity-80 transition-opacity [&[data-state=open]>svg]:rotate-180">
                  <div>
                    <CardTitle className="text-left">
                      Get in touch with our team
                    </CardTitle>
                    <CardDescription className="text-left mt-1">
                      We're here to help with your cybersecurity recruitment needs
                    </CardDescription>
                  </div>
                  <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 text-muted-foreground" />
                </CollapsibleTrigger>
              </CardHeader>
              
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Who We Support</h3>
                        <p className="text-sm text-muted-foreground">
                          Whether you're a cybersecurity professional looking for your next opportunity, an employer seeking to fill critical security positions, or a training partner interested in collaboration, we're committed to providing prompt and helpful support.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Response Time</h3>
                        <p className="text-sm text-muted-foreground">
                          Our team typically responds to all inquiries within 24 hours during business days.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Urgent Matters</h3>
                        <p className="text-sm text-muted-foreground">
                          For urgent matters related to active job applications, account access issues, or payment concerns, please use the appropriate contact email below for the fastest response. Technical issues and bug reports help us improve the platform for everyone in the cybersecurity community.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Form */}
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Send us a message
              </CardTitle>
              <CardDescription>
                Fill out the form and we'll respond within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us how we can help..."
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full gap-2"
                  disabled={isSubmitting}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info & FAQ */}
          <div className="space-y-6">
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">General Inquiries</h3>
                  <p className="text-sm text-muted-foreground">
                    General questions or feedback about our platform
                  </p>
                  <a
                    href="mailto:contact@cydena.com"
                    className="text-sm text-primary hover:underline"
                  >
                    contact@cydena.com
                  </a>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">For Candidates</h3>
                  <p className="text-sm text-muted-foreground">
                    Questions about your profile, certifications, or job opportunities
                  </p>
                  <a
                    href="mailto:candidates@cydena.com"
                    className="text-sm text-primary hover:underline"
                  >
                    candidates@cydena.com
                  </a>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">For Employers</h3>
                  <p className="text-sm text-muted-foreground">
                    Interested in posting jobs or accessing our talent pool
                  </p>
                  <a
                    href="mailto:employers@cydena.com"
                    className="text-sm text-primary hover:underline"
                  >
                    employers@cydena.com
                  </a>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Training Partners</h3>
                  <p className="text-sm text-muted-foreground">
                    Partnership inquiries for training organizations
                  </p>
                  <a
                    href="mailto:partners@cydena.com"
                    className="text-sm text-primary hover:underline"
                  >
                    partners@cydena.com
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-card bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5 text-primary" />
                  Found a Bug?
                </CardTitle>
                <CardDescription>
                  Help us improve Cydena by reporting issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Encountered a broken link, course issue, or something not working right? Let us know!
                </p>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => window.location.href = '/bug-report'}
                >
                  <Bug className="h-4 w-4" />
                  Report a Bug
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border shadow-card bg-gradient-card">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Common questions about using Cydena</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">
                    How do I verify my cybersecurity certifications?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your certification documents (CompTIA, CISSP, CEH, SANS, etc.) in your profile settings. Our verification team reviews submissions within 48 hours. Verified certifications increase your visibility to employers.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">
                    What is your typical response time?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We respond to all inquiries within 24 hours during business days (Monday-Friday). Urgent account issues are prioritized and typically addressed within 4-6 hours.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">
                    How does the leaderboard ranking work?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your ranking is based on verified certifications, completed training courses, profile completeness, and community engagement. Higher rankings increase your visibility to employers searching for top cybersecurity talent.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">
                    Is Cydena free for cybersecurity professionals?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! Cydena is 100% free for all cybersecurity professionals - no hidden fees, no credit card required. Employers and recruiters pay subscription fees to access our talent pool and post jobs.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">
                    How do I report a technical issue or bug?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Click the "Report a Bug" button above or visit our bug report page. Include details about what you were doing when the issue occurred, and we'll investigate promptly.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">
                    Can I contact employers directly through the platform?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! Once you apply for a position, you can message the employer directly through our in-platform messaging system. This direct communication helps speed up the hiring process.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
