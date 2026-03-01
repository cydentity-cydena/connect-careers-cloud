
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS available_for_bounties BOOLEAN NOT NULL DEFAULT false;
