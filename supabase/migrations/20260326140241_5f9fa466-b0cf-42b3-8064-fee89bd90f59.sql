-- Remove the overly permissive policy that exposes flags to all users
DROP POLICY IF EXISTS "Anyone can view active challenges" ON public.ctf_challenges;

-- Only admins can query the raw ctf_challenges table (which contains flags)
-- Non-admin users access challenges through the ctf_challenges_public view (no flag column)
CREATE POLICY "Only admins can view raw challenges"
ON public.ctf_challenges
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));