import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { JobAutoPopulate } from '@/components/jobs/JobAutoPopulate';

const JobCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editJobId = searchParams.get('edit');
  const [userId, setUserId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [postingAs, setPostingAs] = useState<'employer' | 'recruiter'>('employer');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState<'full-time' | 'part-time' | 'contract' | 'freelance'>('full-time');
  const [workMode, setWorkMode] = useState<'on-site' | 'remote' | 'hybrid'>('on-site');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [requiredClearance, setRequiredClearance] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [requiredCerts, setRequiredCerts] = useState('');
  const [mustHaves, setMustHaves] = useState('');
  const [niceToHaves, setNiceToHaves] = useState('');
  const [yearsExpMin, setYearsExpMin] = useState('');
  const [yearsExpMax, setYearsExpMax] = useState('');
  const [managedByCydena, setManagedByCydena] = useState(false);
  const [skipExperienceMatch, setSkipExperienceMatch] = useState(false);
  const [skipClearanceMatch, setSkipClearanceMatch] = useState(false);
  const [skipMustHavesMatch, setSkipMustHavesMatch] = useState(false);
  const [skipCertificationsMatch, setSkipCertificationsMatch] = useState(false);

  const handleAutoPopulate = (details: any) => {
    if (details.title) setTitle(details.title);
    if (details.description) setDescription(details.description);
    if (details.location) setLocation(details.location);
    if (details.jobType) setJobType(details.jobType);
    if (details.remoteAllowed !== undefined) {
      setWorkMode(details.remoteAllowed ? 'remote' : 'on-site');
    }
    if (details.salaryMin) setSalaryMin(details.salaryMin.toString());
    if (details.salaryMax) setSalaryMax(details.salaryMax.toString());
    if (details.requiredClearance) setRequiredClearance(details.requiredClearance);
    if (details.requiredSkills) setRequiredSkills(details.requiredSkills);
    if (details.requiredCerts) setRequiredCerts(details.requiredCerts);
    if (details.mustHaves) setMustHaves(details.mustHaves);
    if (details.niceToHaves) setNiceToHaves(details.niceToHaves);
    if (details.yearsExpMin) setYearsExpMin(details.yearsExpMin.toString());
    if (details.yearsExpMax) setYearsExpMax(details.yearsExpMax.toString());
    if (details.companyName) setCompanyName(details.companyName);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      setUserId(session.user.id);

      // Check if user is an admin or recruiter
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      const userIsAdmin = roles?.some(r => r.role === 'admin');
      const userIsRecruiter = roles?.some(r => r.role === 'recruiter');
      setIsAdmin(userIsAdmin);
      setIsRecruiter(userIsRecruiter);

      // If admin, load all employers and recruiters
      if (userIsAdmin) {
        // Get employer user IDs
        const { data: employerRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'employer');

        // Get recruiter user IDs
        const { data: recruiterRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'recruiter');

        const employerIds = (employerRoles || []).map(r => r.user_id);
        const recruiterIds = (recruiterRoles || []).map(r => r.user_id);
        const allUserIds = [...new Set([...employerIds, ...recruiterIds])];

        // Get profiles for all users
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', allUserIds);

        const allUsers = [
          ...employerIds.map(userId => {
            const profile = profiles?.find(p => p.id === userId);
            return profile ? {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              role: 'employer'
            } : null;
          }).filter(Boolean),
          ...recruiterIds.map(userId => {
            const profile = profiles?.find(p => p.id === userId);
            return profile ? {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              role: 'recruiter'
            } : null;
          }).filter(Boolean)
        ];
        setUsers(allUsers as any[]);
      } else if (userIsRecruiter) {
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

      // Load existing job data if in edit mode
      if (editJobId) {
        const { data: jobData, error } = await supabase
          .from('jobs')
          .select('*, company:companies(name)')
          .eq('id', editJobId)
          .single();

        if (error) {
          toast.error('Failed to load job data');
          return;
        }

        if (jobData) {
          setTitle(jobData.title || '');
          setDescription(jobData.description || '');
          setLocation(jobData.location || '');
          setJobType(jobData.job_type || 'full-time');
          setWorkMode((jobData.work_mode as 'on-site' | 'remote' | 'hybrid') || 'on-site');
          setSalaryMin(jobData.salary_min?.toString() || '');
          setSalaryMax(jobData.salary_max?.toString() || '');
          setRequiredClearance(jobData.required_clearance || '');
          setRequiredSkills(jobData.required_skills?.join(', ') || '');
          setRequiredCerts(jobData.required_certifications?.join(', ') || '');
          setMustHaves(jobData.must_haves?.join(', ') || '');
          setNiceToHaves(jobData.nice_to_haves?.join(', ') || '');
          setYearsExpMin(jobData.years_experience_min?.toString() || '');
          setYearsExpMax(jobData.years_experience_max?.toString() || '');
          setCompanyId(jobData.company_id || '');
          setSelectedClientId(jobData.client_id || '');
          setCompanyName(jobData.company?.name || '');
          setManagedByCydena(jobData.managed_by_cydena || false);
          setSkipExperienceMatch(jobData.skip_experience_match || false);
          setSkipClearanceMatch(jobData.skip_clearance_match || false);
          setSkipMustHavesMatch(jobData.skip_must_haves_match || false);
          setSkipCertificationsMatch(jobData.skip_certifications_match || false);

          // If admin is editing, load the job owner and their role
          if (userIsAdmin) {
            const jobOwnerId = jobData.created_by;
            setSelectedUserId(jobOwnerId);

            // Check if job owner is employer or recruiter
            const { data: ownerRoles } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', jobOwnerId);

            const isOwnerRecruiter = ownerRoles?.some(r => r.role === 'recruiter');
            const isOwnerEmployer = ownerRoles?.some(r => r.role === 'employer');

            if (isOwnerRecruiter) {
              setPostingAs('recruiter');
              setIsRecruiter(true);
              
              // Load recruiter's clients
              const { data: clientsData } = await supabase
                .from('clients')
                .select('id, company_name, contact_name')
                .eq('recruiter_id', jobOwnerId)
                .eq('status', 'active')
                .order('company_name');
              setClients(clientsData || []);
            } else if (isOwnerEmployer) {
              setPostingAs('employer');
              setIsRecruiter(false);
              
              // Load employer's companies
              const { data: companiesData } = await supabase
                .from('companies')
                .select('id, name')
                .eq('created_by', jobOwnerId);
              setCompanies(companiesData || []);
            }
          }
        }
      }
    };
    init();
  }, [navigate, editJobId]);

  const handleCreate = async () => {
    const effectiveUserId = isAdmin && selectedUserId ? selectedUserId : userId;
    if (!effectiveUserId) return;
    
    // Admin validation - only require user selection when editing
    if (isAdmin && editJobId && !selectedUserId) {
      toast.error('Please select a user to reassign this job to');
      return;
    }
    
    // Determine if posting as recruiter
    const isPostingAsRecruiter = isAdmin && selectedUserId ? postingAs === 'recruiter' : isRecruiter;
    
    // Validation for recruiters (using clients) - now optional for admins
    if (isPostingAsRecruiter && !isAdmin) {
      if (!selectedClientId) { toast.error('Please select a client'); return; }
      if (!companyName.trim()) { toast.error('Company name is required'); return; }
    } else if (!isPostingAsRecruiter && !isAdmin) {
      // Validation for employers (using companies) - required for non-admins
      if (!companyId) { toast.error('Please select a company'); return; }
    }
    
    if (!title) { toast.error('Job title is required'); return; }
    if (!description) { toast.error('Job description is required'); return; }

    setLoading(true);
    
    try {
      // For recruiters, we need to ensure company exists or create it
      let finalCompanyId = companyId;
      
      if (isPostingAsRecruiter && !editJobId && companyName.trim()) {
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
              created_by: effectiveUserId
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
      
      const jobData = {
        company_id: finalCompanyId || null,
        client_id: isPostingAsRecruiter && selectedClientId ? selectedClientId : null,
        title,
        description,
        location: location || null,
        job_type: jobType,
        work_mode: workMode,
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
        managed_by_cydena: isAdmin ? managedByCydena : false,
        skip_experience_match: isAdmin ? skipExperienceMatch : false,
        skip_clearance_match: isAdmin ? skipClearanceMatch : false,
        skip_must_haves_match: isAdmin ? skipMustHavesMatch : false,
        skip_certifications_match: isAdmin ? skipCertificationsMatch : false,
      };

      let error;
      if (editJobId) {
        // Update existing job - include created_by if admin is reassigning
        const updateData = isAdmin 
          ? { ...jobData, created_by: effectiveUserId }
          : jobData;
          
        const result = await supabase
          .from('jobs')
          .update(updateData as any)
          .eq('id', editJobId);
        error = result.error;
      } else {
        // Create new job
        const result = await supabase
          .from('jobs')
          .insert({
            ...jobData,
            created_by: effectiveUserId,
          } as any);
        error = result.error;
      }

      if (error) throw error;

      toast.success(editJobId ? 'Job updated successfully' : 'Job posted successfully');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || (editJobId ? 'Failed to update job' : 'Failed to post job'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Post a Job | Cydena" description="Post a new cybersecurity job opening." />
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>{editJobId ? 'Edit Job' : 'Post a Job'}</CardTitle>
          {editJobId && isAdmin && (
            <p className="text-sm text-muted-foreground">
              You can reassign this job to a different employer or recruiter
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isAdmin && (
            <>
              <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <Label className="text-sm font-semibold">
                  Admin: Post on Behalf Of {!editJobId && '(Optional)'}
                </Label>
                {!editJobId && (
                  <p className="text-xs text-muted-foreground">
                    Leave empty to post as yourself
                  </p>
                )}
                <div className="space-y-2">
                  <Select value={postingAs} onValueChange={(v: any) => {
                    setPostingAs(v);
                    setSelectedUserId('');
                    setCompanies([]);
                    setClients([]);
                    setCompanyId('');
                    setSelectedClientId('');
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employer">Employer</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Select {postingAs === 'employer' ? 'Employer' : 'Recruiter'}</Label>
                  <Select value={selectedUserId} onValueChange={async (userId) => {
                    setSelectedUserId(userId);
                    
                    // Load companies or clients for selected user
                    if (postingAs === 'recruiter') {
                      const { data: clientsData } = await supabase
                        .from('clients')
                        .select('id, company_name, contact_name')
                        .eq('recruiter_id', userId)
                        .eq('status', 'active')
                        .order('company_name');
                      setClients(clientsData || []);
                      setIsRecruiter(true);
                    } else {
                      const { data: companiesData } = await supabase
                        .from('companies')
                        .select('id, name')
                        .eq('created_by', userId);
                      setCompanies(companiesData || []);
                      setIsRecruiter(false);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${postingAs} (optional)`} />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter(u => u.role === postingAs)
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
          {!isAdmin && isRecruiter && clients.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">You need to add clients to your portfolio first before posting jobs.</p>
              <Button onClick={() => navigate('/clients/create')}>Add First Client</Button>
            </div>
          ) : !isAdmin && !isRecruiter && companies.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">You need to create a company profile first before posting jobs.</p>
              <Button onClick={() => navigate('/company/create')}>Create Company Profile</Button>
            </div>
          ) : (!isAdmin || (isAdmin && (selectedUserId || !editJobId))) && (
            <>
              {!editJobId && (
                <JobAutoPopulate onPopulate={handleAutoPopulate} />
              )}
              
              {(isAdmin ? postingAs === 'recruiter' : isRecruiter) ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="client">Client{!isAdmin && ' *'}</Label>
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
                    <Label htmlFor="company-name">Company Name{!isAdmin && ' *'}</Label>
                    <Input 
                      id="company-name" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)} 
                      placeholder="Acme Corp"
                      disabled={!isAdmin && !selectedClientId}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="company">Company{!isAdmin && ' *'}</Label>
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
              <div className="space-y-2">
                <Label htmlFor="workMode">Work Mode</Label>
                <Select value={workMode} onValueChange={(v: any) => setWorkMode(v)}>
                  <SelectTrigger id="workMode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on-site">On-site</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                {isAdmin && (
                  <>
                    <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <Checkbox 
                        id="managedByCydena" 
                        checked={managedByCydena} 
                        onCheckedChange={(checked) => setManagedByCydena(!!checked)} 
                      />
                      <div className="flex-1">
                        <Label htmlFor="managedByCydena" className="font-semibold">Managed by Cydena (Expert Assist)</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Applications will be routed to admin funnel for talent curation before being assigned to pods
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <Label className="font-semibold text-sm">Intelligent Matching Overrides</Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Skip matching criteria to show this job to candidates who don't meet these requirements
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="skipExperienceMatch" 
                            checked={skipExperienceMatch} 
                            onCheckedChange={(checked) => setSkipExperienceMatch(!!checked)} 
                          />
                          <Label htmlFor="skipExperienceMatch" className="text-sm">Skip Experience Check</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="skipClearanceMatch" 
                            checked={skipClearanceMatch} 
                            onCheckedChange={(checked) => setSkipClearanceMatch(!!checked)} 
                          />
                          <Label htmlFor="skipClearanceMatch" className="text-sm">Skip Clearance Check</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="skipMustHavesMatch" 
                            checked={skipMustHavesMatch} 
                            onCheckedChange={(checked) => setSkipMustHavesMatch(!!checked)} 
                          />
                          <Label htmlFor="skipMustHavesMatch" className="text-sm">Skip Must-Haves Check</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="skipCertificationsMatch" 
                            checked={skipCertificationsMatch} 
                            onCheckedChange={(checked) => setSkipCertificationsMatch(!!checked)} 
                          />
                          <Label htmlFor="skipCertificationsMatch" className="text-sm">Skip Certifications Check</Label>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
                <Button onClick={handleCreate} disabled={loading}>
                  {loading ? (editJobId ? 'Updating...' : 'Posting...') : (editJobId ? 'Update Job' : 'Post Job')}
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
