
-- Allow public access to basic profile info for marketplace-visible candidates
CREATE POLICY "Public can view profiles of marketplace talent"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.candidate_profiles cp
    WHERE cp.user_id = profiles.id
    AND cp.is_marketplace_visible = true
  )
);
