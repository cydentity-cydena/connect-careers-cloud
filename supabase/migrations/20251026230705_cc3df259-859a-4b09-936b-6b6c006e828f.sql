-- Enable RLS on candidate_verifications if not already enabled
ALTER TABLE candidate_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Employers and recruiters can view verifications" ON candidate_verifications;
DROP POLICY IF EXISTS "Staff and admins can manage all verifications" ON candidate_verifications;
DROP POLICY IF EXISTS "Candidates can view their own verification" ON candidate_verifications;
DROP POLICY IF EXISTS "Employers and recruiters can update verifications" ON candidate_verifications;

-- Policy: Candidates can view their own verification
CREATE POLICY "Candidates can view their own verification"
ON candidate_verifications
FOR SELECT
USING (
  auth.uid() = candidate_id
  OR has_role(auth.uid(), 'candidate'::app_role)
);

-- Policy: Employers and recruiters can view all verifications
CREATE POLICY "Employers and recruiters can view verifications"
ON candidate_verifications
FOR SELECT
USING (
  has_role(auth.uid(), 'employer'::app_role)
  OR has_role(auth.uid(), 'recruiter'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Policy: Staff and admins can insert and update all verifications
CREATE POLICY "Staff and admins can manage all verifications"
ON candidate_verifications
FOR ALL
USING (
  has_role(auth.uid(), 'staff'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'employer'::app_role)
  OR has_role(auth.uid(), 'recruiter'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'staff'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'employer'::app_role)
  OR has_role(auth.uid(), 'recruiter'::app_role)
);