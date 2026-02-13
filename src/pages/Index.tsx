import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Briefcase, ArrowRight, CheckCircle, GraduationCap, Eye, Award, Filter, BarChart3, BadgeCheck, Youtube, Play, ExternalLink, Share2, Star, Calculator, Zap, Code, Target, DollarSign } from "lucide-react";
import { ROICalculator } from "@/components/pricing/ROICalculator";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import Schema from "@/components/Schema";
import heroImage from "@/assets/hero-bg.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: learningPathsData } = useQuery({
    queryKey: ['learning-paths-summary-home'],
    queryFn: async () => {
      const { data: paths, error } = await supabase
        .from('youtube_learning_paths')
        .select('id, total_xp')
        .eq('is_active', true);
      
      if (error) throw error;
      
      const totalPaths = paths?.length || 0;
      const totalXp = paths?.reduce((sum, p) => sum + (p.total_xp || 0), 0) || 0;
      
      return { totalPaths, totalXp };
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Schema type="organization" />
      <Schema type="website" />
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-16 md:pt-24 pb-20 md:pb-32 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6">
              Join the{" "}
              <span className="bg-gradient-cyber bg-clip-text text-transparent">
                Evidence-Led Future
              </span>
              {" "}of Cyber Hiring
            </h1>
            <p className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
              Prove your skills. Hire with confidence.
            </p>
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-2">
              Cydena connects verified cybersecurity professionals with employers who value real-world skills, certified credibility, and faster decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
              <Link to="/profiles" className="w-full sm:w-auto">
                <Button variant="hero" size="lg" className="gap-2 w-full sm:w-auto">
                  Find Talent <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/jobs" className="w-full sm:w-auto">
                <Button variant="cyber" size="lg" className="w-full sm:w-auto">
                  Find Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)] opacity-20" />
      </section>

      {/* Section 1: For Candidates — Free & Accessible */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Free for <span className="bg-gradient-cyber bg-clip-text text-transparent">Candidates</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                From entry-level to CISO — everyone gets equal access
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {[
                { title: "Real-Time Application Tracking", desc: "Never wonder where your application stands — watch it progress from Applied → Under Review → Offer in real-time" },
                { title: "Career Transitioners Welcome", desc: "Breaking into cybersecurity? We support entry-level talent with partner certifications" },
                { title: "Get HR-Ready Verified", desc: "Submit identity & right-to-work securely once, apply everywhere. Stand out with verified badges" },
                { title: "Showcase Your Certifications", desc: "CompTIA, CISSP, CEH, SANS — verified credentials get you noticed" },
                { title: "Prove Your Skills with Assessments", desc: "Take TryHackMe and HackTheBox verified assessments to showcase real technical ability" },
                { title: "Gamified Profile & Peer Endorsements", desc: "Earn XP, climb the leaderboard, get endorsed by peers, unlock achievements as you grow" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 text-sm md:text-base">{item.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Free Learning Paths Card */}
            <Card className="mt-8 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-destructive/10 p-2.5 rounded-lg">
                      <Youtube className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        Free Learning Paths
                        <Badge variant="secondary" className="bg-success/20 text-success border-success/30 text-xs">
                          100% Free
                        </Badge>
                      </CardTitle>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        Curated YouTube courses from top creators
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const shareUrl = `${window.location.origin}/learning-paths`;
                        const shareText = `Check out these free cybersecurity learning paths on Cydena! ${learningPathsData?.totalPaths || 0} paths with ${learningPathsData?.totalXp?.toLocaleString() || 0} XP available.`;
                        if (navigator.share) {
                          navigator.share({ title: 'Free Cybersecurity Learning Paths', text: shareText, url: shareUrl });
                        } else {
                          navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                          alert('Link copied to clipboard!');
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Link to="/learning-paths">
                      <Button size="sm" className="gap-1.5">
                        <Play className="h-3.5 w-3.5" />
                        Browse Paths
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-background/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{learningPathsData?.totalPaths || 0}</p>
                    <p className="text-xs text-muted-foreground">Paths</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-warning">{learningPathsData?.totalXp?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground">XP Available</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-success">Free</p>
                    <p className="text-xs text-muted-foreground">No Cost</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Complete videos to earn XP and track progress. Content from <span className="text-foreground font-medium">NetworkChuck</span>, <span className="text-foreground font-medium">Professor Messer</span>, <span className="text-foreground font-medium">IppSec</span> & more.
                </p>
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  Create Free Profile <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Platform Features + How It Works (consolidated) */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              The platform for <span className="bg-gradient-cyber bg-clip-text text-transparent">verified cyber talent</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto">
              Built specifically for cybersecurity — validated, curated, and interview-ready professionals
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-16">
            {[
              { icon: Shield, title: "HR-Aligned Verification Hub", desc: "Identity, certifications, and eligibility — safely stored, ready for review.", color: "primary" },
              { icon: Users, title: "Candidate Pod Management", desc: "Curate and assign groups of pre-vetted candidates to employers.", color: "accent" },
              { icon: Filter, title: "Intelligent Job Matching", desc: "Only qualified matches see relevant opportunities — no spray-and-pray.", color: "primary" },
              { icon: Briefcase, title: "ATS & Webhook Integration", desc: "Push candidates to Workday and SAP SuccessFactors. Automate workflows.", color: "secondary" },
              { icon: BarChart3, title: "Analytics & Insights", desc: "Track hiring metrics, time-to-hire, and pipeline performance.", color: "accent" },
              { icon: BadgeCheck, title: "Skills Verification", desc: "Pre-validated technical skills and certifications reduce interview time.", color: "primary" },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-gradient-card backdrop-blur-sm border border-border rounded-lg p-5 md:p-6 lg:p-8 hover:scale-105 transition-transform animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`bg-${feature.color}/10 w-11 h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg flex items-center justify-center mb-3 md:mb-4 lg:mb-6 flex-shrink-0`}>
                  <feature.icon className={`h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-${feature.color}`} />
                </div>
                <h3 className="text-base md:text-lg lg:text-xl font-semibold mb-2 md:mb-3">{feature.title}</h3>
                <p className="text-xs md:text-sm lg:text-base text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* How It Works - side by side */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">How Cydena Works</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-card border border-border rounded-lg p-6">
                <h4 className="text-xl font-bold mb-3 text-primary">For Cybersecurity Professionals</h4>
                <ol className="space-y-3 text-muted-foreground">
                  {[
                    "Create your free profile in minutes — no payment required",
                    "Get HR-Ready verified — submit identity, right-to-work & clearance once securely",
                    "Upload and verify your certifications (CISSP, CEH, Security+, etc.)",
                    "Apply to jobs instantly with verified badges",
                    "Track applications in real-time",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-bold text-primary">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="bg-gradient-card border border-border rounded-lg p-6">
                <h4 className="text-xl font-bold mb-3 text-secondary">For Employers & Recruiters</h4>
                <ol className="space-y-3 text-muted-foreground">
                  {[
                    "Choose a subscription plan that fits your hiring needs",
                    "Filter by HR-Ready candidates — identity, RTW & clearance pre-verified",
                    "Access verified candidates with credentials already confirmed",
                    "Post work bounties on the Marketplace for on-demand talent",
                    "Shorten time-to-hire with evidence-based shortlists",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="font-bold text-secondary">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Hire with Confidence + ROI (consolidated) */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 md:mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Hire with <span className="bg-gradient-cyber bg-clip-text text-transparent">Confidence</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Expert support to curate top talent. We don't just connect you with candidates — we help you find the perfect fit.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-16">
              {[
                { icon: Shield, title: "Pre-Vetted Talent Pool", desc: "Every candidate is verified for identity, right-to-work, and certifications. Focus on skills and culture fit, not paperwork.", color: "primary" },
                { icon: Users, title: "Expert Curation Support", desc: "Our team understands cybersecurity roles deeply. Get guidance on talent selection and hiring best practices.", color: "secondary" },
                { icon: Target, title: "Skills-Match Technology", desc: "Intelligent matching considers certifications, experience levels, and specializations to surface candidates who truly fit.", color: "accent" },
                { icon: Briefcase, title: "Dedicated Partner Success", desc: "From onboarding to your first hire and beyond, our team optimizes your hiring strategy and maximizes ROI.", color: "primary" },
              ].map((card, i) => (
                <Card key={i} className={`group hover:shadow-xl transition-all duration-300 border-2 hover:border-${card.color}/50 bg-card/80 backdrop-blur`}>
                  <CardContent className="p-6 md:p-8">
                    <div className={`bg-${card.color}/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <card.icon className={`h-7 w-7 text-${card.color}`} />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-3">{card.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{card.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ROI Calculator inline */}
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
                  <Calculator className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Cost Savings Calculator</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  See How Much You Could <span className="bg-gradient-cyber bg-clip-text text-transparent">Save</span>
                </h3>
                <p className="text-muted-foreground">
                  Compare traditional agency costs vs direct access to verified talent
                </p>
              </div>
              <ROICalculator />
            </div>

            <div className="text-center mt-10 md:mt-12">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="gap-2">
                  Start Hiring Top Talent <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Partners + Marketplace + CTA (consolidated) */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Partners */}
            <div className="text-center mb-12 md:mb-16 animate-fade-in">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
                <span className="text-sm font-semibold text-primary">PARTNERS</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Meet Our <span className="bg-gradient-cyber bg-clip-text text-transparent">Partners</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Connecting you with industry-leading organizations that power our training ecosystem
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {[
                { name: "TRECCERT", href: "https://treccert.com", logo: "/logos/treccert-logo-banner.png", tag: "Accreditation", tagColor: "info", desc: "Certification body providing certifications that attest the competencies of professionals in information security and compliance." },
                { name: "Cydentity", href: "https://www.cydentity.co.uk", logo: "/logos/cydentity-logo-white.png", tag: "Cybersecurity", tagColor: "primary", desc: "Leading cybersecurity solutions provider, delivering comprehensive security services and training." },
                { name: "Cydentity Academy", href: "https://cydentityacademy.com", logo: "/logos/cydentity-academy-logo-white.png", tag: "Training & Education", tagColor: "primary", desc: "Leading provider of cybersecurity and AI security training, offering comprehensive courses." },
                { name: "REAL LMS", href: "https://thereallms.com", logo: "/logos/real-lms-logo.png", tag: "Training Platform", tagColor: "secondary", desc: "Real-world SOC analyst training platform with hands-on labs and simulations." },
              ].map((partner) => (
                <a key={partner.name} href={partner.href} target="_blank" rel="noopener noreferrer">
                  <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/40 bg-card/80 backdrop-blur cursor-pointer h-full">
                    <CardContent className="p-8">
                      <div className="flex items-center justify-center mb-6 h-24">
                        <img src={partner.logo} alt={partner.name} className="h-16 object-contain" />
                      </div>
                      <div className="mb-4">
                        <span className={`px-4 py-1 bg-${partner.tagColor}/20 text-${partner.tagColor} rounded-full text-sm font-semibold`}>
                          {partner.tag}
                        </span>
                      </div>
                      <h4 className="text-2xl font-bold mb-3">{partner.name}</h4>
                      <p className="text-muted-foreground">{partner.desc}</p>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>

            {/* Training Partner CTA */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 mb-16">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="bg-primary/10 p-4 rounded-lg flex-shrink-0">
                    <GraduationCap className="h-10 w-10 text-primary" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">Are You a Training Provider?</h3>
                    <p className="text-muted-foreground mb-4">
                      Join our partner network and give your graduates instant visibility with hiring employers.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <Link to="/partnerships">
                        <Button className="gap-2">
                          <Star className="h-4 w-4" />
                          Become a Partner
                        </Button>
                      </Link>
                      <Link to="/training">
                        <Button variant="outline">View Training Partners</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Talent Marketplace */}
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Zap className="h-3 w-3 mr-1" /> Talent Marketplace
              </Badge>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                On-Demand Cyber Talent.{" "}
                <span className="bg-gradient-cyber bg-clip-text text-transparent">Book or Post.</span>
              </h3>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Need a pen tester for a week? A GRC consultant for a compliance audit?
                Post a bounty or browse our verified talent — available via dashboard, API, or AI agent.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { icon: Briefcase, title: "Employers: Post Bounties", desc: "Describe your security need, set a budget, and let qualified professionals apply.", color: "primary" },
                { icon: Users, title: "Candidates: Get Listed", desc: "Opt in from your Dashboard. Set your rate, availability, and specialisms.", color: "secondary" },
                { icon: Code, title: "API & MCP Ready", desc: "AI agents and platforms can search talent and post bounties programmatically.", color: "accent" },
              ].map((item, i) => (
                <Card key={i} className="border-border bg-card/80">
                  <CardContent className="p-6 text-center">
                    <div className={`h-12 w-12 rounded-full bg-${item.color}/10 flex items-center justify-center mx-auto mb-4`}>
                      <item.icon className={`h-6 w-6 text-${item.color}`} />
                    </div>
                    <h4 className="font-semibold mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Link to="/marketplace">
                <Button variant="hero" size="lg" className="gap-2">
                  Explore the Marketplace <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-cyber opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Proof. Not promises. For cyber talent and teams.</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Show what you can do. Find those who truly can. Join Cydena.
            </p>
            <Link to="/auth">
              <Button variant="hero" size="lg" className="gap-2">
                Get Started Now — Free for Candidates <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
