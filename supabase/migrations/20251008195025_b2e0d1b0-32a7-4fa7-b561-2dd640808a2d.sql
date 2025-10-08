-- Make placements table support both recruiter placements and direct employer hires
ALTER TABLE public.placements 
  ALTER COLUMN recruiter_id DROP NOT NULL,
  ALTER COLUMN client_id DROP NOT NULL;

-- Add employer_id column for direct employer hires
ALTER TABLE public.placements 
  ADD COLUMN employer_id uuid REFERENCES auth.users(id);

-- Add constraint: must have either recruiter_id OR employer_id
ALTER TABLE public.placements
  ADD CONSTRAINT placements_has_employer_or_recruiter 
  CHECK (
    (recruiter_id IS NOT NULL AND client_id IS NOT NULL AND employer_id IS NULL) 
    OR 
    (employer_id IS NOT NULL AND recruiter_id IS NULL AND client_id IS NULL)
  );

COMMENT ON COLUMN public.placements.employer_id IS 'For direct employer hires using pay-per-hire model';
COMMENT ON CONSTRAINT placements_has_employer_or_recruiter ON public.placements IS 'Ensures placement has either recruiter+client OR employer, not both';