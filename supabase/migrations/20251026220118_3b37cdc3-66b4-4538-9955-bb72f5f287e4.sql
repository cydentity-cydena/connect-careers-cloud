-- Allow employers to update verifications for candidates who applied to their jobs
CREATE POLICY "Employers can update verifications for applicants"
ON candidate_verifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE a.candidate_id = candidate_verifications.candidate_id
    AND j.created_by = auth.uid()
  )
);

-- Allow employers to update verifications for unlocked candidates
CREATE POLICY "Employers can update verifications for unlocked candidates"
ON candidate_verifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profile_unlocks
    WHERE profile_unlocks.candidate_id = candidate_verifications.candidate_id
    AND profile_unlocks.employer_id = auth.uid()
  )
);

-- Allow recruiters to update verifications for candidates who applied to client jobs
CREATE POLICY "Recruiters can update verifications for client job applicants"
ON candidate_verifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM applications a
    JOIN jobs j ON j.id = a.job_id
    JOIN clients c ON c.id = j.client_id
    WHERE a.candidate_id = candidate_verifications.candidate_id
    AND c.recruiter_id = auth.uid()
  )
);

-- Allow employers to insert verifications for applicants if none exist
CREATE POLICY "Employers can insert verifications for applicants"
ON candidate_verifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE a.candidate_id = candidate_verifications.candidate_id
    AND j.created_by = auth.uid()
  )
);

-- Allow employers to insert verifications for unlocked candidates if none exist
CREATE POLICY "Employers can insert verifications for unlocked candidates"
ON candidate_verifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profile_unlocks
    WHERE profile_unlocks.candidate_id = candidate_verifications.candidate_id
    AND profile_unlocks.employer_id = auth.uid()
  )
);

-- Allow recruiters to insert verifications for client job applicants if none exist
CREATE POLICY "Recruiters can insert verifications for client job applicants"
ON candidate_verifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM applications a
    JOIN jobs j ON j.id = a.job_id
    JOIN clients c ON c.id = j.client_id
    WHERE a.candidate_id = candidate_verifications.candidate_id
    AND c.recruiter_id = auth.uid()
  )
);