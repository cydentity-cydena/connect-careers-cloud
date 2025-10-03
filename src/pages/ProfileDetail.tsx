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

      // Get current user
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
                      remainingCredits={credits}
                    />
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
                {candidateProfile.candidate_skills?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {candidateProfile.candidate_skills.map((skill: any, idx: number) => (
                          <Badge key={idx} variant="secondary">
                            {skill.skills.name}
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
