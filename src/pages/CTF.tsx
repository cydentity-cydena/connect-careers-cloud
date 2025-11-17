import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CTFChallenges } from '@/components/ctf/CTFChallenges';
import { CTFLeaderboard } from '@/components/ctf/CTFLeaderboard';
import { CTFStats } from '@/components/ctf/CTFStats';
import { Trophy, Target, TrendingUp } from 'lucide-react';

export default function CTF() {
  const [activeTab, setActiveTab] = useState('challenges');

  const { data: userStats } = useQuery({
    queryKey: ['ctf-user-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('ctf_submissions')
        .select('points_awarded, challenge_id')
        .eq('candidate_id', user.id)
        .eq('is_correct', true);

      if (error) throw error;

      return {
        totalPoints: data?.reduce((sum, s) => sum + (s.points_awarded || 0), 0) || 0,
        solvedChallenges: data?.length || 0,
      };
    },
  });

  return (
    <>
      <SEO 
        title="Capture The Flag Challenges - TrecCert"
        description="Test your cybersecurity skills with hands-on CTF challenges. Earn points, climb the leaderboard, and prove your expertise."
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Capture The Flag
            </h1>
            <p className="text-muted-foreground">
              Sharpen your cybersecurity skills with real-world challenges
            </p>
          </div>

          {/* User Stats */}
          {userStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <CTFStats 
                icon={<Trophy className="h-5 w-5" />}
                label="Total Points"
                value={userStats.totalPoints}
                color="text-yellow-500"
              />
              <CTFStats 
                icon={<Target className="h-5 w-5" />}
                label="Challenges Solved"
                value={userStats.solvedChallenges}
                color="text-green-500"
              />
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="challenges">
                <Target className="h-4 w-4 mr-2" />
                Challenges
              </TabsTrigger>
              <TabsTrigger value="leaderboard">
                <TrendingUp className="h-4 w-4 mr-2" />
                Leaderboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="challenges" className="space-y-6">
              <CTFChallenges />
            </TabsContent>

            <TabsContent value="leaderboard">
              <CTFLeaderboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
