import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Flame, Trophy, Share2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Challenge {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

export function SecurityIQ() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [todayScore, setTodayScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

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
          .single();
        
        if (data) {
          setHasAnswered(true);
          setSelectedAnswer(data.selected_answer);
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
    if (selectedAnswer === null || !challenge) return;
    
    const isCorrect = selectedAnswer === challenge.correctAnswer;
    const score = isCorrect ? 100 : 0;
    
    setHasAnswered(true);
    setTodayScore(score);
    
    // Save to database
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('security_iq_attempts')
        .insert({
          candidate_id: user.id,
          challenge_date: today,
          selected_answer: selectedAnswer,
          score: score
        });
      
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
      toast.success("Correct! +100 XP", {
        description: "Keep your streak going!"
      });
    } else {
      toast.error("Not quite right", {
        description: "But you learned something new!"
      });
    }
  };

  const shareResults = () => {
    const emoji = todayScore === 100 ? "✅" : "❌";
    const text = `Security IQ Daily Challenge ${emoji}\nStreak: ${streak} 🔥\nScore: ${todayScore}/100\n\nTest your cybersecurity knowledge on Cydena!`;
    
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
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Security IQ
                <Badge variant="outline" className="text-xs">Daily Challenge</Badge>
              </CardTitle>
              <CardDescription>
                Test your cybersecurity knowledge
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
        {/* Category Badge */}
        <Badge variant="secondary" className="text-xs">
          {challenge.category}
        </Badge>

        {/* Question */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold leading-relaxed">
            {challenge.question}
          </h3>

          {/* Answer Options */}
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
        </div>

        {/* Explanation (shown after answering) */}
        {hasAnswered && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border animate-fade-in space-y-2">
            <div className="font-semibold text-sm">Explanation</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {challenge.explanation}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!hasAnswered ? (
            <Button 
              onClick={handleAnswerSubmit} 
              disabled={selectedAnswer === null}
              className="flex-1"
            >
              Submit Answer
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
