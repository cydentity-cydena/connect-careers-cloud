-- Remove the unique constraint that prevents multiple attempts per challenge
-- Users should be able to retry wrong submissions
ALTER TABLE public.ctf_submissions 
DROP CONSTRAINT IF EXISTS ctf_submissions_candidate_id_challenge_id_key;

-- Add a unique constraint only for correct submissions (per challenge per user)
-- This allows multiple wrong attempts but only one correct solve counts
CREATE UNIQUE INDEX ctf_submissions_unique_correct 
ON public.ctf_submissions (candidate_id, challenge_id) 
WHERE is_correct = true;