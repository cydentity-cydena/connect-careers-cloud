-- Update RLS policy to allow employers/recruiters to create applications for candidates
DROP POLICY IF EXISTS "Candidates can create applications" ON applications;

-- New policy: Allow candidates to create their own applications
CREATE POLICY "Candidates can create own applications" 
ON applications 
FOR INSERT 
WITH CHECK (auth.uid() = candidate_id);

-- New policy: Allow employers to create applications for jobs they own
CREATE POLICY "Employers can create applications for their jobs" 
ON applications 
FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT created_by 
    FROM jobs 
    WHERE id = job_id
  )
);

-- New policy: Allow recruiters to create applications for client jobs
CREATE POLICY "Recruiters can create applications for client jobs" 
ON applications 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM jobs j
    JOIN clients c ON c.id = j.client_id
    WHERE j.id = job_id 
    AND c.recruiter_id = auth.uid()
  )
);

-- New policy: Allow admins to create any applications
CREATE POLICY "Admins can create any applications" 
ON applications 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));