-- Storage policies for resumes bucket
-- Note: RLS is already enabled on storage.objects by Supabase

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Employers can view unlocked candidate resumes" ON storage.objects;

-- Policy: Users can upload their own resumes
CREATE POLICY "Users can upload own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own resumes
CREATE POLICY "Users can view own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own resumes
CREATE POLICY "Users can delete own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Employers/recruiters/admins can view resumes if they have unlocked the profile or are staff
CREATE POLICY "Employers can view unlocked candidate resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' 
  AND (
    -- Employer has unlocked the candidate
    EXISTS (
      SELECT 1 FROM profile_unlocks
      WHERE profile_unlocks.candidate_id::text = (storage.foldername(name))[1]
      AND profile_unlocks.employer_id = auth.uid()
    )
    OR
    -- Or user is admin/staff/recruiter
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'staff'::app_role)
    OR has_role(auth.uid(), 'recruiter'::app_role)
  )
);