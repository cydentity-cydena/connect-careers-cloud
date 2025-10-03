import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Briefcase, FileText, TrendingUp } from "lucide-react";
import { ProfileStrengthMeter } from "@/components/gamification/ProfileStrengthMeter";
import { AchievementBadges } from "@/components/gamification/AchievementBadges";

const CandidateDashboard = () => {
  const [userId, setUserId] = useState<string>("");
  const [xpData, setXpData] = useState<any>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      loadXpData(user.id);
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
      <div>
        <h1 className="text-4xl font-bold mb-2">Candidate Dashboard</h1>
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
          </div>
        )}
      </div>

      {userId && (
        <div className="grid md:grid-cols-2 gap-6">
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
        </div>
      )}

      {userId && (
        <AchievementBadges userId={userId} />
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
            <Button variant="cyber" className="w-full">
              Edit Profile
            </Button>
            <Button variant="outline" className="w-full">
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
              <Button variant="hero" size="sm">Browse Jobs</Button>
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
            <Button variant="cyber" className="w-full" size="sm">
              Add Skills
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              Add Certification
            </Button>
          </CardContent>
        </Card>
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
    </div>
  );
};

export default CandidateDashboard;
