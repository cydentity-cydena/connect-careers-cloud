import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { ArrowLeft, Plus, Trash2, Upload, Image as ImageIcon, User, ChevronDown, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CandidateAvatar } from '@/components/profiles/CandidateAvatar';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [desiredJobTitle, setDesiredJobTitle] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [title, setTitle] = useState('');
  const [yearsExperience, setYearsExperience] = useState<string>('');
  const [countryCode, setCountryCode] = useState('+44');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [professionalStatement, setProfessionalStatement] = useState('');

  const [workHistory, setWorkHistory] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [verification, setVerification] = useState<any>(null);
  
  const [workHistoryOpen, setWorkHistoryOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [educationOpen, setEducationOpen] = useState(false);

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
        .select('full_name, username, bio, location, avatar_url, desired_job_title, email')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name ?? '');
        setUsername(profile.username ?? '');
        setEmail(profile.email ?? '');
        setBio(profile.bio ?? '');
        setLocation(profile.location ?? '');
        setAvatarUrl(profile.avatar_url ?? '');
        setDesiredJobTitle(profile.desired_job_title ?? '');
      }

      // Load candidate profile
      const { data: candidate } = await supabase
        .from('candidate_profiles')
        .select('title, years_experience, phone, linkedin_url, github_url, portfolio_url, resume_url, professional_statement')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (candidate) {
        setTitle(candidate.title ?? '');
        setYearsExperience(candidate.years_experience ? candidate.years_experience.toString() : '');
        
        // Parse phone number to extract country code
        const phoneValue = candidate.phone ?? '';
        if (phoneValue) {
          // Try to extract country code from the phone number
          const match = phoneValue.match(/^(\+\d{1,4})\s*/);
          if (match) {
            setCountryCode(match[1]);
            setPhone(phoneValue.substring(match[0].length).trim());
          } else {
            setPhone(phoneValue);
          }
        }
        
        setLinkedinUrl(candidate.linkedin_url ?? '');
        setGithubUrl(candidate.github_url ?? '');
        setPortfolioUrl(candidate.portfolio_url ?? '');
        setResumeUrl(candidate.resume_url ?? '');
        setProfessionalStatement(candidate.professional_statement ?? '');
      }

      // Load work history
      const { data: workData } = await supabase
        .from('work_history')
        .select('*')
        .eq('candidate_id', session.user.id)
        .order('start_date', { ascending: false });
      if (workData) setWorkHistory(workData);

      // Load projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('candidate_id', session.user.id)
        .order('start_date', { ascending: false });
      if (projectsData) setProjects(projectsData);

      // Load education
      const { data: educationData } = await supabase
        .from('education')
        .select('*')
        .eq('candidate_id', session.user.id)
        .order('start_date', { ascending: false });
      if (educationData) setEducation(educationData);

      // Load verification status
      const { data: verificationData } = await supabase
        .from('candidate_verifications')
        .select('hr_ready')
        .eq('candidate_id', session.user.id)
        .maybeSingle();
      setVerification(verificationData);

      setLoading(false);
    };

    init();
  }, [navigate]);

  const handleSave = async () => {
    if (!userId) return;
    
    // Require username
    if (!username) {
      toast.error('Username is required');
      return;
    }
    
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      toast.error('Username must be 3-20 characters, only letters, numbers, and underscores');
      return;
    }
    
    setLoading(true);
    try {
      const { error: pErr } = await supabase
        .from('profiles')
        .update({ full_name: fullName, username, bio, location, avatar_url: avatarUrl, desired_job_title: desiredJobTitle })
        .eq('id', userId);
      if (pErr) {
        if (pErr.message?.includes('profiles_username_unique')) {
          toast.error('Username already taken');
        } else {
          throw pErr;
        }
        return;
      }

      const { error: cErr } = await supabase
        .from('candidate_profiles')
        .update({ 
          title, 
          years_experience: parseInt(yearsExperience) || 0,
          phone: phone ? `${countryCode} ${phone}` : '',
          linkedin_url: linkedinUrl, 
          github_url: githubUrl, 
          portfolio_url: portfolioUrl, 
          resume_url: resumeUrl,
          professional_statement: professionalStatement
        })
        .eq('user_id', userId);
      if (cErr) throw cErr;

      // Normalize and validate work history before saving
      const normalizedWorkHistory = workHistory.map((w, i) => {
        const isCurrent = !!w.is_current;
        const startDate = w.start_date ? String(w.start_date) : '';
        const endDate = isCurrent ? null : (w.end_date ? String(w.end_date) : null);
        return {
          id: w.id,
          company: (w.company ?? '').trim(),
          role: (w.role ?? '').trim(),
          location: (w.location ?? '')?.trim() || null,
          start_date: startDate,
          end_date: endDate,
          is_current: isCurrent,
          description: (w.description ?? '')?.trim() || null,
        };
      });

      // Validate required fields (company, role, start_date)
      for (let i = 0; i < normalizedWorkHistory.length; i++) {
        const w = normalizedWorkHistory[i];
        const isNewRow = !w.id;
        const hasAnyData = !!(w.company || w.role || w.start_date || w.description || w.location);

        if (!hasAnyData) continue; // skip fully empty rows

        if (!w.company || !w.role || !w.start_date) {
          throw new Error(`Work history #${i + 1}: company, role, and start date are required`);
        }
      }

      // Save work history
      console.log('Saving work history entries:', normalizedWorkHistory.length);
      for (const w of normalizedWorkHistory) {
        const hasAnyData = !!(w.company || w.role || w.start_date || w.description || w.location);
        if (!hasAnyData) continue; // skip empty rows

        if (w.id) {
          console.log('Updating work history:', w.id);
          const { error: workUpdateError } = await supabase
            .from('work_history')
            .update({
              company: w.company,
              role: w.role,
              location: w.location,
              start_date: w.start_date,
              end_date: w.end_date,
              is_current: w.is_current,
              description: w.description,
            })
            .eq('id', w.id);
          if (workUpdateError) {
            console.error('Error updating work history:', workUpdateError);
            throw new Error(`Failed to update work history: ${workUpdateError.message}`);
          }
        } else if (w.company && w.role && w.start_date) {
          console.log('Inserting new work history entry');
          const { error: workInsertError } = await supabase
            .from('work_history')
            .insert({
              company: w.company,
              role: w.role,
              location: w.location,
              start_date: w.start_date,
              end_date: w.end_date,
              is_current: w.is_current,
              description: w.description,
              candidate_id: userId,
            });
          if (workInsertError) {
            console.error('Error inserting work history:', workInsertError);
            throw new Error(`Failed to add work history: ${workInsertError.message}`);
          }
        }
      }

      // Save projects
      for (const project of projects) {
        if (project.id) {
          const { error: projectUpdateError } = await supabase
            .from('projects')
            .update(project)
            .eq('id', project.id);
          if (projectUpdateError) {
            console.error('Error updating project:', projectUpdateError);
            throw new Error(`Failed to update project: ${projectUpdateError.message}`);
          }
        } else if (project.name) {
          const { error: projectInsertError } = await supabase
            .from('projects')
            .insert({ ...project, candidate_id: userId });
          if (projectInsertError) {
            console.error('Error inserting project:', projectInsertError);
            throw new Error(`Failed to add project: ${projectInsertError.message}`);
          }
        }
      }

      // Save education
      for (const edu of education) {
        if (edu.id) {
          const { error: eduUpdateError } = await supabase
            .from('education')
            .update(edu)
            .eq('id', edu.id);
          if (eduUpdateError) {
            console.error('Error updating education:', eduUpdateError);
            throw new Error(`Failed to update education: ${eduUpdateError.message}`);
          }
        } else if (edu.institution && edu.degree) {
          const { error: eduInsertError } = await supabase
            .from('education')
            .insert({ ...edu, candidate_id: userId });
          if (eduInsertError) {
            console.error('Error inserting education:', eduInsertError);
            throw new Error(`Failed to add education: ${eduInsertError.message}`);
          }
        }
      }

      // Reload data to get updated IDs
      const { data: workData, error: workDataError } = await supabase
        .from('work_history')
        .select('*')
        .eq('candidate_id', userId)
        .order('start_date', { ascending: false });
      
      if (workDataError) {
        console.error('Error reloading work history:', workDataError);
      } else {
        console.log('Reloaded work history entries:', workData?.length || 0);
        if (workData) setWorkHistory(workData);
      }

      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('candidate_id', userId)
        .order('start_date', { ascending: false });
      if (projectsData) setProjects(projectsData);

      const { data: educationData } = await supabase
        .from('education')
        .select('*')
        .eq('candidate_id', userId)
        .order('start_date', { ascending: false });
      if (educationData) setEducation(educationData);

      toast.success('Profile updated');
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const addWorkHistory = () => {
    console.log('Adding work history. Current count:', workHistory.length);
    setWorkHistory([...workHistory, { company: '', role: '', start_date: '', end_date: '', description: '', location: '', is_current: false }]);
  };

  const removeWorkHistory = async (index: number) => {
    const item = workHistory[index];
    if (item.id) {
      const { error } = await supabase.from('work_history').delete().eq('id', item.id);
      if (error) {
        console.error('Error deleting work history:', error);
        toast.error('Failed to delete work history entry');
        return;
      }
    }
    setWorkHistory(workHistory.filter((_, i) => i !== index));
  };

  const updateWorkHistory = (index: number, field: string, value: any) => {
    const updated = [...workHistory];
    updated[index] = { ...updated[index], [field]: value };
    setWorkHistory(updated);
  };

  const addProject = () => {
    setProjects([...projects, { name: '', description: '', tech_stack: [], url: '', github_url: '', start_date: '', end_date: '' }]);
  };

  const removeProject = async (index: number) => {
    const item = projects[index];
    if (item.id) {
      await supabase.from('projects').delete().eq('id', item.id);
    }
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: string, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const addEducation = () => {
    setEducation([...education, { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', gpa: '', description: '' }]);
  };

  const removeEducation = async (index: number) => {
    const item = education[index];
    if (item.id) {
      await supabase.from('education').delete().eq('id', item.id);
    }
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: string, value: any) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const hadAvatar = !!avatarUrl;
      
      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);

      // Save to profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Award points only if this is their first avatar
      if (!hadAvatar) {
        await supabase.functions.invoke('award-points-helper', {
          body: {
            candidateId: userId,
            code: 'PROFILE_UPDATED',
            meta: { field: 'avatar' }
          }
        });
        toast.success('Profile picture uploaded! +50 points');
      } else {
        toast.success('Profile picture updated!');
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!userId || !avatarUrl) return;

    try {
      // Delete from storage
      const oldPath = avatarUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('avatars').remove([oldPath]);

      // Update profile
      await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      setAvatarUrl('');
      toast.success('Profile picture removed');
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove profile picture');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Edit Profile | Cydena" description="Edit your cybersecurity profile and experience." />
      
      <Button 
        variant="ghost" 
        onClick={() => navigate('/dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="fullName">Full name (private until unlocked)</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                
                <Label htmlFor="email">Email (private until unlocked)</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />

                <Label htmlFor="phone">Phone number (private until unlocked)</Label>
                <div className="flex gap-2">
                  <Select
                    value={countryCode}
                    onValueChange={(value) => setCountryCode(value)}
                  >
                    <SelectTrigger className="bg-background w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50 max-h-[300px]">
                      <SelectItem value="+1">🇺🇸 +1</SelectItem>
                      <SelectItem value="+44">🇬🇧 +44</SelectItem>
                      <SelectItem value="+61">🇦🇺 +61</SelectItem>
                      <SelectItem value="+49">🇩🇪 +49</SelectItem>
                      <SelectItem value="+33">🇫🇷 +33</SelectItem>
                      <SelectItem value="+31">🇳🇱 +31</SelectItem>
                      <SelectItem value="+91">🇮🇳 +91</SelectItem>
                      <SelectItem value="+65">🇸🇬 +65</SelectItem>
                      <SelectItem value="+971">🇦🇪 +971</SelectItem>
                      <SelectItem value="+27">🇿🇦 +27</SelectItem>
                      <SelectItem value="+55">🇧🇷 +55</SelectItem>
                      <SelectItem value="+52">🇲🇽 +52</SelectItem>
                      <SelectItem value="+81">🇯🇵 +81</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    id="phone" 
                    type="tel"
                    className="flex-1"
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="7700 900123"
                  />
                </div>
                
                <Label htmlFor="username">
                  Username (public, 3-20 chars) <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="your_username"
                  maxLength={20}
                  required
                />
                {!username && (
                  <p className="text-xs text-muted-foreground">
                  ⚠️ Username is required to appear in public profiles
                  </p>
                )}

                <Label htmlFor="location">Location (public)</Label>
                <Select
                  value={location}
                  onValueChange={(value) => setLocation(value)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50 max-h-[300px]">
                    <SelectItem value="United States">🇺🇸 United States</SelectItem>
                    <SelectItem value="United Kingdom">🇬🇧 United Kingdom</SelectItem>
                    <SelectItem value="Canada">🇨🇦 Canada</SelectItem>
                    <SelectItem value="Australia">🇦🇺 Australia</SelectItem>
                    <SelectItem value="Germany">🇩🇪 Germany</SelectItem>
                    <SelectItem value="France">🇫🇷 France</SelectItem>
                    <SelectItem value="Netherlands">🇳🇱 Netherlands</SelectItem>
                    <SelectItem value="India">🇮🇳 India</SelectItem>
                    <SelectItem value="Singapore">🇸🇬 Singapore</SelectItem>
                    <SelectItem value="United Arab Emirates">🇦🇪 United Arab Emirates</SelectItem>
                    <SelectItem value="South Africa">🇿🇦 South Africa</SelectItem>
                    <SelectItem value="Brazil">🇧🇷 Brazil</SelectItem>
                    <SelectItem value="Mexico">🇲🇽 Mexico</SelectItem>
                    <SelectItem value="Japan">🇯🇵 Japan</SelectItem>
                    <SelectItem value="Spain">🇪🇸 Spain</SelectItem>
                    <SelectItem value="Italy">🇮🇹 Italy</SelectItem>
                    <SelectItem value="Poland">🇵🇱 Poland</SelectItem>
                    <SelectItem value="Sweden">🇸🇪 Sweden</SelectItem>
                    <SelectItem value="Norway">🇳🇴 Norway</SelectItem>
                    <SelectItem value="Denmark">🇩🇰 Denmark</SelectItem>
                    <SelectItem value="Switzerland">🇨🇭 Switzerland</SelectItem>
                    <SelectItem value="Belgium">🇧🇪 Belgium</SelectItem>
                    <SelectItem value="Austria">🇦🇹 Austria</SelectItem>
                    <SelectItem value="Ireland">🇮🇪 Ireland</SelectItem>
                    <SelectItem value="New Zealand">🇳🇿 New Zealand</SelectItem>
                    <SelectItem value="Other">🌍 Other</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-base">
                    <ImageIcon className="h-4 w-4" />
                    Profile Picture
                  </Label>
                  
                  {avatarUrl && (
                    <div className="flex flex-col items-center gap-4 p-6 border rounded-xl bg-gradient-to-b from-muted/50 to-muted/20">
                      <div className="relative group">
                        <CandidateAvatar
                          avatarUrl={avatarUrl}
                          username={username}
                          fullName={fullName}
                          isHrReady={verification?.hr_ready}
                          size="xl"
                          showGradientRing
                        />
                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-medium">{fullName || 'Your Name'}</p>
                        <p className="text-xs text-muted-foreground">@{username || 'username'}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAvatarRemove}
                        className="w-full max-w-[200px]"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Picture
                      </Button>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="relative">
                      <Input 
                        id="avatar" 
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                        className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-background/90 flex items-center justify-center rounded-md backdrop-blur-sm">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Upload className="h-4 w-4 animate-pulse text-primary" />
                            <span>Uploading...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Upload className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Upload JPG, PNG, or WEBP (max 5MB). Square images work best for profile pictures. 
                        {!avatarUrl && (
                          <span className="block mt-1 text-primary font-medium">🎉 Earn +50 points for your first upload!</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="title">Current job title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                
                <Label htmlFor="desiredJobTitle">Desired job title (optional)</Label>
                <Input 
                  id="desiredJobTitle" 
                  value={desiredJobTitle} 
                  onChange={(e) => setDesiredJobTitle(e.target.value)}
                  placeholder="e.g., Senior Cloud Security Engineer"
                />
                
                <Label htmlFor="years">Years of experience</Label>
                <Input 
                  id="years" 
                  type="number" 
                  min="0"
                  value={yearsExperience} 
                  onChange={(e) => setYearsExperience(e.target.value)}
                  placeholder="0"
                />
                
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input 
                  id="linkedin" 
                  value={linkedinUrl} 
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/your-username or /in/your-username"
                />
                
                <Label htmlFor="github">GitHub URL</Label>
                <Input 
                  id="github" 
                  value={githubUrl} 
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/your-username"
                />
                
                <Label htmlFor="portfolio">Portfolio URL</Label>
                <Input 
                  id="portfolio" 
                  value={portfolioUrl} 
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://your-portfolio.com"
                />
                
                <Label htmlFor="resume">Resume URL</Label>
                <Input id="resume" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Professional Statement */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Professional Statement</h3>
            <Label htmlFor="bio">Bio (public)</Label>
            <Textarea 
              id="bio" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="A brief bio visible to everyone..."
              className="mb-4"
            />
            
            <Label htmlFor="statement">Professional Statement (private until unlocked)</Label>
            <Textarea 
              id="statement" 
              value={professionalStatement} 
              onChange={(e) => setProfessionalStatement(e.target.value)}
              placeholder="Detailed professional statement, career goals, expertise..."
              rows={6}
            />
          </div>

          <Separator />

          {/* Work History */}
          <Collapsible open={workHistoryOpen} onOpenChange={setWorkHistoryOpen}>
            <div className="flex items-center justify-between mb-4">
              <CollapsibleTrigger asChild>
                <button className="p-0 text-left cursor-pointer bg-transparent border-0">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {workHistoryOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    Work History
                    <span className="text-sm text-muted-foreground font-normal">({workHistory.length})</span>
                  </h3>
                </button>
              </CollapsibleTrigger>
              <Button onClick={addWorkHistory} size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Experience
              </Button>
            </div>
            <CollapsibleContent>
              <div className="space-y-6">
                {workHistory.map((work, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Experience {index + 1}</h4>
                      <Button 
                        onClick={() => removeWorkHistory(index)} 
                        size="sm" 
                        variant="ghost"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Company</Label>
                        <Input 
                          value={work.company} 
                          onChange={(e) => updateWorkHistory(index, 'company', e.target.value)}
                          placeholder="Company name"
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Input 
                          value={work.role} 
                          onChange={(e) => updateWorkHistory(index, 'role', e.target.value)}
                          placeholder="Job title"
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input 
                          value={work.location || ''} 
                          onChange={(e) => updateWorkHistory(index, 'location', e.target.value)}
                          placeholder="City, County/Country"
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input 
                          type="date"
                          value={work.start_date || ''} 
                          onChange={(e) => updateWorkHistory(index, 'start_date', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input 
                          type="date"
                          value={work.end_date || ''} 
                          onChange={(e) => updateWorkHistory(index, 'end_date', e.target.value)}
                          disabled={work.is_current}
                        />
                      </div>
                      <div className="flex items-center pt-8">
                        <input 
                          type="checkbox"
                          id={`current-${index}`}
                          checked={work.is_current || false}
                          onChange={(e) => updateWorkHistory(index, 'is_current', e.target.checked)}
                          className="mr-2"
                        />
                        <Label htmlFor={`current-${index}`} className="cursor-pointer">Currently working here</Label>
                      </div>
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Textarea 
                          value={work.description || ''} 
                          onChange={(e) => updateWorkHistory(index, 'description', e.target.value)}
                          placeholder="Describe your responsibilities and achievements..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Projects */}
          <Collapsible open={projectsOpen} onOpenChange={setProjectsOpen}>
            <div className="flex items-center justify-between mb-4">
              <CollapsibleTrigger asChild>
                <button className="p-0 text-left cursor-pointer bg-transparent border-0">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {projectsOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    Projects
                    <span className="text-sm text-muted-foreground font-normal">({projects.length})</span>
                  </h3>
                </button>
              </CollapsibleTrigger>
              <Button onClick={addProject} size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </div>
            <CollapsibleContent>
              <div className="space-y-6">
                {projects.map((project, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Project {index + 1}</h4>
                      <Button 
                        onClick={() => removeProject(index)} 
                        size="sm" 
                        variant="ghost"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label>Project Name</Label>
                        <Input 
                          value={project.name} 
                          onChange={(e) => updateProject(index, 'name', e.target.value)}
                          placeholder="Project name"
                        />
                      </div>
                      <div>
                        <Label>Project URL</Label>
                        <Input 
                          value={project.url || ''} 
                          onChange={(e) => updateProject(index, 'url', e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <Label>GitHub URL</Label>
                        <Input 
                          value={project.github_url || ''} 
                          onChange={(e) => updateProject(index, 'github_url', e.target.value)}
                          placeholder="https://github.com/..."
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input 
                          type="date"
                          value={project.start_date || ''} 
                          onChange={(e) => updateProject(index, 'start_date', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input 
                          type="date"
                          value={project.end_date || ''} 
                          onChange={(e) => updateProject(index, 'end_date', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Tech Stack (comma-separated)</Label>
                        <Input 
                          value={project.tech_stack?.join(', ') || ''} 
                          onChange={(e) => updateProject(index, 'tech_stack', e.target.value.split(',').map((s: string) => s.trim()))}
                          placeholder="React, TypeScript, Python, etc."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Textarea 
                          value={project.description || ''} 
                          onChange={(e) => updateProject(index, 'description', e.target.value)}
                          placeholder="Describe the project, your role, and key achievements..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Education */}
          <Collapsible open={educationOpen} onOpenChange={setEducationOpen}>
            <div className="flex items-center justify-between mb-4">
              <CollapsibleTrigger asChild>
                <button className="p-0 text-left cursor-pointer bg-transparent border-0">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {educationOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    Education
                    <span className="text-sm text-muted-foreground font-normal">({education.length})</span>
                  </h3>
                </button>
              </CollapsibleTrigger>
              <Button onClick={addEducation} size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Education
              </Button>
            </div>
            <CollapsibleContent>
              <div className="space-y-6">
                {education.map((edu, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Education {index + 1}</h4>
                    <Button 
                      onClick={() => removeEducation(index)} 
                      size="sm" 
                      variant="ghost"
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Institution</Label>
                      <Input 
                        value={edu.institution} 
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        placeholder="University/College name"
                      />
                    </div>
                    <div>
                      <Label>Degree</Label>
                      <Input 
                        value={edu.degree} 
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        placeholder="Bachelor's, Master's, PhD, etc."
                      />
                    </div>
                    <div>
                      <Label>Field of Study</Label>
                      <Input 
                        value={edu.field_of_study || ''} 
                        onChange={(e) => updateEducation(index, 'field_of_study', e.target.value)}
                        placeholder="Computer Science, Cybersecurity, etc."
                      />
                    </div>
                    <div>
                      <Label>Grade (optional)</Label>
                      <Input 
                        value={edu.gpa || ''} 
                        onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                        placeholder="e.g., Pass, Merit, Distinction, First Class"
                      />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input 
                        type="date"
                        value={edu.start_date || ''} 
                        onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input 
                        type="date"
                        value={edu.end_date || ''} 
                        onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea 
                        value={edu.description || ''} 
                        onChange={(e) => updateEducation(index, 'description', e.target.value)}
                        placeholder="Honors, relevant coursework, activities..."
                        rows={3}
                      />
                    </div>
                  </div>
                </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
