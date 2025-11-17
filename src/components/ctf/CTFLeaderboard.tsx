import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal } from 'lucide-react';

export function CTFLeaderboard() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['ctf-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ctf_leaderboard')
        .select('*')
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading leaderboard...</div>;
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-700" />;
    return <span className="text-xl font-bold text-muted-foreground">{rank}</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top CTF Players
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard?.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="w-12 flex items-center justify-center">
                {getRankIcon(index + 1)}
              </div>

              <Avatar className="h-12 w-12">
                <AvatarImage src={entry.avatar_url} />
                <AvatarFallback>
                  {entry.full_name?.charAt(0) || entry.username?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {entry.full_name || entry.username || 'Anonymous'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {entry.challenges_solved} challenges solved
                </p>
              </div>

              <Badge className="text-lg px-4 py-2">
                {entry.total_points} pts
              </Badge>
            </div>
          ))}

          {!leaderboard?.length && (
            <p className="text-center text-muted-foreground py-8">
              No submissions yet. Be the first to solve a challenge!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
