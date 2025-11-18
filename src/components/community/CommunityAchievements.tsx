import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Lock, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_value: number;
  xp_reward: number;
  unlocked: boolean;
  progress: number;
}

export const CommunityAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all community achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('category', 'community')
        .order('requirement_value', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Get user's unlocked achievements
      const { data: unlockedAchievements, error: unlockedError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      if (unlockedError) throw unlockedError;

      const unlockedIds = new Set(unlockedAchievements?.map(ua => ua.achievement_id) || []);

      // Get user's activity counts for progress
      const { count: postCount } = await supabase
        .from('activity_feed')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: commentCount } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: reactionCount } = await supabase
        .from('post_reactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const formatted = allAchievements?.map(achievement => {
        const unlocked = unlockedIds.has(achievement.id);
        let progress = 0;

        // Calculate progress based on achievement type
        if (achievement.name.includes('Post')) {
          progress = Math.min((postCount || 0) / achievement.requirement_value * 100, 100);
        } else if (achievement.name.includes('Comment')) {
          progress = Math.min((commentCount || 0) / achievement.requirement_value * 100, 100);
        } else if (achievement.name.includes('Reaction') || achievement.name.includes('Engaged')) {
          progress = Math.min((reactionCount || 0) / achievement.requirement_value * 100, 100);
        }

        return {
          ...achievement,
          unlocked,
          progress: unlocked ? 100 : progress,
        };
      }) || [];

      setAchievements(formatted);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load achievements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading achievements...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Community Achievements</h3>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <Card 
            key={achievement.id}
            className={achievement.unlocked ? 'border-primary/50 bg-primary/5' : 'opacity-75'}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {achievement.unlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                    {achievement.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {achievement.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {achievement.unlocked ? 'Completed' : `Progress: ${Math.round(achievement.progress)}%`}
                </span>
                <Badge variant="secondary" className="text-xs">
                  +{achievement.xp_reward} XP
                </Badge>
              </div>
              <Progress value={achievement.progress} className="h-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
