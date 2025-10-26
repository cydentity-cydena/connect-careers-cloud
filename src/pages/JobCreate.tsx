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
  const [clients, setClients] = useState<any[]>([]);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');

  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState<'full-time' | 'part-time' | 'contract' | 'freelance'>('full-time');
  const [remoteAllowed, setRemoteAllowed] = useState(false);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [requiredClearance, setRequiredClearance] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [requiredCerts, setRequiredCerts] = useState('');
  const [mustHaves, setMustHaves] = useState('');
  const [niceToHaves, setNiceToHaves] = useState('');
  const [yearsExpMin, setYearsExpMin] = useState('');
  const [yearsExpMax, setYearsExpMax] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      setUserId(session.user.id);

      // Check if user is a recruiter
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      const userIsRecruiter = roles?.some(r => r.role === 'recruiter');
      setIsRecruiter(userIsRecruiter);

      if (userIsRecruiter) {
        // Load clients for recruiters
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, company_name, contact_name')
          .eq('recruiter_id', session.user.id)
          .eq('status', 'active')
          .order('company_name');
        setClients(clientsData || []);
      } else {
        // Load companies for employers
        const { data: companiesData } = await supabase
          .from('companies')
          .select('id, name')
          .eq('created_by', session.user.id);
        setCompanies(companiesData || []);
      }
    };
    init();
  }, [navigate]);

  const handleCreate = async () => {
    if (!userId) return;
    
    // Validation for recruiters (using clients)
    if (isRecruiter) {
      if (!selectedClientId) { toast.error('Please select a client'); return; }
      if (!companyName.trim()) { toast.error('Company name is required'); return; }
    } else {
      // Validation for employers (using companies)
      if (!companyId) { toast.error('Please select a company'); return; }
    }
    
    if (!title) { toast.error('Job title is required'); return; }
    if (!description) { toast.error('Job description is required'); return; }

    setLoading(true);
    
    try {
      // For recruiters, we need to ensure company exists or create it
      let finalCompanyId = companyId;
      
      if (isRecruiter) {
        // Check if company already exists for this client
        const { data: existingCompany } = await supabase
          .from('companies')
          .select('id')
          .eq('name', companyName)
          .maybeSingle();

        if (existingCompany) {
          finalCompanyId = existingCompany.id;
        } else {
          // Create company for the client
          const { data: newCompany, error: companyError } = await supabase
            .from('companies')
            .insert({
              name: companyName,
              created_by: userId
            })
            .select('id')
            .single();

          if (companyError) throw companyError;
          finalCompanyId = newCompany.id;
        }
      }

      const skills = requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
      const certs = requiredCerts.split(',').map(s => s.trim()).filter(Boolean);
      const mustHavesList = mustHaves.split(',').map(s => s.trim()).filter(Boolean);
      const niceToHavesList = niceToHaves.split(',').map(s => s.trim()).filter(Boolean);
      
      const { error } = await supabase.from('jobs').insert({
        company_id: finalCompanyId,
        created_by: userId,
        client_id: isRecruiter ? selectedClientId : null,
        title,
        description,
        location: location || null,
        job_type: jobType,
        remote_allowed: remoteAllowed,
        salary_min: salaryMin ? parseInt(salaryMin) : null,
        salary_max: salaryMax ? parseInt(salaryMax) : null,
        required_clearance: requiredClearance || null,
        required_skills: skills.length > 0 ? skills : null,
        required_certifications: certs.length > 0 ? certs : null,
        must_haves: mustHavesList.length > 0 ? mustHavesList : null,
        nice_to_haves: niceToHavesList.length > 0 ? niceToHavesList : null,
        years_experience_min: yearsExpMin ? parseInt(yearsExpMin) : null,
        years_experience_max: yearsExpMax ? parseInt(yearsExpMax) : null,
        is_active: true,
      } as any);

      if (error) throw error;

      toast.success('Job posted successfully');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Post a Job | Cydena" description="Post a new cybersecurity job opening." />
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Post a Job</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRecruiter && clients.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">You need to add clients to your portfolio first before posting jobs.</p>
              <Button onClick={() => navigate('/clients/create')}>Add First Client</Button>
            </div>
          ) : !isRecruiter && companies.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">You need to create a company profile first before posting jobs.</p>
              <Button onClick={() => navigate('/company/create')}>Create Company Profile</Button>
            </div>
          ) : (
            <>
              {isRecruiter ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="client">Client *</Label>
                    <Select value={selectedClientId} onValueChange={(value) => {
                      setSelectedClientId(value);
                      const client = clients.find(c => c.id === value);
                      if (client) {
                        setCompanyName(client.company_name);
                      }
                    }}>
                      <SelectTrigger id="client">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.company_name}
                            {c.contact_name && ` (${c.contact_name})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name *</Label>
                    <Input 
                      id="company-name" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)} 
                      placeholder="Acme Corp"
                      disabled={!selectedClientId}
                    />
                  </div>
                </>
              ) : (
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
              )}
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
                  <Label htmlFor="yearsExpMin">Min Years Experience</Label>
                  <Input id="yearsExpMin" type="number" value={yearsExpMin} onChange={(e) => setYearsExpMin(e.target.value)} placeholder="2" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsExpMax">Max Years Experience</Label>
                  <Input id="yearsExpMax" type="number" value={yearsExpMax} onChange={(e) => setYearsExpMax(e.target.value)} placeholder="5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clearance">Required Clearance</Label>
                  <Input id="clearance" value={requiredClearance} onChange={(e) => setRequiredClearance(e.target.value)} placeholder="Secret, Top Secret, etc." />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mustHaves">Must-Haves (comma-separated)</Label>
                <Textarea 
                  id="mustHaves" 
                  value={mustHaves} 
                  onChange={(e) => setMustHaves(e.target.value)} 
                  placeholder="Strong communication skills, Team leadership experience, Problem-solving ability"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="niceToHaves">Nice-to-Haves (comma-separated)</Label>
                <Textarea 
                  id="niceToHaves" 
                  value={niceToHaves} 
                  onChange={(e) => setNiceToHaves(e.target.value)} 
                  placeholder="Public speaking experience, Open source contributions, Industry certifications"
                  rows={3}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input id="skills" value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} placeholder="Python, AWS, Linux" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certs">Certifications (comma-separated)</Label>
                  <Input id="certs" value={requiredCerts} onChange={(e) => setRequiredCerts(e.target.value)} placeholder="CISSP, CEH, Security+" />
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
