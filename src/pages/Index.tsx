import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Users, Briefcase, TrendingUp, ArrowRight, Clock, DollarSign, Target, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import Schema from "@/components/Schema";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
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
              The Future of{" "}
              <span className="bg-gradient-cyber bg-clip-text text-transparent">
                Cyber Recruitment
              </span>
            </h1>
            <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-2">
              Connect elite cybersecurity talent with cutting-edge opportunities. 
              Skills-based matching, verified certifications, and real-time collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button variant="hero" size="lg" className="gap-2 w-full sm:w-auto">
                  Find Talent <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button variant="cyber" size="lg" className="w-full sm:w-auto">
                  Find Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)] opacity-20" />
      </section>

      {/* For Candidates Section - Moved to top for visibility */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Free for <span className="bg-gradient-cyber bg-clip-text text-transparent">Candidates</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                From entry-level to CISO - everyone gets equal access
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Real-Time Application Tracking</h3>
                  <p className="text-sm text-muted-foreground">Never wonder where your application stands - watch it progress from Applied → Under Review → Offer in real-time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Career Transitioners Welcome</h3>
                  <p className="text-sm text-muted-foreground">Breaking into cybersecurity? We support entry-level talent with partner certifications</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Showcase Your Certifications</h3>
                  <p className="text-sm text-muted-foreground">CompTIA, CISSP, CEH, SANS - verified credentials get you noticed</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Skip the Recruiter Gatekeepers</h3>
                  <p className="text-sm text-muted-foreground">Apply directly to employers. Message them in-platform. No middleman</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Gamified Profile Building</h3>
                  <p className="text-sm text-muted-foreground">Earn XP, climb the leaderboard, unlock achievements as you grow</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">No Application Black Holes</h3>
                  <p className="text-sm text-muted-foreground">See employer updates, status notes, and timeline of your application progress</p>
                </div>
              </div>
            </div>

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

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Why Choose Cydena?</h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Built specifically for the cybersecurity industry
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-gradient-card backdrop-blur-sm border border-border rounded-lg p-6 md:p-8 hover:scale-105 transition-transform animate-slide-up">
              <div className="bg-primary/10 w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4 md:mb-6">
                <Users className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Skills-Based Matching</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Match candidates with jobs based on verified skills, certifications, and security clearances
              </p>
            </div>

            <div className="bg-gradient-card backdrop-blur-sm border border-border rounded-lg p-6 md:p-8 hover:scale-105 transition-transform animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="bg-secondary/10 w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4 md:mb-6">
                <Briefcase className="h-6 w-6 md:h-7 md:w-7 text-secondary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Application Pipeline</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Track candidates through customizable pipeline stages with in-app kanban board
              </p>
            </div>

            <div className="bg-gradient-card backdrop-blur-sm border border-border rounded-lg p-6 md:p-8 hover:scale-105 transition-transform animate-slide-up sm:col-span-2 lg:col-span-1" style={{animationDelay: '0.2s'}}>
              <div className="bg-accent/10 w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4 md:mb-6">
                <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-accent" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Leaderboards & Rankings</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Showcase top talent with skills-based rankings and endorsement systems
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition for Employers vs Traditional */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-cyber opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              Say Goodbye to <span className="text-destructive">Traditional Recruitment</span>
            </h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
              No more £15,000 agency fees. No more 8-week hiring cycles. No more exclusive contracts.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="text-center p-5 md:p-6 rounded-lg border border-primary/20 bg-gradient-card hover:scale-105 transition-transform">
              <div className="bg-primary/10 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <DollarSign className="h-7 w-7 md:h-8 md:w-8 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">52-90% Cost Savings</h3>
              <p className="text-sm md:text-base text-muted-foreground">£199-£999/mo subscription vs £15,000 agency fees</p>
            </div>

            <div className="text-center p-5 md:p-6 rounded-lg border border-primary/20 bg-gradient-card hover:scale-105 transition-transform" style={{animationDelay: '0.1s'}}>
              <div className="bg-primary/10 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Clock className="h-7 w-7 md:h-8 md:w-8 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">Instant Access</h3>
              <p className="text-sm md:text-base text-muted-foreground">Connect with talent instantly vs 6-8 weeks</p>
            </div>

            <div className="text-center p-5 md:p-6 rounded-lg border border-primary/20 bg-gradient-card hover:scale-105 transition-transform sm:col-span-2 lg:col-span-1" style={{animationDelay: '0.2s'}}>
              <div className="bg-primary/10 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Target className="h-7 w-7 md:h-8 md:w-8 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">Zero Contracts</h3>
              <p className="text-sm md:text-base text-muted-foreground">No retainers, no exclusivity, pay as you go</p>
            </div>
          </div>

          <div className="text-center mt-10 md:mt-12">
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                See Full Pricing Comparison <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-card/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How Cydena Works
              </h2>
              <p className="text-lg text-muted-foreground">
                A streamlined cybersecurity recruitment process built for the modern workforce
              </p>
            </div>

            <div className="space-y-12">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-3 text-primary">For Cybersecurity Professionals</h3>
                  <ol className="space-y-3 text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="font-bold text-primary">1.</span>
                      <span>Create your free profile in minutes - no payment required</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary">2.</span>
                      <span>Upload and verify your certifications (CISSP, CEH, Security+, etc.)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary">3.</span>
                      <span>Browse cybersecurity jobs from vetted employers and apply instantly</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary">4.</span>
                      <span>Track your applications in real-time through our transparent pipeline</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary">5.</span>
                      <span>Connect directly with hiring managers - no recruiter middlemen</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-gradient-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-3 text-secondary">For Employers & Recruiters</h3>
                  <ol className="space-y-3 text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="font-bold text-secondary">1.</span>
                      <span>Choose a subscription plan that fits your hiring needs</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-secondary">2.</span>
                      <span>Post unlimited cybersecurity jobs with detailed requirements</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-secondary">3.</span>
                      <span>Access a curated talent pool with verified certifications</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-secondary">4.</span>
                      <span>Use our kanban pipeline to manage candidates efficiently</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-secondary">5.</span>
                      <span>Hire faster and cheaper than traditional recruitment agencies</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Cybersecurity Professionals Choose Cydena */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Why Cybersecurity Professionals Choose Cydena
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
              <p>
                Traditional cybersecurity job boards and recruitment agencies often create barriers between talented professionals and the opportunities they deserve. Cydena removes these obstacles by providing a direct connection between cybersecurity specialists and employers who value their skills.
              </p>
              <p>
                Our platform recognizes that cybersecurity is a skills-based field where certifications, practical experience, and continuous learning matter more than traditional credentials. Whether you're a penetration tester with OSCP certification, a security analyst with CompTIA Security+, or a CISO with years of experience, Cydena helps you showcase your expertise to employers who understand its value.
              </p>
              <p>
                Entry-level professionals and career transitioners benefit from our partnerships with leading training providers like Cydentity Academy and LetsDefend, gaining access to certification paths that open doors to cybersecurity careers. Meanwhile, experienced professionals appreciate our transparent application process, real-time status updates, and direct communication with decision-makers.
              </p>
              <p>
                Unlike traditional recruitment platforms that charge hefty fees to employers (often 15-30% of first-year salary), Cydena's subscription model allows companies to invest their budget in competitive salaries and benefits for candidates, not middlemen. This creates a healthier job market where talent is rewarded appropriately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-cyber opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Cybersecurity Career or Hiring?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of cybersecurity professionals and forward-thinking employers on Cydena. Whether you're looking for your next role in penetration testing, security operations, GRC, or cloud security, or hiring for critical positions, we make the process simple, transparent, and effective.
            </p>
            <Link to="/auth">
              <Button variant="hero" size="lg" className="gap-2">
                Get Started Now - Free for Candidates <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
