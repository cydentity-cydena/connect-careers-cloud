import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Flame, Trophy, Share2, CheckCircle, XCircle, Flag, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ChessChallenge from "@/components/ctf/ChessChallenge";
import { QuizChallenge } from "@/components/ctf/QuizChallenge";

interface MCQChallenge {
  type: "mcq";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

interface CTFChallenge {
  type: "ctf";
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  hints: any;
  flag: string;
}

type Challenge = MCQChallenge | CTFChallenge;

export function SecurityIQ() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [flagInput, setFlagInput] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [todayScore, setTodayScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    loadTodayChallenge();
    loadUserStats();
  }, []);

  const loadTodayChallenge = async () => {
    try {
      // Fetch today's challenge from edge function
      const { data: challengeData, error: challengeError } = await supabase.functions.invoke(
        'generate-security-iq-challenge'
      );
      
      if (challengeError) {
        console.error('Error fetching challenge:', challengeError);
        throw challengeError;
      }
      
      // Validate challenge data based on type
      if (!challengeData || !challengeData.type) {
        console.error('Invalid challenge data received:', challengeData);
        toast.error("Failed to load challenge - invalid data");
        setLoading(false);
        return;
      }

      if (challengeData.type === "mcq") {
        if (!challengeData.question || 
            !Array.isArray(challengeData.options) || 
            challengeData.options.length !== 4 ||
            challengeData.correctAnswer === undefined ||
            !challengeData.explanation ||
            !challengeData.category) {
          console.error('Invalid MCQ challenge data:', challengeData);
          toast.error("Failed to load challenge - invalid data");
          setLoading(false);
          return;
        }
      } else if (challengeData.type === "ctf") {
        if (!challengeData.title || !challengeData.description || !challengeData.flag) {
          console.error('Invalid CTF challenge data:', challengeData);
          toast.error("Failed to load challenge - invalid data");
          setLoading(false);
          return;
        }
      }
      
      setChallenge(challengeData);
      
      // Check if user already answered today
      const today = new Date().toISOString().split('T')[0];
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from('security_iq_attempts')
          .select('*')
          .eq('candidate_id', user.id)
          .eq('challenge_date', today)
          .maybeSingle();
        
        if (data) {
          setHasAnswered(true);
          if (challengeData.type === "mcq") {
            setSelectedAnswer(data.selected_answer);
          } else if (challengeData.type === "ctf") {
            setFlagInput(data.submitted_flag || "");
          }
          setTodayScore(data.score);
        }
      }
    } catch (error) {
      console.error('Error loading challenge:', error);
      toast.error("Failed to load today's challenge");
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: streakData } = await supabase.rpc('calculate_security_iq_streak', {
        p_candidate_id: user.id
      });
      setStreak(streakData || 0);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!challenge) return;
    
    let isCorrect = false;
    let score = 0;
    
    if (challenge.type === "mcq") {
      if (selectedAnswer === null) return;
      isCorrect = selectedAnswer === challenge.correctAnswer;
      score = isCorrect ? 100 : 0;
    } else if (challenge.type === "ctf") {
      if (!flagInput.trim()) return;
      isCorrect = flagInput.trim() === challenge.flag;
      score = isCorrect ? challenge.points : 0;
    }
    
    setHasAnswered(true);
    setTodayScore(score);
    
    // Save to database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      
      const attemptData: any = {
        candidate_id: user.id,
        challenge_date: today,
        score: score
      };
      
      if (challenge.type === "mcq") {
        attemptData.selected_answer = selectedAnswer;
      } else if (challenge.type === "ctf") {
        attemptData.submitted_flag = flagInput.trim();
        attemptData.challenge_id = challenge.id;
      }
      
      const { error } = await supabase
        .from('security_iq_attempts')
        .insert(attemptData);
      
      if (error) {
        console.error('Error saving attempt:', error);
      } else {
        // Recalculate streak
        const { data: streakData } = await supabase.rpc('calculate_security_iq_streak', {
          p_candidate_id: user.id
        });
        setStreak(streakData || 0);
      }
    }
    
    if (isCorrect) {
      toast.success(`Correct! +${score} points`, {
        description: "Keep your streak going!"
      });
    } else {
      toast.error("Not quite right", {
        description: challenge.type === "ctf" ? "Try again with the correct flag format" : "But you learned something new!"
      });
    }
  };

  const shareResults = () => {
    if (!challenge) return;
    
    const emoji = todayScore && todayScore > 0 ? "✅" : "❌";
    const challengeType = challenge.type === "ctf" ? "CTF" : "MCQ";
    const text = `Security IQ Daily Challenge ${emoji}\nType: ${challengeType}\nStreak: ${streak} 🔥\nScore: ${todayScore}/${challenge.type === "ctf" ? challenge.points : 100}\n\nTest your cybersecurity knowledge on Cydena!`;
    
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Results copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-pulse">Loading today's challenge...</div>
        </CardContent>
      </Card>
    );
  }

  if (!challenge) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-background/95 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              {challenge.type === "ctf" ? <Flag className="h-6 w-6 text-primary" /> : <Shield className="h-6 w-6 text-primary" />}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Security IQ
                <Badge variant="outline" className="text-xs">
                  {challenge.type === "ctf" ? "CTF Challenge" : "Daily Challenge"}
                </Badge>
              </CardTitle>
              <CardDescription>
                {challenge.type === "ctf" ? "Capture the flag!" : "Test your cybersecurity knowledge"}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="h-5 w-5" />
                <span className="text-2xl font-bold">{streak}</span>
              </div>
              <div className="text-xs text-muted-foreground">day streak</div>
            </div>
            
            {todayScore !== null && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary">
                  <Trophy className="h-5 w-5" />
                  <span className="text-2xl font-bold">{todayScore}</span>
                </div>
                <div className="text-xs text-muted-foreground">today</div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Category and Difficulty Badges */}
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">
            {challenge.category}
          </Badge>
          {challenge.type === "ctf" && (
            <>
              <Badge variant="outline" className="text-xs">
                {challenge.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {challenge.points} points
              </Badge>
            </>
          )}
        </div>

        {/* Challenge Content */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold leading-relaxed">
            {challenge.type === "mcq" ? challenge.question : challenge.title}
          </h3>

          {challenge.type === "ctf" && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {challenge.description}
              </p>
            </div>
          )}

          {/* CTF Flag Input */}
          {challenge.type === "ctf" && !hasAnswered && (
            <div className="space-y-3">
              {/* Interactive Challenge Components */}
              {challenge.title.trim().toLowerCase() === "advanced chess gambit" ? (
                <ChessChallenge 
                  onComplete={(flag) => {
                    setFlagInput(flag);
                  }} 
                />
              ) : challenge.title.trim().toLowerCase() === "quiz quantlet" ? (
                <QuizChallenge 
                  onComplete={(flag) => {
                    setFlagInput(flag);
                  }} 
                />
              ) : null}
              
              <Input
                placeholder="Enter flag (e.g., FLAG{...})"
                value={flagInput}
                onChange={(e) => setFlagInput(e.target.value)}
                className="font-mono"
              />
              {challenge.hints && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs"
                >
                  <Lightbulb className="h-3 w-3 mr-1" />
                  {showHint ? "Hide" : "Show"} Hint
                </Button>
              )}
              {showHint && challenge.hints && (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs">
                  💡 {Array.isArray(challenge.hints) ? challenge.hints[0] : challenge.hints}
                </div>
              )}
            </div>
          )}

          {/* MCQ Answer Options */}
          {challenge.type === "mcq" && (
            <div className="space-y-3">
              {challenge.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === challenge.correctAnswer;
                const showResult = hasAnswered;
                
                let buttonClass = "w-full justify-start text-left h-auto py-4 px-4 ";
                
                if (showResult) {
                  if (isCorrect) {
                    buttonClass += "border-green-500 bg-green-500/10 hover:bg-green-500/20";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += "border-red-500 bg-red-500/10 hover:bg-red-500/20";
                  } else {
                    buttonClass += "opacity-50";
                  }
                } else {
                  buttonClass += isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50";
                }

                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={buttonClass}
                    onClick={() => !hasAnswered && setSelectedAnswer(index)}
                    disabled={hasAnswered}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">{option}</span>
                      {showResult && isCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500" />}
                    </div>
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {/* Explanation (shown after answering) */}
        {hasAnswered && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border animate-fade-in space-y-2">
            <div className="font-semibold text-sm flex items-center gap-2">
              {todayScore && todayScore > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              {todayScore && todayScore > 0 ? "Correct!" : "Incorrect"}
            </div>
            {challenge.type === "mcq" && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {challenge.explanation}
              </p>
            )}
            {challenge.type === "ctf" && todayScore && todayScore > 0 && (
              <p className="text-sm text-muted-foreground">
                Well done! You successfully captured the flag.
              </p>
            )}
            {challenge.type === "ctf" && (!todayScore || todayScore === 0) && (
              <p className="text-sm text-muted-foreground font-mono">
                The correct flag was: {challenge.flag}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!hasAnswered ? (
            <Button 
              onClick={handleAnswerSubmit} 
              disabled={challenge.type === "mcq" ? selectedAnswer === null : !flagInput.trim()}
              className="flex-1"
            >
              Submit {challenge.type === "ctf" ? "Flag" : "Answer"}
            </Button>
          ) : (
            <>
              <Button 
                onClick={shareResults}
                variant="outline"
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Result
              </Button>
              <Button 
                onClick={() => window.location.href = '/leaderboard'}
                variant="default"
                className="flex-1"
              >
                View Leaderboard
              </Button>
            </>
          )}
        </div>

        {/* Coming tomorrow message */}
        {hasAnswered && (
          <div className="text-center text-sm text-muted-foreground">
            Come back tomorrow for a new challenge! 🎯
          </div>
        )}
      </CardContent>
    </Card>
  );
}
