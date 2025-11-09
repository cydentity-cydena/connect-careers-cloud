-- Add RLS policies for certification management
-- Allow candidates to delete their own certifications anytime
CREATE POLICY "Candidates can delete own certifications"
ON certifications
FOR DELETE
TO authenticated
USING (auth.uid() = candidate_id);

-- Allow candidates to update only PENDING certifications
CREATE POLICY "Candidates can update pending certifications"
ON certifications
FOR UPDATE
TO authenticated
USING (
  auth.uid() = candidate_id 
  AND verification_status = 'pending'
)
WITH CHECK (
  auth.uid() = candidate_id 
  AND verification_status = 'pending'
);