import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send } from "lucide-react";
import Navigation from "@/components/Navigation";
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
      <Navigation />

      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-muted-foreground">
            Get in touch with our team - we're here to help
          </p>
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

            <Card className="border-border shadow-card bg-gradient-card">
              <CardHeader>
                <CardTitle>Quick Answers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm mb-1">
                    How do I verify my certifications?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your certification documents in your profile settings for verification.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-1">
                    How does the leaderboard work?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your ranking is based on profile completion, certifications, and community engagement.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-1">
                    Is the platform free?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Free for candidates. Employers pay for job postings and premium features.
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
