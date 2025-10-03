import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnlockProfileButton } from "@/components/profiles/UnlockProfileButton";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Mail, Phone, MapPin, Calendar, Briefcase, Award, 
  Github, Linkedin, Globe, FileText, Shield, ArrowLeft 
} from "lucide-react";
import { toast } from "sonner";

// Demo data for leaderboard candidates
const DEMO_PROFILES: Record<string, any> = {
  "1": { full_name: "John Smith", title: "Security Analyst", location: "Washington, DC", bio: "Experienced security analyst with a passion for threat detection and incident response. CISSP and CEH certified professional with 8+ years in cybersecurity.", email: "john.smith@example.com", years_experience: 8, security_clearance: "Secret", linkedin_url: "https://linkedin.com/in/johnsmith", github_url: "https://github.com/johnsmith", certifications: [{ name: "CISSP", issuer: "ISC2", issue_date: "2020-03-15" }, { name: "CEH", issuer: "EC-Council", issue_date: "2019-06-20" }, { name: "CompTIA Security+", issuer: "CompTIA", issue_date: "2018-01-10" }], skills: ["Threat Detection", "Incident Response", "SIEM", "Network Security"] },
  "2": { full_name: "Jane Doe", title: "Penetration Tester", location: "San Francisco, CA", bio: "Penetration tester specializing in web application security. OSCP certified with experience in red team operations.", email: "jane.doe@example.com", years_experience: 6, linkedin_url: "https://linkedin.com/in/janedoe", github_url: "https://github.com/janedoe", portfolio_url: "https://janedoe.com", certifications: [{ name: "OSCP", issuer: "Offensive Security", issue_date: "2021-08-15" }, { name: "CEH", issuer: "EC-Council", issue_date: "2020-04-12" }], skills: ["Web Application Security", "Penetration Testing", "Red Team", "Exploit Development"] },
  "3": { full_name: "Alice Johnson", title: "Incident Responder", location: "New York, NY", bio: "Incident response specialist with expertise in digital forensics and malware analysis. GPEN and CySA+ certified.", email: "alice.johnson@example.com", years_experience: 7, security_clearance: "Top Secret", linkedin_url: "https://linkedin.com/in/alicejohnson", certifications: [{ name: "GPEN", issuer: "GIAC", issue_date: "2021-02-20" }, { name: "CompTIA CySA+", issuer: "CompTIA", issue_date: "2020-09-10" }], skills: ["Digital Forensics", "Malware Analysis", "Incident Response", "Threat Intelligence"] },
  "4": { full_name: "Bob Smith", title: "SOC Analyst", location: "Austin, TX", bio: "SOC analyst with strong skills in SIEM management and threat hunting. CySA+ and Security+ certified.", email: "bob.smith@example.com", years_experience: 4, linkedin_url: "https://linkedin.com/in/bobsmith", github_url: "https://github.com/bobsmith", certifications: [{ name: "CompTIA CySA+", issuer: "CompTIA", issue_date: "2022-01-15" }, { name: "CompTIA Security+", issuer: "CompTIA", issue_date: "2021-05-20" }], skills: ["SIEM", "Threat Hunting", "Log Analysis", "Security Monitoring"] },
  "5": { full_name: "Carol Davis", title: "Security Analyst", location: "Seattle, WA", bio: "Security analyst focused on vulnerability management and security architecture. CompTIA CySA+ certified.", email: "carol.davis@example.com", years_experience: 5, linkedin_url: "https://linkedin.com/in/caroldavis", certifications: [{ name: "CompTIA CySA+", issuer: "CompTIA", issue_date: "2021-11-10" }], skills: ["Vulnerability Management", "Security Architecture", "Risk Assessment"] },
  "6": { full_name: "Michael Brown", title: "Security Consultant", location: "Boston, MA", bio: "Security consultant with extensive experience in compliance and risk management. CISSP certified professional.", email: "michael.brown@example.com", years_experience: 10, security_clearance: "Secret", linkedin_url: "https://linkedin.com/in/michaelbrown", portfolio_url: "https://michaelbrown.com", certifications: [{ name: "CISSP", issuer: "ISC2", issue_date: "2018-07-15" }], skills: ["Compliance", "Risk Management", "Security Strategy", "GRC"] },
  "7": { full_name: "Emma Wilson", title: "Penetration Tester", location: "Chicago, IL", bio: "Penetration tester with expertise in network security and social engineering. CEH certified professional.", email: "emma.wilson@example.com", years_experience: 5, linkedin_url: "https://linkedin.com/in/emmawilson", github_url: "https://github.com/emmawilson", certifications: [{ name: "CEH", issuer: "EC-Council", issue_date: "2021-03-20" }], skills: ["Network Security", "Social Engineering", "Penetration Testing"] },
  "8": { full_name: "David Chen", title: "Security Engineer", location: "Los Angeles, CA", bio: "Security engineer specializing in network security and infrastructure hardening. Security+ and CCNA certified.", email: "david.chen@example.com", years_experience: 6, linkedin_url: "https://linkedin.com/in/davidchen", github_url: "https://github.com/davidchen", certifications: [{ name: "CompTIA Security+", issuer: "CompTIA", issue_date: "2020-08-15" }, { name: "CCNA", issuer: "Cisco", issue_date: "2019-12-10" }], skills: ["Network Security", "Infrastructure Security", "Firewall Management"] },
  "9": { full_name: "Sarah Martinez", title: "Threat Hunter", location: "Denver, CO", bio: "Threat hunter with advanced skills in malware analysis and threat intelligence. GCIA and CySA+ certified.", email: "sarah.martinez@example.com", years_experience: 7, security_clearance: "Top Secret", linkedin_url: "https://linkedin.com/in/sarahmartinez", certifications: [{ name: "GCIA", issuer: "GIAC", issue_date: "2021-05-15" }, { name: "CompTIA CySA+", issuer: "CompTIA", issue_date: "2020-03-20" }], skills: ["Threat Hunting", "Malware Analysis", "Threat Intelligence", "EDR"] },
  "10": { full_name: "James Taylor", title: "Security Architect", location: "Atlanta, GA", bio: "Security architect designing enterprise security solutions. CISSP and CISM certified with 12+ years experience.", email: "james.taylor@example.com", years_experience: 12, security_clearance: "Secret", linkedin_url: "https://linkedin.com/in/jamestaylor", portfolio_url: "https://jamestaylor.com", certifications: [{ name: "CISSP", issuer: "ISC2", issue_date: "2017-04-10" }, { name: "CISM", issuer: "ISACA", issue_date: "2018-09-15" }], skills: ["Security Architecture", "Enterprise Security", "Zero Trust", "Cloud Security"] },
  "11": { full_name: "Lisa Anderson", title: "SOC Analyst", location: "Phoenix, AZ", bio: "SOC analyst with experience in incident detection and response. CompTIA Security+ certified.", email: "lisa.anderson@example.com", years_experience: 3, linkedin_url: "https://linkedin.com/in/lisaanderson", certifications: [{ name: "CompTIA Security+", issuer: "CompTIA", issue_date: "2022-02-10" }], skills: ["Incident Detection", "Security Monitoring", "SIEM"] },
  "12": { full_name: "Kevin Murphy", title: "Security Analyst", location: "Portland, OR", bio: "Security analyst specializing in vulnerability assessment and penetration testing. CySA+ and CEH certified.", email: "kevin.murphy@example.com", years_experience: 5, linkedin_url: "https://linkedin.com/in/kevinmurphy", github_url: "https://github.com/kevinmurphy", certifications: [{ name: "CompTIA CySA+", issuer: "CompTIA", issue_date: "2021-06-15" }, { name: "CEH", issuer: "EC-Council", issue_date: "2020-11-20" }], skills: ["Vulnerability Assessment", "Penetration Testing", "Security Analysis"] },
  "13": { full_name: "Rachel Green", title: "Forensics Analyst", location: "Miami, FL", bio: "Digital forensics analyst with expertise in incident investigation. GCFE and CHFI certified professional.", email: "rachel.green@example.com", years_experience: 6, security_clearance: "Secret", linkedin_url: "https://linkedin.com/in/rachelgreen", certifications: [{ name: "GCFE", issuer: "GIAC", issue_date: "2021-08-10" }, { name: "CHFI", issuer: "EC-Council", issue_date: "2020-05-15" }], skills: ["Digital Forensics", "Incident Investigation", "E-Discovery"] },
  "14": { full_name: "Thomas White", title: "Penetration Tester", location: "Dallas, TX", bio: "Penetration tester focused on application security and code review. CEH certified professional.", email: "thomas.white@example.com", years_experience: 4, linkedin_url: "https://linkedin.com/in/thomaswhite", github_url: "https://github.com/thomaswhite", certifications: [{ name: "CEH", issuer: "EC-Council", issue_date: "2022-03-20" }], skills: ["Application Security", "Code Review", "Penetration Testing"] },
  "15": { full_name: "Amanda Lee", title: "Security Engineer", location: "San Diego, CA", bio: "Security engineer with strong background in cloud security. CompTIA Security+ certified.", email: "amanda.lee@example.com", years_experience: 4, linkedin_url: "https://linkedin.com/in/amandalee", github_url: "https://github.com/amandalee", certifications: [{ name: "CompTIA Security+", issuer: "CompTIA", issue_date: "2021-09-10" }], skills: ["Cloud Security", "Infrastructure Security"] },
  "16": { full_name: "Daniel Harris", title: "Cloud Security Engineer", location: "Minneapolis, MN", bio: "Cloud security engineer specializing in AWS and Azure security. CCSP and Security+ certified.", email: "daniel.harris@example.com", years_experience: 7, linkedin_url: "https://linkedin.com/in/danielharris", github_url: "https://github.com/danielharris", portfolio_url: "https://danielharris.dev", certifications: [{ name: "CCSP", issuer: "ISC2", issue_date: "2021-07-15" }, { name: "CompTIA Security+", issuer: "CompTIA", issue_date: "2020-02-20" }], skills: ["AWS Security", "Azure Security", "Cloud Architecture"] },
  "17": { full_name: "Michelle Clark", title: "Security Analyst", location: "Philadelphia, PA", bio: "Security analyst with expertise in security monitoring and log analysis. CySA+ certified professional.", email: "michelle.clark@example.com", years_experience: 4, linkedin_url: "https://linkedin.com/in/michelleclark", certifications: [{ name: "CompTIA CySA+", issuer: "CompTIA", issue_date: "2022-01-10" }], skills: ["Security Monitoring", "Log Analysis", "SIEM"] },
  "18": { full_name: "Ryan Lewis", title: "Application Security Engineer", location: "Charlotte, NC", bio: "Application security engineer focused on secure SDLC. CSSLP certified professional.", email: "ryan.lewis@example.com", years_experience: 6, linkedin_url: "https://linkedin.com/in/ryanlewis", github_url: "https://github.com/ryanlewis", portfolio_url: "https://ryanlewis.dev", certifications: [{ name: "CSSLP", issuer: "ISC2", issue_date: "2021-04-15" }], skills: ["Secure SDLC", "Application Security", "DevSecOps"] },
  "19": { full_name: "Sophia Walker", title: "SOC Analyst", location: "Detroit, MI", bio: "SOC analyst with strong analytical and problem-solving skills. Security+ certified.", email: "sophia.walker@example.com", years_experience: 3, linkedin_url: "https://linkedin.com/in/sophiawalker", certifications: [{ name: "CompTIA Security+", issuer: "CompTIA", issue_date: "2022-06-20" }], skills: ["Security Monitoring", "Incident Response", "Threat Detection"] },
  "20": { full_name: "Eric Thompson", title: "Security Consultant", location: "Las Vegas, NV", bio: "Security consultant specializing in penetration testing and security assessments. CISSP certified.", email: "eric.thompson@example.com", years_experience: 9, security_clearance: "Secret", linkedin_url: "https://linkedin.com/in/ericthompson", certifications: [{ name: "CISSP", issuer: "ISC2", issue_date: "2019-10-15" }], skills: ["Penetration Testing", "Security Assessment", "Compliance"] }
};

