import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Download, FileJson, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface JSONResumeExportProps {
  variant?: 'button' | 'card';
}

export function JSONResumeExport({ variant = 'button' }: JSONResumeExportProps) {
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateJSONResume = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch all profile data
      const [
        { data: profile },
        { data: candidateProfile },
        { data: skills },
        { data: certifications },
        { data: workHistory },
        { data: education },
        { data: projects }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('candidate_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('candidate_skills').select('*, skills(name, category)').eq('candidate_id', user.id),
        supabase.from('certifications').select('*').eq('candidate_id', user.id),
        supabase.from('work_history').select('*').eq('candidate_id', user.id).order('start_date', { ascending: false }),
        supabase.from('education').select('*').eq('candidate_id', user.id).order('start_date', { ascending: false }),
        supabase.from('projects').select('*').eq('candidate_id', user.id).order('start_date', { ascending: false })
      ]);

      // Build JSON Resume format (https://jsonresume.org/schema/)
      const jsonResume = {
        $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
        basics: {
          name: profile?.full_name || '',
          label: candidateProfile?.title || '',
          image: profile?.avatar_url || '',
          email: profile?.email || '',
          phone: candidateProfile?.phone || '',
          url: candidateProfile?.portfolio_url || '',
          summary: candidateProfile?.professional_statement || profile?.bio || '',
          location: {
            city: profile?.location?.split(',')[0]?.trim() || '',
            countryCode: profile?.location?.split(',').pop()?.trim() || '',
            region: profile?.location || ''
          },
          profiles: [
            candidateProfile?.linkedin_url && {
              network: 'LinkedIn',
              username: candidateProfile.linkedin_url.split('/').pop() || '',
              url: candidateProfile.linkedin_url
            },
            candidateProfile?.github_url && {
              network: 'GitHub',
              username: candidateProfile.github_url.split('/').pop() || '',
              url: candidateProfile.github_url
            },
            profile?.tryhackme_username && {
              network: 'TryHackMe',
              username: profile.tryhackme_username,
              url: `https://tryhackme.com/p/${profile.tryhackme_username}`
            },
            profile?.hackthebox_username && {
              network: 'HackTheBox',
              username: profile.hackthebox_username,
              url: `https://app.hackthebox.com/profile/${profile.hackthebox_username}`
            }
          ].filter(Boolean)
        },
        work: (workHistory || []).map((job: any) => ({
          name: job.company,
          position: job.role,
          url: '',
          startDate: job.start_date || '',
          endDate: job.is_current ? '' : (job.end_date || ''),
          summary: job.description || '',
          highlights: [],
          location: job.location || ''
        })),
        education: (education || []).map((edu: any) => ({
          institution: edu.institution,
          url: '',
          area: edu.field_of_study || '',
          studyType: edu.degree,
          startDate: edu.start_date || '',
          endDate: edu.end_date || '',
          score: edu.gpa || '',
          courses: []
        })),
        certificates: (certifications || []).map((cert: any) => ({
          name: cert.name,
          date: cert.issue_date || '',
          issuer: cert.issuer || '',
          url: cert.credential_url || ''
        })),
        skills: Object.entries(
          (skills || []).reduce((acc: any, skill: any) => {
            const category = skill.skills?.category || 'Technical';
            if (!acc[category]) acc[category] = [];
            acc[category].push(skill.skills?.name);
            return acc;
          }, {})
        ).map(([category, keywords]) => ({
          name: category,
          level: 'Professional',
          keywords: keywords as string[]
        })),
        projects: (projects || []).map((project: any) => ({
          name: project.name,
          description: project.description || '',
          highlights: [],
          keywords: project.tech_stack || [],
          startDate: project.start_date || '',
          endDate: project.end_date || '',
          url: project.url || '',
          roles: [],
          type: 'application'
        })),
        meta: {
          canonical: 'https://cydena.io/profiles/' + user.id,
          version: 'v1.0.0',
          lastModified: new Date().toISOString(),
          theme: 'cydena-cybersecurity'
        }
      };

      setResumeData(jsonResume);
      setDialogOpen(true);
    } catch (error) {
      console.error('Error generating JSON Resume:', error);
      toast.error('Failed to generate resume');
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!resumeData) return;
    
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('JSON Resume downloaded!');
  };

  const copyToClipboard = async () => {
    if (!resumeData) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(resumeData, null, 2));
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  if (variant === 'card') {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-primary" />
              Export Resume
            </CardTitle>
            <CardDescription>
              Download your profile in JSON Resume format for data portability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={generateJSONResume} disabled={loading} className="gap-2">
                {loading ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export JSON Resume
                  </>
                )}
              </Button>
              <Button variant="outline" asChild>
                <a 
                  href="https://jsonresume.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Learn More
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>JSON Resume Generated</DialogTitle>
              <DialogDescription>
                Your profile has been exported in JSON Resume format (v1.0.0)
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted rounded-lg p-4 overflow-auto max-h-[50vh]">
              <pre className="text-xs">
                {JSON.stringify(resumeData, null, 2)}
              </pre>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={copyToClipboard} className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button onClick={downloadJSON} className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={generateJSONResume} disabled={loading} className="gap-2">
        {loading ? (
          <>Generating...</>
        ) : (
          <>
            <FileJson className="h-4 w-4" />
            Export JSON
          </>
        )}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>JSON Resume Generated</DialogTitle>
            <DialogDescription>
              Your profile has been exported in JSON Resume format (v1.0.0)
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted rounded-lg p-4 overflow-auto max-h-[50vh]">
            <pre className="text-xs">
              {JSON.stringify(resumeData, null, 2)}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={copyToClipboard} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button onClick={downloadJSON} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
