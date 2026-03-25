-- Allow admin/staff to remove event participants when resetting event leaderboards
CREATE POLICY "Admins can delete participants"
  ON public.ctf_event_participants
  FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'staff')
  );