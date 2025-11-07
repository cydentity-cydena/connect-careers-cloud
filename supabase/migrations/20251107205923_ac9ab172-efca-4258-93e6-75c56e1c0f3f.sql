-- Add specializations column to candidate_profiles
ALTER TABLE candidate_profiles
ADD COLUMN IF NOT EXISTS specializations text[] DEFAULT ARRAY[]::text[];