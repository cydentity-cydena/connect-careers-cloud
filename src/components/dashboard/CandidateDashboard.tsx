import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Briefcase, FileText, TrendingUp, CheckCircle } from "lucide-react";
import { ProfileStrengthMeter } from "@/components/gamification/ProfileStrengthMeter";
import { AchievementBadges } from "@/components/gamification/AchievementBadges";
import { RecentPointsFeed } from "@/components/rewards/RecentPointsFeed";
import { BoostYourScore } from "./BoostYourScore";

const CandidateDashboard = () => {
  const [userId, setUserId] = useState<string>("");
  const [xpData, setXpData] = useState<any>(null);
  const [userName, setUserName] = useState<string>("");

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
    }
  };

  const loadUserProfile = async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', uid)
      .single();
    
    if (data) {
      // Use username if available, otherwise use full_name, or fall back to "Candidate"
      setUserName(data.username || data.full_name?.split(' ')[0] || 'Candidate');
    }
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
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Free Access Banner */}
      <div className="bg-gradient-to-r from-green-500/10 via-green-400/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4 md:p-6">
        <div className="flex items-start gap-3">
          <div className="bg-green-500/10 rounded-full p-2 flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">🎉 100% Free Forever</h3>
            <p className="text-sm text-muted-foreground">
              You have complete access to all candidate features at no cost. Browse jobs, showcase your skills, and connect with employers - always free.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
        <p className="text-muted-foreground">
          Manage your profile and track your applications
        </p>
        {xpData && (
          <div className="flex items-center gap-4 mt-4">
            <div className="bg-primary/10 px-4 py-2 rounded-lg">
              <span className="text-sm text-muted-foreground">Level </span>
              <span className="text-xl font-bold text-primary">{xpData.level}</span>
            </div>
            <div className="bg-secondary/10 px-4 py-2 rounded-lg">
              <span className="text-sm text-muted-foreground">Total XP </span>
              <span className="text-xl font-bold text-secondary">{xpData.total_xp}</span>
            </div>
            <div className="bg-accent/10 px-4 py-2 rounded-lg">
              <span className="text-sm text-muted-foreground">Points </span>
              <span className="text-xl font-bold text-accent">{xpData.points_balance || 0}</span>
            </div>
          </div>
        )}
      </div>

      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to make the most of your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Complete Your Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Add your experience, skills, and certifications
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Browse Job Opportunities</h3>
                <p className="text-sm text-muted-foreground">
                  Find cybersecurity roles that match your skills
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Apply & Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Submit applications and communicate with employers
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {userId && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProfileStrengthMeter userId={userId} />
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
                <span className="text-lg font-bold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Applications</span>
                <span className="text-lg font-bold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Skills Added</span>
                <span className="text-lg font-bold">0</span>
              </div>
            </CardContent>
          </Card>
          <RecentPointsFeed userId={userId} limit={5} />
        </div>
      )}

      {userId && (
        <AchievementBadges userId={userId} />
      )}

      {userId && (
        <BoostYourScore />
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-border shadow-card hover:scale-105 transition-transform">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="cyber" className="w-full" onClick={() => navigate('/profile')}>
              Edit Profile
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/profiles')}>
              View Public Profile
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border shadow-card hover:scale-105 transition-transform">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-secondary" />
              Active Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-primary mb-2">0</p>
              <p className="text-sm text-muted-foreground mb-4">Applications</p>
              <Button variant="hero" size="sm" onClick={() => navigate('/jobs')}>Browse Jobs</Button>
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
            <Button variant="outline" className="w-full" size="sm" onClick={() => navigate('/certifications')}>
              Add Certification
            </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default CandidateDashboard;
