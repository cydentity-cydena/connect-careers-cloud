import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Skill { id: string; name: string }
interface UserSkill { id: string; skill_id: string; skills: { name: string } }

const Skills = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [existingSkills, setExistingSkills] = useState<UserSkill[]>([]);
  const [existing, setExisting] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      setUserId(session.user.id);

      const [{ data: skillsData }, { data: userSkills }] = await Promise.all([
        supabase.from('skills').select('id, name').order('name'),
        supabase.from('candidate_skills').select('id, skill_id, skills(name)').eq('candidate_id', session.user.id)
      ]);

      setSkills(skillsData ?? []);
      setExistingSkills((userSkills ?? []) as UserSkill[]);
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
    
    // Reload existing skills
    const { data: updatedUserSkills } = await supabase
      .from('candidate_skills')
      .select('id, skill_id, skills(name)')
      .eq('candidate_id', userId);
    
    setExistingSkills((updatedUserSkills ?? []) as UserSkill[]);
    setExisting(new Set((updatedUserSkills ?? []).map((s: any) => s.skill_id)));
    setSelected({});
  };

  const handleRemoveSkill = async (candidateSkillId: string, skillName: string) => {
    if (!userId) return;
    setRemoving(candidateSkillId);

    const { error } = await supabase
      .from('candidate_skills')
      .delete()
      .eq('id', candidateSkillId);

    if (error) {
      toast.error('Failed to remove skill');
      setRemoving(null);
      return;
    }

    toast.success(`Removed ${skillName}`);
    
    // Update local state
    setExistingSkills(prev => prev.filter(s => s.id !== candidateSkillId));
    setExisting(prev => {
      const newSet = new Set(prev);
      const skill = existingSkills.find(s => s.id === candidateSkillId);
      if (skill) newSet.delete(skill.skill_id);
      return newSet;
    });
    setRemoving(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Manage Skills | Cydena" description="Manage your skills and specializations." />
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Current Skills Section */}
        {existingSkills.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Skills</CardTitle>
              <CardDescription>
                Skills you've added to your profile. Click the X to remove.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {existingSkills.map(userSkill => (
                  <Badge 
                    key={userSkill.id} 
                    variant="secondary"
                    className="text-sm py-1.5 px-3 flex items-center gap-2"
                  >
                    {userSkill.skills.name}
                    <button
                      onClick={() => handleRemoveSkill(userSkill.id, userSkill.skills.name)}
                      disabled={removing === userSkill.id}
                      className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Add New Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Skills</CardTitle>
            <CardDescription>
              Select additional skills to add to your profile. Already added skills are marked with ✓
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map(skill => {
                  const isExisting = existing.has(skill.id);
                  const isSelected = !!selected[skill.id];
                  return (
                    <div key={skill.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill.id}
                        checked={isExisting || isSelected}
                        disabled={isExisting}
                        onCheckedChange={() => handleToggle(skill.id)}
                      />
                      <Label 
                        htmlFor={skill.id} 
                        className={isExisting ? 'text-muted-foreground cursor-not-allowed' : 'cursor-pointer'}
                      >
                        {skill.name} {isExisting && '✓'}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
            <Button onClick={handleSave} disabled={!canSave || loading} className="w-full">
              Add Selected Skills
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Skills;
