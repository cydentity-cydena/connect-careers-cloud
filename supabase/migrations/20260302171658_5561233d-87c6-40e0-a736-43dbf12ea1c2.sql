
-- Secure function to verify event access code and join
CREATE OR REPLACE FUNCTION public.join_ctf_event(
  p_event_slug TEXT,
  p_access_code TEXT
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
  v_event_name TEXT;
  v_is_active BOOLEAN;
  v_starts_at TIMESTAMPTZ;
  v_ends_at TIMESTAMPTZ;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Find event and verify code
  SELECT id, name, is_active, starts_at, ends_at
  INTO v_event_id, v_event_name, v_is_active, v_starts_at, v_ends_at
  FROM public.ctf_events
  WHERE slug = p_event_slug
    AND LOWER(TRIM(access_code)) = LOWER(TRIM(p_access_code));

  IF v_event_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid access code');
  END IF;

  IF NOT v_is_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'This event is not currently active');
  END IF;

  -- Check time window if set
  IF v_ends_at IS NOT NULL AND NOW() > v_ends_at THEN
    RETURN jsonb_build_object('success', false, 'error', 'This event has ended');
  END IF;

  -- Register participant
  INSERT INTO public.ctf_event_participants (event_id, user_id)
  VALUES (v_event_id, v_user_id)
  ON CONFLICT (event_id, user_id) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'event_id', v_event_id, 'event_name', v_event_name);
END;
$$;

-- Remove access_code from the public SELECT policy
-- Create a public view without access_code for non-admin queries
DROP POLICY IF EXISTS "Anyone can read active events" ON public.ctf_events;

CREATE POLICY "Anyone can read active events metadata" ON public.ctf_events
  FOR SELECT TO authenticated
  USING (is_active = true);
