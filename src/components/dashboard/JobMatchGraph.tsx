import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Briefcase, ChevronDown, ChevronRight, CheckCircle, XCircle, 
  Lightbulb, TrendingUp, Award, ArrowRight, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface JobMatch {
  job_id: string;
  job_title: string;
  company_name: string | null;
  match_score: number;
  matched_skills: string[];
  matched_certs: string[];
  missing_skills: string[];
  missing_certs: string[];
}

interface SkillSuggestion {
  skill_name: string;
  demand_count: number;
  related_certs: string[];
  avg_salary_boost: number;
}

export function JobMatchGraph() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch job matches using graph query
      const { data: matchData, error: matchError } = await supabase.rpc(
        'get_job_matches_graph',
        { p_candidate_id: user.id }
      );

      if (matchError) {
        console.error('Error fetching job matches:', matchError);
      } else {
        setMatches(matchData || []);
      }

      // Fetch skill upgrade suggestions
      const { data: suggestionData, error: suggestionError } = await supabase.rpc(
        'get_skill_upgrade_suggestions',
        { p_candidate_id: user.id }
      );

      if (suggestionError) {
        console.error('Error fetching skill suggestions:', suggestionError);
      } else {
        setSuggestions(suggestionData || []);
      }
    } catch (error) {
      console.error('Error loading job match data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-500 bg-green-500/10';
    if (score >= 60) return 'text-yellow-500 bg-yellow-500/10';
    if (score >= 40) return 'text-orange-500 bg-orange-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Partial Match';
    return 'Growth Opportunity';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const topMatches = matches.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Job Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Job Matches
          </CardTitle>
          <CardDescription>
            AI-powered matching based on your skills and certifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {topMatches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No job matches found yet.</p>
              <p className="text-sm">Add more skills and certifications to get matches!</p>
            </div>
          ) : (
            topMatches.map((match) => (
              <Collapsible
                key={match.job_id}
                open={expandedJob === match.job_id}
                onOpenChange={() => setExpandedJob(
                  expandedJob === match.job_id ? null : match.job_id
                )}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-4 p-3 rounded-lg border cursor-pointer hover:bg-accent/5 transition-colors">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold",
                      getMatchColor(match.match_score)
                    )}>
                      {match.match_score}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{match.job_title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {match.company_name || 'Company'}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {getMatchLabel(match.match_score)}
                    </Badge>
                    {expandedJob === match.job_id ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 ml-4 border-l-2 border-border space-y-4">
                    {/* Match breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-green-600 flex items-center gap-1 mb-2">
                          <CheckCircle className="h-4 w-4" />
                          Matched
                        </p>
                        <div className="space-y-1">
                          {match.matched_skills?.map((skill) => (
                            <Badge key={skill} variant="outline" className="mr-1 text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {match.matched_certs?.map((cert) => (
                            <Badge key={cert} className="mr-1 text-xs bg-primary/20 text-primary">
                              {cert}
                            </Badge>
                          ))}
                          {(!match.matched_skills?.length && !match.matched_certs?.length) && (
                            <span className="text-sm text-muted-foreground">None yet</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-orange-600 flex items-center gap-1 mb-2">
                          <XCircle className="h-4 w-4" />
                          Missing
                        </p>
                        <div className="space-y-1">
                          {match.missing_skills?.map((skill) => (
                            <Badge key={skill} variant="outline" className="mr-1 text-xs border-dashed">
                              {skill}
                            </Badge>
                          ))}
                          {match.missing_certs?.map((cert) => (
                            <Badge key={cert} variant="outline" className="mr-1 text-xs border-dashed border-primary/50">
                              {cert}
                            </Badge>
                          ))}
                          {(!match.missing_skills?.length && !match.missing_certs?.length) && (
                            <span className="text-sm text-muted-foreground">None!</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/jobs/${match.job_id}`)}
                      className="gap-2"
                    >
                      View Job <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
          
          {matches.length > 5 && (
            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={() => navigate('/jobs')}
            >
              View All {matches.length} Matches
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Skill Upgrade Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Skills to Learn
            </CardTitle>
            <CardDescription>
              In-demand skills that will unlock more job opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Collapsible open={showSuggestions} onOpenChange={setShowSuggestions}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  {showSuggestions ? 'Hide' : 'Show'} Recommendations
                  {showSuggestions ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-3">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <div 
                    key={suggestion.skill_name} 
                    className="flex items-center gap-4 p-3 rounded-lg border"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{suggestion.skill_name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {suggestion.demand_count} jobs
                        </span>
                        {suggestion.avg_salary_boost > 0 && (
                          <span className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            £{Math.round(suggestion.avg_salary_boost / 1000)}k avg
                          </span>
                        )}
                      </div>
                    </div>
                    {suggestion.related_certs?.length > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Related Certs</p>
                        <div className="flex gap-1 justify-end flex-wrap">
                          {suggestion.related_certs.slice(0, 2).map((cert) => (
                            <Badge key={cert} variant="secondary" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
