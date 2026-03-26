
CREATE TABLE public.team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email text NOT NULL,
  role text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(inviter_id, invitee_email, status)
);

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invitations" ON public.team_invitations
  FOR SELECT TO authenticated
  USING (inviter_id = auth.uid());

CREATE POLICY "Service role full access" ON public.team_invitations
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Invitees can view their invitations" ON public.team_invitations
  FOR SELECT TO authenticated
  USING (invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE OR REPLACE FUNCTION public.check_seats_available(owner_id uuid, role_type text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT true;
$$;
