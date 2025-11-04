import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    title: "Cydena",
    subtitle: "A Value-Based Recruitment Platform for Cybersecurity Talent",
    content: (
      <div className="text-center space-y-6">
        <p className="text-2xl">A Revolutionary Platform for Students & Graduates</p>
        <div className="grid grid-cols-3 gap-8 mt-12">
          <div className="space-y-2">
            <div className="text-5xl font-bold text-primary">100%</div>
            <p className="text-lg">Hire with Confidence</p>
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
              <h3 className="text-xl font-semibold mb-2">Value-Based Platform for Everyone</h3>
              <p className="text-lg">Free for candidates, transparent pricing for employers—no hidden fees or surprises</p>
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
            <p className="text-lg">Upload work authorization documents securely - GDPR compliant storage, verified within 24 hours</p>
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
    title: "Our Partners",
    subtitle: "Collaborating with Industry Leaders to Deliver World-Class Training and Certification",
    content: (
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* TRECCERT */}
          <div className="p-8 bg-card rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-center mb-6 h-24">
              <img src="/logos/treccert-logo.svg" alt="TRECCERT" className="h-16 object-contain" />
            </div>
            <div className="mb-4">
              <span className="px-4 py-1 bg-blue-500/20 text-blue-600 rounded-full text-sm font-semibold">
                Accreditation
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-3">TRECCERT</h3>
            <p className="text-lg text-muted-foreground">
              Certification body providing certifications that attest the competencies of professionals in information security and compliance.
            </p>
          </div>

          {/* Cydentity */}
          <div className="p-8 bg-card rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-center mb-6 h-24">
              <img src="/logos/cydentity-logo-white.png" alt="Cydentity" className="h-16 object-contain" />
            </div>
            <div className="mb-4">
              <span className="px-4 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                Cybersecurity
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-3">Cydentity</h3>
            <p className="text-lg text-muted-foreground">
              Leading cybersecurity solutions provider, delivering comprehensive security services and training to protect organizations from evolving digital threats.
            </p>
          </div>

          {/* Cydentity Academy */}
          <div className="p-8 bg-card rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-center mb-6 h-24">
              <img src="/logos/cydentity-academy-logo-white.png" alt="Cydentity Academy" className="h-16 object-contain" />
            </div>
            <div className="mb-4">
              <span className="px-4 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                Training & Education
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-3">Cydentity Academy</h3>
            <p className="text-lg text-muted-foreground">
              Leading provider of cybersecurity and AI security training, offering comprehensive courses to upskill professionals and students in cutting-edge security practices.
            </p>
          </div>

          {/* real LMS */}
          <div className="p-8 bg-card rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-center mb-6 h-24">
              <img src="/logos/letsdefend-logo.jpg" alt="real LMS" className="h-16 object-contain" />
            </div>
            <div className="mb-4">
              <span className="px-4 py-1 bg-purple-500/20 text-purple-600 rounded-full text-sm font-semibold">
                Hands-On Labs
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-3">real LMS</h3>
            <p className="text-lg text-muted-foreground">
              Real-world SOC analyst training platform with hands-on labs and simulations, helping students gain practical blue team experience in a realistic environment.
            </p>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mt-12 p-8 bg-primary/10 rounded-xl">
          <h3 className="text-2xl font-semibold mb-4 text-center">The Value of Our Partnerships</h3>
          <p className="text-lg text-center mb-6">
            Through our partner network, students gain access to industry-recognized certifications, 
            comprehensive training programs, and real-world labs—ensuring they're job-ready from day one.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🎓</div>
              <p className="font-semibold">Industry Certifications</p>
              <p className="text-sm text-muted-foreground">TRECCERT accredited programs</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🛡️</div>
              <p className="font-semibold">Expert Training</p>
              <p className="text-sm text-muted-foreground">Cydentity & Academy courses</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💻</div>
              <p className="font-semibold">Practical Experience</p>
              <p className="text-sm text-muted-foreground">Hands-on labs & simulations</p>
            </div>
          </div>
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
    title: "What a Verified Profile Looks Like",
    subtitle: "Professional, Verified, and Ready to Impress Employers",
    content: (
      <div className="max-w-5xl mx-auto">
        <div className="border-2 border-primary/20 rounded-xl p-8 bg-card shadow-xl">
          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-8 pb-8 border-b">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-bold">
              JD
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-3xl font-bold">Jane Doe</h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-sm font-semibold flex items-center gap-1">
                    ✓ HR-Ready
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-600 rounded-full text-sm font-semibold">
                    Identity Verified
                  </span>
                </div>
              </div>
              <p className="text-xl text-muted-foreground mb-2">Penetration Testing Specialist</p>
              <p className="text-lg">📍 London, UK  •  💼 Available Immediately  •  💰 £35k-45k</p>
            </div>
          </div>

          {/* Verified Certifications */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold mb-4">🎓 Verified Certifications</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="font-semibold">CompTIA Security+</p>
                <p className="text-sm text-muted-foreground">✓ Verified via Credly</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="font-semibold">CEH v12</p>
                <p className="text-sm text-muted-foreground">✓ Verified via EC-Council</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="font-semibold">OSCP</p>
                <p className="text-sm text-muted-foreground">✓ Verified via Offensive Security</p>
              </div>
            </div>
          </div>

          {/* Platform Integrations */}
          <div className="mb-8">
            <h4 className="text-xl font-semibold mb-4">🎯 Verified Skills</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">TryHackMe</p>
                  <span className="text-green-600 text-sm">✓ Connected</span>
                </div>
                <p className="text-sm text-muted-foreground">Level 12 • Top 5%</p>
              </div>
              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">HackTheBox</p>
                  <span className="text-green-600 text-sm">✓ Connected</span>
                </div>
                <p className="text-sm text-muted-foreground">Rank: Hacker • 45 machines pwned</p>
              </div>
            </div>
          </div>

          {/* Key Skills */}
          <div>
            <h4 className="text-xl font-semibold mb-4">💡 Top Skills</h4>
            <div className="flex flex-wrap gap-2">
              {["Penetration Testing", "Network Security", "Python", "Linux", "Web Application Security", "Metasploit", "Burp Suite", "OWASP Top 10"].map((skill) => (
                <span key={skill} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
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
