-- Add INSERT policy for employer_credits table
CREATE POLICY "Users can insert own employer credits"
ON public.employer_credits
FOR INSERT
WITH CHECK (auth.uid() = employer_id);