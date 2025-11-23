import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import Schema from "@/components/Schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnlockProfileButton } from "@/components/profiles/UnlockProfileButton";
import { PeerEndorsement } from "@/components/profiles/PeerEndorsement";
import { DirectMessageButton } from "@/components/messaging/DirectMessageButton";
import { SpecializationBadges } from "@/components/profiles/SpecializationBadges";
import { detectSpecializations } from "@/lib/specializations";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Mail, Phone, MapPin, Calendar, Briefcase, Award, 
  Github, Linkedin, Globe, FileText, Shield, ArrowLeft,
  Building2, GraduationCap, Code, ExternalLink, Eye, Info, ChevronDown, ChevronRight, User
} from "lucide-react";
import { CertificationCard } from "@/components/certifications/CertificationCard";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HRReadyBadge } from "@/components/hrready/HRReadyBadge";
import { CandidateAvatar } from "@/components/profiles/CandidateAvatar";
import { AssessmentResults } from "@/components/profiles/AssessmentResults";
import { ProfileBadgeDisplay } from "@/components/badges/ProfileBadgeDisplay";
import { PushCandidateButton } from "@/components/integrations/PushCandidateButton";
import { HighValueBadges } from "@/components/profiles/HighValueBadges";

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
  const [viewerRole, setViewerRole] = useState<string | null>(null);
  const [candidateXp, setCandidateXp] = useState<any>(null);
  const [viewingResumeUrl, setViewingResumeUrl] = useState<string | null>(null);
  const [viewingResumeName, setViewingResumeName] = useState<string>("");
  const [certificationsOpen, setCertificationsOpen] = useState(false);
  const [workHistoryOpen, setWorkHistoryOpen] = useState(false);
  const [educationOpen, setEducationOpen] = useState(false);
  const [verification, setVerification] = useState<any>(null);

  useEffect(() => {
    loadProfileData();
  }, [id]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Get current user (optional)
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);

      // Get viewer's role
      let viewerRoleValue = null;
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        if (roleData && roleData.length > 0) {
          const roles = roleData.map(r => r.role);
          // Check if admin first, then staff, then other roles
          viewerRoleValue = roles.find(role => ['admin', 'staff'].includes(role)) || roles[0];
        }
        setViewerRole(viewerRoleValue);
      }

      // Determine unlock status and credits if logged in
      let unlocked = false;
      const isOwnProfile = user?.id === id;
      const isAdmin = viewerRoleValue === 'admin' || viewerRoleValue === 'staff';
      
      if (isOwnProfile) {
        // Always show full profile to the owner
        unlocked = true;
      } else if (isAdmin) {
        // Admins have full access to all profiles without unlocking
        unlocked = true;
      } else if (user) {
        // For employers/recruiters, check unlock status
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
        .select("id, full_name, username, avatar_url, location, bio, email, desired_job_title, tryhackme_username, hackthebox_username, tryhackme_rank, hackthebox_rank, tryhackme_level, tryhackme_points, tryhackme_badges, hackthebox_points, hackthebox_rank_text, hackthebox_user_owns")
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

      console.log('Candidate profile data:', candidateDirect);

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

      // Fetch candidate XP for community view (always visible)
      const { data: xpData } = await supabase
        .from('candidate_xp')
        .select('*')
        .eq('candidate_id', id)
        .maybeSingle();
      setCandidateXp(xpData);

      // Fetch resumes if unlocked (only visible ones for employers)
      if (unlocked) {
        const { data: resumesData, error: resumesError } = await supabase
          .from('candidate_resumes')
          .select('id, resume_name, resume_type, resume_url, is_primary, created_at, is_visible_to_employers')
          .eq('candidate_id', id)
          .eq('is_visible_to_employers', true) // Only show resumes candidate made visible
          .order('is_primary', { ascending: false });
        
        console.log('Fetched resumes data:', { resumesData, resumesError });
        
        if (resumesData) {
          const resumesWithSignedUrls = await Promise.all(
            resumesData.map(async (resume) => {
              console.log('Processing resume:', resume);
              
              const normalizePath = (value: string) => value
                .replace(/^\/?resumes\//, '')
                .replace(/^\//, '');

              // If it's already a full URL or data URL, keep as is
              if (resume.resume_url.startsWith('http') || resume.resume_url.startsWith('data:')) {
                console.log('Resume already has full URL, skipping signed URL generation');
                return resume;
              }

              try {
                const normalizedPath = normalizePath(resume.resume_url);
                console.log('Generating signed URL for path:', normalizedPath);
                
                const { data: signedData, error: signedError } = await supabase.storage
                  .from('resumes')
                  .createSignedUrl(normalizedPath, 3600); // 1 hour expiry
                
                console.log('Signed URL result:', { signedData, signedError });
                
                if (signedData?.signedUrl) {
                  return { ...resume, resume_url: signedData.signedUrl };
                }
                
                if (signedError) {
                  console.error('Error generating signed URL:', signedError);
                }
              } catch (error) {
                console.error('Exception generating signed URL for resume:', error);
              }
              return resume;
            })
          );
          console.log('Final resumes with signed URLs:', resumesWithSignedUrls);
          setResumes(resumesWithSignedUrls);
        }
      }

      // Fetch verification status (publicly visible)
      const { data: verificationData } = await supabase
        .from('candidate_verifications')
        .select('hr_ready, identity_status, rtw_status, logistics_status, compliance_score, clearance_level, pci_qsa_status')
        .eq('candidate_id', id)
        .maybeSingle();
      setVerification(verificationData);

    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile: " + (error.message || "Unknown error"));
      // Set loading to false even on error so the UI can show something
      setLoading(false);
      // Keep profile as null to show "not found" message
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockSuccess = () => {
    setIsUnlocked(true);
    setCredits(prev => prev - 1);
    loadProfileData();
  };

  const handleViewResume = async (resumeUrl: string, resumeName: string) => {
    try {
      console.log('handleViewResume called with:', { resumeUrl, resumeName });
      
      // If it's already a data URL or full http URL, use it directly
      if (resumeUrl.startsWith('data:') || resumeUrl.startsWith('http')) {
        console.log('Resume already has full URL or data URL, using directly');
        const separator = resumeUrl.includes('#') ? '&' : '#';
        const zoomUrl = `${resumeUrl}${separator}zoom=page-width`;
        setViewingResumeUrl(zoomUrl);
        setViewingResumeName(resumeName);
        return;
      }
      
      // Normalize to a bucket-relative path (no leading slash or 'resumes/')
      const derivePath = (value: string) => {
        try {
          if (value.startsWith("http")) {
            const url = new URL(value);
            const match = url.pathname.match(/\/object\/(?:public|sign)\/resumes\/(.*)$/);
            if (match?.[1]) {
              console.log('Extracted path from URL:', match[1]);
              return match[1];
            }
          }
        } catch (e) {
          console.error('Error parsing URL:', e);
        }
        // strip leading slash and optional 'resumes/' prefix
        const cleaned = value.replace(/^\/?resumes\//, '').replace(/^\//, '');
        console.log('Cleaned path:', cleaned);
        return cleaned;
      };

      const filePath = derivePath(resumeUrl);
      console.log('Final file path for signed URL:', filePath);

      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(filePath, 3600);

      console.log('Signed URL response:', { data, error });

      if (error) {
        console.error('Supabase storage error:', error);
        throw error;
      }
      
      if (!data?.signedUrl) {
        throw new Error('No signed URL returned from storage');
      }

      const signed = data.signedUrl;
      console.log('Generated signed URL:', signed);
      
      const separator = signed.includes('#') ? '&' : '#';
      const zoomUrl = `${signed}${separator}zoom=page-width`;
      
      setViewingResumeUrl(zoomUrl);
      setViewingResumeName(resumeName);
    } catch (error: any) {
      console.error('Error loading resume - full details:', error);
      toast.error('Failed to load resume', {
        description: error?.message || 'Unable to load the resume file',
      });
    }
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
        <SEO 
          title="Profile Not Found - Cydena"
          description="The requested profile could not be found."
        />
        <Navigation />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The profile you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </main>
      </div>
    );
  }

  const isOwnProfile = currentUserId === id;
  const isCandidateViewingCandidate = viewerRole === 'candidate' && !isOwnProfile;

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={`${profile.username || 'Profile'} - Cybersecurity Professional on Cydena`}
        description={`${candidateProfile?.title || 'Cybersecurity professional'} with verified certifications and experience. ${profile.bio || ''}`}
      />
      <Schema type="breadcrumb" data={{
        items: [
          { name: "Home", path: "/" },
          { name: "Profiles", path: "/profiles" },
          { name: profile.username || "Profile", path: `/profiles/${id}` }
        ]
      }} />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(isOwnProfile ? "/dashboard" : "/profiles")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {isOwnProfile ? "Back to Dashboard" : "Back to Profiles"}
        </Button>

        {isOwnProfile && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/10 rounded-full p-2 flex-shrink-0">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Unlocked Profile Preview
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  You're viewing your <strong>unlocked profile</strong> - exactly what employers and recruiters see after spending credits to unlock your full details (name, email, resumes, work history, etc.).
                </p>
                <p className="text-sm text-muted-foreground">
                  To edit your profile, go to <Button variant="link" className="h-auto p-0 text-sm" onClick={() => navigate('/profile')}>Profile Settings</Button>.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar - Public Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="relative mb-4">
                    <CandidateAvatar
                      avatarUrl={profile.avatar_url}
                      username={profile.username}
                      fullName={isUnlocked ? profile.full_name : undefined}
                      isHrReady={verification?.hr_ready}
                      size="xl"
                      showGradientRing
                      className=""
                    />
                    {/* Achievement Badge Display */}
                    <div className="absolute -bottom-2 -right-2">
                      <ProfileBadgeDisplay userId={id!} size="lg" />
                    </div>
                  </div>
                  <div className="w-full">
                    {!isUnlocked && (
                      <div className="bg-muted/50 rounded-lg p-3 mb-3 text-xs text-muted-foreground">
                        <Shield className="h-4 w-4 inline mr-1" />
                        Full name and contact details unlocked for employers
                      </div>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold mb-1">
                    {isUnlocked && profile.full_name ? profile.full_name : `@${profile.username || "anonymous"}`}
                  </h1>
                  {isUnlocked && profile.full_name && (
                    <p className="text-sm text-muted-foreground mb-2">@{profile.username || "anonymous"}</p>
                  )}
                  {candidateProfile?.title && (
                    <p className="text-muted-foreground mb-2">{candidateProfile.title}</p>
                  )}
                  <div className="flex flex-col items-center gap-2 mb-2">
                    {verification?.hr_ready && (
                      <HRReadyBadge isReady={true} size="md" />
                    )}
                    <HighValueBadges 
                      clearanceLevel={verification?.clearance_level}
                      pciQsaStatus={verification?.pci_qsa_status}
                      certifications={candidateProfile?.certifications?.map((c: any) => c.name) || []}
                    />
                  </div>
                  {profile.desired_job_title && (
                    <div className="flex items-center gap-2 justify-center">
                      <Badge variant="secondary" className="text-xs">
                        Seeking: {profile.desired_job_title}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="mb-6 space-y-2">
                  {!isCandidateViewingCandidate && !isUnlocked && (
                    <UnlockProfileButton
                      candidateId={id!}
                      isUnlocked={isUnlocked}
                      onUnlock={handleUnlockSuccess}
                      remainingCredits={credits}
                      viewerRole={viewerRole}
                    />
                  )}
                  {isUnlocked && currentUserId && !isCandidateViewingCandidate && (
                    <>
                      <DirectMessageButton
                        recipientId={id!}
                        recipientName={profile.full_name || profile.username || "Candidate"}
                        variant="default"
                      />
                      {(viewerRole === 'employer' || viewerRole === 'recruiter') && (
                        <PushCandidateButton 
                          candidateId={id!}
                          candidateName={profile.full_name || profile.username}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Community Stats for Candidates */}
                {isCandidateViewingCandidate && candidateXp && (
                  <div className="space-y-3 border-t pt-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Level</p>
                      <p className="text-3xl font-bold text-primary">{candidateXp.level}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total XP</p>
                        <p className="text-xl font-semibold">{candidateXp.total_xp}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Points</p>
                        <p className="text-xl font-semibold">{candidateXp.community_points}</p>
                      </div>
                    </div>
                  </div>
                )}

                {isUnlocked && !isCandidateViewingCandidate && (
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

            {isUnlocked && candidateProfile && !isCandidateViewingCandidate && (
              candidateProfile.linkedin_url || 
              candidateProfile.github_url || 
              candidateProfile.portfolio_url || 
              candidateProfile.resume_url
            ) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {candidateProfile.linkedin_url && (
                    <a 
                      href={candidateProfile.linkedin_url.startsWith('http') ? candidateProfile.linkedin_url : `https://linkedin.com${candidateProfile.linkedin_url}`}
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
                      href={candidateProfile.github_url.startsWith('http') ? candidateProfile.github_url : `https://github.com/${candidateProfile.github_url.replace(/^\//, '')}`}
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
                      href={candidateProfile.portfolio_url.startsWith('http') ? candidateProfile.portfolio_url : `https://${candidateProfile.portfolio_url}`}
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
            
            {/* Info banner for candidates viewing candidates */}
            {isCandidateViewingCandidate && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Community Profile View</h3>
                      <p className="text-sm text-muted-foreground">
                        You're viewing {profile.username}'s community profile. Professional details like work history and contact information are only visible to employers and recruiters. You can see their skills, certifications, and provide endorsements.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isUnlocked && !isCandidateViewingCandidate && (
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
                    viewerRole={viewerRole}
                  />
                </CardContent>
              </Card>
            )}

            {candidateProfile && (
              <>
                {/* Experience & Details - Hidden for candidates viewing candidates */}
                {!isCandidateViewingCandidate && (
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
                      {candidateProfile.work_mode_preference && (
                        <div>
                          <span className="text-sm font-semibold">Work Mode Preference:</span>
                          <p className="text-muted-foreground capitalize">
                            {candidateProfile.work_mode_preference}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Skills & Specializations */}
                {candidateProfile?.candidate_skills?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills & Specializations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Specialization Badges */}
                      {candidateProfile.candidate_skills && candidateProfile.certifications && (() => {
                        const savedSpecs = candidateProfile.specializations;
                        const autoDetected = detectSpecializations(
                          candidateProfile.candidate_skills,
                          candidateProfile.certifications
                        );
                        const specsToShow = savedSpecs && savedSpecs.length > 0 ? savedSpecs : autoDetected;
                        console.log('Specializations debug:', { savedSpecs, autoDetected, specsToShow });
                        
                        return (
                          <div>
                            <p className="text-sm font-semibold mb-2">Specializations:</p>
                            <SpecializationBadges 
                              specializations={specsToShow} 
                              showAll
                            />
                          </div>
                        );
                      })()}
                      
                      {/* Skills List */}
                      <div>
                        <p className="text-sm font-semibold mb-2">Technical Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {candidateProfile.candidate_skills.map((skill: any, idx: number) => (
                            <Badge key={idx} variant="secondary">
                              {skill.skills?.name || skill}
                              {skill.years_experience > 0 && ` (${skill.years_experience}y)`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Certifications - Always visible for community credibility */}
                {candidateProfile.certifications?.length > 0 && (
                  <Collapsible open={certificationsOpen} onOpenChange={setCertificationsOpen}>
                    <div className="space-y-3">
                      <CollapsibleTrigger asChild>
                        <button className="p-0 w-full text-left cursor-pointer bg-transparent border-0">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            {certificationsOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                            <Award className="h-5 w-5" />
                            Certifications
                            <span className="text-sm text-muted-foreground font-normal">({candidateProfile.certifications.length})</span>
                          </h3>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-3">
                        {candidateProfile.certifications.map((cert: any, idx: number) => (
                          <CertificationCard
                            key={idx}
                            certification={cert}
                            isUnlocked={isUnlocked && !isCandidateViewingCandidate}
                            showCredentialUrl={isUnlocked && !isCandidateViewingCandidate}
                          />
                        ))}
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                )}


                {/* AI Skills Assessments */}
                <AssessmentResults candidateId={id!} />

                {/* Resumes (Unlocked Only) - Hidden for candidates */}
                {isUnlocked && resumes.length > 0 && !isCandidateViewingCandidate && (
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
                            onClick={() => handleViewResume(resume.resume_url, resume.resume_name)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Work History - Hidden for candidates viewing candidates */}
                {workHistory.length > 0 && !isCandidateViewingCandidate && (
                  <Collapsible open={workHistoryOpen} onOpenChange={setWorkHistoryOpen}>
                    <Card>
                      <CardHeader>
                        <CollapsibleTrigger asChild>
                          <button className="p-0 w-full text-left cursor-pointer bg-transparent border-0">
                            <CardTitle className="flex items-center gap-2">
                              {workHistoryOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                              <Building2 className="h-5 w-5" />
                              Work Experience
                              <span className="text-sm text-muted-foreground font-normal">({workHistory.length})</span>
                            </CardTitle>
                          </button>
                        </CollapsibleTrigger>
                      </CardHeader>
                      <CollapsibleContent>
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
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )}

                {/* Projects - Hidden for candidates viewing candidates */}
                {projects.length > 0 && !isCandidateViewingCandidate && (
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

                {/* Education - Hidden for candidates viewing candidates */}
                {education.length > 0 && !isCandidateViewingCandidate && (
                  <Collapsible open={educationOpen} onOpenChange={setEducationOpen}>
                    <Card>
                      <CardHeader>
                        <CollapsibleTrigger asChild>
                          <button className="p-0 w-full text-left cursor-pointer bg-transparent border-0">
                            <CardTitle className="flex items-center gap-2">
                              {educationOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                              <GraduationCap className="h-5 w-5" />
                              Education
                              <span className="text-sm text-muted-foreground font-normal">({education.length})</span>
                            </CardTitle>
                          </button>
                        </CollapsibleTrigger>
                      </CardHeader>
                      <CollapsibleContent>
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
                                    {new Date(edu.start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })} - {edu.end_date ? new Date(edu.end_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Present'}
                                  </span>
                                )}
                                {edu.gpa && (
                                  <span>Grade: {edu.gpa}</span>
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
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )}

              </>
            )}
          </div>
        </div>

        {/* Resume Viewer Dialog */}
        <Dialog open={!!viewingResumeUrl} onOpenChange={(open) => !open && setViewingResumeUrl(null)}>
          <DialogContent className="max-w-none w-screen h-screen p-0 sm:rounded-none flex flex-col">
            <DialogHeader className="px-4 py-3 border-b">
              <DialogTitle>{viewingResumeName} - Resume</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              {viewingResumeUrl && (
                <iframe
                  src={viewingResumeUrl}
                  className="w-full h-full border-0"
                  title="Resume Viewer"
                  onError={(e) => {
                    console.error('Iframe failed to load:', e);
                    toast.error('Failed to display resume', {
                      description: 'The resume file could not be displayed in the browser',
                    });
                  }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
