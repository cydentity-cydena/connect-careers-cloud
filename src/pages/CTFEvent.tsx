import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import ChessChallenge from "@/components/ctf/ChessChallenge";
import { QuizChallenge } from "@/components/ctf/QuizChallenge";
import PortProbeChallenge from "@/components/ctf/PortProbeChallenge";
import { CuriousWebChallenge } from "@/components/ctf/CuriousWebChallenge";
import { InjectionJunctionChallenge } from "@/components/ctf/InjectionJunctionChallenge";
import { DeepfakeDetectorChallenge } from "@/components/ctf/DeepfakeDetectorChallenge";
import { SOCInTheLoopChallenge } from "@/components/ctf/SOCInTheLoopChallenge";
import ClientBriefChallenge from "@/components/ctf/ClientBriefChallenge";
import {
  Flag, Trophy, Target, Lightbulb, Lock, CheckCircle2, Crown, Medal, Award,
  Flame, Terminal, Share2, Copy, Check, ShieldCheck, Calendar, Users
} from "lucide-react";

interface HintItem { hint: string; cost: number; }

interface CTFChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  hints: HintItem[] | null;
  file_url: string | null;
  file_name: string | null;
}

interface EventInfo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  banner_url: string | null;
}

interface LeaderboardEntry {
  id: string;
  username: string | null;
  challenges_solved: number;
  total_points: number;
  last_submission: string | null;
}

const parseHints = (hints: Json | null): HintItem[] | null => {
  if (!hints) return null;
  if (Array.isArray(hints)) return hints as unknown as HintItem[];
  return null;
};

