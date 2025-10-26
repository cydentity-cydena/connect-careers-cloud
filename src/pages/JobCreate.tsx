import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

const JobCreate = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [companyId, setCompanyId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState<'full-time' | 'part-time' | 'contract' | 'freelance'>('full-time');
  const [remoteAllowed, setRemoteAllowed] = useState(false);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [requiredClearance, setRequiredClearance] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      setUserId(session.user.id);

      const { data } = await supabase
        .from('companies')
        .select('id, name')
        .eq('created_by', session.user.id);
      setCompanies(data || []);
    };
    init();
  }, [navigate]);

  const handleCreate = async () => {
    if (!userId) return;
    if (!companyId) { toast.error('Please select a company'); return; }
    if (!title) { toast.error('Job title is required'); return; }
    if (!description) { toast.error('Job description is required'); return; }

    setLoading(true);
    const skills = requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
    const { error } = await supabase.from('jobs').insert({
      company_id: companyId,
      created_by: userId,
      title,
      description,
      location: location || null,
      job_type: jobType,
      remote_allowed: remoteAllowed,
      salary_min: salaryMin ? parseInt(salaryMin) : null,
      salary_max: salaryMax ? parseInt(salaryMax) : null,
      required_clearance: requiredClearance || null,
      required_skills: skills.length > 0 ? skills : null,
      is_active: true,
    } as any);
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Job posted successfully');
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Post a Job | Cydena" description="Post a new cybersecurity job opening." />
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Post a Job</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {companies.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">You need to create a company profile first before posting jobs.</p>
              <Button onClick={() => navigate('/company/create')}>Create Company Profile</Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Select value={companyId} onValueChange={setCompanyId}>
                  <SelectTrigger id="company">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Cybersecurity Analyst" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe the role, responsibilities, and qualifications..." 
                  rows={6}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote / London" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobType">Job Type</Label>
                  <Select value={jobType} onValueChange={(v: any) => setJobType(v)}>
                    <SelectTrigger id="jobType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Min Salary</Label>
                  <Input id="salaryMin" type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="40000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Max Salary</Label>
                  <Input id="salaryMax" type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="70000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clearance">Required Clearance</Label>
                  <Input id="clearance" value={requiredClearance} onChange={(e) => setRequiredClearance(e.target.value)} placeholder="Secret, Top Secret, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Required Skills (comma-separated)</Label>
                  <Input id="skills" value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} placeholder="CISSP, Python, AWS" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="remote" checked={remoteAllowed} onCheckedChange={(checked) => setRemoteAllowed(!!checked)} />
                <Label htmlFor="remote">Remote work allowed</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
                <Button onClick={handleCreate} disabled={loading}>
                  {loading ? 'Posting...' : 'Post Job'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobCreate;
