import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnlockProfileButton } from "@/components/profiles/UnlockProfileButton";
import { PeerEndorsement } from "@/components/profiles/PeerEndorsement";
import { DirectMessageButton } from "@/components/messaging/DirectMessageButton";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Mail, Phone, MapPin, Calendar, Briefcase, Award, 
  Github, Linkedin, Globe, FileText, Shield, ArrowLeft,
  Building2, GraduationCap, Code, ExternalLink
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
  const [workHistory, setWorkHistory] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);

  useEffect(() => {
    loadProfileData();
  }, [id]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Get current user (optional)
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);

      // Determine unlock status and credits if logged in
      let unlocked = false;
      if (user) {
        const { data: unlockData } = await supabase
          .from("profile_unlocks")
          .select("id")
          .eq("employer_id", user.id)
          .eq("candidate_id", id)
          .maybeSingle();
        unlocked = !!unlockData;

        const { data: creditData } = await supabase
          .from("employer_credits")
          .select("credits")
          .eq("employer_id", user.id)
          .maybeSingle();
        setCredits(creditData?.credits || 0);
      }
      setIsUnlocked(unlocked);

      // Fetch profile - try direct, fallback to public RPC (RLS-safe)
      let profileData: any = null;
      const { data: directProfile } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, location, bio, email")
        .eq("id", id)
        .maybeSingle();

      if (directProfile) {
        profileData = { ...directProfile };
        if (!unlocked) {
          profileData.email = null;
          profileData.full_name = null; // Hide real name until unlocked
        }
      } else {
        const { data: rpcProfile } = await supabase.rpc('get_public_profile', { profile_id: id });
        const row = Array.isArray(rpcProfile) ? rpcProfile?.[0] : rpcProfile;
        profileData = row || null;
      }
      setProfile(profileData);

      // Fetch candidate profile with skills and certs - try direct, fallback to public RPC
      const { data: candidateDirect } = await supabase
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

      if (candidateDirect) {
        setCandidateProfile(candidateDirect);
      } else {
        const { data: rpcCandidate } = await supabase.rpc('get_public_candidate_profile', { profile_user_id: id });
        const base = Array.isArray(rpcCandidate) ? rpcCandidate?.[0] : rpcCandidate;

        // Publicly readable tables for skills and certifications
        const [{ data: skills }, { data: certs }] = await Promise.all([
          supabase
            .from("candidate_skills")
            .select(`years_experience, proficiency_level, skills(name, category)`) 
            .eq("candidate_id", id),
          supabase
            .from("certifications")
            .select("name, issuer, issue_date, expiry_date, credential_url")
            .eq("candidate_id", id),
        ]);

        setCandidateProfile({
          ...base,
          candidate_skills: skills || [],
          certifications: certs || [],
        });
      }

      // Fetch work history, projects, education
      const workPromise = supabase
        .from('work_history')
        .select('*')
        .eq('candidate_id', id)
        .order('start_date', { ascending: false });
      
      const projectsPromise = supabase
        .from('projects')
        .select('*')
        .eq('candidate_id', id)
        .order('start_date', { ascending: false });
      
      const educationPromise = supabase
        .from('education')
        .select('*')
        .eq('candidate_id', id)
        .order('start_date', { ascending: false });

      const [{ data: workData }, { data: projectsData }, { data: educationData }] = await Promise.all([
        workPromise,
        projectsPromise,
        educationPromise
      ]);

      setWorkHistory(workData || []);
      setProjects(projectsData || []);
      setEducation(educationData || []);

      // Fetch resumes if unlocked
      if (unlocked) {
        const { data: resumesData } = await supabase
          .from('candidate_resumes')
          .select('id, resume_name, resume_type, resume_url, is_primary, created_at')
          .eq('candidate_id', id)
          .order('is_primary', { ascending: false });
        
        setResumes(resumesData || []);
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
                      <img src={profile.avatar_url} alt={profile.username || "User"} className="rounded-full" />
                    ) : (
                      "👤"
                    )}
                  </div>
                  {isUnlocked && profile.full_name ? (
                    <>
                      <h1 className="text-2xl font-bold mb-1">{profile.full_name}</h1>
                      <p className="text-sm text-muted-foreground mb-2">@{profile.username || "anonymous"}</p>
                    </>
                  ) : (
                    <h1 className="text-2xl font-bold mb-2">@{profile.username || "anonymous"}</h1>
                  )}
                  {candidateProfile?.title && (
                    <p className="text-muted-foreground mb-4">{candidateProfile.title}</p>
                  )}
                </div>

                <div className="mb-6 space-y-2">
                  {!isUnlocked && (
                    <UnlockProfileButton
                      candidateId={id!}
                      isUnlocked={isUnlocked}
                      onUnlock={handleUnlockSuccess}
                      remainingCredits={credits}
                    />
                  )}
                  {isUnlocked && currentUserId && (
                    <DirectMessageButton
                      recipientId={id!}
                      recipientName={profile.full_name || profile.username || "Candidate"}
                      variant="default"
                    />
                  )}
                </div>

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
            {/* Peer Endorsements - Always visible */}
            <PeerEndorsement candidateId={id!} currentUserId={currentUserId} />
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

                {/* Resumes (Unlocked Only) */}
                {isUnlocked && resumes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Resumes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {resumes.map((resume: any) => (
                        <div
                          key={resume.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{resume.resume_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {resume.resume_type}
                              {resume.is_primary && " • Primary"}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(resume.resume_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Work History */}
                {workHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Work Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {workHistory.map((work, idx) => (
                        <div key={idx} className="border-b last:border-0 pb-6 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-lg">{work.role}</h4>
                              <p className="text-muted-foreground">{work.company}</p>
                            </div>
                            {work.is_current && (
                              <Badge variant="default">Current</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            {work.start_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(work.start_date).toLocaleDateString()} - {work.end_date ? new Date(work.end_date).toLocaleDateString() : 'Present'}
                              </span>
                            )}
                            {work.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {work.location}
                              </span>
                            )}
                          </div>
                          {work.description && (
                            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                              {work.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {projects.map((project, idx) => (
                        <div key={idx} className="border-b last:border-0 pb-6 last:pb-0">
                          <h4 className="font-semibold text-lg mb-2">{project.name}</h4>
                          {project.description && (
                            <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line">
                              {project.description}
                            </p>
                          )}
                          {project.tech_stack && project.tech_stack.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.tech_stack.map((tech: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-3">
                            {project.url && (
                              <a 
                                href={project.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View Project
                              </a>
                            )}
                            {project.github_url && (
                              <a 
                                href={project.github_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                              >
                                <Github className="h-3 w-3" />
                                View Code
                              </a>
                            )}
                          </div>
                          {(project.start_date || project.end_date) && (
                            <div className="text-xs text-muted-foreground mt-2">
                              {project.start_date && new Date(project.start_date).toLocaleDateString()}
                              {project.start_date && project.end_date && ' - '}
                              {project.end_date && new Date(project.end_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Education */}
                {education.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {education.map((edu, idx) => (
                        <div key={idx} className="border-b last:border-0 pb-6 last:pb-0">
                          <h4 className="font-semibold text-lg">{edu.degree}</h4>
                          <p className="text-muted-foreground">{edu.institution}</p>
                          {edu.field_of_study && (
                            <p className="text-sm text-muted-foreground mt-1">{edu.field_of_study}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                            {edu.start_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(edu.start_date).toLocaleDateString()} - {edu.end_date ? new Date(edu.end_date).toLocaleDateString() : 'Present'}
                              </span>
                            )}
                            {edu.gpa && (
                              <span>GPA: {edu.gpa}</span>
                            )}
                          </div>
                          {edu.description && (
                            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                              {edu.description}
                            </p>
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
