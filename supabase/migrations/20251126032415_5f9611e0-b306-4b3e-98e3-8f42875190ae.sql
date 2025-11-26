-- Add field to jobs table to mark jobs as admin-managed for expert assist service
ALTER TABLE public.jobs
ADD COLUMN managed_by_cydena boolean DEFAULT false;

-- Add comment explaining the field
COMMENT ON COLUMN public.jobs.managed_by_cydena IS 'When true, applications go to admin funnel for expert talent curation before being sent to pods';

-- Create index for filtering admin-managed jobs
CREATE INDEX idx_jobs_managed_by_cydena ON public.jobs(managed_by_cydena) WHERE managed_by_cydena = true;