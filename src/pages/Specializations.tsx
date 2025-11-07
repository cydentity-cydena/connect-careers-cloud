import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { SPECIALIZATIONS, detectSpecializations, type Specialization } from '@/lib/specializations';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const Specializations = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [autoDetected, setAutoDetected] = useState<Specialization[]>([]);
  const [selected, setSelected] = useState<Record<Specialization, boolean>>({} as Record<Specialization, boolean>);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      setUserId(session.user.id);

      // Fetch user's skills and certifications to detect specializations
      const [{ data: skillsData }, { data: certsData }, { data: profileData }] = await Promise.all([
        supabase
          .from('candidate_skills')
          .select('skills(name, category)')
          .eq('candidate_id', session.user.id),
        supabase
          .from('certifications')
          .select('name, issuer')
          .eq('candidate_id', session.user.id),
        supabase
          .from('candidate_profiles')
          .select('specializations')
          .eq('user_id', session.user.id)
          .maybeSingle()
      ]);

      // Auto-detect specializations based on skills and certs
      const detected = detectSpecializations(
        skillsData ?? [],
        certsData ?? []
      );
      setAutoDetected(detected);

      // Load saved preferences or default to all auto-detected
      const savedSpecs = profileData?.specializations as Specialization[] | null;
      if (savedSpecs && savedSpecs.length > 0) {
        const selectedMap = {} as Record<Specialization, boolean>;
        savedSpecs.forEach(spec => {
          selectedMap[spec] = true;
        });
        setSelected(selectedMap);
      } else {
        // Default to showing all detected
        const defaultSelected = {} as Record<Specialization, boolean>;
        detected.forEach(spec => {
          defaultSelected[spec] = true;
        });
        setSelected(defaultSelected);
      }

      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleToggle = (id: Specialization) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    if (!userId) return;

    const selectedSpecs = Object.entries(selected)
      .filter(([_, isSelected]) => isSelected)
      .map(([spec]) => spec as Specialization);

    // Save to candidate_profiles
    const { error } = await supabase
      .from('candidate_profiles')
      .upsert({
        user_id: userId,
        specializations: selectedSpecs
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      toast.error('Failed to save specializations');
      console.error(error);
      return;
    }

    toast.success('Specializations updated!');
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Manage Specializations | Cydena" description="Choose which specializations to display on your profile." />
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

        <Card>
          <CardHeader>
            <CardTitle>Manage Your Specializations</CardTitle>
            <CardDescription>
              Specializations are automatically detected from your skills and certifications. Choose which ones to display publicly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {autoDetected.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  We detected {autoDetected.length} specialization{autoDetected.length > 1 ? 's' : ''} based on your profile. 
                  Uncheck any you don't want to display.
                </AlertDescription>
              </Alert>
            )}

            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : autoDetected.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No specializations detected yet. Add more skills and certifications to unlock specializations!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {SPECIALIZATIONS.filter(spec => autoDetected.includes(spec.id)).map(spec => (
                    <div key={spec.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id={spec.id}
                        checked={!!selected[spec.id]}
                        onCheckedChange={() => handleToggle(spec.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor={spec.id} className="cursor-pointer flex items-center gap-2 mb-2">
                          <span className="text-xl">{spec.icon}</span>
                          <span className="font-semibold">{spec.label}</span>
                        </Label>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Detected from keywords: {spec.keywords.slice(0, 5).join(', ')}
                            {spec.keywords.length > 5 && '...'}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {spec.certKeywords.slice(0, 6).map((cert, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {cert.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={handleSave} className="w-full">
                  Save Specializations
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Specializations;
