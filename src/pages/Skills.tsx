import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, X, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Skill { id: string; name: string }
interface UserSkill { id: string; skill_id: string; years_experience: number | null; skills: { name: string } }

const Skills = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [yearsExp, setYearsExp] = useState<Record<string, number>>({});
  const [existingSkills, setExistingSkills] = useState<UserSkill[]>([]);
  const [existing, setExisting] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [editingExp, setEditingExp] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      setUserId(session.user.id);

      const [{ data: skillsData }, { data: userSkills }] = await Promise.all([
        supabase.from('skills').select('id, name').order('name'),
        supabase.from('candidate_skills').select('id, skill_id, years_experience, skills(name)').eq('candidate_id', session.user.id)
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

    const rows = newSkillIds.map(id => ({ 
      candidate_id: userId, 
      skill_id: id,
      years_experience: yearsExp[id] || 0
    }));
    const { error } = await supabase.from('candidate_skills').insert(rows);
    if (error) {
      toast.error(error.message);
      return;
    }

    // Award points for each skill added (capped at 20 skills to prevent abuse)
    const SKILL_POINTS_CAP = 20;
    const pointsPerSkill = 50;
    const currentSkillCount = existing.size;
    
    // Calculate how many of the new skills should earn points
    const skillsEligibleForPoints = Math.max(0, SKILL_POINTS_CAP - currentSkillCount);
    const skillsToReward = Math.min(newSkillIds.length, skillsEligibleForPoints);
    const totalPoints = skillsToReward * pointsPerSkill;
    
    try {
      // Only award points for skills up to the cap
      for (let i = 0; i < skillsToReward; i++) {
        await supabase.functions.invoke('award-points-helper', {
          body: {
            candidateId: userId,
            code: 'SKILL_ADDED',
            meta: { skillId: newSkillIds[i] }
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
      
      if (skillsToReward > 0) {
        const message = skillsToReward < newSkillIds.length 
          ? `✅ ${newSkillIds.length} skill(s) added — +${totalPoints} points (${newSkillIds.length - skillsToReward} skill(s) added without points - 20 skill cap reached)`
          : `✅ ${newSkillIds.length} skill(s) added — +${totalPoints} points!`;
        toast.success(message);
      } else {
        toast.success(`✅ ${newSkillIds.length} skill(s) added (no points awarded - 20 skill cap reached)`);
      }
    } catch (e) {
      toast.success('Skills added');
    }
    
    // Reload existing skills
    const { data: updatedUserSkills } = await supabase
      .from('candidate_skills')
      .select('id, skill_id, years_experience, skills(name)')
      .eq('candidate_id', userId);
    
    setExistingSkills((updatedUserSkills ?? []) as UserSkill[]);
    setExisting(new Set((updatedUserSkills ?? []).map((s: any) => s.skill_id)));
    setSelected({});
    setYearsExp({});
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
                    {editingExp === userSkill.id ? (
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={yearsExp[userSkill.id] ?? userSkill.years_experience ?? 0}
                        onChange={(e) => setYearsExp(prev => ({ ...prev, [userSkill.id]: parseInt(e.target.value) || 0 }))}
                        onBlur={async () => {
                          const years = yearsExp[userSkill.id] ?? userSkill.years_experience ?? 0;
                          const { error } = await supabase
                            .from('candidate_skills')
                            .update({ years_experience: years })
                            .eq('id', userSkill.id);
                          if (error) {
                            toast.error('Failed to update years of experience');
                          } else {
                            toast.success('Years of experience updated');
                            const { data: updatedSkills } = await supabase
                              .from('candidate_skills')
                              .select('id, skill_id, years_experience, skills(name)')
                              .eq('candidate_id', userId);
                            setExistingSkills((updatedSkills ?? []) as UserSkill[]);
                          }
                          setEditingExp(null);
                        }}
                        className="ml-2 w-16 h-6 text-xs"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setYearsExp(prev => ({ ...prev, [userSkill.id]: userSkill.years_experience ?? 0 }));
                          setEditingExp(userSkill.id);
                        }}
                        className="ml-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {userSkill.years_experience ? `${userSkill.years_experience} yrs` : '0 yrs'}
                        <Pencil className="ml-1 h-3 w-3 inline" />
                      </button>
                    )}
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
              <div className="space-y-3">
                {skills.map(skill => {
                  const isExisting = existing.has(skill.id);
                  const isSelected = !!selected[skill.id];
                  return (
                    <div key={skill.id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-2 flex-1">
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
                      {isSelected && !isExisting && (
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`years-${skill.id}`} className="text-xs text-muted-foreground whitespace-nowrap">
                            Years:
                          </Label>
                          <Input
                            id={`years-${skill.id}`}
                            type="number"
                            min="0"
                            max="50"
                            placeholder="0"
                            value={yearsExp[skill.id] || ''}
                            onChange={(e) => setYearsExp(prev => ({ ...prev, [skill.id]: parseInt(e.target.value) || 0 }))}
                            className="w-20 h-8"
                          />
                        </div>
                      )}
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
