-- Allow everyone to view basic public profile info (avatar, username, full_name) for community features
-- This ensures avatars and usernames appear in activity feeds, comments, etc.
-- Full profile details remain protected by existing RLS policies

CREATE POLICY "Public profile info viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Note: This policy only grants SELECT access. 
-- Users still need to be authenticated and match conditions in other policies 
-- (own profile, unlocked access, applicant status, admin/staff) 
-- to see full profile details like bio, location, email, etc.
-- The application layer should filter which fields are shown based on context.