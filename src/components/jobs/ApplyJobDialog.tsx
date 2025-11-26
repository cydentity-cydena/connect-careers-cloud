import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Send, FileText, Star, Upload } from "lucide-react";
import { toast } from "sonner";

interface Resume {
  id: string;
  resume_name: string;
  resume_type: string;
  is_primary: boolean;
}

interface ApplyJobDialogProps {
  jobId: string;
  jobTitle: string;
  children: React.ReactNode;
}

export const ApplyJobDialog = ({ jobId, jobTitle, children }: ApplyJobDialogProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    if (open) {
      loadResumes();
    }
  }, [open]);

  const loadResumes = async () => {
    setLoadingResumes(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("candidate_resumes")
        .select("id, resume_name, resume_type, is_primary")
        .eq("candidate_id", user.id)
        .order("is_primary", { ascending: false });

      if (error) throw error;
      
      setResumes(data || []);
      // Auto-select primary resume
      const primary = data?.find(r => r.is_primary);
      if (primary) setSelectedResumeId(primary.id);
    } catch (error) {
      console.error("Error loading resumes:", error);
      toast.error("Failed to load resumes");
    } finally {
      setLoadingResumes(false);
    }
  };


  const handleApply = async () => {
    if (!selectedResumeId) {
      toast.error("Please select a resume");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to apply");
        return;
      }

      // Gate: require ID + RTW verified (green or amber)
      const { data: verData, error: verError } = await supabase
        .from('candidate_verifications')
        .select('identity_status, rtw_status')
        .eq('candidate_id', user.id)
        .maybeSingle();
      if (verError) console.warn('Verification check error', verError);
      const idOk = verData && ['green','amber'].includes(verData.identity_status || '');
      const rtwOk = verData && ['green','amber'].includes(verData.rtw_status || '');
      if (!idOk || !rtwOk) {
        toast.error("Complete Identity and Right to Work verification before applying. Redirecting to HR-Ready...");
        setOpen(false);
        setTimeout(() => window.location.assign('/hr-ready'), 600);
        return;
      }

      // Check if already applied
      const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("candidate_id", user.id)
        .eq("job_id", jobId)
        .maybeSingle();

      if (existing) {
        toast.error("You have already applied to this job");
        return;
      }

      // Check if this is a Cydena-managed job
      const { data: jobData } = await supabase
        .from("jobs")
        .select("managed_by_cydena")
        .eq("id", jobId)
        .single();

      // Create application
      const { error } = await supabase.from("applications").insert({
        candidate_id: user.id,
        job_id: jobId,
        resume_id: selectedResumeId,
        cover_letter: coverLetter || null,
      });

      if (error) throw error;

      // If managed by Cydena, also add to admin pipeline for curation
      if (jobData?.managed_by_cydena) {
        // Get candidate profile info for pipeline entry
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();

        const { data: candidateProfile } = await supabase
          .from('candidate_profiles')
          .select('title, years_experience')
          .eq('user_id', user.id)
          .single();

        // Check if already in pipeline
        const { data: pipelineExists } = await supabase
          .from('candidate_pipeline')
          .select('id')
          .eq('candidate_id', user.id)
          .maybeSingle();

        if (!pipelineExists) {
          await supabase.from('candidate_pipeline').insert({
            candidate_id: user.id,
            stage: 'new_application',
            source: `job_application_${jobId}`,
            desired_role: candidateProfile?.title || 'Not specified',
          });
        }
      }

      toast.success(
        jobData?.managed_by_cydena 
          ? "Application submitted! Our team will review and curate your profile." 
          : "Application submitted successfully!"
      );
      setOpen(false);
      setCoverLetter("");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to {jobTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Resume Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Resume *</Label>
            {loadingResumes ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Loading resumes...
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Upload Resume Option */}
                <div 
                  className="p-6 border-2 rounded-lg hover:border-primary transition-colors cursor-pointer bg-card"
                  onClick={() => {
                    setOpen(false);
                    navigate('/dashboard');
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold">Upload New Resume</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Go to dashboard to upload a PDF or Word document
                      </p>
                    </div>
                  </div>
                </div>

                {/* Existing Resumes */}
                {resumes.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-px bg-border flex-1"></div>
                      <span className="text-xs text-muted-foreground">Import from Dashboard</span>
                      <div className="h-px bg-border flex-1"></div>
                    </div>
                    <RadioGroup value={selectedResumeId} onValueChange={setSelectedResumeId}>
                      {resumes.map((resume) => (
                        <div
                          key={resume.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <RadioGroupItem value={resume.id} id={resume.id} />
                          <label
                            htmlFor={resume.id}
                            className="flex-1 flex items-center gap-2 cursor-pointer"
                          >
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="font-medium">{resume.resume_name}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {resume.resume_type === "auto-generated" ? "Generated from Profile" : resume.resume_type}
                              </p>
                            </div>
                            {resume.is_primary && (
                              <span className="flex items-center gap-1 text-xs text-primary">
                                <Star className="h-3 w-3 fill-current" />
                                Primary
                              </span>
                            )}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
            <Textarea
              id="cover-letter"
              placeholder="Introduce yourself and explain why you're a great fit for this role..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={loading || !selectedResumeId}
              className="flex-1"
              aria-label="Submit application"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
