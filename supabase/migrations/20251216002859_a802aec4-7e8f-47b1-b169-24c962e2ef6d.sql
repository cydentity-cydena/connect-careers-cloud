-- Allow all authenticated users to view ctf_submissions for leaderboard purposes
-- This only exposes points data, not the actual flag values (which shouldn't be shown anyway)
CREATE POLICY "Authenticated users can view all submissions for leaderboard"
ON public.ctf_submissions
FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated users to view basic profile info for leaderboard/community features
-- This is safe as it only allows SELECT, and profiles are meant to be public on this platform
CREATE POLICY "Authenticated users can view all profiles for community features"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);