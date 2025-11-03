-- Allow candidates to insert their own verification record
CREATE POLICY "Candidates can insert own verification"
ON public.candidate_verifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = candidate_id);

-- Allow candidates to update their own verification record
CREATE POLICY "Candidates can update own verification"
ON public.candidate_verifications
FOR UPDATE
TO authenticated
USING (auth.uid() = candidate_id);