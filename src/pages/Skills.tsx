import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

interface Skill { id: string; name: string }

const Skills = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [existing, setExisting] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      setUserId(session.user.id);

      const [{ data: skillsData }, { data: userSkills }] = await Promise.all([
        supabase.from('skills').select('id, name').order('name'),
        supabase.from('candidate_skills').select('skill_id').eq('candidate_id', session.user.id)
      ]);

      setSkills(skillsData ?? []);
      setExisting(new Set((userSkills ?? []).map((s: any) => s.skill_id)));
      setLoading(false);
    };
    init();
  }, [navigate]);

  const canSave = useMemo(() => Object.values(selected).some(Boolean), [selected]);

  const handleToggle = (id: string) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSave = async () => {
    if (!userId) return;
    const newSkillIds = Object.entries(selected)
      .filter(([id, v]) => v && !existing.has(id))
      .map(([id]) => id);

    if (newSkillIds.length === 0) {
      toast.info('No new skills selected');
      return;
    }

    const rows = newSkillIds.map(id => ({ candidate_id: userId, skill_id: id }));
    const { error } = await supabase.from('candidate_skills').insert(rows);
    if (error) {
      toast.error(error.message);
      return;
    }

    // Award points for each skill added
    const pointsPerSkill = 50;
    const totalPoints = newSkillIds.length * pointsPerSkill;
    
    try {
      for (const skillId of newSkillIds) {
        await supabase.functions.invoke('award-points-helper', {
          body: {
            candidateId: userId,
            code: 'SKILL_ADDED',
            meta: { skillId }
          }
        });
      }
      
      // Trigger achievement check
      const totalSkills = existing.size + newSkillIds.length;
      await supabase.rpc('check_and_award_achievements', {
        p_user_id: userId,
        p_category: 'skills',
        p_current_count: totalSkills
      });
      
      toast.success(`✅ ${newSkillIds.length} skill(s) added — +${totalPoints} points!`);
    } catch (e) {
      toast.success('Skills added');
    }
    
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Add Skills | Cydena" description="Add skills to your candidate profile." />
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Select your skills</CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div>Loading...</div>
          ) : skills.length === 0 ? (
            <p className="text-muted-foreground">No skills available yet. Please check back later.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {skills.map((s) => (
                <label key={s.id} className="flex items-center gap-3">
                  <Checkbox id={s.id} checked={!!selected[s.id]} onCheckedChange={() => handleToggle(s.id)} />
                  <Label htmlFor={s.id}>{s.name}</Label>
                </label>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!canSave}>Save</Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Skills;
