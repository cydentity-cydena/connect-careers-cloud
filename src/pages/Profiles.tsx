import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Lock, Star, Eye, Shield, Filter } from "lucide-react";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { SpecializationBadges } from "@/components/profiles/SpecializationBadges";
import { detectSpecializations, SPECIALIZATIONS, type Specialization } from "@/lib/specializations";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HRReadyBadge } from "@/components/hrready/HRReadyBadge";
import { ProfileBadgeDisplay } from "@/components/badges/ProfileBadgeDisplay";

interface CandidateProfile {
  id: string;
  username: string;
  title: string;
  ranking: number;
  certifications: string[];
  skills: string[];
  specializations: Specialization[];
  experience: string;
  avatar: string;
  locked: boolean;
}

const Profiles = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | 'all'>('all');
  const [hrReadyOnly, setHrReadyOnly] = useState(false);
  const [verificationStatuses, setVerificationStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    checkUserAccess();
  }, []);

  const checkUserAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view candidate profiles",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      // Check if user is employer, recruiter, admin, or candidate
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error || !roleData || roleData.length === 0) {
        setUserRole('unauthorized');
        setCheckingAccess(false);
        return;
      }

      const roles = roleData.map(r => r.role);
      
      // Employers, recruiters, and admins can browse all profiles
      // Candidates can only see their own profile for preview
      if (roles.some(role => ['employer', 'recruiter', 'admin', 'staff'].includes(role))) {
        const primaryRole = roles.find(role => ['admin', 'staff', 'employer', 'recruiter'].includes(role));
        setUserRole(primaryRole || 'employer');
        setCheckingAccess(false);
        fetchCandidates();
      } else if (roles.includes('candidate')) {
        setUserRole('candidate');
        setCheckingAccess(false);
        // Redirect candidates directly to their own profile for preview
        toast({
          title: "Profile Preview",
          description: "Viewing your profile as employers see it",
        });
        navigate(`/profiles/${user.id}`);
      } else {
        setUserRole('unauthorized');
        setCheckingAccess(false);
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setCheckingAccess(false);
    }
  };

  useEffect(() => {
    if (userRole && userRole !== 'unauthorized') {
      fetchCandidates();
    }
  }, [userRole]);

  const fetchCandidates = async () => {
    try {
      // Fetch candidate XP data
      const { data: xpData, error: xpError } = await supabase
        .from('candidate_xp')
        .select('candidate_id, total_xp')
        .order('total_xp', { ascending: false });

      if (xpError) throw xpError;
      if (!xpData || xpData.length === 0) {
        setCandidates([]);
        return;
      }

      const candidateIds = xpData.map(entry => entry.candidate_id);

      // Fetch public profile usernames via RPC (RLS-safe)
      const profileResults = await Promise.all(
        candidateIds.map(async (cid) => {
          const { data } = await supabase.rpc('get_public_profile', { profile_id: cid });
          const row = Array.isArray(data) ? data?.[0] : data;
          return { id: cid, username: row?.username ?? null, desired_job_title: (row as any)?.desired_job_title ?? null };
        })
      );

      // Fetch public candidate titles via RPC (and years_experience)
      const candidateProfileResults = await Promise.all(
        candidateIds.map(async (cid) => {
          const { data } = await supabase.rpc('get_public_candidate_profile', { profile_user_id: cid });
          const row = Array.isArray(data) ? data?.[0] : data;
          return { user_id: cid, title: row?.title ?? null, years_experience: row?.years_experience ?? 0 };
        })
      );

      // Fetch certifications
      const { data: certData } = await supabase
        .from('certifications')
        .select('candidate_id, name, issuer')
        .in('candidate_id', candidateIds);

      // Fetch skills
      const { data: skillsData } = await supabase
        .from('candidate_skills')
        .select('candidate_id, skills(name, category)')
        .in('candidate_id', candidateIds);

      // Fetch HR-Ready statuses
      const { data: verData } = await supabase
        .from('candidate_verifications')
        .select('candidate_id, hr_ready')
        .in('candidate_id', candidateIds);
      
      const verMap: Record<string, boolean> = {};
      verData?.forEach(v => {
        verMap[v.candidate_id] = v.hr_ready || false;
      });
      setVerificationStatuses(verMap);

      // Create lookup maps
      const profileMap = new Map(profileResults.map((p) => [p.id, p]));
      const candidateProfileMap = new Map(candidateProfileResults.map((cp) => [cp.user_id, cp]));
      const certsByCandidate: Record<string, any[]> = {};
      const skillsByCandidate: Record<string, any[]> = {};
      
      certData?.forEach(cert => {
        if (!certsByCandidate[cert.candidate_id]) {
          certsByCandidate[cert.candidate_id] = [];
        }
        certsByCandidate[cert.candidate_id].push(cert);
      });

      skillsData?.forEach(skill => {
        if (!skillsByCandidate[skill.candidate_id]) {
          skillsByCandidate[skill.candidate_id] = [];
        }
        skillsByCandidate[skill.candidate_id].push(skill);
      });

      // Check if current user is admin or staff
      const { data: { user } } = await supabase.auth.getUser();
      let isAdminOrStaff = false;
      
      if (user) {
        const { data: currentUserRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        if (currentUserRoles) {
          const roles = currentUserRoles.map(r => r.role);
          isAdminOrStaff = roles.some(role => ['admin', 'staff'].includes(role));
        }
      }

      // Transform to candidate profile format
      const candidateData: CandidateProfile[] = xpData.map((entry, index) => {
        const profile = profileMap.get(entry.candidate_id);
        const candidateProfile = candidateProfileMap.get(entry.candidate_id);
        const certs = certsByCandidate[entry.candidate_id] || [];
        const skills = skillsByCandidate[entry.candidate_id] || [];
        
        const specializations = detectSpecializations(skills, certs);
        
        // Use desired_job_title if set, otherwise fallback to current title
        const displayTitle = (profile as any)?.desired_job_title || candidateProfile?.title || 'Cybersecurity Professional';
        
        return {
          id: entry.candidate_id,
          username: profile?.username || 'user_anonymous',
          title: displayTitle,
          ranking: index + 1,
          certifications: certs.map(c => c.name).slice(0, 3),
          skills: skills.map(s => s.skills?.name).filter(Boolean).slice(0, 5),
          specializations,
          experience: `${candidateProfile?.years_experience || 0} years`,
          avatar: "🔒",
          locked: isAdminOrStaff ? false : index > 2 // Admins see all profiles as unlocked
        };
      });

      setCandidates(candidateData);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.certifications.some((cert) =>
        cert.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      candidate.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesSpecialization =
      selectedSpecialization === 'all' ||
      candidate.specializations.includes(selectedSpecialization);

    const matchesHRReady = !hrReadyOnly || verificationStatuses[candidate.id];

    return matchesSearch && matchesSpecialization && matchesHRReady;
  });

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 text-white";
    if (rank === 2) return "bg-gray-400 text-white";
    if (rank === 3) return "bg-orange-600 text-white";
    return "bg-primary text-primary-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Cybersecurity Talent Profiles - Verified Security Professionals"
        description="Browse verified cybersecurity professionals with CISSP, CEH, OSCP certifications. Search security analysts, penetration testers, and infosec experts."
        keywords="cybersecurity talent pool, security analyst profiles, penetration tester candidates, CISSP professionals"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 animate-fade-in">
        {checkingAccess ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Checking access...</p>
          </div>
        ) : userRole === 'unauthorized' ? (
          <div className="max-w-2xl mx-auto text-center py-16">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
            <p className="text-muted-foreground mb-6">
              This page is only accessible to employers and recruiters. Candidate profiles are private and only visible to hiring organizations.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you an employer looking to find talent? Contact us to learn more.
              </p>
              {/* <Button onClick={() => navigate('/pricing')}>
                View Employer Plans
              </Button> */}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Verified Cybersecurity Professionals</h1>
              <p className="text-muted-foreground mb-4">
                Browse pre-screened security talent
              </p>
              
              {/* HR-Ready Filter */}
              <div className="mb-4 flex items-center gap-3">
                <Button
                  variant={hrReadyOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHrReadyOnly(!hrReadyOnly)}
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {hrReadyOnly ? "Showing HR-Ready Only" : "Show All Candidates"}
                </Button>
                {hrReadyOnly && (
                  <span className="text-sm text-muted-foreground">
                    {filteredCandidates.length} verified candidate{filteredCandidates.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {/* Specialization Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by specialization:</span>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedSpecialization === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedSpecialization('all')}
                  >
                    All
                  </Badge>
                  {SPECIALIZATIONS.map((spec) => (
                    <Badge
                      key={spec.id}
                      variant={selectedSpecialization === spec.id ? 'default' : 'outline'}
                      className={`cursor-pointer ${selectedSpecialization === spec.id ? '' : spec.color}`}
                      onClick={() => setSelectedSpecialization(spec.id)}
                    >
                      <span className="mr-1">{spec.icon}</span>
                      {spec.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">Loading profiles...</p>
              </div>
            ) : (
              <>
            {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by role, certification, experience..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Profiles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate, index) => (
            <Card
              key={candidate.id}
              className="border-border shadow-card hover:scale-105 transition-transform animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <div className="bg-gradient-cyber w-20 h-20 rounded-full flex items-center justify-center text-4xl">
                      {candidate.avatar}
                    </div>
                    {verificationStatuses[candidate.id] && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5 shadow-lg">
                        <Shield className="h-4 w-4 text-primary fill-primary/20" />
                      </div>
                    )}
                    {/* Achievement Badge Display */}
                    <div className="absolute -top-1 -right-1">
                      <ProfileBadgeDisplay userId={candidate.id} size="sm" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-lg">@{candidate.username}</h3>
                      {candidate.ranking <= 3 && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                      <HRReadyBadge isReady={verificationStatuses[candidate.id]} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {candidate.title}
                    </p>
                    <Badge className={getRankBadgeColor(candidate.ranking)}>
                      Ranking: {candidate.ranking}
                      {candidate.ranking === 1 && "st"}
                      {candidate.ranking === 2 && "nd"}
                      {candidate.ranking === 3 && "rd"}
                      {candidate.ranking > 3 && "th"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Specializations */}
                  {candidate.specializations.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Specializations:</p>
                      <SpecializationBadges specializations={candidate.specializations} />
                    </div>
                  )}

                  {/* Top Skills */}
                  {candidate.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {candidate.certifications.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-1">Certifications:</p>
                      <div className="flex flex-wrap gap-1">
                        {candidate.certifications.map((cert, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">Experience:</span>{" "}
                      {candidate.experience}
                    </p>
                  </div>

                  <Button 
                    variant={candidate.locked ? "outline" : "default"} 
                    className="w-full gap-2"
                    onClick={() => navigate(`/profiles/${candidate.id}`)}
                  >
                    {candidate.locked ? (
                      <>
                        <Lock className="h-4 w-4" />
                        View & Unlock Profile
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        View Full Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

            {filteredCandidates.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No candidates found matching your search.
                </p>
              </div>
              )}
            </>
          )}
        </>
        )}
      </main>
    </div>
  );
};

export default Profiles;
