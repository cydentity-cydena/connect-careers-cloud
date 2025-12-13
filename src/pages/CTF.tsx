import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import CyberQuizChallenge from "@/components/ctf/CyberQuizChallenge";
import { 
  Flag, 
  Trophy, 
  Target, 
  Lightbulb, 
  Lock, 
  CheckCircle2, 
  Crown,
  Medal,
  Award,
  Flame,
  Terminal
} from "lucide-react";

interface HintItem {
  hint: string;
  cost: number;
}

interface CTFChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  hints: HintItem[] | null;
}

const parseHints = (hints: Json | null): HintItem[] | null => {
  if (!hints) return null;
  if (Array.isArray(hints)) {
    return hints as unknown as HintItem[];
  }
  return null;
};

interface LeaderboardEntry {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  challenges_solved: number;
  total_points: number;
  last_submission: string | null;
}

interface UserStats {
  solvedChallenges: string[];
  totalPoints: number;
  rank: number;
}

const CTF = () => {
  const [challenges, setChallenges] = useState<CTFChallenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({ solvedChallenges: [], totalPoints: 0, rank: 0 });
  const [selectedChallenge, setSelectedChallenge] = useState<CTFChallenge | null>(null);
  const [flagInput, setFlagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<string, number[]>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);

    // Fetch challenges from public view (no flags exposed)
    const { data: challengesData, error: challengesError } = await supabase
      .from('ctf_challenges_public')
      .select('*')
      .order('points', { ascending: true });

    if (challengesError) {
      console.error("Error fetching challenges:", challengesError);
    } else if (challengesData) {
      const mapped: CTFChallenge[] = challengesData
        .filter(c => c.id && c.title && c.description && c.category && c.difficulty && c.points)
        .map(c => ({
          id: c.id!,
          title: c.title!,
          description: c.description!,
          category: c.category!,
          difficulty: c.difficulty!,
          points: c.points!,
          hints: parseHints(c.hints)
        }));
      setChallenges(mapped);
    }

    // Fetch leaderboard
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from('ctf_leaderboard')
      .select('*')
      .limit(50);

    if (leaderboardError) {
      console.error("Error fetching leaderboard:", leaderboardError);
    } else {
      setLeaderboard(leaderboardData || []);
      
      // Calculate user rank if logged in
      if (user?.id && leaderboardData) {
        const userRankIndex = leaderboardData.findIndex(entry => entry.id === user.id);
        if (userRankIndex !== -1) {
          setUserStats(prev => ({ ...prev, rank: userRankIndex + 1 }));
        }
      }
    }

    // Fetch user's solved challenges if logged in
    if (user?.id) {
      const { data: submissions } = await supabase
        .from('ctf_submissions')
        .select('challenge_id, points_awarded')
        .eq('candidate_id', user.id)
        .eq('is_correct', true);

      if (submissions) {
        const solvedIds = submissions.map(s => s.challenge_id);
        const totalPoints = submissions.reduce((sum, s) => sum + (s.points_awarded || 0), 0);
        setUserStats(prev => ({ ...prev, solvedChallenges: solvedIds, totalPoints }));
      }
    }

    setLoading(false);
  };

  const handleSubmitFlag = async () => {
    if (!selectedChallenge || !flagInput.trim() || !userId) {
      if (!userId) toast.error("Please sign in to submit flags");
      return;
    }

    setSubmitting(true);

    try {
      // Use the secure RPC function to verify the flag
      const { data: isCorrect, error: verifyError } = await supabase
        .rpc('verify_ctf_flag', {
          p_challenge_id: selectedChallenge.id,
          p_submitted_flag: flagInput.trim()
        });

      if (verifyError) throw verifyError;

      // Record the submission
      const { error: submitError } = await supabase
        .from('ctf_submissions')
        .insert({
          candidate_id: userId,
          challenge_id: selectedChallenge.id,
          submitted_flag: flagInput.trim(),
          is_correct: isCorrect,
          points_awarded: isCorrect ? selectedChallenge.points : 0
        });

      if (submitError) {
        // Check if already solved
        if (submitError.code === '23505') {
          toast.info("You've already solved this challenge!");
        } else {
          throw submitError;
        }
      } else if (isCorrect) {
        toast.success(`🎉 Correct! +${selectedChallenge.points} points`);
        setUserStats(prev => ({
          ...prev,
          solvedChallenges: [...prev.solvedChallenges, selectedChallenge.id],
          totalPoints: prev.totalPoints + selectedChallenge.points
        }));
        setSelectedChallenge(null);
        setFlagInput("");
        // Refresh leaderboard
        fetchData();
      } else {
        toast.error("Incorrect flag. Try again!");
      }
    } catch (error) {
      console.error("Error submitting flag:", error);
      toast.error("Error submitting flag");
    } finally {
      setSubmitting(false);
    }
  };

  const revealHint = (challengeId: string, hintIndex: number) => {
    setRevealedHints(prev => ({
      ...prev,
      [challengeId]: [...(prev[challengeId] || []), hintIndex]
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'expert': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'crypto': return '🔐';
      case 'web': return '🌐';
      case 'network': return '🔌';
      case 'forensics': return '🔍';
      case 'reverse': return '⚙️';
      default: return '🏁';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-mono">{rank}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="CTF Challenges | Cydena" 
        description="Test your cybersecurity skills with our Capture The Flag challenges. Compete with others and climb the leaderboard."
      />
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Weekly CTF Competition</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Capture The Flag
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Test your cybersecurity skills by solving challenges. Find flags, earn points, and compete for the top of the leaderboard.
          </p>
        </div>

        {/* User Stats Bar */}
        {userId && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Challenges Solved</p>
                  <p className="text-2xl font-bold">{userStats.solvedChallenges.length}/{challenges.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold">{userStats.totalPoints}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Flame className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Rank</p>
                  <p className="text-2xl font-bold">{userStats.rank > 0 ? `#${userStats.rank}` : '-'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="challenges" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="challenges" className="gap-2">
              <Flag className="h-4 w-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge) => {
                const isSolved = userStats.solvedChallenges.includes(challenge.id);
                const isSelected = selectedChallenge?.id === challenge.id;
                
                return (
                  <Card 
                    key={challenge.id} 
                    className={`transition-all cursor-pointer hover:shadow-lg ${
                      isSolved ? 'bg-green-500/5 border-green-500/30' : 
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => !isSolved && setSelectedChallenge(isSelected ? null : challenge)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getCategoryIcon(challenge.category)}</span>
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {challenge.title}
                              {isSolved && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            </CardTitle>
                            <CardDescription className="text-xs capitalize">{challenge.category}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="gap-1">
                          <Trophy className="h-3 w-3" />
                          {challenge.points} pts
                        </Badge>
                        {isSolved ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                            Solved ✓
                          </Badge>
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      {/* Expanded Challenge View */}
                      {isSelected && !isSolved && (
                        <div className="pt-4 border-t space-y-3" onClick={(e) => e.stopPropagation()}>
                          {/* Special Interactive Challenge: Cyber Security Gauntlet */}
                          {challenge.title === "Cyber Security Gauntlet" ? (
                            <CyberQuizChallenge 
                              onComplete={(flag) => {
                                setFlagInput(flag);
                              }} 
                            />
                          ) : (
                            <>
                              {/* Hints */}
                              {challenge.hints && challenge.hints.length > 0 && (
                                <div className="space-y-2">
                                  {challenge.hints.map((hint, idx) => (
                                    <div key={idx}>
                                      {revealedHints[challenge.id]?.includes(idx) ? (
                                        <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/20 text-xs">
                                          💡 {hint.hint}
                                        </div>
                                      ) : (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="text-xs w-full justify-start"
                                          onClick={() => revealHint(challenge.id, idx)}
                                        >
                                          <Lightbulb className="h-3 w-3 mr-1" />
                                          Reveal Hint {idx + 1}
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}

                          {/* Flag Input */}
                          <div className="flex gap-2">
                            <Input
                              placeholder="FLAG{...}"
                              value={flagInput}
                              onChange={(e) => setFlagInput(e.target.value)}
                              className="font-mono text-sm"
                              onKeyDown={(e) => e.key === 'Enter' && handleSubmitFlag()}
                            />
                            <Button 
                              onClick={handleSubmitFlag} 
                              disabled={submitting || !flagInput.trim()}
                              size="sm"
                            >
                              {submitting ? "..." : "Submit"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {challenges.length === 0 && (
              <Card className="p-12 text-center">
                <Flag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Active Challenges</h3>
                <p className="text-muted-foreground">Check back soon for new CTF challenges!</p>
              </Card>
            )}
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  CTF Leaderboard
                </CardTitle>
                <CardDescription>Top performers in the weekly CTF competition</CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead className="text-center">Solved</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.map((entry, index) => (
                        <TableRow 
                          key={entry.id}
                          className={entry.id === userId ? 'bg-primary/5' : ''}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center justify-center w-8 h-8">
                              {getRankIcon(index + 1)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={entry.avatar_url || undefined} />
                                <AvatarFallback>
                                  {(entry.full_name || entry.username || '?')[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {entry.full_name || entry.username || 'Anonymous'}
                                  {entry.id === userId && <span className="text-primary ml-2">(You)</span>}
                                </p>
                                {entry.username && entry.full_name && (
                                  <p className="text-xs text-muted-foreground">@{entry.username}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{entry.challenges_solved}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-bold text-primary">{entry.total_points}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Rankings Yet</h3>
                    <p className="text-muted-foreground">Be the first to solve a challenge and claim the top spot!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CTF;
