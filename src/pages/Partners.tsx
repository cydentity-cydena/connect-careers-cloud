import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";

const Partners = () => {
  const partners = [
    {
      name: "CompTIA",
      description: "Computing Technology Industry Association - Leading provider of vendor-neutral IT certifications.",
      color: "bg-red-500",
      features: ["Security+", "CySA+", "CASP+", "PenTest+"]
    },
    {
      name: "EC-Council",
      description: "International council for e-commerce and cyber security certifications.",
      color: "bg-blue-500",
      features: ["CEH", "ECSA", "LPT", "CND"]
    },
    {
      name: "SANS",
      description: "World's largest cybersecurity training and certification organization.",
      color: "bg-green-600",
      features: ["GPEN", "GCIH", "GSEC", "GCIA"]
    },
    {
      name: "ISC2",
      description: "International Information System Security Certification Consortium.",
      color: "bg-purple-600",
      features: ["CISSP", "SSCP", "CCSP", "ISSAP"]
    },
    {
      name: "Real LMS",
      description: "Comprehensive learning management system specializing in ISO, Cybersecurity, and AI training for professionals and organizations.",
      color: "bg-teal-600",
      features: ["Custom Training Paths", "Skills Assessment", "Team Management", "Progress Tracking"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Accredited Partners</h1>
          <p className="text-muted-foreground">
            Industry-leading organizations providing world-class cybersecurity training and certifications
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {partners.map((partner, idx) => (
            <Card
              key={partner.name}
              className="border-border shadow-card hover:scale-105 transition-transform animate-slide-up"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center gap-4 mb-3">
                  <div className={`${partner.color} w-16 h-16 rounded-lg flex items-center justify-center`}>
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{partner.name}</CardTitle>
                </div>
                <CardDescription className="text-base">
                  {partner.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-semibold mb-3">Key Certifications:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {partner.features.map((feature, featureIdx) => (
                      <div key={featureIdx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Partnership Benefits */}
        <Card className="border-border shadow-card bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-2xl">Why Partner With Us?</CardTitle>
            <CardDescription>
              Benefits of being an accredited training partner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Verified Credentials
                </h3>
                <p className="text-sm text-muted-foreground">
                  All certifications are verified and validated through our platform
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Direct Job Placement
                </h3>
                <p className="text-sm text-muted-foreground">
                  Connect certified professionals directly with hiring organizations
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Enhanced Visibility
                </h3>
                <p className="text-sm text-muted-foreground">
                  Showcase your certified professionals on our leaderboard system
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Partners;
