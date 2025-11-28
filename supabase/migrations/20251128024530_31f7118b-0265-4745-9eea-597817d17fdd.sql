-- Add matching override flags to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS skip_experience_match boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS skip_clearance_match boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS skip_must_haves_match boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS skip_certifications_match boolean DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.jobs.skip_experience_match IS 'If true, candidates without required experience will still see this job';
COMMENT ON COLUMN public.jobs.skip_clearance_match IS 'If true, candidates without required clearance will still see this job';
COMMENT ON COLUMN public.jobs.skip_must_haves_match IS 'If true, candidates without must-have skills will still see this job';
COMMENT ON COLUMN public.jobs.skip_certifications_match IS 'If true, candidates without required certifications will still see this job';