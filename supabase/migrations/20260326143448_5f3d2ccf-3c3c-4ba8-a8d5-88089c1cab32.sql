-- Recreate CTF leaderboard views WITHOUT security_invoker so they can read all profiles
-- (these views only expose username/avatar, no sensitive data like email)

DROP VIEW IF EXISTS public.ctf_leaderboard;
CREATE VIEW public.ctf_leaderboard AS
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

DROP VIEW IF EXISTS public.ctf_event_leaderboard;
CREATE VIEW public.ctf_event_leaderboard AS
SELECT
  ep.event_id,
  p.id,
  p.username,
  count(DISTINCT s.challenge_id) AS challenges_solved,
  COALESCE(sum(s.points_awarded), 0::bigint) AS total_points,
  max(s.submitted_at) AS last_submission
FROM ctf_event_participants ep
JOIN profiles p ON p.id = ep.user_id
LEFT JOIN ctf_submissions s ON s.candidate_id = ep.user_id
  AND s.is_correct = true
  AND s.challenge_id IN (
    SELECT ce.challenge_id FROM ctf_challenge_events ce WHERE ce.event_id = ep.event_id
  )
GROUP BY ep.event_id, p.id, p.username
ORDER BY COALESCE(sum(s.points_awarded), 0::bigint) DESC, max(s.submitted_at);