import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Briefcase, ArrowRight, CheckCircle, GraduationCap, Eye, Award, Filter, BarChart3, BadgeCheck, Youtube, Play, ExternalLink, Share2, Star, Calculator, Zap, Code, Target, DollarSign, Clock, XCircle, AlertTriangle, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { ROICalculator } from "@/components/pricing/ROICalculator";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import Schema from "@/components/Schema";
import heroImage from "@/assets/hero-bg.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full text-left p-4 bg-card/80 border border-border rounded-lg hover:border-primary/30 transition-colors">
        <span className="font-semibold text-sm md:text-base pr-4">{question}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pt-3 pb-1 text-sm text-muted-foreground leading-relaxed">
        {answer}
      </CollapsibleContent>
    </Collapsible>
  );
};

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

      {/* Hero Section — Specific, outcome-driven */}
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
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5">
              <Shield className="h-3 w-3 mr-1" />
              Built technology-first. No agency rebrand.
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6">
              Every Candidate{" "}
              <span className="bg-gradient-cyber bg-clip-text text-transparent">
                Validated
              </span>
              , Not Just Listed
            </h1>
            <p className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
              We validate capability — not scale headcount. Hire verified cyber talent without recruiter fees.
            </p>
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-2">
              Identity checked. Right-to-work confirmed. Certifications auto-verified. Skills assessed. The UK's only cybersecurity talent platform where every professional is proven, not just registered.
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

            {/* 3 Hiring Modes — Key Differentiator */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 max-w-3xl mx-auto px-2">
              <Link to="/profiles" className="group">
                <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-4 text-center hover:border-primary/40 transition-all hover:bg-primary/5">
                  <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-sm">Book Talent</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Browse & hire pre-verified professionals directly</p>
                </div>
              </Link>
              <Link to="/marketplace" className="group">
                <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-4 text-center hover:border-secondary/40 transition-all hover:bg-secondary/5">
                  <Target className="h-6 w-6 text-secondary mx-auto mb-2" />
                  <p className="font-semibold text-sm">Post a Bounty</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Scope a task, set a budget — talent comes to you</p>
                </div>
              </Link>
              <div className="group cursor-default">
                <div className="bg-card/60 backdrop-blur border border-border/50 rounded-xl p-4 text-center relative overflow-hidden">
                  <Badge variant="outline" className="absolute top-2 right-2 text-[9px] px-1.5 py-0 border-accent/30 text-accent">Coming Soon</Badge>
                  <Zap className="h-6 w-6 text-accent mx-auto mb-2" />
                  <p className="font-semibold text-sm">AI Agent Hiring</p>
                  <p className="text-[11px] text-muted-foreground mt-1">AI matches, shortlists & schedules — autonomously</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 justify-center"><CheckCircle className="h-3 w-3 text-success" /> Free for candidates</span>
              <span className="flex items-center gap-1 justify-center"><CheckCircle className="h-3 w-3 text-success" /> No agency heritage — technology-first</span>
              <span className="flex items-center gap-1 justify-center"><CheckCircle className="h-3 w-3 text-success" /> UK compliance: CBEST, SC/DV, NIS2</span>
            </div>

            {/* Why Cydena link */}
            <div className="mt-6">
              <Link to="/why-cydena" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                See why employers choose Cydena over volume platforms <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Partner logos trust strip */}
            <div className="mt-8 pt-8 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">Partnered With</p>
              <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
                <img src="/logos/treccert-logo-banner.png" alt="TRECCERT" className="h-8 object-contain" />
                <img src="/logos/cydentity-logo-white.png" alt="Cydentity" className="h-8 object-contain" />
                <img src="/logos/cydentity-academy-logo-white.png" alt="Cydentity Academy" className="h-7 object-contain" />
                <img src="/logos/real-lms-logo.png" alt="REAL LMS" className="h-8 object-contain" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)] opacity-20" />
      </section>

      {/* Problem Section — Pain Agitation */}
      <section className="py-12 md:py-16 border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Cyber Hiring Is <span className="text-destructive">Broken</span>
            </h2>
            <p className="text-muted-foreground mb-10 text-lg">
              Traditional recruiting wastes time and money. Here's what you're dealing with:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: DollarSign, stat: "15–25%", label: "Agency fees per hire" },
                { icon: Clock, stat: "3+ months", label: "Average time to fill" },
                { icon: XCircle, stat: "70%+", label: "CVs are unverified" },
                { icon: AlertTriangle, stat: "£12K", label: "Cost of a bad hire" },
              ].map((item, i) => (
                <div key={i} className="bg-destructive/5 border border-destructive/20 rounded-lg p-5 text-center">
                  <item.icon className="h-6 w-6 text-destructive mx-auto mb-2" />
                  <p className="text-2xl font-bold text-destructive">{item.stat}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Old Way vs Cydena Comparison */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              The Old Way vs <span className="bg-gradient-cyber bg-clip-text text-transparent">The Cydena Way</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-destructive flex items-center gap-2">
                    <XCircle className="h-5 w-5" /> Traditional Recruiting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "20% agency fee per placement",
                    "3+ month average hiring cycle",
                    "CV-based screening — no skill proof",
                    "No credential verification",
                    "Recruiter gatekeeping",
                    "Unpredictable costs",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-primary flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" /> Cydena
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Flat subscription fee — no commissions",
                    "Pre-verified, interview-ready candidates",
                    "Skills assessments prove real ability",
                    "Certifications verified automatically",
                    "Direct access — no middleman",
                    "Predictable, budgetable hiring costs",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: For Candidates — Free & Accessible */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-3 border-success/30 text-success bg-success/5">
                Always Free
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Free for <span className="bg-gradient-cyber bg-clip-text text-transparent">Cybersecurity Professionals</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                From entry-level to CISO — get hired based on proof, not paper CVs
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
              <p className="text-xs text-muted-foreground mt-2">Takes 2 minutes. No credit card required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Platform Features — benefit-driven headlines */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              Everything you need to <span className="bg-gradient-cyber bg-clip-text text-transparent">hire with confidence</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto">
              Built specifically for cybersecurity — validated, curated, and interview-ready professionals
            </p>
          </div>

          {/* Feature cards — benefit-driven */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-16">
            {[
                { icon: Shield, title: "HR-Ready: Verified Before You See Them", desc: "Identity, certifications, right-to-work, and security clearance validated upfront — not self-declared on a CV.", color: "primary" },
              { icon: Target, title: "Skills-Based, Not CV-Based", desc: "LLM-powered assessments and CTF challenges prove real capability. No more guessing from keyword-stuffed CVs.", color: "accent" },
              { icon: Filter, title: "UK Compliance Built In", desc: "CBEST, TIBER-UK, NIS2, SC/DV clearance filters — frameworks volume platforms don't speak to.", color: "primary" },
              { icon: Briefcase, title: "Push to Your ATS in One Click", desc: "Integrates with Workday, SAP SuccessFactors and webhooks. Automate your existing workflow.", color: "secondary" },
              { icon: Users, title: "Community, Not Just Transactions", desc: "CTF challenges, learning paths, peer endorsements — talent that grows on the platform, not just passes through.", color: "accent" },
              { icon: BadgeCheck, title: "Zero Agency Heritage", desc: "Built technology-first without recruitment agency baggage. Direct access to validated professionals — no middlemen.", color: "primary" },
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

          {/* What a Verified Profile Includes */}
          <div className="max-w-3xl mx-auto mb-16">
            <h3 className="text-2xl font-bold text-center mb-6">What a Cydena Verified Profile Includes</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Identity verified (ID check)",
                "Right-to-work confirmed",
                "Security clearance validated",
                "Certifications auto-verified",
                "Skills assessments completed",
                "Peer endorsements collected",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-card/80 border border-border rounded-lg px-4 py-3">
                  <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
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

      {/* Section 3: ROI + Value Stack */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Bold savings claim */}
            <div className="text-center mb-12 md:mb-16 animate-fade-in">
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5">
                <Calculator className="h-3 w-3 mr-1" />
                Cost Savings Calculator
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Companies Save Up to <span className="bg-gradient-cyber bg-clip-text text-transparent">90%</span> vs Agencies
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                See exactly how much you could save with direct access to verified talent
              </p>
            </div>

            {/* ROI Calculator */}
            <div className="max-w-4xl mx-auto mb-10">
              <ROICalculator />
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/contact">
                  <Button variant="hero" size="lg" className="gap-2">
                    Book a Demo to Validate These Numbers <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Based on UK agency averages (15–25% placement fee). Your actual savings may vary.
              </p>
            </div>

            {/* Value Stack */}
            <div className="max-w-3xl mx-auto mt-16">
              <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
                Everything You Get With <span className="bg-gradient-cyber bg-clip-text text-transparent">Cydena</span>
              </h3>
              <div className="bg-card/80 border border-primary/20 rounded-xl p-6 md:p-8">
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Flat subscription — no commissions",
                    "Pre-verified cybersecurity professionals",
                    "Credential & right-to-work validation",
                    "Skills assessments built in",
                    "ATS integration (Workday, SAP, webhooks)",
                    "Talent pod management",
                    "Hiring analytics dashboard",
                    "Marketplace for on-demand talent",
                    "API & AI agent access",
                    "Dedicated partner support",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mt-10 md:mt-12">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="gap-2">
                  Start Hiring Top Talent <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-2">No long-term contracts. Cancel anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Partners + Marketplace */}
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
                { icon: Code, title: "Integrate Into Your Workflow", desc: "Connect Cydena directly into your hiring systems via API or AI agents. No manual steps.", color: "accent" },
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

      {/* Trust & Security Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Built for <span className="bg-gradient-cyber bg-clip-text text-transparent">Enterprise Security</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Shield, label: "GDPR Compliant" },
                { icon: Lock, label: "Encrypted Data Storage" },
                { icon: BadgeCheck, label: "Verified Credentials" },
                { icon: Eye, label: "SOC-Ready Audit Trail" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-card/80 border border-border rounded-lg px-4 py-3">
                  <item.icon className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
              Frequently Asked <span className="bg-gradient-cyber bg-clip-text text-transparent">Questions</span>
            </h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary mb-4">For Employers</h3>
              <div className="space-y-3">
                <FAQItem 
                  question="How is Cydena different from recruitment agencies and volume platforms?" 
                  answer="Most platforms scale headcount — they list thousands of unverified CVs. Cydena validates capability. Every candidate's identity, right-to-work, certifications, and skills are proven before you see them. We're built technology-first with no recruitment agency heritage, and we specialise in UK compliance frameworks like CBEST, TIBER-UK, and SC/DV clearance." 
                />
                <FAQItem 
                  question="What does verification include?" 
                  answer="Our HR-Ready verification covers identity checks, right-to-work validation, security clearance confirmation, and automated certification verification. Skills assessments from platforms like TryHackMe and HackTheBox prove technical ability." 
                />
                <FAQItem 
                  question="Is there a contract or commitment?" 
                  answer="No long-term contracts. All plans are month-to-month and you can cancel anytime. We also offer annual billing with a 15% discount for teams that prefer it." 
                />
                <FAQItem 
                  question="How quickly can we start hiring?" 
                  answer="You can browse verified candidates immediately after signing up. Most employers have a shortlist within the first week. Our talent pods and intelligent matching accelerate time-to-hire significantly." 
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-secondary mb-4">For Candidates</h3>
              <div className="space-y-3">
                <FAQItem 
                  question="Is Cydena really free for candidates?" 
                  answer="Yes, 100% free. Creating your profile, getting verified, applying to jobs, and accessing learning paths costs you nothing. We're funded by employer subscriptions." 
                />
                <FAQItem 
                  question="How long does verification take?" 
                  answer="Basic profile setup takes about 2 minutes. HR-Ready verification (identity, right-to-work) is typically reviewed within 24–48 hours. Certification verification is often instant for supported providers." 
                />
                <FAQItem 
                  question="Do I need certifications to join?" 
                  answer="No. Cydena welcomes professionals at all levels, including career transitioners. Certifications boost your profile visibility, but skills assessments and peer endorsements also help you stand out." 
                />
                <FAQItem 
                  question="Who can see my profile?" 
                  answer="Your profile is visible to verified employers and recruiters on the platform. Sensitive information like identity documents is never shared — only your verification status badges are shown." 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — Urgency + Risk Reversal */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-cyber opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stop Paying 20% Recruiter Fees.<br />
              Start Hiring Verified Cyber Talent Today.
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              The best verified candidates are matched quickly. Join now to secure priority access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="gap-2">
                  Start Hiring — Free Trial <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="cyber" size="lg" className="gap-2">
                  Create Free Candidate Profile
                </Button>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 justify-center"><CheckCircle className="h-3 w-3 text-success" /> No credit card required</span>
              <span className="flex items-center gap-1 justify-center"><CheckCircle className="h-3 w-3 text-success" /> No long-term contracts</span>
              <span className="flex items-center gap-1 justify-center"><CheckCircle className="h-3 w-3 text-success" /> Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
