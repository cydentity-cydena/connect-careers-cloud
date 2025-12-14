-- Fix 1: Drop and recreate views with SECURITY INVOKER
-- This ensures the views use the RLS policies of the querying user, not the view creator

-- Recreate ctf_challenges_public view with security_invoker = true
DROP VIEW IF EXISTS public.ctf_challenges_public;
CREATE VIEW public.ctf_challenges_public 
WITH (security_invoker = true) AS
SELECT id,
    title,
    description,
    category,
    difficulty,
    points,
    hints,
    is_active,
    file_url,
    file_name,
    created_at,
    updated_at
FROM ctf_challenges
WHERE is_active = true;

-- Recreate ctf_leaderboard view with security_invoker = true
DROP VIEW IF EXISTS public.ctf_leaderboard;
CREATE VIEW public.ctf_leaderboard 
WITH (security_invoker = true) AS
SELECT p.id,
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

-- Fix 2: Remove the overly permissive "Authenticated users can view profiles" policy
-- This policy allows ANY authenticated user to view ALL profile data which is a security risk
-- The granular policies (own profile, applicants, unlocked, staff, recruiters) already cover legitimate use cases
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;