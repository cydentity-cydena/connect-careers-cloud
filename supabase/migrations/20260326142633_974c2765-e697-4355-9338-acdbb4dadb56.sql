CREATE OR REPLACE FUNCTION public.get_ctf_event_challenges_safe(p_event_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  category text,
  difficulty text,
  points integer,
  hints jsonb,
  is_active boolean,
  file_url text,
  file_name text,
  visibility text,
  created_at timestamptz,
  sort_order integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  IF NOT (
    EXISTS (
      SELECT 1
      FROM public.ctf_event_participants ep
      WHERE ep.event_id = p_event_id
        AND ep.user_id = v_user_id
    )
    OR has_role(v_user_id, 'admin'::app_role)
    OR has_role(v_user_id, 'staff'::app_role)
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.title,
    c.description,
    c.category,
    c.difficulty,
    c.points,
    c.hints::jsonb,
    c.is_active,
    c.file_url,
    c.file_name,
    c.visibility,
    c.created_at,
    COALESCE(ce.sort_order, 0)::integer AS sort_order
  FROM public.ctf_challenge_events ce
  JOIN public.ctf_challenges c ON c.id = ce.challenge_id
  WHERE ce.event_id = p_event_id
    AND c.is_active = true
  ORDER BY COALESCE(ce.sort_order, 0), c.points, c.created_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_ctf_event_challenges_safe(uuid) TO authenticated;