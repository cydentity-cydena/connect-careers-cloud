import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Lock } from 'lucide-react';
import { CTFSubmitDialog } from './CTFSubmitDialog';

const difficultyColors = {
  beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  advanced: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  expert: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export function CTFChallenges() {
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['ctf-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ctf_challenges')
        .select('*')
        .eq('is_active', true)
        .order('difficulty', { ascending: true })
        .order('points', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: userSubmissions } = useQuery({
    queryKey: ['ctf-user-submissions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('ctf_submissions')
        .select('challenge_id, is_correct')
        .eq('candidate_id', user.id);

      if (error) throw error;
      return data;
    },
  });

  const isSolved = (challengeId: string) => {
    return userSubmissions?.some(
      (s) => s.challenge_id === challengeId && s.is_correct
    );
  };

  const filteredChallenges = challenges?.filter((challenge) => {
    const matchesDifficulty = difficultyFilter === 'all' || challenge.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === 'all' || challenge.category === categoryFilter;
    return matchesDifficulty && matchesCategory;
  });

  const categories = [...new Set(challenges?.map((c) => c.category) || [])];

  if (isLoading) {
    return <div className="text-center py-12">Loading challenges...</div>;
  }

  return (
    <>
      <div className="flex gap-4 mb-6">
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChallenges?.map((challenge) => {
          const solved = isSolved(challenge.id);
          
          return (
            <Card 
              key={challenge.id} 
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                solved ? 'border-green-500/50' : ''
              }`}
            >
              {solved && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}>
                    {challenge.difficulty}
                  </Badge>
                  <span className="text-2xl font-bold text-primary">
                    {challenge.points}pts
                  </span>
                </div>
                <CardTitle className="text-xl">{challenge.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {challenge.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {challenge.category}
                  </Badge>
                  <Button
                    onClick={() => setSelectedChallenge(challenge)}
                    variant={solved ? "outline" : "default"}
                    disabled={solved}
                  >
                    {solved ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Solved
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Attempt
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedChallenge && (
        <CTFSubmitDialog
          challenge={selectedChallenge}
          open={!!selectedChallenge}
          onOpenChange={(open) => !open && setSelectedChallenge(null)}
        />
      )}
    </>
  );
}
