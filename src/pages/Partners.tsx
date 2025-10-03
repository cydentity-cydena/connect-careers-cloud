import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Upload, CheckCircle, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";

const Partners = () => {
  const partners = [
    {
      category: "Gamified Training Platforms",
      description: "Interactive learning with verified completion badges",
      icon: <Zap className="h-6 w-6" />,
      providers: [
        {
          name: "TryHackMe",
          description: "Gamified cybersecurity labs with global community. Issues digital completion certificates integrated with Credly.",
          color: "bg-green-600",
          features: ["Hands-on Labs", "Completion Badges", "Community Rankings", "Credly Integration"]
        },
        {
          name: "Hack The Box",
          description: "Industry-recognized penetration testing labs. HTB Academy issues verified completion badges.",
          color: "bg-lime-600",
          features: ["HTB Academy", "Pro Labs", "Verified Badges", "Employer Recognition"]
        },
        {
          name: "Immersive Labs",
          description: "Skills benchmarking platform with strong employer-facing analytics and completion tracking.",
          color: "bg-purple-600",
          features: ["Skills Assessment", "Lab Exercises", "Progress Tracking", "Employer Dashboards"]
        },
        {
          name: "LetsDefend",
          description: "SOC analyst labs with certificates and performance scores. Practical blue team training.",
          color: "bg-blue-600",
          features: ["SOC Training", "Incident Response", "Certificates", "Performance Scores"]
        }
      ]
    },
    {
      category: "Cybersecurity Bootcamps & Academies",
      description: "Intensive training programs with career-focused certifications",
      icon: <Shield className="h-6 w-6" />,
      providers: [
        {
          name: "TCM Security Academy",
          description: "Affordable courses with PNPT certification. Rapidly growing recognition in the industry.",
          color: "bg-red-600",
          features: ["PNPT Certification", "Practical Training", "Course Certificates", "Industry Recognition"]
        },
        {
          name: "RangeForce",
          description: "Modular cyber range with completion badges and existing integration capabilities.",
          color: "bg-orange-600",
          features: ["Modular Training", "Team Challenges", "Completion Badges", "API Integration"]
        },
        {
          name: "Cybrary",
          description: "Extensive library of cybersecurity courses with completion certificates and career paths.",
          color: "bg-cyan-600",
          features: ["Course Library", "Career Paths", "Certificates", "Skills Assessments"]
        },
        {
          name: "INE (eLearnSecurity)",
          description: "Provider of eJPT and eCPPT certifications. Respected practical security certifications.",
          color: "bg-indigo-600",
          features: ["eJPT Certification", "eCPPT Training", "Lab Environment", "Industry Respected"]
        }
      ]
    },
    {
      category: "Specialized Training Providers",
      description: "Niche cybersecurity training with verified completion badges",
      icon: <Upload className="h-6 w-6" />,
      providers: [
        {
          name: "Blue Team Labs Online",
          description: "Practical blue team challenges with completion badges. Focused on defensive security skills.",
          color: "bg-blue-700",
          features: ["Defensive Security", "Challenge Labs", "Completion Badges", "Practical Skills"]
        },
        {
          name: "Practical DevSecOps",
          description: "Specialized DevSecOps certifications. Community-driven training for secure development.",
          color: "bg-teal-600",
          features: ["DevSecOps Certs", "Pipeline Security", "Cloud Security", "Community Support"]
        },
        {
          name: "PentesterLab",
          description: "Hands-on web security labs with certificates of completion. Focused on practical exploitation.",
          color: "bg-red-700",
          features: ["Web Security", "Practical Labs", "Certificates", "Vulnerability Testing"]
        },
        {
          name: "PortSwigger Academy",
          description: "Well-known web security training (Burp Suite creators). Issues completion badges for courses.",
          color: "bg-orange-700",
          features: ["Web Security", "Burp Suite", "Free Training", "Completion Badges"]
        }
      ]
    },
    {
      category: "Official Certification Bodies",
      description: "Established certification organizations with global recognition",
      icon: <CheckCircle className="h-6 w-6" />,
      providers: [
        {
          name: "(ISC)²",
          description: "Leading cybersecurity certifications body offering CISSP, SSCP, and other industry-standard credentials.",
          color: "bg-blue-800",
          features: ["CISSP", "SSCP", "CCSP", "ISSAP"]
        },
        {
          name: "ISACA",
          description: "Global association for IT governance, risk management, and cybersecurity professionals.",
          color: "bg-orange-600",
          features: ["CISA", "CISM", "CRISC", "CGEIT"]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <SEO 
        title="Training Partners | Cydent" 
        description="Showcase verified certifications from leading cybersecurity training providers and academies on Cydent." 
      />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-cyber bg-clip-text text-transparent">
              Training Partners
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Import and showcase verified certifications from our partner training providers
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2 text-primary flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  For Candidates
                </h2>
                <p className="text-muted-foreground">
                  Completed training from these partners? Import your certificates and badges directly into your Cydent profile. 
                  We support Credly, Accredible, and direct badge URLs. Earn +500-700 points for verified certifications!
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2 text-primary flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  For Training Providers
                </h2>
                <p className="text-muted-foreground">
                  Interested in partnering with Cydent? We showcase your training graduates to employers at no cost. 
                  Your graduates gain visibility, and you gain a direct talent pipeline. Easy integration with existing badge systems.
                </p>
              </div>
            </div>
          </div>

          {partners.map((category, idx) => (
            <div key={idx} className="mb-12">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-bold">{category.category}</h2>
                </div>
                <p className="text-muted-foreground">{category.description}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {category.providers.map((partner, pIdx) => (
                  <Card 
                    key={pIdx}
                    className="border-border hover:border-primary/50 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <CardHeader className={`${partner.color} rounded-t-lg text-white`}>
                      <CardTitle className="text-xl">{partner.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground mb-4">
                        {partner.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {partner.features.map((feature, fIdx) => (
                          <Badge key={fIdx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* Partnership CTA */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl">Become a Training Partner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Join our network of training providers and give your graduates instant visibility with hiring employers.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Free Integration</h3>
                    <p className="text-sm text-muted-foreground">No cost to join or list your training programs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Quick Setup</h3>
                    <p className="text-sm text-muted-foreground">Works with Credly, Accredible, or custom badges</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Talent Pipeline</h3>
                    <p className="text-sm text-muted-foreground">Direct connection to hiring employers</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Partners;
