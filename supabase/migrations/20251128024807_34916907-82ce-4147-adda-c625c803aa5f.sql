-- Add global intelligent matching toggle to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS skip_intelligent_matching boolean DEFAULT false;

COMMENT ON COLUMN public.jobs.skip_intelligent_matching IS 'If true, this job bypasses intelligent matching entirely and is shown to all candidates';