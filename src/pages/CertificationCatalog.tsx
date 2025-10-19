import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Award, GraduationCap, CheckCircle, Star } from "lucide-react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import treccertLogo from "@/assets/treccert-logo.svg";
import cydentityLogo from "/logos/cydentity-academy-logo.png";

interface Course {
  name: string;
  description: string;
  provider: string;
  roles: string;
  enrollUrl: string;
}

const CertificationCatalog = () => {
  const [featuredCertifications, setFeaturedCertifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeaturedCertifications = async () => {
      const { data } = await supabase
        .from("featured_certifications")
        .select("*")
        .order("slot_position");
      
      if (data) {
        setFeaturedCertifications(data);
      }
    };

    fetchFeaturedCertifications();
  }, []);

  const courses: Course[] = [
    {
      name: "CompTIA Security+",
      description: "Essential principles for network security and risk management.",
      provider: "CompTIA",
      roles: "Security Administrator, Systems Administrator, Network Engineer",
      enrollUrl: "https://www.comptia.org/certifications/security"
    },
    {
      name: "CompTIA Cybersecurity Analyst (CySA+)",
      description: "Focuses on threat detection and response.",
      provider: "CompTIA",
      roles: "Security Analyst, Threat Intelligence Analyst, SOC Analyst",
      enrollUrl: "https://www.comptia.org/certifications/cybersecurity-analyst"
    },
    {
      name: "CompTIA Advanced Security Practitioner (CASP+)",
      description: "Advanced practitioners covering enterprise security and risk management.",
      provider: "CompTIA",
      roles: "Security Architect, Senior Security Engineer",
      enrollUrl: "https://www.comptia.org/certifications/comptia-advanced-security-practitioner"
    },
    {
      name: "Certified Ethical Hacker (CEH)",
      description: "Focuses on hacking tools, techniques, and methodologies.",
      provider: "EC-Council",
      roles: "Ethical Hacker, Penetration Tester, Network Security Specialist",
      enrollUrl: "https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/"
    },
    {
      name: "Certified Network Defender (CND)",
      description: "Focuses on network security technologies and operations.",
      provider: "EC-Council",
      roles: "Network Administrator, Network Defense Technician",
      enrollUrl: "https://www.eccouncil.org/train-certify/certified-network-defender-cnd/"
    },
    {
      name: "Certified Information Security Manager (CISM)",
      description: "Advanced certification focusing on managing and governing information security programs.",
      provider: "EC-Council",
      roles: "Information Security Manager, IT Audit Manager",
      enrollUrl: "https://www.eccouncil.org/train-certify/certified-chief-information-security-officer-cciso/"
    },
    {
      name: "GIAC Security Essentials (GSEC)",
      description: "Comprehensive information security certification.",
      provider: "SANS",
      roles: "Security Professional, Network Administrator",
      enrollUrl: "https://www.giac.org/certifications/security-essentials-gsec/"
    },
    {
      name: "GIAC Penetration Tester (GPEN)",
      description: "Penetration testing and ethical hacking skills.",
      provider: "SANS",
      roles: "Penetration Tester, Security Consultant",
      enrollUrl: "https://www.giac.org/certifications/penetration-tester-gpen/"
    },
    {
      name: "GIAC Incident Handler (GCIH)",
      description: "Incident handling and computer forensics.",
      provider: "SANS",
      roles: "Incident Handler, Security Operations Analyst",
      enrollUrl: "https://www.giac.org/certifications/certified-incident-handler-gcih/"
    },
    {
      name: "Certified Information Systems Security Professional (CISSP)",
      description: "Advanced security certification for experienced professionals.",
      provider: "ISC2",
      roles: "Security Consultant, Manager, CISO",
      enrollUrl: "https://www.isc2.org/certifications/cissp"
    },
    {
      name: "Systems Security Certified Practitioner (SSCP)",
      description: "IT administration and security operations certification.",
      provider: "ISC2",
      roles: "Systems Administrator, Security Analyst",
      enrollUrl: "https://www.isc2.org/certifications/sscp"
    },
  ];

  const providers = ["CompTIA", "EC-Council", "SANS", "ISC2"];

  const getProviderIcon = (provider: string) => {
    const icons: { [key: string]: string } = {
      "CompTIA": "🔴",
      "EC-Council": "🔵",
      "SANS": "🟢",
      "ISC2": "🟣",
      "TRECCert": "🔷",
    };
    return icons[provider] || "📚";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <SEO 
        title="Certification Catalog | Cydena"
        description="Advance your cybersecurity career with industry-recognized professional certifications from top providers."
        keywords="cybersecurity certifications, CompTIA Security+, CISSP, CEH, GIAC, professional development"
      />

      <main className="container mx-auto px-4 py-8 animate-fade-in">
        {/* TRECCert Partnership Banner */}
        <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-background mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <img src={cydentityLogo} alt="Cydentity Academy Logo" className="h-16 w-auto object-contain" />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold">Official Accreditation Partner</h3>
                    <Badge variant="secondary" className="bg-primary/20">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified Partner
                    </Badge>
                  </div>
                  <p className="text-base text-muted-foreground">
                    Cydentity Academy delivers ISO certifications with TRECCert accreditation - a trusted global certification body
                  </p>
                </div>
              </div>
              <a
                href="https://cydentityacademy.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 py-2 whitespace-nowrap"
              >
                Learn More
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Premium Cybersecurity Certifications</h1>
          <p className="text-muted-foreground">
            Advance your career with industry-recognized professional certifications
          </p>
        </div>

        {/* Partnership CTA - Top Placement */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Become a Featured Certification Provider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Are you a certification provider? Get premium visibility and reach thousands of cybersecurity professionals actively pursuing certifications.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Prime Visibility</h3>
                  <p className="text-sm text-muted-foreground">Featured placement at top of catalog</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Targeted Audience</h3>
                  <p className="text-sm text-muted-foreground">Reach active job seekers and professionals</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Brand Authority</h3>
                  <p className="text-sm text-muted-foreground">Position as trusted certification body</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-border">
              <a href="/partnerships" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2">
                <Star className="h-4 w-4 mr-2" />
                View Partnership Plans
              </a>
              <a href="/contact?subject=Certification%20Partnership" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6 py-2">
                Contact Us
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Featured Certifications Section - Tiered Display */}
        {featuredCertifications.length > 0 && (
          <div className="mb-12 animate-fade-in">
            <div className="mb-6">
              <h2 className="text-3xl font-bold">
                Featured Certifications
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {featuredCertifications.map((cert) => {
                const defaultStyles = { border: "border-2 border-purple-500/50", bg: "from-purple-500/5 to-transparent", badge: "bg-purple-500", size: "scale-90", label: "FEATURED", icon: "text-purple-500" };
                const slotStyles = {
                  1: { border: "border-4 border-yellow-500", bg: "from-yellow-500/15 to-yellow-500/5", badge: "bg-yellow-500", size: "scale-105", label: "PREMIUM", icon: "text-yellow-500" },
                  2: { border: "border-3 border-orange-500/70", bg: "from-orange-500/10 to-orange-500/5", badge: "bg-orange-500", size: "scale-100", label: "FEATURED", icon: "text-orange-500" },
                  3: { border: "border-2 border-blue-500/60", bg: "from-blue-500/8 to-blue-500/3", badge: "bg-blue-500", size: "scale-95", label: "FEATURED", icon: "text-blue-500" },
                  4: { border: "border-2 border-purple-500/50", bg: "from-purple-500/5 to-transparent", badge: "bg-purple-500", size: "scale-90", label: "FEATURED", icon: "text-purple-500" },
                }[cert.slot_position as 1 | 2 | 3 | 4] || defaultStyles;

                return (
                  <Card
                    key={cert.id}
                    className={`relative ${slotStyles.border} ${slotStyles.size} bg-gradient-to-br ${slotStyles.bg} hover:scale-[1.02] transition-all duration-200`}
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className={`${slotStyles.badge} text-white border-0 px-3 py-1`}>
                        {cert.slot_position === 1 && <Star className="h-3.5 w-3.5 mr-1.5 fill-white" />}
                        <Star className="h-3.5 w-3.5 mr-1.5" />
                        {slotStyles.label}
                      </Badge>
                    </div>

                    {cert.logo_url && (
                      <div className="p-6 pb-0">
                        <img 
                          src={cert.logo_url} 
                          alt={`${cert.provider_name} logo`}
                          className="h-12 object-contain"
                        />
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <CardTitle className={`${cert.slot_position === 1 ? 'text-2xl' : 'text-xl'} flex items-center gap-2`}>
                        <Award className={`h-5 w-5 ${slotStyles.icon}`} />
                        {cert.cert_name}
                      </CardTitle>
                      <CardDescription className="font-semibold text-base">
                        {cert.provider_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {cert.description}
                      </p>
                      <a
                        href={cert.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 text-sm ${slotStyles.icon} hover:underline font-semibold transition-colors`}
                      >
                        Learn More & Enroll →
                      </a>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {providers.map((provider, providerIdx) => (
          <div key={provider} className="mb-12 animate-slide-up" style={{ animationDelay: `${providerIdx * 0.1}s` }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">{getProviderIcon(provider)}</div>
              <h2 className="text-3xl font-bold">{provider} Training Courses</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses
                .filter((course) => course.provider === provider)
                .map((course, idx) => (
                  <Card
                    key={idx}
                    className="border-border shadow-card hover:scale-105 transition-transform"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        {course.name}
                      </CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold mb-1">Suitable for:</p>
                          <p className="text-sm text-muted-foreground">
                            {course.roles}
                          </p>
                        </div>
                        <Button 
                          variant="hero" 
                          className="w-full gap-2"
                          onClick={() => window.open(course.enrollUrl, '_blank')}
                        >
                          <BookOpen className="h-4 w-4" />
                          Enroll Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default CertificationCatalog;
