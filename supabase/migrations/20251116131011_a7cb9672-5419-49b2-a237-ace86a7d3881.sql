-- Add work_mode_preference field to candidate_profiles table
ALTER TABLE public.candidate_profiles 
ADD COLUMN IF NOT EXISTS work_mode_preference text 
CHECK (work_mode_preference IN ('remote', 'hybrid', 'on-site', 'flexible'));

-- Update existing rows to have a default value
UPDATE public.candidate_profiles 
SET work_mode_preference = 'flexible' 
WHERE work_mode_preference IS NULL;