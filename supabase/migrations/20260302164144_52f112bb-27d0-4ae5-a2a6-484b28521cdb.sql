
-- CTF Events table
CREATE TABLE public.ctf_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  access_code TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  banner_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ctf_events ENABLE ROW LEVEL SECURITY;

-- Admins can manage events
CREATE POLICY "Admins can manage events" ON public.ctf_events
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'staff')));

-- Anyone can read active events (for slug lookup)
CREATE POLICY "Anyone can read active events" ON public.ctf_events
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Junction: challenges assigned to events (shared/multi-assign)
CREATE TABLE public.ctf_challenge_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.ctf_challenges(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.ctf_events(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, event_id)
);

ALTER TABLE public.ctf_challenge_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage challenge events" ON public.ctf_challenge_events
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'staff')));

CREATE POLICY "Participants can read challenge events" ON public.ctf_challenge_events
  FOR SELECT TO authenticated
  USING (true);

-- Event participants (tracks who entered with access code)
CREATE TABLE public.ctf_event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.ctf_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.ctf_event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own participation" ON public.ctf_event_participants
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join events" ON public.ctf_event_participants
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all participants" ON public.ctf_event_participants
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'staff')));

-- Event-specific leaderboard view
CREATE OR REPLACE VIEW public.ctf_event_leaderboard AS
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
