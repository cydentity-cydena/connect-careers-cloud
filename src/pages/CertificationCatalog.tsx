import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Award, GraduationCap, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";

interface Course {
  name: string;
  description: string;
  provider: string;
  roles: string;
}

const CertificationCatalog = () => {
  const courses: Course[] = [
    {
      name: "CompTIA Security+",
      description: "Essential principles for network security and risk management.",
      provider: "CompTIA",
      roles: "Security Administrator, Systems Administrator, Network Engineer"
    },
    {
      name: "CompTIA Cybersecurity Analyst (CySA+)",
      description: "Focuses on threat detection and response.",
      provider: "CompTIA",
      roles: "Security Analyst, Threat Intelligence Analyst, SOC Analyst"
    },
    {
      name: "CompTIA Advanced Security Practitioner (CASP+)",
      description: "Advanced practitioners covering enterprise security and risk management.",
      provider: "CompTIA",
      roles: "Security Architect, Senior Security Engineer"
    },
    {
      name: "Certified Ethical Hacker (CEH)",
      description: "Focuses on hacking tools, techniques, and methodologies.",
      provider: "EC-Council",
      roles: "Ethical Hacker, Penetration Tester, Network Security Specialist"
    },
    {
      name: "Certified Network Defender (CND)",
      description: "Focuses on network security technologies and operations.",
      provider: "EC-Council",
      roles: "Network Administrator, Network Defense Technician"
    },
    {
      name: "Certified Information Security Manager (CISM)",
      description: "Advanced certification focusing on managing and governing information security programs.",
      provider: "EC-Council",
      roles: "Information Security Manager, IT Audit Manager"
    },
    {
      name: "GIAC Security Essentials (GSEC)",
      description: "Comprehensive information security certification.",
      provider: "SANS",
      roles: "Security Professional, Network Administrator"
    },
    {
      name: "GIAC Penetration Tester (GPEN)",
      description: "Penetration testing and ethical hacking skills.",
      provider: "SANS",
      roles: "Penetration Tester, Security Consultant"
    },
    {
      name: "GIAC Incident Handler (GCIH)",
      description: "Incident handling and computer forensics.",
      provider: "SANS",
      roles: "Incident Handler, Security Operations Analyst"
    },
    {
      name: "Certified Information Systems Security Professional (CISSP)",
      description: "Advanced security certification for experienced professionals.",
      provider: "ISC2",
      roles: "Security Consultant, Manager, CISO"
    },
    {
      name: "Systems Security Certified Practitioner (SSCP)",
      description: "IT administration and security operations certification.",
      provider: "ISC2",
      roles: "Systems Administrator, Security Analyst"
    },
  ];

  const providers = ["CompTIA", "EC-Council", "SANS", "ISC2"];

  const getProviderIcon = (provider: string) => {
    const icons: { [key: string]: string } = {
      "CompTIA": "🔴",
      "EC-Council": "🔵",
      "SANS": "🟢",
      "ISC2": "🟣"
    };
    return icons[provider] || "📚";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Premium Cybersecurity Certifications</h1>
          <p className="text-muted-foreground">
            Advance your career with industry-recognized professional certifications
          </p>
        </div>

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
                        <Button variant="hero" className="w-full gap-2">
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

        {/* Career Path Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold">Official Certification Bodies</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Established certification organizations with global recognition
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="border-border shadow-card hover:scale-105 transition-transform">
              <CardHeader className="bg-blue-800 rounded-t-lg text-white">
                <CardTitle className="text-xl">(ISC)²</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Leading cybersecurity certifications body offering CISSP, SSCP, and other industry-standard credentials.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["CISSP", "SSCP", "CCSP", "ISSAP"].map((cert, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-card hover:scale-105 transition-transform">
              <CardHeader className="bg-orange-600 rounded-t-lg text-white">
                <CardTitle className="text-xl">ISACA</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Global association for IT governance, risk management, and cybersecurity professionals.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["CISA", "CISM", "CRISC", "CGEIT"].map((cert, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Career Path Section */}
        <Card className="border-border shadow-card bg-gradient-card mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <GraduationCap className="h-6 w-6 text-primary" />
              From Entry-Level to CISO
            </CardTitle>
            <CardDescription>Your roadmap to cybersecurity success</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Navigating the path from graduation to becoming a Chief Information Security Officer (CISO)
              can be challenging with numerous certifications and online resources available. We provide
              guidance to ensure you are on the right track to achieve your training and career goals.
            </p>
            <Button variant="hero">View Career Paths</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CertificationCatalog;
