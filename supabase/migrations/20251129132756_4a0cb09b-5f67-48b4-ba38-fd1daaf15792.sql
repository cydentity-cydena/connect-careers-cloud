
-- Add SELECT policy for candidate_verifications based on profile unlock
CREATE POLICY "Employers and recruiters with unlock can view verifications"
ON public.candidate_verifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profile_unlocks
    WHERE profile_unlocks.candidate_id = candidate_verifications.candidate_id
    AND profile_unlocks.employer_id = auth.uid()
  )
);
