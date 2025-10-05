import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Crosshair, Scale, Cloud, Brain, Clock, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type SkillPathway = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  level: string;
  required_skills: string[];
  recommended_certs: string[];
  next_steps: string[];
  estimated_time_months: number | null;
  icon: string | null;
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Blue Team': return <Shield className="h-5 w-5" />;
    case 'Red Team': return <Crosshair className="h-5 w-5" />;
    case 'Governance': return <Scale className="h-5 w-5" />;
    case 'Cloud Security': return <Cloud className="h-5 w-5" />;
    case 'AI Security': return <Brain className="h-5 w-5" />;
    default: return <Circle className="h-5 w-5" />;
  }
};

const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'beginner': return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'intermediate': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'advanced': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    case 'expert': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
    default: return 'bg-muted';
  }
};

export const SkillPathways = () => {
  const [pathways, setPathways] = useState<SkillPathway[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadPathways();
    loadUserSkills();
  }, []);

  const loadPathways = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_pathways')
        .select('*')
        .order('level', { ascending: true });

      if (error) throw error;
      setPathways(data || []);
    } catch (error) {
      console.error('Error loading pathways:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSkills = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('candidate_skills')
        .select('skill_id, skills(name)')
        .eq('candidate_id', user.id);

      if (error) throw error;
      
      const skillNames = new Set(
        data?.map((item: any) => item.skills?.name).filter(Boolean) || []
      );
      setUserSkills(skillNames);
    } catch (error) {
      console.error('Error loading user skills:', error);
    }
  };

  const calculateProgress = (pathway: SkillPathway) => {
    if (!pathway.required_skills || pathway.required_skills.length === 0) return 0;
    const matchedSkills = pathway.required_skills.filter(skill => userSkills.has(skill)).length;
    return Math.round((matchedSkills / pathway.required_skills.length) * 100);
  };

  const categories = [
    { value: 'all', label: 'All Pathways' },
    { value: 'Blue Team', label: 'Blue Team', icon: <Shield className="h-4 w-4" /> },
    { value: 'Red Team', label: 'Red Team', icon: <Crosshair className="h-4 w-4" /> },
    { value: 'Governance', label: 'Governance', icon: <Scale className="h-4 w-4" /> },
    { value: 'Cloud Security', label: 'Cloud Security', icon: <Cloud className="h-4 w-4" /> },
    { value: 'AI Security', label: 'AI Security', icon: <Brain className="h-4 w-4" /> },
  ];

  const filteredPathways = selectedCategory === 'all' 
    ? pathways 
    : pathways.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-20 bg-muted rounded" />
                <div className="h-8 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value} className="flex items-center gap-2">
              {cat.icon}
              <span className="hidden sm:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPathways.map((pathway) => {
          const progress = calculateProgress(pathway);
          const isComplete = progress === 100;

          return (
            <Card key={pathway.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg ${getLevelColor(pathway.level)}`}>
                    {getCategoryIcon(pathway.category)}
                  </div>
                  <Badge variant="outline" className={getLevelColor(pathway.level)}>
                    {pathway.level}
                  </Badge>
                </div>
                <CardTitle className="flex items-center gap-2">
                  {pathway.name}
                  {isComplete && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                </CardTitle>
                <CardDescription>{pathway.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {pathway.estimated_time_months && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{pathway.estimated_time_months} months</span>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {pathway.required_skills?.slice(0, 3).map((skill, i) => (
                      <Badge 
                        key={i} 
                        variant={userSkills.has(skill) ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {userSkills.has(skill) && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {skill}
                      </Badge>
                    ))}
                    {pathway.required_skills?.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{pathway.required_skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {pathway.recommended_certs && pathway.recommended_certs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Recommended Certs</h4>
                    <div className="flex flex-wrap gap-1">
                      {pathway.recommended_certs.slice(0, 2).map((cert, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button className="w-full" variant={isComplete ? "default" : "outline"}>
                  {isComplete ? "Review Pathway" : "Start Learning"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPathways.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pathways found for this category.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};