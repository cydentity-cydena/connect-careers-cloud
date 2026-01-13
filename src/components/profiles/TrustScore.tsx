import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, CheckCircle2, AlertCircle, User, Award, Briefcase, Trophy, Users, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustScoreProps {
  candidateId: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface TrustScoreData {
  total_trust_score: number;
  identity_score: number;
  rtw_score: number;
  clearance_score: number;
  hr_ready_score: number;
  certification_score: number;
  profile_completion_score: number;
  skills_score: number;
  experience_score: number;
  ctf_score: number;
  community_score: number;
  assessment_score: number;
}

const scoreCategories = [
  { key: 'identity_score', label: 'Identity Verified', icon: User, weight: '15%' },
  { key: 'rtw_score', label: 'Right to Work', icon: FileCheck, weight: '10%' },
  { key: 'clearance_score', label: 'Security Clearance', icon: Shield, weight: '10%' },
  { key: 'hr_ready_score', label: 'HR Ready', icon: CheckCircle2, weight: '15%' },
  { key: 'certification_score', label: 'Certifications', icon: Award, weight: '15%' },
  { key: 'profile_completion_score', label: 'Profile Complete', icon: User, weight: '10%' },
  { key: 'skills_score', label: 'Skills Added', icon: Briefcase, weight: '5%' },
  { key: 'experience_score', label: 'Experience', icon: Briefcase, weight: '5%' },
  { key: 'ctf_score', label: 'CTF Performance', icon: Trophy, weight: '5%' },
  { key: 'community_score', label: 'Community Engagement', icon: Users, weight: '5%' },
  { key: 'assessment_score', label: 'Assessments', icon: FileCheck, weight: '5%' },
];

export function TrustScore({ candidateId, showDetails = false, size = 'md' }: TrustScoreProps) {
  const [score, setScore] = useState<TrustScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrustScore = async () => {
      try {
        // First try to get cached score
        const { data: cachedScore } = await supabase
          .from('trust_scores')
          .select('*')
          .eq('candidate_id', candidateId)
          .maybeSingle();

        if (cachedScore) {
          setScore(cachedScore);
        }

        // Calculate fresh score (this also updates the cache)
        const { data: freshScore, error } = await supabase.rpc('calculate_trust_score', {
          p_candidate_id: candidateId
        });

        if (!error && freshScore !== null) {
          // Refetch the detailed score
          const { data: updatedScore } = await supabase
            .from('trust_scores')
            .select('*')
            .eq('candidate_id', candidateId)
            .maybeSingle();
          
          if (updatedScore) {
            setScore(updatedScore);
          }
        }
      } catch (error) {
        console.error('Error fetching trust score:', error);
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchTrustScore();
    }
  }, [candidateId]);

  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    if (value >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreGradient = (value: number) => {
    if (value >= 80) return 'from-green-500 to-emerald-400';
    if (value >= 60) return 'from-yellow-500 to-amber-400';
    if (value >= 40) return 'from-orange-500 to-orange-400';
    return 'from-red-500 to-red-400';
  };

  const getScoreLabel = (value: number) => {
    if (value >= 90) return 'Exceptional';
    if (value >= 80) return 'Excellent';
    if (value >= 70) return 'Very Good';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    return 'Building';
  };

  if (loading) {
    return (
      <div className={cn(
        "animate-pulse bg-muted rounded-lg",
        size === 'sm' && "h-8 w-20",
        size === 'md' && "h-12 w-32",
        size === 'lg' && "h-16 w-40"
      )} />
    );
  }

  const totalScore = score?.total_trust_score ?? 0;

  // Compact badge version
  if (size === 'sm') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                "gap-1 cursor-help",
                getScoreColor(totalScore)
              )}
            >
              <Shield className="h-3 w-3" />
              {totalScore}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Trust Score: {totalScore}/100</p>
            <p className="text-xs text-muted-foreground">{getScoreLabel(totalScore)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Medium circular score
  if (size === 'md' && !showDetails) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br",
            getScoreGradient(totalScore)
          )}>
            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
              <span className="text-xl font-bold">{totalScore}</span>
            </div>
          </div>
        </div>
        <div>
          <p className="font-semibold">Trust Score</p>
          <p className={cn("text-sm", getScoreColor(totalScore))}>
            {getScoreLabel(totalScore)}
          </p>
        </div>
      </div>
    );
  }

  // Full detailed card
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          Verification Trust Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main score display */}
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg",
            getScoreGradient(totalScore)
          )}>
            <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
              <span className="text-2xl font-bold">{totalScore}</span>
            </div>
          </div>
          <div>
            <p className={cn("text-lg font-semibold", getScoreColor(totalScore))}>
              {getScoreLabel(totalScore)}
            </p>
            <p className="text-sm text-muted-foreground">
              Based on {scoreCategories.length} verification factors
            </p>
          </div>
        </div>

        {/* Score breakdown */}
        {showDetails && score && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-3">Score Breakdown</p>
            {scoreCategories.map((category) => {
              const value = score[category.key as keyof TrustScoreData] as number;
              const Icon = category.icon;
              return (
                <div key={category.key} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm flex-1 truncate">{category.label}</span>
                  <span className="text-xs text-muted-foreground">{category.weight}</span>
                  <div className="w-16">
                    <Progress value={value} className="h-1.5" />
                  </div>
                  <span className={cn("text-sm font-medium w-8 text-right", getScoreColor(value))}>
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
