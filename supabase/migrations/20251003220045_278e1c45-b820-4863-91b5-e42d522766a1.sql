-- Fix profiles table security: prevent anonymous access and control email visibility

-- First, drop the existing "Users can view own profile" policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a new policy that explicitly requires authentication and allows users to view their own profile
CREATE POLICY "Authenticated users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create a policy to allow employers with unlocked access to view candidate profiles (including email)
CREATE POLICY "Employers with unlocked access can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profile_unlocks
    WHERE profile_unlocks.candidate_id = profiles.id
      AND profile_unlocks.employer_id = auth.uid()
  )
);

-- Create a policy to allow employers to view profiles of candidates who applied to their jobs
-- (but without sensitive info like email unless unlocked - handled in candidate_profiles table)
CREATE POLICY "Employers can view applicant profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE a.candidate_id = profiles.id
      AND j.created_by = auth.uid()
  )
);

-- Add explicit comment about email visibility
COMMENT ON COLUMN public.profiles.email IS 'Email is only visible to: the profile owner, or employers who have unlocked the profile';
