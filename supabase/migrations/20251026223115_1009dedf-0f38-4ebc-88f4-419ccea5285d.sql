-- Add new fields to jobs table for better job requirements specification
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS must_haves text[],
ADD COLUMN IF NOT EXISTS nice_to_haves text[],
ADD COLUMN IF NOT EXISTS years_experience_min integer,
ADD COLUMN IF NOT EXISTS years_experience_max integer,
ADD COLUMN IF NOT EXISTS required_certifications text[];