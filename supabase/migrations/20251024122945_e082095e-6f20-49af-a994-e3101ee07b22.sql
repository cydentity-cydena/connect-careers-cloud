-- Allow public viewing of certifications for leaderboard/profiles
CREATE POLICY "Certifications viewable by all for public profiles"
ON public.certifications
FOR SELECT
USING (true);