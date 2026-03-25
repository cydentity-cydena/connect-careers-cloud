-- Allow admins to delete CTF submissions (for clearing leaderboards)
CREATE POLICY "Admins can delete submissions"
  ON public.ctf_submissions
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete CTF hint usage (for clearing leaderboards)
CREATE POLICY "Admins can delete hint usage"
  ON public.ctf_hint_usage
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));