import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Upload, CheckCircle, Zap, Star, TrendingUp, Building2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import Schema from "@/components/Schema";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Training = () => {
  const [featuredPartners, setFeaturedPartners] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeaturedPartners = async () => {
      const { data } = await supabase
        .from("featured_training_partners")
        .select("*")
        .order("slot_position");
      
      if (data) {
        setFeaturedPartners(data);
      }
    };

    fetchFeaturedPartners();
  }, []);

  // Deduplicate featured partners by name
  const uniqueFeaturedPartners = (() => {
    const seen = new Set<string>();
    return featuredPartners.filter((fp) => {
      const name = fp.partner_name as string;
      if (!name || seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  })();

  const partners = [
    {
      category: "Gamified Training Platforms",
      description: "Interactive learning with verified completion badges",
      icon: <Zap className="h-6 w-6" />,
      providers: [
        {
          name: "Hack The Box",
          description: "Industry-recognized penetration testing labs. HTB Academy issues verified completion badges.",
          color: "bg-lime-600",
          features: ["HTB Academy", "Pro Labs", "Verified Badges", "Employer Recognition"],
          freeCourses: [
            { name: "Introduction to HTB", url: "https://academy.hackthebox.com/course/preview/intro-to-academy" }
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
          name: "TryHackMe",
          description: "Gamified cybersecurity labs with global community. Issues digital completion certificates integrated with Credly.",
          color: "bg-green-600",
          features: ["Hands-on Labs", "Completion Badges", "Community Rankings", "Credly Integration"],
          freeCourses: [
            { name: "Linux Fundamentals", url: "https://tryhackme.com/r/room/linuxfundamentalspart1" },
            { name: "Phishing Analysis", url: "https://tryhackme.com/room/phishingemails1tryoe" }
          ]
        },
        {
          name: "LetsDefend",
          description: "Blue team training with real-world SOC scenarios. Hands-on SIEM practice and incident response exercises.",
          color: "bg-cyan-600",
          features: ["SOC Analyst Training", "Real-World Scenarios", "SIEM Practice", "Completion Certificates"],
          freeCourses: [
            { name: "SOC Analyst Path", url: "https://app.letsdefend.io/accounts/login?from=%2Fhomepage" }
          ]
        },
        {
          name: "Cybrary",
          description: "Comprehensive cybersecurity training platform with career paths and hands-on virtual labs.",
          color: "bg-orange-600",
          features: ["Career Paths", "Virtual Labs", "Certificates", "Skill Assessments"],
          freeCourses: [
            { name: "Intro to IT & Cybersecurity", url: "https://www.cybrary.it/catalog" }
          ]
        },
        {
          name: "TCM Security Academy",
          description: "Affordable courses with PNPT certification. Rapidly growing recognition in the industry.",
          color: "bg-red-600",
          features: ["PNPT Certification", "Practical Training", "Course Certificates", "Industry Recognition"],
          freeCourses: [
            { name: "Learn Penetration Testing (Free)", url: "https://academy.tcm-sec.com/p/learn-penetration-testing-free" }
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
            { name: "Community Range", url: "https://www.rangeforce.com/free-edition" }
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
          name: "Cydentity Academy",
          description: "Official ISO/IEC 27001 training provider. Partners with TRECCert (ANAB accredited) for ISMS certifications.",
          color: "bg-blue-900",
          features: ["ISO 27001 Training", "TRECCert Partner", "ISMS Implementation", "Lead Auditor Courses"],
          isOfficial: true,
          freeCourses: [
            { name: "View Courses", url: "https://cydentityacademy.com/" }
          ]
        },
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
          name: "PentesterLab",
          description: "Hands-on web security labs with certificates of completion. Focused on practical exploitation.",
          color: "bg-red-700",
          features: ["Web Security", "Practical Labs", "Certificates", "Vulnerability Testing"],
          freeCourses: [
            { name: "Web for Pentesters", url: "https://pentesterlab.com/exercises/web-for-pentester" }
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
        title="Cybersecurity Training Courses - Security+ to OSCP Prep"
        description="Access free cybersecurity training from Hack The Box, TryHackMe, and top providers. Prepare for Security+, CEH, OSCP certifications with hands-on labs."
        keywords="free cybersecurity training, Security+ courses, OSCP preparation, penetration testing labs, HTB Academy"
      />
      <Schema type="breadcrumb" data={{
        items: [
          { name: "Home", path: "/" },
          { name: "Training", path: "/training" }
        ]
      }} />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-cyber bg-clip-text text-transparent">
              Cybersecurity Training & Certification Prep
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Complete courses, import certifications, and boost your score with verified training
            </p>

            {/* Partnership CTA - Top Placement */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 mb-12">
              <CardHeader>
                <CardTitle className="text-2xl">Become a Training Partner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Are you a training provider? Join our network and give your graduates instant visibility with hiring employers. Upgrade to featured placement for premium exposure.
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
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-border">
                  <Link to="/partnerships">
                    <Button className="w-full sm:w-auto">
                      <Star className="h-4 w-4 mr-2" />
                      Become a Featured Partner
                    </Button>
                  </Link>
                  <Link to="/contact?subject=Partnership%20Inquiry">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Featured Partners Section - Tiered Display */}
            {featuredPartners.length > 0 && (
              <div className="mb-12 animate-fade-in">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold">
                    Featured Training Partners
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {uniqueFeaturedPartners.map((partner) => {
                    const defaultStyles = { border: "border-2 border-purple-500/50", bg: "from-purple-500/5 to-transparent", badge: "bg-purple-500", size: "scale-90", label: "FEATURED", icon: "text-purple-500" };
                    const slotStyles = {
                      1: { border: "border-4 border-yellow-500", bg: "from-yellow-500/15 to-yellow-500/5", badge: "bg-yellow-500", size: "scale-105", label: "PREMIUM", icon: "text-yellow-500" },
                      2: { border: "border-3 border-orange-500/70", bg: "from-orange-500/10 to-orange-500/5", badge: "bg-orange-500", size: "scale-100", label: "FEATURED", icon: "text-orange-500" },
                      3: { border: "border-2 border-blue-500/60", bg: "from-blue-500/8 to-blue-500/3", badge: "bg-blue-500", size: "scale-95", label: "FEATURED", icon: "text-blue-500" },
                      4: { border: "border-2 border-purple-500/50", bg: "from-purple-500/5 to-transparent", badge: "bg-purple-500", size: "scale-90", label: "FEATURED", icon: "text-purple-500" },
                    }[partner.slot_position as 1 | 2 | 3 | 4] || defaultStyles;
                    
                    // Check if this is an official partner
                    const isOfficialPartner = ['Cydentity Academy', 'TRECCert'].includes(partner.partner_name);

                    return (
                      <Card
                        key={partner.id}
                        className={`relative ${slotStyles.border} ${slotStyles.size} bg-gradient-to-br ${slotStyles.bg} hover:scale-[1.02] transition-all duration-200`}
                      >
                        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                          <Badge className={`${slotStyles.badge} text-white border-0 px-3 py-1`}>
                            {partner.slot_position === 1 && <Star className="h-3.5 w-3.5 mr-1.5 fill-white" />}
                            <Star className="h-3.5 w-3.5 mr-1.5" />
                            {slotStyles.label}
                          </Badge>
                          {isOfficialPartner && (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Official Partner
                            </Badge>
                          )}
                        </div>

                        {partner.logo_url && (
                          <div className="p-6 pb-4">
                            <img 
                              src={partner.logo_url} 
                              alt={`${partner.partner_name} logo`}
                              className="h-20 w-auto object-contain"
                            />
                          </div>
                        )}

                        <CardHeader className="pb-3">
                          <CardTitle className={`${partner.slot_position === 1 ? 'text-2xl' : 'text-xl'} flex items-center gap-2`}>
                            <Building2 className={`h-5 w-5 ${slotStyles.icon}`} />
                            {partner.partner_name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {partner.description}
                          </p>
                          <a
                            href={partner.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 text-sm ${slotStyles.icon} hover:underline font-semibold transition-colors`}
                          >
                            Visit Training Platform →
                          </a>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
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
                    className="border-border hover:border-primary/50 transition-all hover:scale-[1.02] cursor-pointer relative"
                  >
                    {partner.isOfficial && (
                      <div className="absolute top-4 right-4 z-10">
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Official Partner
                        </Badge>
                      </div>
                    )}
                    <CardHeader className={`${partner.color} rounded-t-lg text-white`}>
                      <CardTitle className="text-xl">{partner.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {partner.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {partner.features.map((feature, fIdx) => (
                          <Badge key={fIdx} className="text-xs bg-purple-600 text-white hover:bg-purple-700 border-0">
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
        </div>
      </main>
    </div>
  );
};

export default Training;
