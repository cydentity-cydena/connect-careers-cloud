
-- Tighten ctf_challenge_events SELECT to only participants of that event
DROP POLICY "Participants can read challenge events" ON public.ctf_challenge_events;

CREATE POLICY "Event participants can read challenge assignments" ON public.ctf_challenge_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ctf_event_participants ep 
      WHERE ep.event_id = ctf_challenge_events.event_id 
      AND ep.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'staff')
    )
  );

-- Fix the view to use SECURITY INVOKER (default, explicit)
DROP VIEW IF EXISTS public.ctf_event_leaderboard;
CREATE VIEW public.ctf_event_leaderboard WITH (security_invoker = true) AS
SELECT 
  ep.event_id,
  p.id,
  p.username,
  COUNT(DISTINCT s.challenge_id) as challenges_solved,
  COALESCE(SUM(s.points_awarded), 0) as total_points,
  MAX(s.submitted_at) as last_submission
FROM public.ctf_event_participants ep
JOIN public.profiles p ON p.id = ep.user_id
LEFT JOIN public.ctf_submissions s ON s.candidate_id = ep.user_id AND s.is_correct = true
  AND s.challenge_id IN (SELECT ce.challenge_id FROM public.ctf_challenge_events ce WHERE ce.event_id = ep.event_id)
GROUP BY ep.event_id, p.id, p.username
ORDER BY total_points DESC, last_submission ASC;