export default function ProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [credits, setCredits] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadProfileData();
  }, [id]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Check if this is a demo profile from leaderboard
      const demoProfile = DEMO_PROFILES[id!];
      if (demoProfile) {
        // For demo profiles, use the hardcoded data
        setProfile({
          full_name: demoProfile.full_name,
          avatar_url: null,
          location: demoProfile.location,
          bio: demoProfile.bio,
          email: demoProfile.email
        });

        setCandidateProfile({
          title: demoProfile.title,
          years_experience: demoProfile.years_experience,
          security_clearance: demoProfile.security_clearance,
          linkedin_url: demoProfile.linkedin_url,
          github_url: demoProfile.github_url,
          portfolio_url: demoProfile.portfolio_url,
          certifications: demoProfile.certifications,
          candidate_skills: demoProfile.skills?.map((skill: string) => ({
            skills: { name: skill },
            years_experience: 0,
            proficiency_level: 4
          })) || []
        });

        // For demo profiles, show as locked by default
        setIsUnlocked(false);
        setLoading(false);
        return;
      }

      // Get current user for real profiles
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(user.id);

      // Check if profile is unlocked
      const { data: unlockData } = await supabase
        .from("profile_unlocks")
        .select("id")
        .eq("employer_id", user.id)
        .eq("candidate_id", id)
        .maybeSingle();

      setIsUnlocked(!!unlockData);

      // Get employer credits
      const { data: creditData } = await supabase
        .from("employer_credits")
        .select("credits")
        .eq("employer_id", user.id)
        .maybeSingle();

      setCredits(creditData?.credits || 0);

      // Get public profile info (email visible only if unlocked)
      const profileFields = unlockData 
        ? "full_name, avatar_url, location, bio, email"
        : "full_name, avatar_url, location, bio";
        
      const { data: publicProfile } = await supabase
        .from("profiles")
        .select(profileFields)
        .eq("id", id)
        .single();

      setProfile(publicProfile);

      // Get candidate profile (visible if unlocked or if they have an application)
      const { data: candidateData } = await supabase
        .from("candidate_profiles")
        .select(`
          *,
          candidate_skills(
            skill_id,
            years_experience,
            proficiency_level,
            skills(name, category)
          ),
          certifications(name, issuer, issue_date, expiry_date, credential_url)
        `)
        .eq("user_id", id)
        .maybeSingle();

      if (candidateData) {
        setCandidateProfile(candidateData);
      }

    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockSuccess = () => {
    const demoProfile = DEMO_PROFILES[id!];
    if (demoProfile) {
      // For demo profiles, just show the unlocked state
      setIsUnlocked(true);
      toast.info("This is a demo profile from the leaderboard");
      return;
    }
    
    setIsUnlocked(true);
    setCredits(prev => prev - 1);
    loadProfileData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96 md:col-span-2" />
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <Button onClick={() => navigate("/profiles")}>Back to Profiles</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/profiles")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profiles
        </Button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar - Public Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-cyber flex items-center justify-center text-5xl mb-4">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} className="rounded-full" />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{profile.full_name || "Anonymous"}</h1>
                  {candidateProfile?.title && (
                    <p className="text-muted-foreground mb-4">{candidateProfile.title}</p>
                  )}
                </div>

                {!isUnlocked && (
                  <div className="mb-6">
                    <UnlockProfileButton
                      candidateId={id!}
                      isUnlocked={isUnlocked}
                      onUnlock={handleUnlockSuccess}
                      remainingCredits={DEMO_PROFILES[id!] ? 999 : credits}
                    />
                    {DEMO_PROFILES[id!] && (
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Demo profile - Click to preview unlocked view
                      </p>
                    )}
                  </div>
                )}

                {isUnlocked && (
                  <div className="space-y-3">
                    {profile.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="break-all">{profile.email}</span>
                      </div>
                    )}
                    {candidateProfile?.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>{candidateProfile.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                {profile.location && (
                  <div className="flex items-center gap-2 text-sm mt-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {profile.bio && (
                  <p className="text-sm text-muted-foreground mt-4">{profile.bio}</p>
                )}
              </CardContent>
            </Card>

            {isUnlocked && candidateProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {candidateProfile.linkedin_url && (
                    <a 
                      href={candidateProfile.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn Profile
                    </a>
                  )}
                  {candidateProfile.github_url && (
                    <a 
                      href={candidateProfile.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub Profile
                    </a>
                  )}
                  {candidateProfile.portfolio_url && (
                    <a 
                      href={candidateProfile.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      Portfolio
                    </a>
                  )}
                  {candidateProfile.resume_url && (
                    <a 
                      href={candidateProfile.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Download Resume
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {!isUnlocked && (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="pt-6 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Unlock Full Profile</h3>
                  <p className="text-muted-foreground mb-4">
                    Unlock this profile to view complete details including contact information, 
                    work history, skills, certifications, and more.
                  </p>
                  <UnlockProfileButton
                    candidateId={id!}
                    isUnlocked={isUnlocked}
                    onUnlock={handleUnlockSuccess}
                    remainingCredits={credits}
                  />
                </CardContent>
              </Card>
            )}

            {candidateProfile && (
              <>
                {/* Experience & Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Professional Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {candidateProfile.years_experience && (
                      <div>
                        <span className="text-sm font-semibold">Experience:</span>
                        <p className="text-muted-foreground">
                          {candidateProfile.years_experience} years
                        </p>
                      </div>
                    )}
                    {candidateProfile.security_clearance && (
                      <div>
                        <span className="text-sm font-semibold">Security Clearance:</span>
                        <p className="text-muted-foreground">{candidateProfile.security_clearance}</p>
                      </div>
                    )}
                    {candidateProfile.willing_to_relocate !== null && (
                      <div>
                        <span className="text-sm font-semibold">Willing to Relocate:</span>
                        <p className="text-muted-foreground">
                          {candidateProfile.willing_to_relocate ? "Yes" : "No"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Skills */}
                {candidateProfile?.candidate_skills?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {candidateProfile.candidate_skills.map((skill: any, idx: number) => (
                          <Badge key={idx} variant="secondary">
                            {skill.skills?.name || skill}
                            {skill.years_experience > 0 && ` (${skill.years_experience}y)`}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Certifications */}
                {candidateProfile.certifications?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {candidateProfile.certifications.map((cert: any, idx: number) => (
                        <div key={idx} className="border-b last:border-0 pb-4 last:pb-0">
                          <h4 className="font-semibold">{cert.name}</h4>
                          {cert.issuer && (
                            <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {cert.issue_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Issued: {new Date(cert.issue_date).toLocaleDateString()}
                              </span>
                            )}
                            {cert.expiry_date && (
                              <span>
                                Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {isUnlocked && cert.credential_url && (
                            <a 
                              href={cert.credential_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline mt-2 inline-block"
                            >
                              View Credential
                            </a>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
