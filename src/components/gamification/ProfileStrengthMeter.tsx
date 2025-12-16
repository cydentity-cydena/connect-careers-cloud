import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle2, ChevronRight, ArrowRight } from "lucide-react";

interface ProfileStrengthMeterProps {
  userId: string;
}

interface ProfileField {
  label: string;
  route: string;
  section?: string;
  completed: boolean;
}

export const ProfileStrengthMeter = ({ userId }: ProfileStrengthMeterProps) => {
  const navigate = useNavigate();
  const [completion, setCompletion] = useState(0);
  const [profileFields, setProfileFields] = useState<ProfileField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateCompletion();
  }, [userId]);

  const calculateCompletion = async () => {
    try {
      const fields: ProfileField[] = [];
      let score = 0;

      // Check profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        const hasName = !!profile.full_name;
        if (hasName) score += 10;
        fields.push({ label: 'Add your full name', route: '/profile', section: 'name', completed: hasName });
        
        const hasBio = !!profile.bio;
        if (hasBio) score += 10;
        fields.push({ label: 'Write a professional bio', route: '/profile', section: 'bio', completed: hasBio });
        
        const hasLocation = !!profile.location;
        if (hasLocation) score += 10;
        fields.push({ label: 'Add your location', route: '/profile', section: 'location', completed: hasLocation });
        
        const hasAvatar = !!profile.avatar_url;
        if (hasAvatar) score += 10;
        fields.push({ label: 'Upload a profile photo', route: '/profile', section: 'avatar', completed: hasAvatar });
      }

      // Check candidate profile
      const { data: candidateProfile } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (candidateProfile) {
        const hasTitle = !!candidateProfile.title;
        if (hasTitle) score += 10;
        fields.push({ label: 'Add your job title', route: '/profile', section: 'title', completed: hasTitle });
        
        const hasExperience = candidateProfile.years_experience > 0;
        if (hasExperience) score += 10;
        fields.push({ label: 'Add years of experience', route: '/profile', section: 'experience', completed: hasExperience });
        
        const hasLinkedIn = !!candidateProfile.linkedin_url;
        if (hasLinkedIn) score += 10;
        fields.push({ label: 'Connect LinkedIn profile', route: '/profile', section: 'linkedin', completed: hasLinkedIn });
      }

      // Check for resumes in the candidate_resumes table
      const { data: resumes } = await supabase
        .from('candidate_resumes')
        .select('id')
        .eq('candidate_id', userId);

      const hasResume = resumes && resumes.length > 0;
      if (hasResume) score += 10;
      fields.push({ label: 'Upload your resume', route: '/dashboard', section: 'resume', completed: hasResume });

      // Check skills
      const { data: skills } = await supabase
        .from('candidate_skills')
        .select('id')
        .eq('candidate_id', userId);

      const hasSkills = skills && skills.length > 0;
      if (hasSkills) score += 10;
      fields.push({ label: 'Add your skills', route: '/skills', completed: hasSkills });

      // Check certifications
      const { data: certs } = await supabase
        .from('certifications')
        .select('id')
        .eq('candidate_id', userId);

      const hasCerts = certs && certs.length > 0;
      if (hasCerts) score += 10;
      fields.push({ label: 'Add certifications', route: '/certifications', completed: hasCerts });

      setCompletion(score);
      setProfileFields(fields);

      // Award achievements for profile completion milestones
      await checkAndAwardProfileAchievements(score);
    } catch (error) {
      console.error('Error calculating completion:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndAwardProfileAchievements = async (score: number) => {
    try {
      // Use the database function to check and award achievements
      await supabase.rpc('check_and_award_achievements', {
        p_user_id: userId,
        p_category: 'profile',
        p_current_count: score
      });
    } catch (error) {
      console.error('Error checking profile achievements:', error);
    }
  };

  const getStrengthLabel = () => {
    if (completion === 100) return { text: 'Elite', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600' };
    if (completion >= 80) return { text: 'Strong', color: 'bg-gradient-to-r from-green-400 to-green-600' };
    if (completion >= 50) return { text: 'Good', color: 'bg-gradient-to-r from-blue-400 to-blue-600' };
    return { text: 'Getting Started', color: 'bg-gradient-to-r from-gray-400 to-gray-600' };
  };

  if (loading) return null;

  const strength = getStrengthLabel();

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Profile Strength
          <Badge className={`ml-auto ${strength.color} text-white border-0`}>
            {strength.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-bold">{completion}%</span>
          </div>
          <Progress 
            value={completion} 
            className="h-3 cursor-pointer hover:scale-105 transition-transform" 
            onClick={() => navigate('/profile')}
          />
        </div>

        {completion === 100 ? (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>Profile complete! You're 3x more likely to be discovered by employers.</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Next steps to boost your profile:</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/profile')}
                className="text-xs h-7"
              >
                Edit Profile
              </Button>
            </div>
            <div className="space-y-2">
              {profileFields.slice(0, 5).map((field, index) => (
                <button
                  key={index}
                  onClick={() => !field.completed && navigate(field.route)}
                  disabled={field.completed}
                  className={`w-full flex items-center justify-between gap-2 text-sm p-2 rounded-lg transition-all group ${
                    field.completed 
                      ? 'text-green-600 dark:text-green-400 cursor-default' 
                      : 'text-muted-foreground hover:text-primary hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      field.completed 
                        ? 'border-green-500 bg-green-500' 
                        : 'border-muted-foreground/30 group-hover:border-primary'
                    }`}>
                      {field.completed ? (
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30 group-hover:bg-primary" />
                      )}
                    </div>
                    <span className={`text-left ${field.completed ? 'line-through opacity-70' : ''}`}>
                      {field.label}
                    </span>
                  </div>
                  {!field.completed && (
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </button>
              ))}
            </div>
            {profileFields.some(f => !f.completed) && (
              <Button 
                variant="cyber" 
                size="sm" 
                onClick={() => navigate('/profile')}
                className="w-full mt-2"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Complete Profile Now
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};