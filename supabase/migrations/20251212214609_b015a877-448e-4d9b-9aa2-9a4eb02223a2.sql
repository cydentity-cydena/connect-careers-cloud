-- Fix 1: user_achievements - Drop the overly permissive policy and create proper admin-only access
DROP POLICY IF EXISTS "Service role can manage achievements" ON user_achievements;

-- Create policy that only allows admins to manage achievements (insert/update/delete)
CREATE POLICY "Only admins can manage achievements"
ON user_achievements
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: profiles - Restrict public access to authenticated users only
DROP POLICY IF EXISTS "Public profile info viewable by everyone" ON profiles;

-- Only authenticated users can view profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);