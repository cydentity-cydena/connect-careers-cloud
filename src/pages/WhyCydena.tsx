import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield, ArrowRight, CheckCircle, XCircle, Users, Briefcase,
  BadgeCheck, Target, Code, Award, Trophy, GraduationCap, Building2, Cpu
} from "lucide-react";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";

const WhyCydena = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Why Cydena | Verified Cyber Talent vs Volume Platforms"
        description="See how Cydena's verification-first approach compares to volume-based recruitment platforms. Every candidate validated, not just listed."
      />
      <Navigation />

      {/* Hero */}
      <section className="pt-16 md:pt-24 pb-16 md:pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5">
              <Shield className="h-3 w-3 mr-1" />
              Why choose Cydena
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              We Validate{" "}
              <span className="bg-gradient-cyber bg-clip-text text-transparent">Capability</span>
              <br />
              Not Scale Headcount
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Volume platforms list hundreds of thousands of unverified profiles.
              Cydena proves every candidate is who they say they are, with the skills they claim.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Volume Platforms vs{" "}
              <span className="bg-gradient-cyber bg-clip-text text-transparent">Cydena</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Volume Platform Column */}
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-destructive flex items-center gap-2">
                    <XCircle className="h-5 w-5" /> Volume Platforms
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Recruitment agencies rebranded as tech</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "200K+ profiles — mostly unverified CVs",
                    "CV-based keyword matching",
                    "No identity or right-to-work checks",
                    "Self-declared skills, no proof",
                    "Built from agency CV databases",
                    "Europe-wide, no UK compliance depth",
                    "Transactional — candidates pass through",
                    "Enterprise-focused, SMBs underserved",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Cydena Column */}
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-primary flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" /> Cydena
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Built technology-first, no agency heritage</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Every candidate validated before listing",
                    "LLM-powered skills assessment & CTF challenges",
                    "Identity, RTW, and clearance verified upfront",
                    "Certifications auto-verified with AI",
                    "Technology-first — no recruitment legacy",
                    "Deep UK compliance: CBEST, TIBER-UK, SC/DV, NIS2",
                    "Community-driven — candidates grow on platform",
                    "Purpose-built for UK SMB MSSPs & enterprise",
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

      {/* Six Differentiators */}
      <section className="py-12 md:py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Six Reasons Employers Choose Cydena
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              We're not another recruiter with a website. Here's what makes us fundamentally different.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: BadgeCheck,
                  title: "Verification, Not Volume",
                  desc: "Every professional is identity-checked, RTW-confirmed, and skills-assessed. You see validated capability, not self-reported claims.",
                },
                {
                  icon: Shield,
                  title: "UK Compliance Depth",
                  desc: "Native support for CBEST, TIBER-UK, NIS2, the Cyber Security & Resilience Bill, and SC/DV clearance requirements. Frameworks volume platforms don't speak to.",
                },
                {
                  icon: Cpu,
                  title: "AI-Powered Skill Validation",
                  desc: "LLM-powered assessments, AI certification verification, and Security IQ challenges replace CV keyword matching with genuine proof of ability.",
                },
                {
                  icon: Users,
                  title: "Community, Not Transactions",
                  desc: "CTF challenges, learning paths, XP progression, and peer endorsements. Talent grows on our platform — they don't just pass through.",
                },
                {
                  icon: Building2,
                  title: "SMB MSSP Focus",
                  desc: "Volume platforms target enterprise giants. Cydena is purpose-built for the underserved UK SMB MSSP segment — sticky relationships, not one-off placements.",
                },
                {
                  icon: Code,
                  title: "Zero Agency Heritage",
                  desc: "No recruiter CV database dump. Built technology-first without the incentives, culture, or legacy of a recruitment agency rebrand.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-gradient-card border border-border rounded-lg p-6 hover:border-primary/30 transition-colors"
                >
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Capabilities Comparison */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              AI That <span className="bg-gradient-cyber bg-clip-text text-transparent">Validates</span>, Not Just Matches
            </h2>
            <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
              Most platforms use AI to match keywords from CVs. We use AI to prove candidates can actually do the job.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: Target,
                  title: "Skills Assessment Engine",
                  desc: "LLM-powered assessments generate domain-specific questions that test real knowledge — not pattern-matched keywords from a CV.",
                },
                {
                  icon: Award,
                  title: "AI Certification Verification",
                  desc: "Automated verification cross-references credential IDs, issuer databases, and document analysis to confirm certifications are genuine.",
                },
                {
                  icon: Trophy,
                  title: "Security IQ Challenges",
                  desc: "AI-generated security scenarios test decision-making under pressure — proving candidates can think, not just list tools they've used.",
                },
                {
                  icon: GraduationCap,
                  title: "Career Path Intelligence",
                  desc: "AI career assistant analyses skill gaps and recommends learning paths, certifications, and roles — helping candidates grow, not just get listed.",
                },
                {
                  icon: Briefcase,
                  title: "Trust Score Algorithm",
                  desc: "Multi-factor trust scoring weighing identity verification, certifications, skills, CTF performance, and community engagement into a single credibility metric.",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-card/80 border border-border rounded-lg p-5">
                  <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Killer Line + CTA */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-cyber opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-primary font-semibold mb-4">The bottom line</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Others scale headcount.
              <br />
              <span className="bg-gradient-cyber bg-clip-text text-transparent">
                Cydena validates capability.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Stop paying for CV databases dressed up as platforms.
              Start hiring candidates who are already proven.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/profiles">
                <Button variant="hero" size="lg" className="gap-2">
                  Browse Verified Talent <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="cyber" size="lg" className="gap-2">
                  Create Free Profile
                </Button>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 justify-center"><CheckCircle className="h-3 w-3 text-success" /> No credit card required</span>
              <span className="flex items-center gap-1 justify-center"><CheckCircle className="h-3 w-3 text-success" /> No agency commissions</span>
              <span className="flex items-center gap-1 justify-center"><CheckCircle className="h-3 w-3 text-success" /> Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyCydena;
