import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Users, Briefcase, TrendingUp, ArrowRight, Clock, DollarSign, Target, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
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
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              The Future of{" "}
              <span className="bg-gradient-cyber bg-clip-text text-transparent">
                Cyber Recruitment
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect elite cybersecurity talent with cutting-edge opportunities. 
              Skills-based matching, verified certifications, and real-time collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="gap-2">
                  Find Talent <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="cyber" size="lg">
                  Find Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)] opacity-20" />
      </section>

      {/* Features */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">Why Choose Cydena?</h2>
            <p className="text-muted-foreground text-lg">
              Built specifically for the cybersecurity industry
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-card backdrop-blur-sm border border-border rounded-lg p-8 hover:scale-105 transition-transform animate-slide-up">
              <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Skills-Based Matching</h3>
              <p className="text-muted-foreground">
                Match candidates with jobs based on verified skills, certifications, and security clearances
              </p>
            </div>

            <div className="bg-gradient-card backdrop-blur-sm border border-border rounded-lg p-8 hover:scale-105 transition-transform animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="bg-secondary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Briefcase className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Application Pipeline</h3>
              <p className="text-muted-foreground">
                Track candidates through customizable pipeline stages with in-app messaging
              </p>
            </div>

            <div className="bg-gradient-card backdrop-blur-sm border border-border rounded-lg p-8 hover:scale-105 transition-transform animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="bg-accent/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Leaderboards & Rankings</h3>
              <p className="text-muted-foreground">
                Showcase top talent with skills-based rankings and endorsement systems
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition for Employers vs Traditional */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-cyber opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Say Goodbye to <span className="text-destructive">Traditional Recruitment</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              No more £15,000 agency fees. No more 8-week hiring cycles. No more exclusive contracts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-lg border border-primary/20 bg-gradient-card hover:scale-105 transition-transform">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">98% Cost Savings</h3>
              <p className="text-muted-foreground">Pay £10-£50 per profile vs £15,000 agency fees</p>
            </div>

            <div className="text-center p-6 rounded-lg border border-primary/20 bg-gradient-card hover:scale-105 transition-transform" style={{animationDelay: '0.1s'}}>
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">48 Hours</h3>
              <p className="text-muted-foreground">Connect with talent in 2 days vs 6-8 weeks</p>
            </div>

            <div className="text-center p-6 rounded-lg border border-primary/20 bg-gradient-card hover:scale-105 transition-transform" style={{animationDelay: '0.2s'}}>
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Zero Contracts</h3>
              <p className="text-muted-foreground">No retainers, no exclusivity, pay as you go</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="gap-2">
                See Full Pricing Comparison <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Candidates Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Free Forever for <span className="bg-gradient-cyber bg-clip-text text-transparent">Candidates</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                From entry-level to CISO - everyone gets equal access
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
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

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-cyber opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Hiring?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join the next generation of cyber recruitment today
            </p>
            <Link to="/auth">
              <Button variant="hero" size="lg" className="gap-2">
                Get Started Now <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Cydena</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                The future of cybersecurity recruitment. Connecting elite talent with cutting-edge opportunities.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
                <li><Link to="/profiles" className="hover:text-primary transition-colors">Browse Talent</Link></li>
                <li><Link to="/jobs" className="hover:text-primary transition-colors">Find Jobs</Link></li>
                <li><Link to="/training" className="hover:text-primary transition-colors">Training</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/partners" className="hover:text-primary transition-colors">Partners</Link></li>
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2025 Cydena. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Twitter</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
