
-- Allow anyone to view marketplace-visible candidate profiles (public page)
CREATE POLICY "Public can view marketplace visible profiles"
ON public.candidate_profiles
FOR SELECT
USING (is_marketplace_visible = true);
