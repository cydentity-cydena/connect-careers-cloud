import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, CheckCircle2, Circle } from "lucide-react";

interface ProfileStrengthMeterProps {
  userId: string;
}

export const ProfileStrengthMeter = ({ userId }: ProfileStrengthMeterProps) => {
  const [completion, setCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateCompletion();
  }, [userId]);

  const calculateCompletion = async () => {
    try {
      const missing: string[] = [];
      let score = 0;

      // Check profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        if (profile.full_name) score += 10;
        else missing.push('Full name');
        
        if (profile.bio) score += 10;
        else missing.push('Bio');
        
        if (profile.location) score += 10;
        else missing.push('Location');
        
        if (profile.avatar_url) score += 10;
        else missing.push('Profile photo');
      }

      // Check candidate profile
      const { data: candidateProfile } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (candidateProfile) {
        if (candidateProfile.title) score += 10;
        else missing.push('Job title');
        
        if (candidateProfile.years_experience > 0) score += 10;
        else missing.push('Years of experience');
        
        if (candidateProfile.resume_url) score += 10;
        else missing.push('Resume');
        
        if (candidateProfile.linkedin_url) score += 10;
        else missing.push('LinkedIn URL');
      }

      // Check skills
      const { data: skills } = await supabase
        .from('candidate_skills')
        .select('id')
        .eq('candidate_id', userId);

      if (skills && skills.length > 0) score += 10;
      else missing.push('Skills');

      // Check certifications
      const { data: certs } = await supabase
        .from('certifications')
        .select('id')
        .eq('candidate_id', userId);

      if (certs && certs.length > 0) score += 10;
      else missing.push('Certifications');

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
          <Progress value={completion} className="h-3" />
        </div>

        {missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Complete your profile:</p>
            <ul className="space-y-1">
              {missingFields.slice(0, 5).map((field) => (
                <li key={field} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Circle className="h-3 w-3" />
                  {field}
                </li>
              ))}
            </ul>
            {completion === 100 && (
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium pt-2">
                <CheckCircle2 className="h-4 w-4" />
                Profile complete! You're 3x more likely to be discovered by employers.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};