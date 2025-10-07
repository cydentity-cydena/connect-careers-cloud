-- Add resume_id to applications table to track which resume was used
ALTER TABLE public.applications
ADD COLUMN resume_id uuid REFERENCES public.candidate_resumes(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_applications_resume ON public.applications(resume_id);