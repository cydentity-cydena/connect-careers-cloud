-- Fix: Remove overly permissive policy that exposes candidate data to all authenticated users
DROP POLICY IF EXISTS "Public can view basic candidate info" ON public.candidate_profiles;

-- Add policy: Employers who unlocked profiles can view them
CREATE POLICY "Employers with unlocked access can view profiles"
ON public.candidate_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profile_unlocks
    WHERE profile_unlocks.candidate_id = candidate_profiles.user_id
    AND profile_unlocks.employer_id = auth.uid()
  )
);