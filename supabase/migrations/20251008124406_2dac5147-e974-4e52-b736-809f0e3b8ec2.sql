-- Drop the overly permissive policy that allows public viewing of all certifications
DROP POLICY IF EXISTS "Certifications viewable by all" ON public.certifications;

-- Add restricted policy: Candidates can view their own certifications (already covered by "Candidates manage own certifications" ALL policy, but making it explicit for SELECT)
CREATE POLICY "Candidates view own certifications" 
ON public.certifications 
FOR SELECT 
USING (auth.uid() = candidate_id);

-- Add policy: Employers who have unlocked a candidate's profile can view their certifications
CREATE POLICY "Employers with unlocked access can view certifications" 
ON public.certifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM profile_unlocks
    WHERE profile_unlocks.candidate_id = certifications.candidate_id
      AND profile_unlocks.employer_id = auth.uid()
  )
);

-- Add policy: Employers can view certifications of candidates who applied to their jobs
CREATE POLICY "Employers can view applicant certifications" 
ON public.certifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE a.candidate_id = certifications.candidate_id
      AND j.created_by = auth.uid()
  )
);