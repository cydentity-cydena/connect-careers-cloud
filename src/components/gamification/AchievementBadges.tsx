import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Award } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  earned_at?: string;
}

interface AchievementBadgesProps {
  userId: string;
}

export const AchievementBadges = ({ userId }: AchievementBadgesProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    try {
      // Get all achievements
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .order('xp_reward', { ascending: false });

      // Get user's earned achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id, earned_at')
        .eq('user_id', userId);

      const earnedIds = new Set(userAchievements?.map(a => a.achievement_id) || []);
      const earnedMap = new Map(userAchievements?.map(a => [a.achievement_id, a.earned_at]) || []);

      const merged = allAchievements?.map(achievement => ({
        ...achievement,
        earned_at: earnedMap.get(achievement.id),
      })) || [];

      setAchievements(merged);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const earnedCount = achievements.filter(a => a.earned_at).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Achievements
          <Badge variant="outline" className="ml-auto">
            {earnedCount}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          <TooltipProvider>
            {achievements.map((achievement) => (
              <Tooltip key={achievement.id}>
                <TooltipTrigger>
                  <div
                    className={`
                      flex items-center justify-center p-3 rounded-lg border-2 transition-all
                      ${achievement.earned_at 
                        ? 'border-primary bg-primary/10 scale-110' 
                        : 'border-border bg-muted/50 opacity-40 grayscale'
                      }
                    `}
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-semibold">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-primary">+{achievement.xp_reward} XP</p>
                    {achievement.earned_at && (
                      <p className="text-xs text-green-600">
                        Earned {new Date(achievement.earned_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};