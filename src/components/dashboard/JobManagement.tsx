import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Edit, Trash2, Briefcase, MapPin, Clock, Banknote } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string | null;
  job_type: string;
  remote_allowed: boolean;
  salary_min: number | null;
  salary_max: number | null;
  required_clearance: string | null;
  required_skills: string[] | null;
  required_certifications: string[] | null;
  must_haves: string[] | null;
  nice_to_haves: string[] | null;
  years_experience_min: number | null;
  years_experience_max: number | null;
  is_active: boolean;
  created_at: string;
  companies: { name: string } | null;
}

export const JobManagement = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deleteJob, setDeleteJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<Partial<Job>>({});

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(name)')
        .eq('created_by', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      toast.error('Failed to load jobs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location || '',
      job_type: job.job_type,
      remote_allowed: job.remote_allowed,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      required_clearance: job.required_clearance || '',
      required_skills: job.required_skills,
      required_certifications: job.required_certifications,
      must_haves: job.must_haves,
      nice_to_haves: job.nice_to_haves,
      years_experience_min: job.years_experience_min,
      years_experience_max: job.years_experience_max,
      is_active: job.is_active,
    });
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: formData.title,
          description: formData.description,
          location: formData.location || null,
          job_type: formData.job_type as 'full-time' | 'part-time' | 'contract' | 'freelance',
          remote_allowed: formData.remote_allowed,
          salary_min: formData.salary_min,
          salary_max: formData.salary_max,
          required_clearance: formData.required_clearance || null,
          required_skills: formData.required_skills,
          required_certifications: formData.required_certifications,
          must_haves: formData.must_haves,
          nice_to_haves: formData.nice_to_haves,
          years_experience_min: formData.years_experience_min,
          years_experience_max: formData.years_experience_max,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingJob.id);

      if (error) throw error;

      toast.success('Job updated successfully');
      setEditingJob(null);
      loadJobs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update job');
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteJob) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', deleteJob.id);

      if (error) throw error;

      toast.success('Job deleted successfully');
      setDeleteJob(null);
      loadJobs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete job');
    }
  };

  const toggleJobStatus = async (job: Job) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: !job.is_active })
        .eq('id', job.id);

      if (error) throw error;

      toast.success(`Job ${!job.is_active ? 'activated' : 'deactivated'}`);
      loadJobs();
    } catch (error: any) {
      toast.error('Failed to update job status');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading jobs...</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No jobs posted yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    {job.companies && (
                      <p className="text-sm text-muted-foreground">{job.companies.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={job.is_active ? 'default' : 'secondary'}>
                      {job.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.job_type}
                  </div>
                  {(job.salary_min || job.salary_max) && (
                    <div className="flex items-center gap-1">
                      <Banknote className="h-4 w-4" />
                      £{job.salary_min?.toLocaleString() || '0'} - £{job.salary_max?.toLocaleString() || '0'}
                    </div>
                  )}
                  {(job.years_experience_min || job.years_experience_max) && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.years_experience_min}-{job.years_experience_max} years
                    </div>
                  )}
                </div>

                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.slice(0, 5).map((skill, idx) => (
                      <Badge key={idx} variant="outline">{skill}</Badge>
                    ))}
                    {job.required_skills.length > 5 && (
                      <Badge variant="outline">+{job.required_skills.length - 5} more</Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleJobStatus(job)}
                  title={job.is_active ? 'Deactivate' : 'Activate'}
                >
                  <Switch checked={job.is_active} />
                </Button>
                <Dialog open={editingJob?.id === job.id} onOpenChange={(open) => !open && setEditingJob(null)}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(job)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Job</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Job Title *</Label>
                        <Input
                          value={formData.title || ''}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={6}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input
                            value={formData.location || ''}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Job Type</Label>
                          <Select
                            value={formData.job_type}
                            onValueChange={(v) => setFormData({ ...formData, job_type: v as 'full-time' | 'part-time' | 'contract' | 'freelance' })}
                          >
                            <SelectTrigger>
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
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Min Salary</Label>
                          <Input
                            type="number"
                            value={formData.salary_min || ''}
                            onChange={(e) => setFormData({ ...formData, salary_min: parseInt(e.target.value) || null })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Salary</Label>
                          <Input
                            type="number"
                            value={formData.salary_max || ''}
                            onChange={(e) => setFormData({ ...formData, salary_max: parseInt(e.target.value) || null })}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Min Years Experience</Label>
                          <Input
                            type="number"
                            value={formData.years_experience_min || ''}
                            onChange={(e) => setFormData({ ...formData, years_experience_min: parseInt(e.target.value) || null })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Years Experience</Label>
                          <Input
                            type="number"
                            value={formData.years_experience_max || ''}
                            onChange={(e) => setFormData({ ...formData, years_experience_max: parseInt(e.target.value) || null })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Must-Haves (comma-separated)</Label>
                        <Textarea
                          value={formData.must_haves?.join(', ') || ''}
                          onChange={(e) => setFormData({ ...formData, must_haves: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Nice-to-Haves (comma-separated)</Label>
                        <Textarea
                          value={formData.nice_to_haves?.join(', ') || ''}
                          onChange={(e) => setFormData({ ...formData, nice_to_haves: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                          rows={3}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Skills (comma-separated)</Label>
                          <Input
                            value={formData.required_skills?.join(', ') || ''}
                            onChange={(e) => setFormData({ ...formData, required_skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Certifications (comma-separated)</Label>
                          <Input
                            value={formData.required_certifications?.join(', ') || ''}
                            onChange={(e) => setFormData({ ...formData, required_certifications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Required Clearance</Label>
                        <Input
                          value={formData.required_clearance || ''}
                          onChange={(e) => setFormData({ ...formData, required_clearance: e.target.value })}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.remote_allowed}
                          onCheckedChange={(checked) => setFormData({ ...formData, remote_allowed: checked })}
                        />
                        <Label>Remote work allowed</Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                        <Label>Job is active</Label>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditingJob(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateJob}>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteJob(job)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={!!deleteJob} onOpenChange={() => setDeleteJob(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteJob?.title}"? This action cannot be undone
              and will remove all associated applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
