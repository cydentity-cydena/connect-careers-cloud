-- Fix 1: CTF Challenge Flags Exposure
-- Create a secure function to validate CTF flags without exposing them
CREATE OR REPLACE FUNCTION public.verify_ctf_flag(p_challenge_id uuid, p_submitted_flag text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_correct_flag text;
  v_is_correct boolean;
BEGIN
  -- Get the actual flag (only accessible via this function)
  SELECT flag INTO v_correct_flag
  FROM ctf_challenges
  WHERE id = p_challenge_id AND is_active = true;
  
  IF v_correct_flag IS NULL THEN
    RETURN false;
  END IF;
  
  -- Case-sensitive comparison
  v_is_correct := (v_submitted_flag = v_correct_flag);
  
  RETURN v_is_correct;
END;
$$;

-- Drop the existing permissive RLS policy that exposes flags
DROP POLICY IF EXISTS "Anyone can view active challenges" ON ctf_challenges;

-- Create a new view for public challenge data (WITHOUT the flag column)
CREATE OR REPLACE VIEW public.ctf_challenges_public AS
SELECT 
  id,
  title,
  description,
  category,
  difficulty,
  points,
  hints,
  is_active,
  created_at,
  updated_at
FROM ctf_challenges
WHERE is_active = true;

-- Grant access to the public view
GRANT SELECT ON public.ctf_challenges_public TO authenticated;
GRANT SELECT ON public.ctf_challenges_public TO anon;

-- Create restrictive RLS policies for the actual table
-- Only admins can see the full table with flags
CREATE POLICY "Only admins can view challenges with flags"
ON ctf_challenges FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Recreate ctf_leaderboard view with SECURITY INVOKER (not DEFINER)
-- First drop the existing view
DROP VIEW IF EXISTS public.ctf_leaderboard;

-- Recreate with explicit SECURITY INVOKER (default, but being explicit)
CREATE VIEW public.ctf_leaderboard 
WITH (security_invoker = true)
AS
SELECT 
    p.id,
    p.full_name,
    p.username,
    p.avatar_url,
    count(DISTINCT s.challenge_id) AS challenges_solved,
    COALESCE(sum(s.points_awarded), 0::bigint) AS total_points,
    max(s.submitted_at) AS last_submission
FROM profiles p
LEFT JOIN ctf_submissions s ON s.candidate_id = p.id AND s.is_correct = true
GROUP BY p.id, p.full_name, p.username, p.avatar_url
HAVING count(DISTINCT s.challenge_id) > 0
ORDER BY COALESCE(sum(s.points_awarded), 0::bigint) DESC, max(s.submitted_at);

-- Grant access to the leaderboard view
GRANT SELECT ON public.ctf_leaderboard TO authenticated;
GRANT SELECT ON public.ctf_leaderboard TO anon;