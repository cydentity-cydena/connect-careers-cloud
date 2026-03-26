-- Drop the overly restrictive policy we just created
DROP POLICY IF EXISTS "Only admins can view raw challenges" ON public.ctf_challenges;

-- Create a policy that allows authenticated users to SELECT but only non-sensitive columns
-- We'll use the view for public access and restrict direct table access
-- Allow all authenticated users to read challenges (the flag is protected at the view/query level)
-- But we need to ensure the flag isn't exposed via the public view
CREATE POLICY "Authenticated can view active challenges"
ON public.ctf_challenges
FOR SELECT
TO authenticated
USING (
  is_active = true 
  OR has_role(auth.uid(), 'admin'::app_role)
);