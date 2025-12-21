import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Youtube,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  Zap,
  Shield,
  CheckCircle,
  ArrowRight,
  Star,
  Heart,
  Globe,
} from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Reach Targeted Audience",
    description: "Connect with cybersecurity professionals actively seeking to upskill and advance their careers.",
  },
  {
    icon: TrendingUp,
    title: "Increase Subscribers",
    description: "Every learning path includes prominent CTAs encouraging users to subscribe to your channel.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track how many users engage with your content, complete videos, and click through to your channel.",
  },
  {
    icon: Award,
    title: "Featured Partner Status",
    description: "Get highlighted as a featured training partner with premium placement across our platform.",
  },
  {
    icon: Heart,
    title: "Full Attribution",
    description: "Your brand, channel, and content are always credited with links back to your original content.",
  },
  {
    icon: Shield,
    title: "You Stay in Control",
    description: "Request removal anytime. We use YouTube embeds only - your content stays on your platform.",
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Apply to Partner",
    description: "Fill out the form below with your channel details and content focus areas.",
  },
  {
    step: 2,
    title: "Content Curation",
    description: "We curate your best videos into structured learning paths with XP rewards for users.",
  },
  {
    step: 3,
    title: "Get Discovered",
    description: "Your content reaches our community of cybersecurity candidates and employers.",
  },
  {
    step: 4,
    title: "Grow Together",
    description: "Track engagement analytics and watch your subscriber count grow.",
  },
];

const featuredPartners = [
  { name: "IppSec", category: "Penetration Testing", subscribers: "500K+" },
  { name: "John Hammond", category: "Bug Bounty & CTF", subscribers: "1.5M+" },
  { name: "NetworkChuck", category: "Networking", subscribers: "3M+" },
  { name: "PwnFunction", category: "Web Security", subscribers: "200K+" },
];

export default function TrainingPartners() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    channelName: "",
    channelUrl: "",
    email: "",
    subscriberCount: "",
    contentFocus: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.channelName || !form.channelUrl || !form.email) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: form.channelName,
          email: form.email,
          subject: `Training Partner Application: ${form.channelName}`,
          message: `
Channel Name: ${form.channelName}
Channel URL: ${form.channelUrl}
Subscriber Count: ${form.subscriberCount}
Content Focus: ${form.contentFocus}

Message:
${form.message}
          `.trim(),
        },
      });

      if (error) throw error;

      toast.success("Application submitted! We'll be in touch soon.");
      setForm({
        channelName: "",
        channelUrl: "",
        email: "",
        subscriberCount: "",
        contentFocus: "",
        message: "",
      });
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Training Provider Partnerships | Cydena"
        description="Partner with Cydena to reach thousands of cybersecurity professionals. Get featured, grow your audience, and help shape the next generation of security talent."
      />
      <Navigation />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 gap-2" variant="secondary">
                <Youtube className="h-4 w-4 text-red-500" />
                Training Provider Program
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Grow Your Audience with{" "}
                <span className="text-primary">Cydena</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Partner with us to reach thousands of cybersecurity professionals 
                actively seeking to learn and advance their careers. Your content, 
                our platform, mutual growth.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2" asChild>
                  <a href="#apply">
                    Apply to Partner
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/learning-paths")}>
                  View Learning Paths
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">10K+</p>
                <p className="text-sm text-muted-foreground">Active Learners</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">50+</p>
                <p className="text-sm text-muted-foreground">Learning Paths</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Videos Curated</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">100K+</p>
                <p className="text-sm text-muted-foreground">XP Earned Monthly</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Partner With Us?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We help content creators reach a targeted audience of cybersecurity 
                professionals while maintaining full control of their content.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <div className="p-3 rounded-lg bg-primary/10 w-fit mb-2">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground">
                Simple, transparent, and creator-friendly
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {howItWorks.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Partners */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Partners</h2>
              <p className="text-muted-foreground">
                Join these amazing creators already on our platform
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {featuredPartners.map((partner, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                      <Youtube className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="font-semibold mb-1">{partner.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{partner.category}</p>
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3" />
                      {partner.subscribers}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section id="apply" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Apply to Partner</h2>
                <p className="text-muted-foreground">
                  Tell us about your channel and how we can work together
                </p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="channelName">Channel Name *</Label>
                        <Input
                          id="channelName"
                          value={form.channelName}
                          onChange={(e) => setForm({ ...form, channelName: e.target.value })}
                          placeholder="e.g., NetworkChuck"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="channelUrl">Channel URL *</Label>
                      <Input
                        id="channelUrl"
                        value={form.channelUrl}
                        onChange={(e) => setForm({ ...form, channelUrl: e.target.value })}
                        placeholder="https://youtube.com/@yourchannel"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subscriberCount">Subscriber Count</Label>
                        <Input
                          id="subscriberCount"
                          value={form.subscriberCount}
                          onChange={(e) => setForm({ ...form, subscriberCount: e.target.value })}
                          placeholder="e.g., 50K"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contentFocus">Content Focus</Label>
                        <Input
                          id="contentFocus"
                          value={form.contentFocus}
                          onChange={(e) => setForm({ ...form, contentFocus: e.target.value })}
                          placeholder="e.g., Penetration Testing, CTFs"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Tell us more about your channel</Label>
                      <Textarea
                        id="message"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="What topics do you cover? What makes your content unique? Any specific ideas for collaboration?"
                        rows={4}
                      />
                    </div>

                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                      {loading ? (
                        "Submitting..."
                      ) : (
                        <>
                          Submit Application
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By submitting, you agree to let us review your channel for potential partnership.
                      We typically respond within 2-3 business days.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Common Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Do you monetize my content?</h3>
                  <p className="text-muted-foreground">
                    No. We use YouTube embeds which means views still count towards your channel. 
                    We never reupload, modify, or monetize your content.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What if I want my content removed?</h3>
                  <p className="text-muted-foreground">
                    Just email us and we will remove your content within 24 hours, no questions asked.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Is there a subscriber minimum?</h3>
                  <p className="text-muted-foreground">
                    No minimum required! We care about quality content, not subscriber counts. 
                    Smaller creators with great educational content are welcome.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What analytics do I get?</h3>
                  <p className="text-muted-foreground">
                    Featured partners get access to engagement metrics including video completions, 
                    click-through rates to your channel, and user retention data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}