import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Award, GraduationCap, CheckCircle, Star } from "lucide-react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import SEO from "@/components/SEO";

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
      name: "ISO 42001 Essentials",
      description: "The basics of AI governance, ethical use, compliance requirements, and risk awareness.",
      provider: "Real LMS",
      roles: "Compliance Officer, Information Security Officer",
      enrollUrl: "https://thereallms.com/artificial-intelligence-1"
    },
    {
      name: "ISO 42001 Practitioner",
      description: "The fundamental concepts, ethical and  regulatory requirements, risk assessments, and AI principles.",
      provider: "Real LMS",
      roles: "Compliance Officer, Information Security Officer",
      enrollUrl: "https://thereallms.com/42001-practitioner"
    },
    {
      name: "ISO 42001 Lead Implementer",
      description: " This certification is perfect for professionals who are responsible for implementing AIMS in their organizations or for external clients.",
      provider: "Real LMS",
      roles: "Compliance Officer, Information Security Officer",
      enrollUrl: "https://thereallms.com/42001-lead-implementer"
    },
    {
      name: "ISO 42001 Lead Auditor",
      description: "This certification is perfect for professionals who are responsible for auditing AIMS in their organizations or for external clients.",
      provider: "Real LMS",
      roles: "Compliance Officer, Information Security Officer",
      enrollUrl: "https://thereallms.com/42001-lead-auditor"
    },
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

  const providers = ["Real LMS","CompTIA", "EC-Council", "SANS", "ISC2"];

  const getProviderIcon = (provider: string) => {
    const icons: { [key: string]: string } = {
      "CompTIA": "🔴",
      "EC-Council": "🔵",
      "SANS": "🟢",
      "ISC2": "🟣",
      "Real LMS": "🔴"
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
                Become Featured
              </a>
              <a href="/contact?subject=Certification%20Partnership" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6 py-2">
                Contact Us
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Featured Certifications Section */}
        {featuredCertifications.length > 0 && (
          <div className="mb-12 animate-fade-in relative">
            {/* Banner Wrapper */}
            <div className="border-4 border-yellow-500 rounded-xl p-6 md:p-8 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/20 dark:via-amber-950/20 dark:to-orange-950/20 shadow-2xl relative overflow-hidden">
              {/* Decorative corner badges */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/20 rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-500/20 rounded-tr-full"></div>
              
              {/* Featured Banner Tag */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-6 py-2 text-base font-bold shadow-lg border-2 border-yellow-600">
                  <Star className="h-5 w-5 mr-2 fill-white" />
                  FEATURED CERTIFICATIONS
                  <Star className="h-5 w-5 ml-2 fill-white" />
                </Badge>
              </div>

              <div className="flex items-center justify-center gap-2 mb-8 mt-4">
                <Star className="h-8 w-8 text-yellow-600 fill-yellow-600 animate-pulse" />
                <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-yellow-700 to-amber-700 bg-clip-text text-transparent">
                  Premium Featured Certifications
                </h2>
                <Star className="h-8 w-8 text-yellow-600 fill-yellow-600 animate-pulse" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {featuredCertifications.map((cert) => (
                  <Card 
                    key={cert.id}
                    className="relative border-3 border-yellow-400 bg-white dark:bg-gray-900 shadow-xl hover:scale-105 transition-all duration-300 hover:shadow-2xl overflow-hidden"
                  >
                    {/* Featured ribbon */}
                    <div className="absolute top-4 -right-10 rotate-45 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-12 py-1 text-xs font-bold shadow-lg">
                      FEATURED
                    </div>

                    <CardHeader className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold">
                              <Star className="h-3 w-3 mr-1 fill-yellow-950" />
                              Featured
                            </Badge>
                          </div>
                          <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                            <Award className="h-6 w-6 text-yellow-600" />
                            {cert.cert_name}
                          </CardTitle>
                          <CardDescription className="text-lg font-semibold text-primary">
                            {cert.provider_name}
                          </CardDescription>
                        </div>
                        {cert.logo_url && (
                          <img 
                            src={cert.logo_url} 
                            alt={`${cert.provider_name} logo`}
                            className="h-16 w-16 object-contain rounded-lg bg-white dark:bg-gray-800 p-2 shadow-md"
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        {cert.description}
                      </p>
                      <a
                        href={cert.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline font-semibold text-lg hover:text-yellow-600 transition-colors"
                      >
                        Learn More & Enroll →
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
