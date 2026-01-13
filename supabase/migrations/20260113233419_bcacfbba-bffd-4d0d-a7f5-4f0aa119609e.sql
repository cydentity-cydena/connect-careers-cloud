-- Fix trust_scores RLS policies to allow function writes and public reads
DROP POLICY IF EXISTS "Users can view their own trust score" ON public.trust_scores;
DROP POLICY IF EXISTS "Employers can view trust scores" ON public.trust_scores;
DROP POLICY IF EXISTS "Service role full access to trust_scores" ON public.trust_scores;
DROP POLICY IF EXISTS "Anyone can view trust scores" ON public.trust_scores;
DROP POLICY IF EXISTS "Service role can manage trust_scores" ON public.trust_scores;

-- Allow anyone to read trust scores (they're public metrics)
CREATE POLICY "Anyone can view trust scores"
ON public.trust_scores
FOR SELECT
USING (true);

-- Allow authenticated users to insert/update their own trust score
CREATE POLICY "Users can manage own trust score"
ON public.trust_scores
FOR ALL
TO authenticated
USING (candidate_id = auth.uid())
WITH CHECK (candidate_id = auth.uid());