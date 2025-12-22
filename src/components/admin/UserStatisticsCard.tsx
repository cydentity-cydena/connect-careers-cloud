import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  TrendingUp, 
  GraduationCap, 
  Flag, 
  Award, 
  Activity,
  UserPlus,
  BookOpen,
  MessageSquare,
  FileCheck,
  Target,
  Zap,
  Calendar,
  Clock
} from "lucide-react";
import { subDays, startOfDay } from "date-fns";

interface StatsData {
  // User signups
  totalUsers: number;
  signupsToday: number;
  signupsThisWeek: number;
  signupsThisMonth: number;
  
  // Learning Paths
  totalLearningPaths: number;
  pathCompletions: number;
  videoWatches: number;
  activelearners: number;
  
  // CTF Stats
  totalCtfChallenges: number;
  ctfSubmissions: number;
  ctfSolves: number;
  ctfParticipants: number;
  
  // Engagement
  communityPosts: number;
  communityComments: number;
  directMessages: number;
  
  // Certifications
  totalCertifications: number;
  verifiedCertifications: number;
  pendingVerifications: number;
  
  // XP & Achievements
  totalXpAwarded: number;
  achievementsUnlocked: number;
  hrReadyCount: number;
  
  // Applications
  totalApplications: number;
}

const StatItem = ({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  color = "primary" 
}: { 
  label: string; 
  value: number | string; 
  icon: React.ElementType; 
  trend?: string;
  color?: string;
}) => (
  <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 text-${color}`} />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="font-semibold">{value}</span>
      {trend && (
        <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
          {trend}
        </Badge>
      )}
    </div>
  </div>
);

const UserStatisticsCard = () => {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    signupsToday: 0,
    signupsThisWeek: 0,
    signupsThisMonth: 0,
    totalLearningPaths: 0,
    pathCompletions: 0,
    videoWatches: 0,
    activelearners: 0,
    totalCtfChallenges: 0,
    ctfSubmissions: 0,
    ctfSolves: 0,
    ctfParticipants: 0,
    communityPosts: 0,
    communityComments: 0,
    directMessages: 0,
    totalCertifications: 0,
    verifiedCertifications: 0,
    pendingVerifications: 0,
    totalXpAwarded: 0,
    achievementsUnlocked: 0,
    hrReadyCount: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    setLoading(true);
    try {
      const today = startOfDay(new Date()).toISOString();
      const weekAgo = subDays(new Date(), 7).toISOString();
      const monthAgo = subDays(new Date(), 30).toISOString();

      // Parallel fetch all stats
      const [
        totalUsersResult,
        signupsTodayResult,
        signupsWeekResult,
        signupsMonthResult,
        learningPathsResult,
        videoCompletionsResult,
        ctfChallengesResult,
        ctfSubmissionsResult,
        ctfSolvesResult,
        ctfParticipantsResult,
        activityFeedResult,
        commentsResult,
        directMessagesResult,
        certificationsResult,
        verifiedCertsResult,
        pendingVerificationsResult,
        xpResult,
        achievementsResult,
        hrReadyResult,
        applicationsResult,
      ] = await Promise.all([
        // Total users
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        // Signups today
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today),
        // Signups this week
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
        // Signups this month
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo),
        // YouTube Learning paths
        supabase.from('youtube_learning_paths').select('*', { count: 'exact', head: true }),
        // Video completions
        supabase.from('youtube_video_completions').select('*', { count: 'exact', head: true }),
        // CTF challenges
        supabase.from('ctf_challenges').select('*', { count: 'exact', head: true }).eq('is_active', true),
        // CTF total submissions
        supabase.from('ctf_submissions').select('*', { count: 'exact', head: true }),
        // CTF correct solves
        supabase.from('ctf_submissions').select('*', { count: 'exact', head: true }).eq('is_correct', true),
        // CTF unique participants
        supabase.from('ctf_submissions').select('candidate_id'),
        // Activity feed (as proxy for community activity)
        supabase.from('activity_feed').select('*', { count: 'exact', head: true }),
        // Comments
        supabase.from('post_comments').select('*', { count: 'exact', head: true }),
        // Direct messages
        supabase.from('direct_messages').select('*', { count: 'exact', head: true }),
        // Total certifications
        supabase.from('certifications').select('*', { count: 'exact', head: true }),
        // Verified certifications
        supabase.from('certifications').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
        // Pending verification requests
        supabase.from('certification_verification_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        // Total XP awarded
        supabase.from('candidate_xp').select('total_xp'),
        // Achievements unlocked
        supabase.from('user_achievements').select('*', { count: 'exact', head: true }),
        // HR Ready candidates
        supabase.from('candidate_verifications').select('*', { count: 'exact', head: true }).eq('hr_ready', true),
        // Applications
        supabase.from('applications').select('*', { count: 'exact', head: true }),
      ]);

      // Calculate unique CTF participants
      const uniqueCtfParticipants = new Set(
        ctfParticipantsResult.data?.map(s => s.candidate_id) || []
      ).size;

      // Calculate total XP
      const totalXp = xpResult.data?.reduce((sum, record) => sum + (record.total_xp || 0), 0) || 0;

      // Get active learners (users with video completions in the last week)
      const activeLearnersResult = await supabase
        .from('youtube_video_completions')
        .select('user_id')
        .gte('completed_at', weekAgo);
      
      const activeLearnersCount = new Set(
        activeLearnersResult.data?.map(r => r.user_id) || []
      ).size;

      setStats({
        totalUsers: totalUsersResult.count || 0,
        signupsToday: signupsTodayResult.count || 0,
        signupsThisWeek: signupsWeekResult.count || 0,
        signupsThisMonth: signupsMonthResult.count || 0,
        totalLearningPaths: learningPathsResult.count || 0,
        pathCompletions: videoCompletionsResult.count || 0,
        videoWatches: videoCompletionsResult.count || 0,
        activelearners: activeLearnersCount,
        totalCtfChallenges: ctfChallengesResult.count || 0,
        ctfSubmissions: ctfSubmissionsResult.count || 0,
        ctfSolves: ctfSolvesResult.count || 0,
        ctfParticipants: uniqueCtfParticipants,
        communityPosts: activityFeedResult.count || 0,
        communityComments: commentsResult.count || 0,
        directMessages: directMessagesResult.count || 0,
        totalCertifications: certificationsResult.count || 0,
        verifiedCertifications: verifiedCertsResult.count || 0,
        pendingVerifications: pendingVerificationsResult.count || 0,
        totalXpAwarded: totalXp,
        achievementsUnlocked: achievementsResult.count || 0,
        hrReadyCount: hrReadyResult.count || 0,
        totalApplications: applicationsResult.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
            Loading Statistics...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-6 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const signupGrowthRate = stats.signupsThisMonth > 0 
    ? ((stats.signupsThisWeek / (stats.signupsThisMonth / 4)) * 100 - 100).toFixed(0)
    : '0';

  return (
    <Card className="border-border shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Platform Statistics
            </CardTitle>
            <CardDescription>
              Real-time user activity and engagement metrics
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signups" className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="signups" className="text-xs">Signups</TabsTrigger>
            <TabsTrigger value="learning" className="text-xs">Learning</TabsTrigger>
            <TabsTrigger value="ctf" className="text-xs">CTF</TabsTrigger>
            <TabsTrigger value="engagement" className="text-xs">Engagement</TabsTrigger>
            <TabsTrigger value="verification" className="text-xs">Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="signups" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg text-center">
                <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-500">+{stats.signupsToday}</p>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </div>
            <StatItem label="Signups This Week" value={stats.signupsThisWeek} icon={UserPlus} trend={`${signupGrowthRate}%`} />
            <StatItem label="Signups This Month" value={stats.signupsThisMonth} icon={Calendar} />
            <StatItem label="HR-Ready Candidates" value={stats.hrReadyCount} icon={FileCheck} color="green-500" />
            <StatItem label="Total Applications" value={stats.totalApplications} icon={Target} />
          </TabsContent>

          <TabsContent value="learning" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-lg text-center">
                <p className="text-3xl font-bold text-purple-500">{stats.totalLearningPaths}</p>
                <p className="text-sm text-muted-foreground">Learning Paths</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-500">{stats.activelearners}</p>
                <p className="text-sm text-muted-foreground">Active Learners</p>
              </div>
            </div>
            <StatItem label="Videos Watched" value={stats.videoWatches} icon={BookOpen} />
            <StatItem label="Videos Completed" value={stats.pathCompletions} icon={GraduationCap} color="green-500" />
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Active This Week</span>
                <span className="font-medium">{stats.activelearners} learners</span>
              </div>
              <Progress 
                value={stats.totalUsers > 0 ? (stats.activelearners / stats.totalUsers) * 100 : 0} 
                className="h-2"
              />
            </div>
          </TabsContent>

          <TabsContent value="ctf" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-lg text-center">
                <p className="text-3xl font-bold text-orange-500">{stats.totalCtfChallenges}</p>
                <p className="text-sm text-muted-foreground">Active Challenges</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-lg text-center">
                <p className="text-3xl font-bold text-red-500">{stats.ctfParticipants}</p>
                <p className="text-sm text-muted-foreground">Participants</p>
              </div>
            </div>
            <StatItem label="Total Submissions" value={stats.ctfSubmissions} icon={Flag} />
            <StatItem label="Correct Solves" value={stats.ctfSolves} icon={Award} color="green-500" />
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-medium">
                  {stats.ctfSubmissions > 0 
                    ? ((stats.ctfSolves / stats.ctfSubmissions) * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>
              <Progress 
                value={stats.ctfSubmissions > 0 ? (stats.ctfSolves / stats.ctfSubmissions) * 100 : 0} 
                className="h-2"
              />
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 rounded-lg text-center">
                <p className="text-2xl font-bold text-cyan-500">{stats.communityPosts}</p>
                <p className="text-xs text-muted-foreground">Activities</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 rounded-lg text-center">
                <p className="text-2xl font-bold text-indigo-500">{stats.communityComments}</p>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-pink-500/20 to-pink-500/5 rounded-lg text-center">
                <p className="text-2xl font-bold text-pink-500">{stats.directMessages}</p>
                <p className="text-xs text-muted-foreground">Messages</p>
              </div>
            </div>
            <StatItem label="Total XP Awarded" value={stats.totalXpAwarded.toLocaleString()} icon={Zap} color="yellow-500" />
            <StatItem label="Achievements Unlocked" value={stats.achievementsUnlocked} icon={Award} color="purple-500" />
            <StatItem label="Average XP per User" value={stats.totalUsers > 0 ? Math.round(stats.totalXpAwarded / stats.totalUsers) : 0} icon={TrendingUp} />
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-lg text-center">
                <p className="text-3xl font-bold text-emerald-500">{stats.verifiedCertifications}</p>
                <p className="text-sm text-muted-foreground">Verified Certs</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg text-center">
                <p className="text-3xl font-bold text-amber-500">{stats.pendingVerifications}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
            <StatItem label="Total Certifications" value={stats.totalCertifications} icon={Award} />
            <StatItem label="HR-Ready Verified" value={stats.hrReadyCount} icon={FileCheck} color="green-500" />
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Verification Rate</span>
                <span className="font-medium">
                  {stats.totalCertifications > 0 
                    ? ((stats.verifiedCertifications / stats.totalCertifications) * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>
              <Progress 
                value={stats.totalCertifications > 0 ? (stats.verifiedCertifications / stats.totalCertifications) * 100 : 0} 
                className="h-2"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserStatisticsCard;
