import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import ChessChallenge from "@/components/ctf/ChessChallenge";
import { QuizChallenge } from "@/components/ctf/QuizChallenge";
import PortProbeChallenge from "@/components/ctf/PortProbeChallenge";
import { CuriousWebChallenge } from "@/components/ctf/CuriousWebChallenge";
import { InjectionJunctionChallenge } from "@/components/ctf/InjectionJunctionChallenge";
import { DeepfakeDetectorChallenge } from "@/components/ctf/DeepfakeDetectorChallenge";
import { SOCInTheLoopChallenge } from "@/components/ctf/SOCInTheLoopChallenge";
import {
  BookOpen, Lock, CheckCircle2, ChevronRight, ShieldCheck,
  Flag, Target, Lightbulb, Trophy, ExternalLink
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

interface CourseModule {
  id: string;
  title: string;
  description: string | null;
  module_order: number;
  challenges: CTFChallenge[];
}

interface CourseInfo {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  partner_name: string | null;
  partner_logo_url: string | null;
  banner_url: string | null;
  sequential_modules: boolean;
}

const parseHints = (hints: Json | null): HintItem[] | null => {
  if (!hints) return null;
  if (Array.isArray(hints)) return hints as unknown as HintItem[];
  return null;
};

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [solvedChallenges, setSolvedChallenges] = useState<string[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<CTFChallenge | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [flagInputs, setFlagInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<string, number[]>>({});
  const [hintDeductions, setHintDeductions] = useState<Record<string, number>>({});
  const [justSolved, setJustSolved] = useState<{ challengeId: string; points: number } | null>(null);

  useEffect(() => {
    loadCourse();
  }, [slug]);

  const loadCourse = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);

    const { data: courseData, error } = await supabase
      .from('courses')
      .select('id, title, slug, description, partner_name, partner_logo_url, banner_url, sequential_modules')
      .eq('slug', slug)
      .single();

    if (error || !courseData) {
      toast.error("Course not found");
      setLoading(false);
      return;
    }

    setCourse(courseData as CourseInfo);

    if (user?.id) {
      const { data: participant } = await supabase
        .from('course_participants')
        .select('id')
        .eq('course_id', courseData.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (participant) {
        setHasAccess(true);
        await loadCourseData(courseData.id, user.id);
      }
    }

    setLoading(false);
  };

  const loadCourseData = async (courseId: string, uid: string) => {
    // Load modules
    const { data: modulesData } = await supabase
      .from('course_modules')
      .select('id, title, description, module_order')
      .eq('course_id', courseId)
      .order('module_order');

    if (!modulesData || modulesData.length === 0) {
      setModules([]);
      return;
    }

    // Load all module challenges
    const moduleIds = modulesData.map(m => m.id);
    const { data: mcData } = await supabase
      .from('course_module_challenges')
      .select('module_id, challenge_id, sort_order')
      .in('module_id', moduleIds)
      .order('sort_order');

    // Load challenge details
    const challengeIds = mcData?.map(mc => mc.challenge_id) || [];
    let challengeMap: Record<string, CTFChallenge> = {};

    if (challengeIds.length > 0) {
      const { data: challengesData } = await supabase
        .from('ctf_challenges')
        .select('id, title, description, category, difficulty, points, hints, file_url, file_name')
        .in('id', challengeIds)
        .eq('is_active', true);

      if (challengesData) {
        challengesData.forEach(c => {
          challengeMap[c.id] = {
            id: c.id, title: c.title, description: c.description,
            category: c.category, difficulty: c.difficulty, points: c.points,
            hints: parseHints(c.hints), file_url: c.file_url, file_name: c.file_name
          };
        });
      }
    }

    // Build modules with challenges
    const builtModules: CourseModule[] = modulesData.map(m => ({
      ...m,
      challenges: (mcData || [])
        .filter(mc => mc.module_id === m.id)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(mc => challengeMap[mc.challenge_id])
        .filter(Boolean)
    }));

    setModules(builtModules);

    // Load user submissions
    const { data: submissions } = await supabase
      .from('ctf_submissions')
      .select('challenge_id')
      .eq('candidate_id', uid)
      .eq('is_correct', true);

    setSolvedChallenges(submissions?.map(s => s.challenge_id) || []);

    // Load hint usage
    const { data: hintUsage } = await supabase
      .from('ctf_hint_usage')
      .select('challenge_id, hint_index, points_deducted')
      .eq('candidate_id', uid);

    if (hintUsage) {
      const hints: Record<string, number[]> = {};
      const deductions: Record<string, number> = {};
      hintUsage.forEach(h => {
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
      toast.error("Please sign in first to join this course");
      navigate('/auth');
      return;
    }

    setCheckingCode(true);

    const { data, error } = await supabase.rpc('join_course', {
      p_course_slug: slug!,
      p_access_code: accessCode.trim()
    });

    if (error) {
      toast.error("Failed to verify access code");
      setCheckingCode(false);
      return;
    }

    const result = data as { success: boolean; error?: string; course_id?: string; course_title?: string };

    if (!result.success) {
      toast.error(result.error || "Invalid access code");
      setCheckingCode(false);
      return;
    }

    toast.success(`Welcome to ${result.course_title || course?.title}!`);
    setHasAccess(true);
    if (course) await loadCourseData(course.id, userId);
    setCheckingCode(false);
  };

  const handleSubmitFlag = async (challenge: CTFChallenge) => {
    const currentInput = flagInputs[challenge.id] || "";
    if (!currentInput.trim() || !userId) {
      if (!userId) toast.error("Please sign in to submit flags");
      return;
    }

    setSubmitting(true);
    try {
      const { data: isCorrect, error: verifyError } = await supabase
        .rpc('verify_ctf_flag', { p_challenge_id: challenge.id, p_submitted_flag: currentInput.trim() });
      if (verifyError) throw verifyError;

      const hintPenalty = hintDeductions[challenge.id] || 0;
      const finalPoints = Math.max(0, challenge.points - hintPenalty);

      const { error: submitError } = await supabase.from('ctf_submissions').insert({
        candidate_id: userId, challenge_id: challenge.id,
        submitted_flag: currentInput.trim(), is_correct: isCorrect, points_awarded: isCorrect ? finalPoints : 0
      });

      if (submitError) {
        if (submitError.code === '23505') {
          toast.info("You've already solved this challenge!");
          return;
        }
        throw submitError;
      }

      if (isCorrect) {
        setJustSolved({ challengeId: challenge.id, points: finalPoints });
        setSolvedChallenges(prev => [...prev, challenge.id]);
        setFlagInputs(prev => ({ ...prev, [challenge.id]: "" }));
        setTimeout(() => { setJustSolved(null); setSelectedChallenge(null); }, 3000);
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

  const isModuleUnlocked = (moduleIndex: number): boolean => {
    if (!course?.sequential_modules) return true;
    if (moduleIndex === 0) return true;
    // Previous module must be fully completed
    const prevModule = modules[moduleIndex - 1];
    return prevModule.challenges.every(c => solvedChallenges.includes(c.id));
  };

  const getModuleProgress = (mod: CourseModule) => {
    if (mod.challenges.length === 0) return 0;
    const solved = mod.challenges.filter(c => solvedChallenges.includes(c.id)).length;
    return Math.round((solved / mod.challenges.length) * 100);
  };

  const getDifficultyColor = (d: string) => {
    switch (d.toLowerCase()) {
      case 'beginner': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'advanced': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'expert': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const renderInteractiveChallenge = (challenge: CTFChallenge) => {
    const onComplete = (flag: string) => {
      setFlagInputs(prev => ({ ...prev, [challenge.id]: flag }));
      setTimeout(() => handleSubmitFlag(challenge), 100);
    };
    const title = challenge.title.toLowerCase();
    if (title.includes('chess')) return <ChessChallenge onComplete={onComplete} />;
    if (title.includes('quiz')) return <QuizChallenge onComplete={onComplete} />;
    if (title.includes('port probe')) return <PortProbeChallenge challengeId={challenge.id} onSolve={onComplete} />;
    if (title.includes('curious web')) return <CuriousWebChallenge onFlagSubmit={onComplete} />;
    if (title.includes('injection')) return <InjectionJunctionChallenge onFlagSubmit={onComplete} />;
    if (title.includes('deepfake')) return <DeepfakeDetectorChallenge onComplete={onComplete} />;
    if (title.includes('soc in')) return <SOCInTheLoopChallenge onComplete={onComplete} />;
    return null;
  };

  const totalChallenges = modules.reduce((sum, m) => sum + m.challenges.length, 0);
  const totalSolved = modules.reduce((sum, m) => sum + m.challenges.filter(c => solvedChallenges.includes(c.id)).length, 0);
  const overallProgress = totalChallenges > 0 ? Math.round((totalSolved / totalChallenges) * 100) : 0;

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

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">This course doesn't exist or is no longer available.</p>
          <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
        </div>
      </div>
    );
  }

  // Access Code Gate
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title={`${course.title} | Cydena Courses`} description={course.description || "Cybersecurity training course"} />
        <Navigation />
        <div className="container mx-auto px-4 py-16 max-w-md">
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              {course.partner_logo_url && (
                <div className="flex justify-center mb-4">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg inline-block">
                    <img src={course.partner_logo_url} alt={course.partner_name || ""} className="max-h-16 object-contain" />
                  </div>
                </div>
              )}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 mx-auto">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Course Access</span>
              </div>
              <CardTitle className="text-2xl">{course.title}</CardTitle>
              {course.description && (
                <CardDescription className="mt-2">{course.description}</CardDescription>
              )}
              {course.partner_name && (
                <p className="text-sm text-muted-foreground mt-2">
                  Delivered by <strong>{course.partner_name}</strong>
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {!userId ? (
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">Sign in to join this course</p>
                  <Button onClick={() => navigate('/auth')} className="w-full">Sign In / Register</Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enter Access Code</label>
                    <Input
                      value={accessCode}
                      onChange={e => setAccessCode(e.target.value)}
                      placeholder="e.g. CPSA-2026"
                      className="text-center font-mono text-lg tracking-wider"
                      onKeyDown={e => e.key === 'Enter' && handleAccessCode()}
                    />
                  </div>
                  <Button onClick={handleAccessCode} disabled={checkingCode || !accessCode.trim()} className="w-full">
                    {checkingCode ? "Verifying..." : "Join Course"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Challenge detail view
  if (selectedChallenge) {
    const isSolved = solvedChallenges.includes(selectedChallenge.id);
    const interactiveComponent = renderInteractiveChallenge(selectedChallenge);

    return (
      <div className="min-h-screen bg-background">
        <SEO title={`${selectedChallenge.title} | ${course.title}`} description={selectedChallenge.description} />
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setSelectedChallenge(null)} className="mb-6 gap-2">
            ← Back to Modules
          </Button>

          {justSolved?.challengeId === selectedChallenge.id && (
            <Card className="mb-6 border-green-500/30 bg-green-500/10">
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold text-green-500">Challenge Solved! 🎉</h3>
                <p className="text-muted-foreground">You earned <strong>+{justSolved.points} points</strong></p>
              </CardContent>
            </Card>
          )}

          <div className={`grid gap-6 ${interactiveComponent ? 'lg:grid-cols-2' : 'max-w-3xl mx-auto'}`}>
            {interactiveComponent && (
              <div>{interactiveComponent}</div>
            )}

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isSolved ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Target className="h-5 w-5 text-primary" />
                      )}
                      <CardTitle className="text-xl">{selectedChallenge.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getDifficultyColor(selectedChallenge.difficulty)}>
                        {selectedChallenge.difficulty}
                      </Badge>
                      <Badge variant="secondary">{selectedChallenge.points} pts</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedChallenge.description}</p>

                  {/* Hints */}
                  {selectedChallenge.hints && selectedChallenge.hints.length > 0 && !isSolved && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-1">
                        <Lightbulb className="h-4 w-4" /> Hints
                      </h4>
                      {selectedChallenge.hints.map((hint, idx) => (
                        <div key={idx}>
                          {revealedHints[selectedChallenge.id]?.includes(idx) ? (
                            <p className="text-sm bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                              💡 {hint.hint}
                            </p>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => revealHint(selectedChallenge, idx)}
                            >
                              Reveal Hint {idx + 1} {hint.cost > 0 && `(-${hint.cost} pts)`}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Flag submission */}
                  {!isSolved && (
                    <div className="flex gap-2">
                      <Input
                        value={flagInputs[selectedChallenge.id] || ""}
                        onChange={e => setFlagInputs(prev => ({ ...prev, [selectedChallenge.id]: e.target.value }))}
                        placeholder="Enter flag..."
                        className="font-mono"
                        onKeyDown={e => e.key === 'Enter' && handleSubmitFlag(selectedChallenge)}
                      />
                      <Button
                        onClick={() => handleSubmitFlag(selectedChallenge)}
                        disabled={submitting || !flagInputs[selectedChallenge.id]?.trim()}
                      >
                        {submitting ? "..." : <Flag className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}

                  {isSolved && (
                    <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-lg">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Challenge completed!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main course view - module list
  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${course.title} | Cydena Courses`} description={course.description || "Cybersecurity training course"} />
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/courses')} className="mb-4 gap-2">
            ← All Courses
          </Button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {course.partner_logo_url && (
                <div className="bg-white/10 p-3 rounded-lg">
                  <img src={course.partner_logo_url} alt={course.partner_name || ""} className="h-12 object-contain" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{course.title}</h1>
                {course.partner_name && (
                  <p className="text-muted-foreground">Delivered by <strong>{course.partner_name}</strong></p>
                )}
              </div>
            </div>
            {overallProgress === 100 && (
              <Badge className="bg-green-500 gap-1 text-base px-4 py-2">
                <Trophy className="h-4 w-4" /> Course Complete
              </Badge>
            )}
          </div>
          {course.description && (
            <p className="text-muted-foreground mt-4 max-w-3xl">{course.description}</p>
          )}
        </div>

        {/* Overall Progress */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {totalSolved}/{totalChallenges} challenges completed
              </span>
              <span className="text-sm font-medium text-primary">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </CardContent>
        </Card>

        {/* Modules */}
        <div className="space-y-4">
          {modules.map((mod, idx) => {
            const unlocked = isModuleUnlocked(idx);
            const progress = getModuleProgress(mod);
            const isComplete = progress === 100;

            return (
              <Card key={mod.id} className={!unlocked ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                        isComplete ? 'bg-green-500 text-white' :
                        unlocked ? 'bg-primary/10 text-primary' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {isComplete ? <CheckCircle2 className="h-5 w-5" /> : 
                         !unlocked ? <Lock className="h-4 w-4" /> : idx + 1}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{mod.title}</CardTitle>
                        {mod.description && (
                          <CardDescription>{mod.description}</CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {mod.challenges.filter(c => solvedChallenges.includes(c.id)).length}/{mod.challenges.length}
                      </span>
                      {unlocked && <Progress value={progress} className="w-24 h-2" />}
                    </div>
                  </div>
                </CardHeader>
                {unlocked && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {mod.challenges.map(challenge => {
                        const isSolved = solvedChallenges.includes(challenge.id);
                        return (
                          <button
                            key={challenge.id}
                            onClick={() => { setSelectedChallenge(challenge); setSelectedModuleId(mod.id); }}
                            className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 transition-colors flex items-center gap-3"
                          >
                            {isSolved ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <Target className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${isSolved ? 'text-green-500' : ''}`}>
                                {challenge.title}
                              </p>
                              <p className="text-xs text-muted-foreground">{challenge.category} • {challenge.points} pts</p>
                            </div>
                            <Badge variant="outline" className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                              {challenge.difficulty}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {modules.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Modules Yet</h3>
              <p className="text-muted-foreground">Course content is being prepared. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
