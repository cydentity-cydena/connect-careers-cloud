import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [desiredJobTitle, setDesiredJobTitle] = useState('');

  const [title, setTitle] = useState('');
  const [yearsExperience, setYearsExperience] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [professionalStatement, setProfessionalStatement] = useState('');

  const [workHistory, setWorkHistory] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);

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
        .select('full_name, username, location, bio, avatar_url, desired_job_title, email')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name ?? '');
        setUsername(profile.username ?? '');
        setEmail(profile.email ?? '');
        setLocation(profile.location ?? '');
        setBio(profile.bio ?? '');
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
        setPhone(candidate.phone ?? '');
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
        .update({ full_name: fullName, username, location, bio, avatar_url: avatarUrl, desired_job_title: desiredJobTitle })
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
          phone,
          linkedin_url: linkedinUrl, 
          github_url: githubUrl, 
          portfolio_url: portfolioUrl, 
          resume_url: resumeUrl,
          professional_statement: professionalStatement
        })
        .eq('user_id', userId);
      if (cErr) throw cErr;

      // Save work history
      for (const work of workHistory) {
        if (work.id) {
          await supabase.from('work_history').update(work).eq('id', work.id);
        } else if (work.company && work.role) {
          await supabase.from('work_history').insert({ ...work, candidate_id: userId });
        }
      }

      // Save projects
      for (const project of projects) {
        if (project.id) {
          await supabase.from('projects').update(project).eq('id', project.id);
        } else if (project.name) {
          await supabase.from('projects').insert({ ...project, candidate_id: userId });
        }
      }

      // Save education
      for (const edu of education) {
        if (edu.id) {
          await supabase.from('education').update(edu).eq('id', edu.id);
        } else if (edu.institution && edu.degree) {
          await supabase.from('education').insert({ ...edu, candidate_id: userId });
        }
      }

      toast.success('Profile updated');
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const addWorkHistory = () => {
    setWorkHistory([...workHistory, { company: '', role: '', start_date: '', end_date: '', description: '', location: '', is_current: false }]);
  };

  const removeWorkHistory = async (index: number) => {
    const item = workHistory[index];
    if (item.id) {
      await supabase.from('work_history').delete().eq('id', item.id);
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
                
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
              </div>
              <div className="space-y-3">
                <Label htmlFor="title">Current job title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                
                <Label htmlFor="phone">Phone number (private until unlocked)</Label>
                <Input 
                  id="phone" 
                  type="tel"
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7700 900000"
                />
                
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
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Work History</h3>
              <Button onClick={addWorkHistory} size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Experience
              </Button>
            </div>
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
                        placeholder="City, State/Country"
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
          </div>

          <Separator />

          {/* Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Projects</h3>
              <Button onClick={addProject} size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </div>
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
          </div>

          <Separator />

          {/* Education */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Education</h3>
              <Button onClick={addEducation} size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Education
              </Button>
            </div>
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
                      <Label>GPA (optional, if applicable)</Label>
                      <Input 
                        value={edu.gpa || ''} 
                        onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                        placeholder="e.g., 3.8/4.0 or 85%"
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
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
