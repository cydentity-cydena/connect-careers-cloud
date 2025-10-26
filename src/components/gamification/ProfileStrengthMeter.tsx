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

interface MissingField {
  label: string;
  route: string;
  section?: string;
}

export const ProfileStrengthMeter = ({ userId }: ProfileStrengthMeterProps) => {
  const navigate = useNavigate();
  const [completion, setCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState<MissingField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateCompletion();
  }, [userId]);

  const calculateCompletion = async () => {
    try {
      const missing: MissingField[] = [];
      let score = 0;

      // Check profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        if (profile.full_name) score += 10;
        else missing.push({ label: 'Add your full name', route: '/profile', section: 'name' });
        
        if (profile.bio) score += 10;
        else missing.push({ label: 'Write a professional bio', route: '/profile', section: 'bio' });
        
        if (profile.location) score += 10;
        else missing.push({ label: 'Add your location', route: '/profile', section: 'location' });
        
        if (profile.avatar_url) score += 10;
        else missing.push({ label: 'Upload a profile photo', route: '/profile', section: 'avatar' });
      }

      // Check candidate profile
      const { data: candidateProfile } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (candidateProfile) {
        if (candidateProfile.title) score += 10;
        else missing.push({ label: 'Add your job title', route: '/profile', section: 'title' });
        
        if (candidateProfile.years_experience > 0) score += 10;
        else missing.push({ label: 'Add years of experience', route: '/profile', section: 'experience' });
        
        if (candidateProfile.linkedin_url) score += 10;
        else missing.push({ label: 'Connect LinkedIn profile', route: '/profile', section: 'linkedin' });
      }

      // Check for resumes in the candidate_resumes table
      const { data: resumes } = await supabase
        .from('candidate_resumes')
        .select('id')
        .eq('candidate_id', userId);

      if (resumes && resumes.length > 0) score += 10;
      else missing.push({ label: 'Upload your resume', route: '/dashboard', section: 'resume' });

      // Check skills
      const { data: skills } = await supabase
        .from('candidate_skills')
        .select('id')
        .eq('candidate_id', userId);

      if (skills && skills.length > 0) score += 10;
      else missing.push({ label: 'Add your skills', route: '/skills' });

      // Check certifications
      const { data: certs } = await supabase
        .from('certifications')
        .select('id')
        .eq('candidate_id', userId);

      if (certs && certs.length > 0) score += 10;
      else missing.push({ label: 'Add certifications', route: '/certifications' });

      setCompletion(score);
      setMissingFields(missing);
    } catch (error) {
      console.error('Error calculating completion:', error);
    } finally {
      setLoading(false);
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
              {missingFields.slice(0, 5).map((field, index) => (
                <button
                  key={index}
                  onClick={() => navigate(field.route)}
                  className="w-full flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-primary p-2 rounded-lg hover:bg-accent/50 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary flex items-center justify-center flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/30 group-hover:bg-primary" />
                    </div>
                    <span className="text-left">{field.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
            {missingFields.length > 0 && (
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