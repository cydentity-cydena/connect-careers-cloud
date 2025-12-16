import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Briefcase, FileText, TrendingUp, CheckCircle, ArrowRight, Eye, Bug, Share2, Sparkles, Award, Target, ChevronRight } from "lucide-react";
import { ProfileStrengthMeter } from "@/components/gamification/ProfileStrengthMeter";
import { AchievementBadges } from "@/components/gamification/AchievementBadges";
import { XPSystemInfo } from "@/components/gamification/XPSystemInfo";
import { RecentPointsFeed } from "@/components/rewards/RecentPointsFeed";
import { ProfileViewsNotification } from "./ProfileViewsNotification";
import { MultipleResumesManager } from "./MultipleResumesManager";
import { BoostYourScore } from "./BoostYourScore";
import { SkillsAssessmentCTA } from "./SkillsAssessmentCTA";
import { UsernameChangeDialog } from "./UsernameChangeDialog";
import { ApplicationTracker } from "./ApplicationTracker";
import { HRReadyCTA } from "./HRReadyCTA";
import { BadgeSelector } from "@/components/badges/BadgeSelector";
import { CertificationManager } from "@/components/certifications/CertificationManager";
import { ReferralSystem } from "./ReferralSystem";
import { ReferralBlitzBanner } from "./ReferralBlitzBanner";
import { CareerPathsAI } from "./CareerPathsAI";
import { SecurityIQ } from "./SecurityIQ";
import { ShareProfileCard } from "@/components/sharing/ShareProfileCard";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const CandidateDashboard = () => {
  const [userId, setUserId] = useState<string>("");
  const [xpData, setXpData] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");
  const [userCreatedAt, setUserCreatedAt] = useState<Date | null>(null);
  const [showGettingStarted, setShowGettingStarted] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const navigate = useNavigate();

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      loadXpData(user.id);
      loadUserProfile(user.id);
      
      // Backfill achievements on dashboard load (runs silently)
      supabase.functions.invoke('backfill-achievements').catch(err => 
        console.log('Achievement backfill skipped:', err.message)
      );
    }
  };

  const loadUserProfile = async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, username, created_at')
      .eq('id', uid)
      .single();
    
    if (data) {
      // Use username if available, otherwise use full_name, or fall back to "Candidate"
      setUserName(data.username || data.full_name?.split(' ')[0] || 'Candidate');
      
      // Check if account is older than 7 days
      const createdDate = new Date(data.created_at);
      setUserCreatedAt(createdDate);
      const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      setShowGettingStarted(daysSinceCreation < 7);
    }
    
    setIsLoadingProfile(false);
  };

  const loadXpData = async (uid: string) => {
    const { data } = await supabase
      .from('candidate_xp')
      .select('*')
      .eq('candidate_id', uid)
      .maybeSingle();
    
    if (data) {
      setXpData(data);
    }
  };

  const { data: authData } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data; // { user }
    },
  });
  const user = authData?.user;

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, username_changes')
        .eq('id', user?.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch profile views from this week
  const { data: profileViewsCount = 0 } = useQuery({
    queryKey: ['profile-views-week', userId],
    queryFn: async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count, error } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('candidate_id', userId)
        .gte('viewed_at', oneWeekAgo.toISOString());
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });

  // Fetch active applications count
  const { data: applicationsCount = 0 } = useQuery({
    queryKey: ['applications-count', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('candidate_id', userId);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });

  // Fetch skills count
  const { data: skillsCount = 0 } = useQuery({
    queryKey: ['skills-count', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('candidate_skills')
        .select('*', { count: 'exact', head: true })
        .eq('candidate_id', userId);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });

  // Fetch certifications for share card
  const { data: certifications = [] } = useQuery({
    queryKey: ['certifications-for-share', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certifications')
        .select('name')
        .eq('candidate_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Fetch candidate profile for specializations
  const { data: candidateProfile } = useQuery({
    queryKey: ['candidate-profile-share', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidate_profiles')
        .select('specializations, title')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch HR-Ready status
  const { data: hrReadyStatus } = useQuery({
    queryKey: ['hr-ready-status', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidate_verifications')
        .select('hr_ready')
        .eq('candidate_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data?.hr_ready || false;
    },
    enabled: !!userId,
  });

  // Fetch CTF rank
  const { data: ctfRank } = useQuery({
    queryKey: ['ctf-rank', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ctf_leaderboard')
        .select('id, total_points')
        .order('total_points', { ascending: false });
      
      if (error) throw error;
      if (!data) return null;
      
      const rankIndex = data.findIndex(entry => entry.id === userId);
      return rankIndex >= 0 ? rankIndex + 1 : null;
    },
    enabled: !!userId,
  });

  // Fetch achievements count
  const { data: achievementsCount = 0 } = useQuery({
    queryKey: ['achievements-count', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });

  // Fetch top skills for share card
  const { data: topSkills = [] } = useQuery({
    queryKey: ['top-skills', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidate_skills')
        .select('skills(name)')
        .eq('candidate_id', userId)
        .order('proficiency_level', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data?.map((s: any) => s.skills?.name).filter(Boolean) || [];
    },
    enabled: !!userId,
  });

  // Calculate XP progress to next level
  const calculateXpProgress = () => {
    if (!xpData) return 0;
    const currentLevel = xpData.level || 1;
    const currentXp = xpData.total_xp || 0;
    const xpForCurrentLevel = currentLevel * 100;
    const xpForNextLevel = (currentLevel + 1) * 100;
    const xpIntoLevel = currentXp - (currentLevel * (currentLevel - 1) / 2 * 100);
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    return Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100));
  };

  const [showMoreFeatures, setShowMoreFeatures] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Campaign Banner - Only shows if active */}
      <ReferralBlitzBanner />

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: WELCOME HEADER + QUICK STATS (Primary Focus)
          Visual weight: HIGH - First thing users see
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-background via-primary/5 to-background border border-border/50 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Welcome Message */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold">Welcome, {userName}</h1>
              <div className="flex items-center gap-1">
                <BadgeSelector />
                <XPSystemInfo />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Manage your profile and find your next opportunity
            </p>
            
            {/* XP Stats - Inline */}
            {xpData && (
              <div className="flex items-center gap-3 mt-4">
                <div className="bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Level {xpData.level}</span>
                </div>
                <div className="bg-secondary/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium">{xpData.total_xp} XP</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats - Right Side */}
          <div className="flex gap-4 md:gap-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">{profileViewsCount}</div>
              <div className="text-xs text-muted-foreground">Views This Week</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-secondary">{applicationsCount}</div>
              <div className="text-xs text-muted-foreground">Applications</div>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-accent">{skillsCount}</div>
              <div className="text-xs text-muted-foreground">Skills</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2: PRIMARY ACTIONS (Profile Completion + Job Search)
          Visual weight: HIGH - Clear call to action
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Strength - Takes 2 columns on large screens */}
        {userId && (
          <div className="lg:col-span-2">
            <ProfileStrengthMeter userId={userId} />
          </div>
        )}

        {/* Primary CTA Card */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-primary" />
              Find Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Browse cybersecurity roles matched to your skills
            </p>
            <Button 
              variant="cyber" 
              className="w-full"
              onClick={() => navigate('/jobs')}
            >
              Browse Jobs
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* HR-Ready CTA - Shows only if not verified */}
      {userId && <HRReadyCTA userId={userId} />}

      {/* Getting Started Guide - Only for new users */}
      {!isLoadingProfile && showGettingStarted && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Getting Started</CardTitle>
            <CardDescription>Quick steps to set up your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/profile" className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-sm">1</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors">Complete Profile</h3>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              
              <Link to="/jobs" className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-sm">2</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors">Browse Jobs</h3>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              
              <Link to="/skills" className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-sm">3</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors">Add Skills</h3>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3: PROFILE MANAGEMENT (Tabbed Interface)
          Visual weight: MEDIUM - Organized secondary features
      ═══════════════════════════════════════════════════════════════════════ */}
      {userId && (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="resume" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Resume</span>
            </TabsTrigger>
            <TabsTrigger value="certs" className="gap-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Certifications</span>
            </TabsTrigger>
            <TabsTrigger value="share" className="gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{profile?.full_name || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Username</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">@{profile?.username || 'Not set'}</span>
                        {profile?.username && user?.id && (
                          <UsernameChangeDialog 
                            currentUsername={profile.username}
                            usernameChanges={profile.username_changes || 0}
                            userId={user.id}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium truncate ml-4">{profile?.email}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="cyber" className="flex-1" onClick={() => navigate('/profile')}>
                      Edit Profile
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/profiles/${userId}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent" />
                    Skills & Specializations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Showcase your cybersecurity expertise
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/skills')}>
                    Manage Skills
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/specializations')}>
                    Manage Specializations
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Profile Views */}
            <ProfileViewsNotification />
          </TabsContent>

          <TabsContent value="resume">
            <MultipleResumesManager />
          </TabsContent>

          <TabsContent value="certs">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-accent" />
                      Your Certifications
                    </CardTitle>
                    <CardDescription>Manage and verify your credentials</CardDescription>
                  </div>
                  <Button onClick={() => navigate('/certifications')}>
                    Add Certification
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CertificationManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="share">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  Share Your Profile
                </CardTitle>
                <CardDescription>Promote yourself on social media</CardDescription>
              </CardHeader>
              <CardContent>
                <ShareProfileCard
                  userName={userName}
                  title={candidateProfile?.title || profile?.desired_job_title}
                  avatarUrl={profile?.avatar_url}
                  level={xpData?.level || 1}
                  totalXp={xpData?.total_xp || 0}
                  certCount={certifications.length}
                  certNames={certifications.map(c => c.name)}
                  specializations={candidateProfile?.specializations || []}
                  skills={topSkills}
                  isHrReady={hrReadyStatus}
                  profileUrl={`https://cydena.com/profiles/${userId}`}
                  ctfRank={ctfRank}
                  achievementsCount={achievementsCount}
                  memberSince={userCreatedAt}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4: APPLICATIONS & PROGRESS
          Visual weight: MEDIUM
      ═══════════════════════════════════════════════════════════════════════ */}
      <ApplicationTracker />

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 5: AI FEATURES & GROWTH (Collapsible)
          Visual weight: LOW - Expandable for power users
      ═══════════════════════════════════════════════════════════════════════ */}
      <Collapsible open={showMoreFeatures} onOpenChange={setShowMoreFeatures}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {showMoreFeatures ? 'Hide' : 'Show'} AI Features & Growth Tools
            </span>
            <ChevronRight className={`h-4 w-4 transition-transform ${showMoreFeatures ? 'rotate-90' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-6 pt-4">
          {/* AI-Powered Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Powered Insights
            </h3>
            {userId && <SecurityIQ />}
            {userId && <CareerPathsAI />}
          </div>

          {/* Achievements */}
          {userId && <AchievementBadges userId={userId} />}

          {/* Boost & Assessment CTAs */}
          {userId && <BoostYourScore />}
          {userId && <SkillsAssessmentCTA />}

          {/* Referral System */}
          {userId && <ReferralSystem />}

          {/* Recent Activity & Bug Report */}
          {userId && (
            <div className="grid md:grid-cols-2 gap-6">
              <RecentPointsFeed userId={userId} limit={5} />
              
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bug className="h-5 w-5 text-muted-foreground" />
                    Report an Issue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Found something that needs fixing?
                  </p>
                  <Button 
                    onClick={() => navigate('/bug-report')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Report Bug
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default CandidateDashboard;
