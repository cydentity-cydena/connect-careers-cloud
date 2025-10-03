import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [title, setTitle] = useState('');
  const [yearsExperience, setYearsExperience] = useState<number>(0);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUserId(session.user.id);

      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, location, bio, avatar_url')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name ?? '');
        setLocation(profile.location ?? '');
        setBio(profile.bio ?? '');
        setAvatarUrl(profile.avatar_url ?? '');
      }

      // Load candidate profile
      const { data: candidate } = await supabase
        .from('candidate_profiles')
        .select('title, years_experience, linkedin_url, github_url, portfolio_url, resume_url')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (candidate) {
        setTitle(candidate.title ?? '');
        setYearsExperience(candidate.years_experience ?? 0);
        setLinkedinUrl(candidate.linkedin_url ?? '');
        setGithubUrl(candidate.github_url ?? '');
        setPortfolioUrl(candidate.portfolio_url ?? '');
        setResumeUrl(candidate.resume_url ?? '');
      }

      setLoading(false);
    };

    init();
  }, [navigate]);

  const handleSave = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { error: pErr } = await supabase
        .from('profiles')
        .update({ full_name: fullName, location, bio, avatar_url: avatarUrl })
        .eq('id', userId);
      if (pErr) throw pErr;

      const { error: cErr } = await supabase
        .from('candidate_profiles')
        .update({ title, years_experience: yearsExperience, linkedin_url: linkedinUrl, github_url: githubUrl, portfolio_url: portfolioUrl, resume_url: resumeUrl })
        .eq('user_id', userId);
      if (cErr) throw cErr;

      toast.success('Profile updated');
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Edit Profile | Cydent" description="Edit your cybersecurity profile and experience." />
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
              <Label htmlFor="bio">Bio</Label>
              <Input id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <div className="space-y-3">
              <Label htmlFor="title">Job title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Label htmlFor="years">Years of experience</Label>
              <Input id="years" type="number" value={yearsExperience} onChange={(e) => setYearsExperience(parseInt(e.target.value || '0'))} />
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input id="linkedin" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
              <Label htmlFor="github">GitHub URL</Label>
              <Input id="github" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
              <Label htmlFor="portfolio">Portfolio URL</Label>
              <Input id="portfolio" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} />
              <Label htmlFor="resume">Resume URL</Label>
              <Input id="resume" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