const CTFEvent = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);
  const [challenges, setChallenges] = useState<CTFChallenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({ solvedChallenges: [] as string[], totalPoints: 0, rank: 0 });
  const [selectedChallenge, setSelectedChallenge] = useState<CTFChallenge | null>(null);
  const [flagInputs, setFlagInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<string, number[]>>({});
  const [justSolved, setJustSolved] = useState<{ challengeId: string; points: number } | null>(null);
  const [hintDeductions, setHintDeductions] = useState<Record<string, number>>({});
  const [linkCopied, setLinkCopied] = useState(false);

  const eventUrl = typeof window !== 'undefined' ? `${window.location.origin}/ctf/events/${slug}` : '';

  const copyLink = async () => {
    await navigator.clipboard.writeText(eventUrl);
    setLinkCopied(true);
    toast.success('Event link copied!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  useEffect(() => {
    loadEvent();
  }, [slug]);

  const loadEvent = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);

    // Fetch event by slug (exclude access_code)
    const { data: eventData, error: eventError } = await supabase
      .from('ctf_events')
      .select('id, name, slug, description, starts_at, ends_at, is_active, banner_url')
      .eq('slug', slug)
      .single();

    if (eventError || !eventData) {
      toast.error("Event not found");
      setLoading(false);
      return;
    }

    setEvent(eventData as EventInfo);

    // Check if user already has access
    if (user?.id) {
      const { data: participant } = await supabase
        .from('ctf_event_participants')
        .select('id')
        .eq('event_id', eventData.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (participant) {
        setHasAccess(true);
        await loadEventData(eventData.id, user.id);
      }
    }

    setLoading(false);
  };

  const loadEventData = async (eventId: string, uid: string) => {
    // Load challenges assigned to this event
    const { data: challengeAssignments } = await supabase
      .from('ctf_challenge_events')
      .select('challenge_id, sort_order')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true });

    if (challengeAssignments && challengeAssignments.length > 0) {
      const challengeIds = challengeAssignments.map(ca => ca.challenge_id);
      const { data: challengesData } = await supabase
        .from('ctf_challenges')
        .select('id, title, description, category, difficulty, points, hints, file_url, file_name')
        .in('id', challengeIds)
        .eq('is_active', true);

      if (challengesData) {
        // Sort by assignment order
        const orderMap = new Map(challengeAssignments.map(ca => [ca.challenge_id, ca.sort_order]));
        const mapped: CTFChallenge[] = challengesData
          .map(c => ({
            id: c.id!, title: c.title!, description: c.description!,
            category: c.category!, difficulty: c.difficulty!, points: c.points!,
            hints: parseHints(c.hints), file_url: c.file_url || null, file_name: c.file_name || null
          }))
          .sort((a, b) => (orderMap.get(a.id) || 0) - (orderMap.get(b.id) || 0));
        setChallenges(mapped);
      }
    }

    // Load event leaderboard
    const { data: lbData } = await supabase
      .from('ctf_event_leaderboard')
      .select('*')
      .eq('event_id', eventId);

    if (lbData) {
      setLeaderboard(lbData as LeaderboardEntry[]);
      const userRankIndex = lbData.findIndex(e => e.id === uid);
      if (userRankIndex !== -1) {
        setUserStats(prev => ({ ...prev, rank: userRankIndex + 1 }));
      }
    }

    // Load user submissions & hints
    const [submissionsResult, hintUsageResult] = await Promise.all([
      supabase.from('ctf_submissions').select('challenge_id, points_awarded')
        .eq('candidate_id', uid).eq('is_correct', true),
      supabase.from('ctf_hint_usage').select('challenge_id, hint_index, points_deducted')
        .eq('candidate_id', uid)
    ]);

    if (submissionsResult.data) {
      const solvedIds = submissionsResult.data.map(s => s.challenge_id);
      const totalPoints = submissionsResult.data.reduce((sum, s) => sum + (s.points_awarded || 0), 0);
      setUserStats(prev => ({ ...prev, solvedChallenges: solvedIds, totalPoints }));
    }

    if (hintUsageResult.data) {
      const hints: Record<string, number[]> = {};
      const deductions: Record<string, number> = {};
      hintUsageResult.data.forEach(h => {
        if (!hints[h.challenge_id]) hints[h.challenge_id] = [];
        hints[h.challenge_id].push(h.hint_index);
        deductions[h.challenge_id] = (deductions[h.challenge_id] || 0) + h.points_deducted;
      });
      setRevealedHints(hints);
      setHintDeductions(deductions);
    }
  };

  const handleAccessCode = async () => {
    if (!accessCode.trim()) return;
    if (!userId) {
      toast.error("Please sign in first to join this event");
      navigate('/auth');
      return;
    }
    if (!event) return;

    setCheckingCode(true);

    // Use secure server-side verification
    const { data, error } = await supabase.rpc('join_ctf_event', {
      p_event_slug: slug!,
      p_access_code: accessCode.trim()
    });

    if (error) {
      toast.error("Failed to verify access code");
      setCheckingCode(false);
      return;
    }

    const result = data as { success: boolean; error?: string; event_id?: string; event_name?: string };

    if (!result.success) {
      toast.error(result.error || "Invalid access code");
      setCheckingCode(false);
      return;
    }

    toast.success(`Welcome to ${result.event_name || event.name}!`);
    setHasAccess(true);
    await loadEventData(event.id, userId);
    setCheckingCode(false);
  };

  const handleSubmitFlag = async () => {
    const currentInput = selectedChallenge ? flagInputs[selectedChallenge.id] || "" : "";
    if (!selectedChallenge || !currentInput.trim() || !userId) {
      if (!userId) toast.error("Please sign in to submit flags");
      return;
    }

    setSubmitting(true);
    try {
      const { data: isCorrect, error: verifyError } = await supabase
        .rpc('verify_ctf_flag', { p_challenge_id: selectedChallenge.id, p_submitted_flag: currentInput.trim() });
      if (verifyError) throw verifyError;

      const hintPenalty = hintDeductions[selectedChallenge.id] || 0;
      const finalPoints = Math.max(0, selectedChallenge.points - hintPenalty);

      const { error: submitError } = await supabase.from('ctf_submissions').insert({
        candidate_id: userId, challenge_id: selectedChallenge.id,
        submitted_flag: currentInput.trim(), is_correct: isCorrect, points_awarded: isCorrect ? finalPoints : 0
      });

      if (submitError) {
        if (submitError.code === '23505') {
          toast.info("You've already solved this challenge!");
          setSelectedChallenge(null);
          return;
        }
        throw submitError;
      }

      if (isCorrect) {
        setJustSolved({ challengeId: selectedChallenge.id, points: finalPoints });
        setUserStats(prev => ({
          ...prev,
          solvedChallenges: [...prev.solvedChallenges, selectedChallenge.id],
          totalPoints: prev.totalPoints + finalPoints
        }));
        setFlagInputs(prev => ({ ...prev, [selectedChallenge.id]: "" }));
        setTimeout(() => { setJustSolved(null); setSelectedChallenge(null); }, 3000);
        if (event) loadEventData(event.id, userId);
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

  const revealHint = async (challenge: CTFChallenge, hintIndex: number) => {
    if (!userId) { toast.error("Please sign in to reveal hints"); return; }
    const hint = challenge.hints?.[hintIndex];
    const cost = hint?.cost || 0;
    if (cost > 0 && !window.confirm(`Reveal this hint for ${cost} points?`)) return;

    try {
      const { error } = await supabase.from('ctf_hint_usage').insert({
        candidate_id: userId, challenge_id: challenge.id, hint_index: hintIndex, points_deducted: cost
      });
      if (error && error.code !== '23505') throw error;

      setRevealedHints(prev => ({ ...prev, [challenge.id]: [...(prev[challenge.id] || []), hintIndex] }));
      if (cost > 0) {
        setHintDeductions(prev => ({ ...prev, [challenge.id]: (prev[challenge.id] || 0) + cost }));
        toast.info(`💡 Hint revealed! -${cost} points will be deducted from your solve.`);
      }
    } catch (error) {
      toast.error("Failed to reveal hint");
    }
  };

  const getDifficultyColor = (d: string) => {
    switch (d.toLowerCase()) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'expert': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-mono">{rank}</span>;
  };

  const renderInteractiveChallenge = (challenge: CTFChallenge) => {
    const onComplete = (flag: string) => {
      setFlagInputs(prev => ({ ...prev, [challenge.id]: flag }));
      setTimeout(() => handleSubmitFlag(), 100);
    };
    const title = challenge.title.toLowerCase();
    if (title.includes('chess')) return <ChessChallenge onComplete={onComplete} />;
    if (title.includes('quiz')) return <QuizChallenge onComplete={onComplete} />;
    if (title.includes('port probe')) return <PortProbeChallenge challengeId={challenge.id} onSolve={onComplete} />;
    if (title.includes('curious web')) return <CuriousWebChallenge onFlagSubmit={onComplete} />;
    if (title.includes('injection')) return <InjectionJunctionChallenge onFlagSubmit={onComplete} />;
    if (title.includes('deepfake')) return <DeepfakeDetectorChallenge onComplete={onComplete} />;
    if (title.includes('soc in')) return <SOCInTheLoopChallenge onComplete={onComplete} />;
    if (title.includes('client brief') || title.includes('professional practice')) return <ClientBriefChallenge onComplete={onComplete} />;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <Flag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground mb-6">This CTF event doesn't exist or is no longer available.</p>
          <Button onClick={() => navigate('/ctf')}>Go to Public CTF</Button>
        </div>
      </div>
    );
  }

  // Access Code Gate
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title={`${event.name} | CTF Event`} description={event.description || "Private CTF event"} />
        <Navigation />
        <div className="container mx-auto px-4 py-16 max-w-md">
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              {event.banner_url && (
                <div className="flex justify-center mb-4">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg inline-block">
                    <img src={event.banner_url} alt={event.name} className="max-h-24 object-contain" />
                  </div>
                </div>
              )}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 mx-auto">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Private Event</span>
              </div>
              <CardTitle className="text-2xl">{event.name}</CardTitle>
              {event.description && (
                <CardDescription className="mt-2">{event.description}</CardDescription>
              )}
              {event.starts_at && (
                <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(event.starts_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {!userId ? (
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">Sign in to join this event</p>
                  <Button onClick={() => navigate('/auth')} className="w-full">Sign In / Register</Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enter Access Code</label>
                    <Input
                      value={accessCode}
                      onChange={e => setAccessCode(e.target.value)}
                      placeholder="e.g. BSIDES-LANCS-2026"
                      className="text-center font-mono text-lg tracking-wider"
                      onKeyDown={e => e.key === 'Enter' && handleAccessCode()}
                    />
                  </div>
                  <Button onClick={handleAccessCode} disabled={checkingCode || !accessCode.trim()} className="w-full">
                    {checkingCode ? "Verifying..." : "Join Event"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main Event CTF Page
  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${event.name} | CTF Event`} description={event.description || "Private CTF event"} />
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Event Header */}
        <div className="text-center mb-8">
          {event.banner_url && (
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl inline-block">
                <img src={event.banner_url} alt={event.name} className="max-h-32 object-contain" />
              </div>
            </div>
          )}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Private CTF Event</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
          {event.description && <p className="text-muted-foreground max-w-2xl mx-auto mb-4">{event.description}</p>}
          {event.starts_at && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="h-4 w-4" />
              {new Date(event.starts_at).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {event.ends_at && <> — {new Date(event.ends_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</>}
            </div>
          )}
          <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
            {linkCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {linkCopied ? 'Copied!' : 'Copy Event Link'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Challenges Solved</p>
                  <p className="text-2xl font-bold">{userStats.solvedChallenges.length}/{challenges.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-500/5 border-yellow-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold">{userStats.totalPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Flame className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Your Rank</p>
                  <p className="text-2xl font-bold">{userStats.rank || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="challenges" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="challenges" className="gap-2"><Flag className="h-4 w-4" /> Challenges</TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2"><Trophy className="h-4 w-4" /> Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="mt-6">
            {challenges.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No Challenges Yet</h3>
                  <p className="text-muted-foreground">Challenges will appear here when the event starts.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {challenges.map(challenge => {
                  const isSolved = userStats.solvedChallenges.includes(challenge.id);
                  const isSelected = selectedChallenge?.id === challenge.id;
                  const isCelebrating = justSolved?.challengeId === challenge.id;
                  const interactiveComponent = renderInteractiveChallenge(challenge);
                  const isWideChallenge = challenge.title.toLowerCase().includes('port probe') ||
                    challenge.title.toLowerCase().includes('curious web') ||
                    challenge.title.toLowerCase().includes('injection') ||
                    challenge.title.toLowerCase().includes('soc in') ||
                    challenge.title.toLowerCase().includes('client brief') ||
                    challenge.title.toLowerCase().includes('professional practice');

                  return (
                    <Card
                      key={challenge.id}
                      className={`transition-all cursor-pointer ${isWideChallenge ? 'md:col-span-2' : ''} ${
                        isCelebrating ? 'border-green-500 bg-green-500/10 animate-pulse' :
                        isSolved ? 'border-green-500/30 bg-green-500/5' :
                        isSelected ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'
                      }`}
                      onClick={() => !isSolved && !isCelebrating && setSelectedChallenge(isSelected ? null : challenge)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {isSolved ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Flag className="h-5 w-5 text-muted-foreground" />}
                              <CardTitle className="text-lg">{challenge.title}</CardTitle>
                            </div>
                            <CardDescription>{challenge.description}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getDifficultyColor(challenge.difficulty)}>{challenge.difficulty}</Badge>
                            <Badge variant="outline" className="font-mono">{challenge.points} pts</Badge>
                          </div>
                        </div>
                      </CardHeader>

                      {isSelected && !isSolved && (
                        <CardContent onClick={e => e.stopPropagation()}>
                          {interactiveComponent && <div className="mb-4">{interactiveComponent}</div>}

                          {/* Hints */}
                          {challenge.hints && challenge.hints.length > 0 && (
                            <div className="mb-4 space-y-2">
                              {challenge.hints.map((hint, idx) => (
                                <div key={idx}>
                                  {revealedHints[challenge.id]?.includes(idx) ? (
                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                                      <p className="text-sm">{hint.hint}</p>
                                    </div>
                                  ) : (
                                    <Button variant="outline" size="sm" onClick={() => revealHint(challenge, idx)} className="gap-2">
                                      <Lightbulb className="h-4 w-4" />
                                      Reveal Hint {idx + 1} (-{hint.cost} pts)
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Flag input */}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter flag..."
                              value={flagInputs[challenge.id] || ""}
                              onChange={e => setFlagInputs(prev => ({ ...prev, [challenge.id]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && handleSubmitFlag()}
                              className="font-mono"
                            />
                            <Button onClick={handleSubmitFlag} disabled={submitting}>
                              {submitting ? "..." : "Submit"}
                            </Button>
                          </div>
                          {hintDeductions[challenge.id] > 0 && (
                            <p className="text-xs text-yellow-500 mt-1">
                              ⚠️ {hintDeductions[challenge.id]} pts will be deducted for hints used
                            </p>
                          )}
                        </CardContent>
                      )}

                      {isCelebrating && (
                        <CardContent>
                          <div className="text-center py-4">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2 animate-bounce" />
                            <p className="text-lg font-bold text-green-500">🎉 Solved! +{justSolved?.points} points</p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {event.name} — Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    No solves yet. Be the first!
                  </div>
                ) : (
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
                      {leaderboard.map((entry, idx) => (
                        <TableRow key={entry.id} className={entry.id === userId ? 'bg-primary/5' : ''}>
                          <TableCell>{getRankIcon(idx + 1)}</TableCell>
                          <TableCell className="font-medium">
                            @{entry.username || 'anonymous'}
                            {entry.id === userId && <Badge variant="outline" className="ml-2 text-xs">You</Badge>}
                          </TableCell>
                          <TableCell className="text-center">{entry.challenges_solved}</TableCell>
                          <TableCell className="text-right font-mono font-bold">{entry.total_points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CTFEvent;
