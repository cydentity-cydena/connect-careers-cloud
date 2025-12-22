import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  X,
  Shield,
  Users,
  TrendingUp,
  Target,
  DollarSign,
  Rocket,
  CheckCircle,
  Globe,
  Award,
  Zap,
  BarChart3,
  Building2,
  GraduationCap,
  Briefcase,
  ArrowRight
} from "lucide-react";

const slides = [
  {
    title: "Cydena",
    subtitle: "The Verified Talent Marketplace for Cybersecurity",
    content: (
      <div className="flex flex-col items-center justify-center h-full space-y-8">
        <img 
          src="/logos/cydena-logo-full.png" 
          alt="Cydena" 
          className="h-24 object-contain"
        />
        <p className="text-2xl text-muted-foreground text-center max-w-2xl">
          Connecting verified cybersecurity professionals with employers who need them most
        </p>
        <div className="flex gap-4 mt-8">
          <Badge variant="outline" className="px-4 py-2 text-base">
            <Shield className="w-4 h-4 mr-2" />
            Verified Credentials
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-base">
            <Users className="w-4 h-4 mr-2" />
            Pre-Vetted Talent
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-base">
            <Zap className="w-4 h-4 mr-2" />
            Faster Hiring
          </Badge>
        </div>
      </div>
    )
  },
  {
    title: "The Problem",
    subtitle: "A $10B+ Hiring Crisis in Cybersecurity",
    content: (
      <div className="grid md:grid-cols-2 gap-8 h-full items-center">
        <div className="space-y-6">
          <div className="p-6 bg-destructive/10 rounded-xl border border-destructive/20">
            <h3 className="text-4xl font-bold text-destructive mb-2">3.5M+</h3>
            <p className="text-muted-foreground">Unfilled cybersecurity jobs globally</p>
          </div>
          <div className="p-6 bg-destructive/10 rounded-xl border border-destructive/20">
            <h3 className="text-4xl font-bold text-destructive mb-2">$4.88M</h3>
            <p className="text-muted-foreground">Average cost of a data breach (2024)</p>
          </div>
          <div className="p-6 bg-destructive/10 rounded-xl border border-destructive/20">
            <h3 className="text-4xl font-bold text-destructive mb-2">6+ Months</h3>
            <p className="text-muted-foreground">Average time to hire a security professional</p>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Why Traditional Hiring Fails:</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
              <span>Credential fraud is rampant - 30% of certifications are falsified</span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
              <span>Recruiters lack technical expertise to verify skills</span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
              <span>Generic job boards don't serve niche security roles</span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
              <span>Expensive agency fees (20-30% of salary)</span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
              <span>No standardized way to assess real-world capabilities</span>
            </li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: "The Solution",
    subtitle: "Cydena: Verified Talent, Trusted Results",
    content: (
      <div className="grid md:grid-cols-3 gap-6 h-full items-center">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow h-full flex flex-col justify-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-3">HR-Ready Verification</h3>
          <p className="text-muted-foreground text-sm">
            Every candidate is pre-verified: identity checks, right-to-work, certifications validated directly with issuers, and security clearance confirmation.
          </p>
        </Card>
        <Card className="p-6 text-center hover:shadow-lg transition-shadow h-full flex flex-col justify-center border-primary">
          <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-3">Skills Validation</h3>
          <p className="text-muted-foreground text-sm">
            Hands-on CTF challenges, technical assessments, and peer endorsements prove real-world capabilities beyond paper credentials.
          </p>
        </Card>
        <Card className="p-6 text-center hover:shadow-lg transition-shadow h-full flex flex-col justify-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-3">Intelligent Matching</h3>
          <p className="text-muted-foreground text-sm">
            AI-powered matching considers skills, specializations, clearance levels, and culture fit to surface the right candidates instantly.
          </p>
        </Card>
      </div>
    )
  },
  {
    title: "The Platform",
    subtitle: "Built for Security Professionals",
    content: (
      <div className="grid md:grid-cols-2 gap-6 h-full">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Verified Candidate Profiles</h3>
          <div className="rounded-xl overflow-hidden border shadow-lg">
            <img 
              src="/screenshots/profile-card.png" 
              alt="Verified candidate profile" 
              className="w-full h-auto"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            HR-Ready badge, verified certifications, skills validation scores
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Community Leaderboard</h3>
          <div className="rounded-xl overflow-hidden border shadow-lg">
            <img 
              src="/screenshots/leaderboard.png" 
              alt="Community leaderboard" 
              className="w-full h-auto"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            CTF challenges, assessments, and community leaderboards
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Trusted Partners",
    subtitle: "Integrated with Leading Certification & Training Providers",
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center">
          <div className="p-6 bg-card rounded-xl border flex items-center justify-center h-24 w-full">
            <img src="/logos/credly-logo.png" alt="Credly" className="h-12 object-contain" />
          </div>
          <div className="p-6 bg-card rounded-xl border flex items-center justify-center h-24 w-full">
            <img src="/logos/treccert-logo-banner.png" alt="TRECCert" className="h-10 object-contain" />
          </div>
          <div className="p-6 bg-card rounded-xl border flex items-center justify-center h-24 w-full">
            <img src="/logos/cydentity-academy-logo.png" alt="Cydentity Academy" className="h-12 object-contain" />
          </div>
          <div className="p-6 bg-card rounded-xl border flex items-center justify-center h-24 w-full">
            <img src="/logos/offsec-logo.png" alt="OffSec Partner Portal" className="h-12 object-contain" />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="p-4 text-center">
            <h4 className="font-semibold mb-2">Certification Bodies</h4>
            <p className="text-sm text-muted-foreground">CompTIA, ISC2, SANS, OffSec, EC-Council</p>
          </Card>
          <Card className="p-4 text-center">
            <h4 className="font-semibold mb-2">Training Platforms</h4>
            <p className="text-sm text-muted-foreground">TryHackMe, HackTheBox, RangeForce, Immersive Labs</p>
          </Card>
          <Card className="p-4 text-center">
            <h4 className="font-semibold mb-2">Badge Providers</h4>
            <p className="text-sm text-muted-foreground">Credly, Acclaim, Badgr, Canvas Credentials</p>
          </Card>
        </div>
        <div className="text-center mt-4">
          <Badge variant="outline" className="text-sm px-4 py-2">
            Direct API integrations for real-time credential verification
          </Badge>
        </div>
      </div>
    )
  },
  {
    title: "How It Works",
    subtitle: "Simple, Fast, Verified",
    content: (
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              For Candidates
            </h3>
            <div className="space-y-4">
              {[
                "Create profile with verified credentials",
                "Complete skills assessments & CTF challenges",
                "Get HR-Ready verified status",
                "Appear in employer searches",
                "Receive matched job opportunities"
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              For Employers
            </h3>
            <div className="space-y-4">
              {[
                "Post jobs with specific requirements",
                "Browse pre-verified candidate pool",
                "Use smart filters by clearance, certs, skills",
                "Unlock profiles with subscription credits",
                "Hire with confidence in days, not months"
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Market Opportunity",
    subtitle: "Massive TAM in a Growing Industry",
    content: (
      <div className="grid md:grid-cols-2 gap-8 h-full items-center">
        <div className="space-y-6">
          <div className="text-center p-8 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
            <h3 className="text-5xl font-bold text-primary mb-2">$500B+</h3>
            <p className="text-lg text-muted-foreground">Global Cybersecurity Market by 2030</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-xl">
              <h4 className="text-2xl font-bold">$28B</h4>
              <p className="text-sm text-muted-foreground">HR Tech Market</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-xl">
              <h4 className="text-2xl font-bold">13%</h4>
              <p className="text-sm text-muted-foreground">CAGR Growth</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Our Addressable Market:</h3>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">TAM</span>
                <span className="text-primary font-bold">$15B</span>
              </div>
              <p className="text-sm text-muted-foreground">Global cybersecurity recruitment spend</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">SAM</span>
                <span className="text-primary font-bold">$4B</span>
              </div>
              <p className="text-sm text-muted-foreground">UK, EU & US enterprise security hiring</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">SOM</span>
                <span className="text-primary font-bold">$200M</span>
              </div>
              <p className="text-sm text-muted-foreground">Year 5 target: 5% of SAM</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Business Model",
    subtitle: "Multiple Revenue Streams, Strong Unit Economics",
    content: (
      <div className="grid md:grid-cols-2 gap-8 h-full">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Revenue Streams</h3>
          <Card className="p-4 border-primary">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="font-semibold">Enterprise Subscriptions</span>
              <Badge variant="secondary" className="text-xs">Primary</Badge>
            </div>
            <p className="text-sm text-muted-foreground">£25K/year base for verified talent access, unlimited searches, priority matching</p>
          </Card>
          <Card className="p-4 border-primary">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="font-semibold">Success Fees</span>
              <Badge variant="secondary" className="text-xs">Primary</Badge>
            </div>
            <p className="text-sm text-muted-foreground">5-8% per hire (vs 20-30% agency) - aligned incentives, still 70% cheaper</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="font-semibold">Training Partner Revenue</span>
            </div>
            <p className="text-sm text-muted-foreground">Featured placements & certification verification fees</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="font-semibold">Premium Candidate Features</span>
            </div>
            <p className="text-sm text-muted-foreground">Boost visibility, priority matching, career coaching</p>
          </Card>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Unit Economics</h3>
          <div className="p-6 bg-muted rounded-xl space-y-4">
            <div className="flex justify-between">
              <span>Base Subscription</span>
              <span className="font-bold">£25,000/yr</span>
            </div>
            <div className="flex justify-between">
              <span>Avg. Success Fees (3 hires)</span>
              <span className="font-bold">+£15,000/yr</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-semibold">Blended ACV</span>
              <span className="font-bold text-primary">£40,000/yr</span>
            </div>
            <div className="flex justify-between">
              <span>Gross Margin</span>
              <span className="font-bold text-green-500">85%</span>
            </div>
            <div className="flex justify-between">
              <span>Target CAC</span>
              <span className="font-bold">£5,000</span>
            </div>
            <div className="flex justify-between">
              <span>LTV:CAC Ratio</span>
              <span className="font-bold text-green-500">24:1</span>
            </div>
          </div>
          <div className="p-4 border-2 border-primary rounded-xl bg-primary/5">
            <p className="text-center font-semibold">
              Path to £10M ARR with 250 enterprise accounts
            </p>
            <p className="text-center text-sm text-muted-foreground mt-1">
              Enterprises save £50-100K vs agency fees
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Employer ROI",
    subtitle: "See the Savings vs Traditional Agencies",
    content: (
      <div className="grid md:grid-cols-2 gap-8 h-full items-center">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">The Simple Math</h3>
          <div className="space-y-4">
            <div className="p-6 bg-destructive/10 rounded-xl border border-destructive/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Agency: 1 Hire</span>
                <span className="text-2xl font-bold text-destructive">£25,000+</span>
              </div>
              <p className="text-sm text-muted-foreground">20%+ of salary - and you pay this EVERY hire</p>
            </div>
            <div className="p-6 bg-green-500/10 rounded-xl border border-green-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Cydena: Unlimited Hires</span>
                <span className="text-2xl font-bold text-green-500">£25,000</span>
              </div>
              <p className="text-sm text-muted-foreground">Flat fee/year - hire as many as you need</p>
            </div>
            <div className="p-6 bg-primary/10 rounded-xl border-2 border-primary">
              <p className="text-center text-xl font-bold text-primary mb-2">
                1 Hire = Break Even
              </p>
              <p className="text-center text-muted-foreground">Every additional hire is essentially FREE</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-center">
              <span className="font-semibold">Enterprise avg: 3 hires/year @ £100K salary</span> = Save £35K+ vs agencies
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Why Employers Switch:</h3>
          <div className="space-y-3">
            {[
              "Pre-verified candidates = skip 2 weeks of background checks",
              "Skills validation = reduce bad hires by 40%",
              "Direct access = no middleman markup",
              "Unlimited searches included in subscription",
              "Success fees only 5-8% (vs 20-30% agencies)"
            ].map((point, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{point}</span>
              </div>
            ))}
          </div>
          <div className="p-4 border-2 border-primary rounded-xl bg-primary/5 mt-4">
            <p className="text-center font-semibold">
              Average enterprise saves £50-100K/year vs agencies
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Competitive Advantage",
    subtitle: "Why We Win",
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">LinkedIn</p>
            <p className="text-xs">Generic, no verification</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Indeed/Monster</p>
            <p className="text-xs">Volume over quality</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Agencies</p>
            <p className="text-xs">Expensive, slow</p>
          </div>
          <div className="text-center p-4 border-2 border-primary rounded-lg bg-primary/5">
            <p className="text-sm font-semibold text-primary mb-1">Cydena</p>
            <p className="text-xs">Verified, specialized, fast</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {[
              "Only platform with HR-Ready verification for security roles",
              "Direct integrations with certification bodies",
              "Hands-on skills validation through CTF challenges",
              "Security clearance verification built-in",
              "Community-driven peer endorsements"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {[
              "AI-powered matching for niche security specializations",
              "Training partner ecosystem for continuous upskilling",
              "Gamification drives engagement and skill development",
              "Transparent, fair pricing (no hidden fees)",
              "Built by security professionals, for security professionals"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Traction & Milestones",
    subtitle: "Early Momentum, Clear Path Forward",
    content: (
      <div className="grid md:grid-cols-2 gap-8 h-full items-center">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">What We've Achieved:</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span>MVP launched with full verification pipeline</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span>Training partner integrations live (Credly, TRECCERT, OffSec)</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span>Founding 200 candidate cohort in verification</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span>Employer pilot conversations with 10+ enterprises</span>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">12-Month Roadmap:</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-green-500/10 border-green-500/30">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">Q1</div>
              <span>2,000 verified candidates, 10 paying employers, £250K ARR</span>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">Q2</div>
              <span>5,000 candidates, 30 employers, £750K ARR</span>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">Q3</div>
              <span>10,000 candidates, 75 employers, £1.9M ARR</span>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">Q4</div>
              <span>20,000 candidates, 150 employers, £3.75M ARR</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Go-To-Market Strategy",
    subtitle: "Land & Expand",
    content: (
      <div className="grid md:grid-cols-3 gap-6 h-full">
        <Card className="p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Candidate Acquisition</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Training partner referrals</li>
            <li>• Community Discord/Slack outreach</li>
            <li>• Certification completion targeting</li>
            <li>• Gamified referral program</li>
            <li>• Content marketing (career guides)</li>
          </ul>
        </Card>
        <Card className="p-6 space-y-4 border-primary">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Employer Acquisition</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Direct outreach to security teams</li>
            <li>• Conference presence (BSides, InfoSec)</li>
            <li>• Partnerships with MSSPs</li>
            <li>• Free trial with verified candidate access</li>
            <li>• Case studies & ROI calculator</li>
          </ul>
        </Card>
        <Card className="p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Partner Network</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Training providers (CompTIA, SANS, OffSec)</li>
            <li>• Bootcamps & academies</li>
            <li>• Universities with cyber programs</li>
            <li>• Recruitment agencies (white-label)</li>
            <li>• Government skills initiatives</li>
          </ul>
        </Card>
      </div>
    )
  },
  {
    title: "The Ask",
    subtitle: "Seed Round: £500K",
    content: (
      <div className="grid md:grid-cols-2 gap-8 h-full items-center">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Use of Funds:</h3>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Product & Engineering</span>
                <span className="text-primary font-bold">40%</span>
              </div>
              <p className="text-sm text-muted-foreground">Scale platform, AI matching, integrations</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Sales & Marketing</span>
                <span className="text-primary font-bold">35%</span>
              </div>
              <p className="text-sm text-muted-foreground">Employer acquisition, brand building</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Operations & Verification</span>
                <span className="text-primary font-bold">15%</span>
              </div>
              <p className="text-sm text-muted-foreground">Scale verification team, compliance</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Reserve</span>
                <span className="text-primary font-bold">10%</span>
              </div>
              <p className="text-sm text-muted-foreground">Working capital & contingency</p>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">What We'll Achieve:</h3>
          <div className="p-6 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <Rocket className="w-5 h-5 text-primary" />
              <span>1,000+ verified candidates</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-primary" />
              <span>100+ paying employers</span>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <span>£250K ARR within 12 months</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <span>UK market leadership position</span>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Clear path to Series A</span>
            </div>
          </div>
          <div className="p-4 border-2 border-primary rounded-xl text-center">
            <p className="font-semibold text-lg">18-month runway to Series A</p>
            <p className="text-sm text-muted-foreground">Target: £3M raise at £15M valuation</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Let's Connect",
    subtitle: "Join Us in Securing the Future of Hiring",
    content: (
      <div className="flex flex-col items-center justify-center h-full space-y-8 text-center">
        <img 
          src="/logos/cydena-logo-full.png" 
          alt="Cydena" 
          className="h-20 object-contain"
        />
        <div className="max-w-2xl space-y-4">
          <p className="text-xl text-muted-foreground">
            The cybersecurity talent crisis isn't going away. We're building the infrastructure to solve it.
          </p>
          <p className="text-lg">
            Ready to discuss how Cydena can become the standard for verified security hiring?
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-primary" />
            <span>www.cydena.com</span>
          </div>
          <div className="flex items-center gap-2 text-lg">
            <Briefcase className="w-5 h-5 text-primary" />
            <span>contact@cydena.com</span>
          </div>
        </div>
      </div>
    )
  }
];

const InvestorPitchDeck = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "Escape") {
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <img 
            src="/logos/cydena-logo.png" 
            alt="Cydena" 
            className="h-8 object-contain"
          />
          <Badge variant="outline" className="text-xs">
            Investor Deck
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {currentSlide + 1} / {slides.length}
          </span>
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col p-8 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{slides[currentSlide].title}</h1>
          <p className="text-xl text-muted-foreground">{slides[currentSlide].subtitle}</p>
        </div>
        <div className="flex-1">
          {slides[currentSlide].content}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 border-t bg-card">
        <Button
          variant="outline"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide 
                  ? "bg-primary" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        <Button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default InvestorPitchDeck;
