import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Upload, CheckCircle, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";

const Training = () => {
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
          features: ["Hands-on Labs", "Completion Badges", "Community Rankings", "Credly Integration"],
          freeCourses: [
            { name: "Linux Fundamentals", url: "https://tryhackme.com/room/linuxfundamentalspart1" },
            { name: "Phishing Analysis", url: "https://tryhackme.com/room/phishingemails1tryoe" }
          ]
        },
        {
          name: "Hack The Box",
          description: "Industry-recognized penetration testing labs. HTB Academy issues verified completion badges.",
          color: "bg-lime-600",
          features: ["HTB Academy", "Pro Labs", "Verified Badges", "Employer Recognition"],
          freeCourses: [
            { name: "Introduction to HTB", url: "https://academy.hackthebox.com/course/preview/introduction-to-academy" }
          ]
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
          features: ["SOC Training", "Incident Response", "Certificates", "Performance Scores"],
          freeCourses: [
            { name: "Free SOC Investigation Labs", url: "https://letsdefend.io/cybersecurity-training" }
          ]
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
          name: "Cybrary",
          description: "Extensive library of cybersecurity courses with completion certificates and career paths.",
          color: "bg-cyan-600",
          features: ["Course Library", "Career Paths", "Certificates", "Skills Assessments"],
          freeCourses: [
            { name: "Free Tier Courses", url: "https://www.cybrary.it/catalog/free" }
          ]
        },
        {
          name: "INE (eLearnSecurity)",
          description: "Provider of eJPT and eCPPT certifications. Respected practical security certifications.",
          color: "bg-indigo-600",
          features: ["eJPT Certification", "eCPPT Training", "Lab Environment", "Industry Respected"],
          freeCourses: [
            { name: "Intro to Pen Testing", url: "https://ine.com/pages/cybersecurity" }
          ]
        }
      ]
    },
    {
      category: "Cyber Ranges & Practice Environments",
      description: "Hands-on cyber ranges with realistic scenarios and free community challenges",
      icon: <Shield className="h-6 w-6" />,
      providers: [
        {
          name: "CyberRanges",
          description: "Official cyber range of UN's ITU. Military-grade platform for realistic cybersecurity scenarios and team exercises.",
          color: "bg-slate-800",
          features: ["Team Exercises", "MITRE ATT&CK", "Realistic Scenarios", "Professional Platform"],
          freeCourses: [
            { name: "Request Demo", url: "https://cyberranges.com/" }
          ]
        },
        {
          name: "CyberDefenders",
          description: "Blue team training platform with free forensics and incident response challenges.",
          color: "bg-blue-800",
          features: ["DFIR Challenges", "Community Labs", "Free Access", "Leaderboards"],
          freeCourses: [
            { name: "Free Blue Team Labs", url: "https://cyberdefenders.org/blueteam-ctf-challenges/" }
          ]
        },
        {
          name: "RangeForce",
          description: "Modular cyber range with team exercises, free community edition available.",
          color: "bg-orange-600",
          features: ["Team Challenges", "Modular Scenarios", "Community Edition", "Completion Badges"],
          freeCourses: [
            { name: "Community Range", url: "https://www.rangeforce.com/community-edition" }
          ]
        },
        {
          name: "NICE Challenge",
          description: "NIST-backed cyber range offering free realistic scenarios and challenges.",
          color: "bg-green-700",
          features: ["Government-Backed", "Realistic Scenarios", "Free Access", "Career Pathways"],
          freeCourses: [
            { name: "Workforce Framework Challenges", url: "https://nice-challenge.com/" }
          ]
        },
        {
          name: "PicoCTF",
          description: "Free CTF platform by Carnegie Mellon. Great for beginners learning cybersecurity fundamentals.",
          color: "bg-yellow-600",
          features: ["Beginner Friendly", "Year-Round Practice", "Free Forever", "Educational Focus"],
          freeCourses: [
            { name: "Practice Challenges", url: "https://picoctf.org/practice" }
          ]
        },
        {
          name: "OverTheWire",
          description: "Classic wargames platform teaching security concepts through hands-on challenges.",
          color: "bg-gray-700",
          features: ["Command Line Skills", "Progressive Difficulty", "100% Free", "Community Driven"],
          freeCourses: [
            { name: "Bandit (Linux Basics)", url: "https://overthewire.org/wargames/bandit/" },
            { name: "Natas (Web Security)", url: "https://overthewire.org/wargames/natas/" }
          ]
        },
        {
          name: "Root-Me",
          description: "French cybersecurity platform with 400+ challenges covering all security domains.",
          color: "bg-red-800",
          features: ["400+ Challenges", "All Skill Levels", "Free Access", "Virtual Environments"],
          freeCourses: [
            { name: "All Challenges", url: "https://www.root-me.org/en/Challenges/" }
          ]
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
          features: ["Defensive Security", "Challenge Labs", "Completion Badges", "Practical Skills"],
          freeCourses: [
            { name: "Free Tier Challenges", url: "https://blueteamlabs.online/home/challenges" }
          ]
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
          features: ["Web Security", "Practical Labs", "Certificates", "Vulnerability Testing"],
          freeCourses: [
            { name: "Web for Pentesters", url: "https://pentesterlab.com/exercises/web_for_pentester/course" }
          ]
        },
        {
          name: "PortSwigger Academy",
          description: "Well-known web security training (Burp Suite creators). Issues completion badges for courses.",
          color: "bg-orange-700",
          features: ["Web Security", "Burp Suite", "Free Training", "Completion Badges"],
          freeCourses: [
            { name: "SQL Injection", url: "https://portswigger.net/web-security/sql-injection" },
            { name: "Cross-Site Scripting", url: "https://portswigger.net/web-security/cross-site-scripting" }
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <SEO 
        title="Free Training | Cydena" 
        description="Complete free cybersecurity courses from leading training providers and earn points on Cydena."
      />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-cyber bg-clip-text text-transparent">
              Free Training Courses
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Complete courses, import certifications, and boost your score with verified training
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2 text-primary flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  For Candidates
                </h2>
                <p className="text-muted-foreground">
                  Completed training from these partners? Import your certificates and badges directly into your Cydena profile. 
                  We support Credly, Accredible, and direct badge URLs. Earn +500-700 points for verified certifications!
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2 text-primary flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  For Training Providers
                </h2>
                <p className="text-muted-foreground">
                  Interested in partnering with Cydena? We showcase your training graduates to employers at no cost.
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
                    <CardContent className="pt-6 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {partner.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {partner.features.map((feature, fIdx) => (
                          <Badge key={fIdx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      {partner.freeCourses && partner.freeCourses.length > 0 && (
                        <div className="pt-4 border-t border-border">
                          <p className="text-sm font-semibold mb-2 text-primary">Free Courses:</p>
                          <div className="space-y-2">
                            {partner.freeCourses.map((course, cIdx) => (
                              <a
                                key={cIdx}
                                href={course.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                              >
                                <span>→</span>
                                <span className="underline">{course.name}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
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
                Are you a training provider? Join our network and give your graduates instant visibility with hiring employers.
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

export default Training;
