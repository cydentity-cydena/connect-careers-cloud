import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Trophy, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  start_date: string;
  end_date: string;
  metadata: any;
}

export const WeeklyChallenges = () => {
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: false })
        .limit(3);

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading challenges...</div>;
  }

  if (challenges.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Weekly Challenges</h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{challenge.title}</CardTitle>
                <Badge variant="secondary">{challenge.challenge_type}</Badge>
              </div>
              <CardDescription className="text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Ends {formatDistanceToNow(new Date(challenge.end_date), { addSuffix: true })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{challenge.description}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>Join the discussion in community</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
