import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Briefcase, FileText, TrendingUp, CheckCircle, ArrowRight, Eye, Bug } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

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
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Free Access Banner */}
      <div className="bg-gradient-to-r from-green-500/10 via-green-400/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4 md:p-6">
        <div className="flex items-start gap-3">
          <div className="bg-green-500/10 rounded-full p-2 flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">🎉 100% Free</h3>
            <p className="text-sm text-muted-foreground">
              You have complete access to all candidate features at no cost. Browse jobs, showcase your skills, and connect with employers.
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold">Welcome back, {userName}! 👋</h1>
          <div className="flex items-center gap-2">
            <BadgeSelector />
            <XPSystemInfo />
          </div>
        </div>
        <p className="text-muted-foreground">
          Manage your profile and track your applications
        </p>
        {xpData && (
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="bg-primary/10 px-4 py-2 rounded-lg group relative">
              <span className="text-sm text-muted-foreground">Level </span>
              <span className="text-xl font-bold text-primary">{xpData.level}</span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border">
                Next level at {xpData.level === 1 ? 100 : xpData.level === 2 ? 250 : xpData.level === 3 ? 500 : xpData.level === 4 ? 1000 : xpData.level === 5 ? 2000 : xpData.level === 6 ? 4000 : xpData.level === 7 ? 8000 : xpData.level === 8 ? 16000 : xpData.level === 9 ? 32000 : '∞'} XP
              </div>
            </div>
            <div className="bg-secondary/10 px-4 py-2 rounded-lg group relative">
              <span className="text-sm text-muted-foreground">Total XP </span>
              <span className="text-xl font-bold text-secondary">{xpData.total_xp}</span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border">
                Permanent progression score
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HR-Ready CTA Banner */}
      {userId && <HRReadyCTA userId={userId} />}

      {!isLoadingProfile && showGettingStarted && (
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Follow these steps to make the most of your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link to="/profile" className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your experience, skills, and certifications
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
              
              <Link to="/hr-ready" className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group border-2 border-primary/20">
                <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-semibold">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Get HR-Ready Verified</h3>
                  <p className="text-sm text-muted-foreground">
                    Required to apply for jobs - prove identity & right to work
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
              
              <Link to="/jobs" className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Apply to Jobs</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse cybersecurity roles and apply instantly
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Views */}
      {userId && <ProfileViewsNotification />}

      {/* Multiple Resumes - Full Width */}
      {userId && <MultipleResumesManager />}

      {userId && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border shadow-card hover:scale-105 transition-transform">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Name:</span> {profile?.full_name || 'Not set'}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm">
                    <span className="font-medium">Username:</span> @{profile?.username || 'Not set'}
                  </p>
                  {profile?.username && user?.id && (
                    <UsernameChangeDialog 
                      currentUsername={profile.username}
                      usernameChanges={profile.username_changes || 0}
                      userId={user.id}
                    />
                  )}
                </div>
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {profile?.email}
                </p>
              </div>
              <div className="space-y-2">
                <Button variant="cyber" className="w-full" onClick={() => navigate('/profile')}>
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/profiles')}>
                  View Public Profile
                </Button>
              </div>
            </CardContent>
          </Card>


          <Card className="border-border shadow-card hover:scale-105 transition-transform">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Skills & Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="cyber" className="w-full" size="sm" onClick={() => navigate('/skills')}>
                Add Skills
              </Button>
              <Button variant="outline" className="w-full" size="sm" onClick={() => navigate('/specializations')}>
                Manage Specializations
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {userId && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProfileStrengthMeter userId={userId} />
          
          {/* Preview Your Profile Card */}
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Preview Your Profile
              </CardTitle>
              <CardDescription>
                See how employers view your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View your profile exactly as it appears to hiring managers and recruiters. Make sure your information is accurate and professional.
              </p>
              <Button 
                onClick={() => navigate(`/profiles/${userId}`)}
                className="w-full gap-2"
                variant="outline"
              >
                <Eye className="h-4 w-4" />
                Preview Profile
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Profile Views This Week</span>
                <span className="text-lg font-bold text-primary">{profileViewsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Applications</span>
                <span className="text-lg font-bold text-secondary">{applicationsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Skills Added</span>
                <span className="text-lg font-bold text-accent">{skillsCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Certification Management - Full Width */}
      {userId && (
        <Card className="border-border shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  Your Certifications
                </CardTitle>
                <CardDescription>
                  Manage your certifications - edit pending or delete anytime
                </CardDescription>
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
      )}

      {userId && (
        <ReferralSystem />
      )}

      <ApplicationTracker />

      {userId && (
        <AchievementBadges userId={userId} />
      )}

      {userId && (
        <BoostYourScore />
      )}

      {userId && (
        <SkillsAssessmentCTA />
      )}

      {userId && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border shadow-card bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-primary" />
                Report a Bug
              </CardTitle>
              <CardDescription>
                Help us improve Cydena
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Found an issue? Let us know and we'll fix it!
              </p>
              <Button 
                onClick={() => navigate('/bug-report')}
                variant="outline"
                className="w-full gap-2"
              >
                <Bug className="h-4 w-4" />
                Report Bug
              </Button>
            </CardContent>
          </Card>

          <RecentPointsFeed userId={userId} limit={5} />
        </div>
      )}

    </div>
  );
};

export default CandidateDashboard;
