import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Users, Briefcase, TrendingUp, ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
            <h2 className="text-4xl font-bold mb-4">Why Choose Cydent?</h2>
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
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Cydent</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              © 2025 Cydent. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
