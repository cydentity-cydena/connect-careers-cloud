import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    title: "Cydena",
    subtitle: "Accelerating Graduate Careers in Cybersecurity",
    content: (
      <div className="text-center space-y-6">
        <p className="text-2xl">A Revolutionary Platform for Students & Graduates</p>
        <div className="grid grid-cols-3 gap-8 mt-12">
          <div className="space-y-2">
            <div className="text-5xl font-bold text-primary">70%</div>
            <p className="text-lg">Faster Hiring</p>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-bold text-primary">100%</div>
            <p className="text-lg">HR-Ready Verified</p>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-bold text-primary">50+</div>
            <p className="text-lg">Skills Tracked</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "The Challenge",
    subtitle: "What Students & Graduates Face Today",
    content: (
      <div className="space-y-6 text-left max-w-4xl mx-auto">
        <div className="space-y-4">
          <div className="p-6 bg-destructive/10 rounded-lg">
            <h3 className="text-2xl font-semibold mb-2">❌ Skills Gap</h3>
            <p className="text-lg">Employers can't verify claimed skills and certifications</p>
          </div>
          <div className="p-6 bg-destructive/10 rounded-lg">
            <h3 className="text-2xl font-semibold mb-2">❌ Slow Hiring Process</h3>
            <p className="text-lg">Traditional recruitment takes weeks or months</p>
          </div>
          <div className="p-6 bg-destructive/10 rounded-lg">
            <h3 className="text-2xl font-semibold mb-2">❌ No Visibility</h3>
            <p className="text-lg">Graduate profiles get lost in generic job boards</p>
          </div>
          <div className="p-6 bg-destructive/10 rounded-lg">
            <h3 className="text-2xl font-semibold mb-2">❌ Manual Verification</h3>
            <p className="text-lg">Students spend hours preparing documents for each application</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "The Cydena Solution",
    subtitle: "How We're Transforming Graduate Employment",
    content: (
      <div className="space-y-6 text-left max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-primary/10 rounded-lg">
            <h3 className="text-2xl font-semibold mb-3">✅ HR-Ready Verification</h3>
            <p className="text-lg">One-time verification of identity, right-to-work, and logistics</p>
          </div>
          <div className="p-6 bg-primary/10 rounded-lg">
            <h3 className="text-2xl font-semibold mb-3">✅ Verified Skills</h3>
            <p className="text-lg">Direct integration with TryHackMe, HackTheBox & certification providers</p>
          </div>
          <div className="p-6 bg-primary/10 rounded-lg">
            <h3 className="text-2xl font-semibold mb-3">✅ Fast-Track Hiring</h3>
            <p className="text-lg">Employers see verified profiles and can hire in days, not weeks</p>
          </div>
          <div className="p-6 bg-primary/10 rounded-lg">
            <h3 className="text-2xl font-semibold mb-3">✅ Career Growth</h3>
            <p className="text-lg">Gamification, skill pathways, and community support</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Key Features",
    subtitle: "What Makes Cydena Different",
    content: (
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center space-y-3">
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="text-xl font-semibold">Skills Assessment</h3>
            <p>AI-powered assessments verify technical capabilities</p>
          </div>
          <div className="text-center space-y-3">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-xl font-semibold">Gamification</h3>
            <p>Earn points, badges, and achievements as you grow</p>
          </div>
          <div className="text-center space-y-3">
            <div className="text-4xl mb-2">🔗</div>
            <h3 className="text-xl font-semibold">Platform Integration</h3>
            <p>Connect TryHackMe, HackTheBox accounts</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center space-y-3">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="text-xl font-semibold">HR-Ready Badge</h3>
            <p>Complete verification shown to all employers</p>
          </div>
          <div className="text-center space-y-3">
            <div className="text-4xl mb-2">🤝</div>
            <h3 className="text-xl font-semibold">Direct Messaging</h3>
            <p>Connect directly with potential employers</p>
          </div>
          <div className="text-center space-y-3">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="text-xl font-semibold">Career Dashboard</h3>
            <p>Track applications, profile views, and progress</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Benefits for Students",
    subtitle: "Why Students Love Cydena",
    content: (
      <div className="space-y-6 max-w-4xl mx-auto text-left">
        <div className="space-y-4">
          <div className="flex gap-4 items-start p-4 bg-card rounded-lg">
            <div className="text-3xl">💼</div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Get Noticed by Top Employers</h3>
              <p className="text-lg">Your verified profile stands out to cybersecurity companies actively hiring</p>
            </div>
          </div>
          <div className="flex gap-4 items-start p-4 bg-card rounded-lg">
            <div className="text-3xl">⚡</div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Apply Once, Not Repeatedly</h3>
              <p className="text-lg">Complete verification once, apply to multiple jobs without re-submitting documents</p>
            </div>
          </div>
          <div className="flex gap-4 items-start p-4 bg-card rounded-lg">
            <div className="text-3xl">📈</div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Showcase Real Skills</h3>
              <p className="text-lg">Integrated verification from TryHackMe, HackTheBox, and certification providers</p>
            </div>
          </div>
          <div className="flex gap-4 items-start p-4 bg-card rounded-lg">
            <div className="text-3xl">🎓</div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Free for Students & Graduates</h3>
              <p className="text-lg">No cost to create profile, get verified, and apply to jobs</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "The Verification Process",
    subtitle: "Simple 3-Step HR-Ready Verification",
    content: (
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4 p-6 border-2 border-primary rounded-lg">
            <div className="text-6xl font-bold text-primary">1</div>
            <h3 className="text-2xl font-semibold">Identity</h3>
            <p className="text-lg">Government ID + biometric verification in minutes</p>
          </div>
          <div className="text-center space-y-4 p-6 border-2 border-primary rounded-lg">
            <div className="text-6xl font-bold text-primary">2</div>
            <h3 className="text-2xl font-semibold">Right to Work</h3>
            <p className="text-lg">Upload work authorization documents - verified within 24 hours</p>
          </div>
          <div className="text-center space-y-4 p-6 border-2 border-primary rounded-lg">
            <div className="text-6xl font-bold text-primary">3</div>
            <h3 className="text-2xl font-semibold">Logistics</h3>
            <p className="text-lg">Location, salary expectations, availability confirmed</p>
          </div>
        </div>
        <div className="mt-12 p-6 bg-primary/10 rounded-lg text-center">
          <p className="text-2xl font-semibold">Once complete: Get the HR-Ready Badge ✅</p>
          <p className="text-lg mt-2">Valid for 1 year - shows employers you're ready to start immediately</p>
        </div>
      </div>
    )
  },
  {
    title: "Partnership Opportunities",
    subtitle: "How Universities Can Partner with Cydena",
    content: (
      <div className="space-y-6 max-w-4xl mx-auto text-left">
        <div className="space-y-4">
          <div className="p-6 bg-primary/10 rounded-lg">
            <h3 className="text-2xl font-semibold mb-3">🎓 Student Access Programs</h3>
            <p className="text-lg">Provide all students with premium Cydena accounts</p>
          </div>
          <div className="p-6 bg-primary/10 rounded-lg">
            <h3 className="text-2xl font-semibold mb-3">📊 Graduate Outcomes Tracking</h3>
            <p className="text-lg">Track employment rates and career progression of your graduates</p>
          </div>
          <div className="p-6 bg-primary/10 rounded-lg">
            <h3 className="text-2xl font-semibold mb-3">🤝 Employer Relationships</h3>
            <p className="text-lg">Direct pipeline between your programs and hiring companies</p>
          </div>
          <div className="p-6 bg-primary/10 rounded-lg">
            <h3 className="text-2xl font-semibold mb-3">🏆 Co-Branded Programs</h3>
            <p className="text-lg">Create university-specific skill pathways and certifications</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Success Metrics",
    subtitle: "The Impact We're Making",
    content: (
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="text-center p-8 bg-card rounded-lg">
            <div className="text-6xl font-bold text-primary mb-4">70%</div>
            <h3 className="text-2xl font-semibold mb-2">Faster Hiring</h3>
            <p className="text-lg">Average time-to-hire reduced from weeks to days</p>
          </div>
          <div className="text-center p-8 bg-card rounded-lg">
            <div className="text-6xl font-bold text-primary mb-4">95%</div>
            <h3 className="text-2xl font-semibold mb-2">Profile Completion</h3>
            <p className="text-lg">Students complete full verification process</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-card rounded-lg">
            <div className="text-4xl font-bold text-primary mb-2">100+</div>
            <p className="text-lg">Active Employers</p>
          </div>
          <div className="text-center p-6 bg-card rounded-lg">
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <p className="text-lg">Student Profiles</p>
          </div>
          <div className="text-center p-6 bg-card rounded-lg">
            <div className="text-4xl font-bold text-primary mb-2">50+</div>
            <p className="text-lg">Successful Placements</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Next Steps",
    subtitle: "Let's Work Together",
    content: (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-6">
          <p className="text-2xl">Ready to give your students a competitive advantage?</p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="p-6 bg-card rounded-lg text-left">
              <h3 className="text-xl font-semibold mb-3">📧 Contact Us</h3>
              <p className="text-lg mb-4">Discuss partnership opportunities</p>
              <p className="text-primary font-semibold">partnerships@cydena.com</p>
            </div>
            <div className="p-6 bg-card rounded-lg text-left">
              <h3 className="text-xl font-semibold mb-3">🌐 Visit Platform</h3>
              <p className="text-lg mb-4">See Cydena in action</p>
              <p className="text-primary font-semibold">www.cydena.com</p>
            </div>
          </div>

          <div className="mt-12 p-8 bg-primary/10 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">Schedule a Demo</h3>
            <p className="text-lg mb-6">See how Cydena can transform graduate employment at your university</p>
            <Button size="lg" className="text-lg px-8 py-6">
              Book a Demo Today
            </Button>
          </div>
        </div>
      </div>
    )
  }
];

export default function UniversityPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
        >
          <Home className="h-4 w-4 mr-2" />
          Exit Presentation
        </Button>
        <div className="text-sm text-muted-foreground">
          Slide {currentSlide + 1} of {slides.length}
        </div>
      </div>

      {/* Main Slide Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-7xl w-full">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold mb-4">{slides[currentSlide].title}</h1>
            <p className="text-2xl text-muted-foreground">{slides[currentSlide].subtitle}</p>
          </div>
          <div className="mt-12">
            {slides[currentSlide].content}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 border-t flex justify-between items-center">
        <Button
          variant="outline"
          onClick={prevSlide}
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-primary w-8' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground pb-4">
        Use arrow keys or buttons to navigate • Press F11 for fullscreen
      </div>
    </div>
  );
}
