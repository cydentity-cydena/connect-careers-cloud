-- 1. Drop the overly permissive community policy that exposes all profile data
DROP POLICY IF EXISTS "Authenticated users can view all profiles for community feature" ON public.profiles;

-- 2. Create a safe public view that excludes sensitive columns
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT
  id,
  full_name,
  username,
  avatar_url,
  bio,
  location,
  created_at,
  updated_at,
  is_verified,
  verified_at,
  desired_job_title,
  tryhackme_username,
  hackthebox_username,
  tryhackme_rank,
  hackthebox_rank,
  tryhackme_level,
  tryhackme_points,
  tryhackme_badges,
  hackthebox_points,
  hackthebox_rank_text,
  hackthebox_user_owns,
  selected_badge_id,
  selected_avatar_frame,
  is_founding_200,
  founding_200_joined_at,
  profile_claimed,
  featured_until
FROM public.profiles;
-- Excludes: email, hackthebox_api_key, email_notifications, imported_by_recruiter, username_changes

-- 3. Add a new policy: authenticated users can read LIMITED profile data of others
-- (they must use profiles_public view which strips sensitive columns)
CREATE POLICY "Authenticated users can view profiles via safe view"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
-- NOTE: This still allows SELECT but the profiles_public view is the recommended query target.
-- We need this because the view uses security_invoker and needs a base table policy.
-- The REAL protection is that frontend code uses profiles_public for non-admin queries.

-- Actually, let's take a different approach: use a security definer function instead
-- Drop the policy we just created
DROP POLICY IF EXISTS "Authenticated users can view profiles via safe view" ON public.profiles;

-- Create a secure function to get community profiles without sensitive data  
CREATE OR REPLACE FUNCTION public.get_profiles_safe(p_user_ids uuid[] DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  full_name text,
  username text,
  avatar_url text,
  bio text,
  location text,
  created_at timestamptz,
  is_verified boolean,
  desired_job_title text,
  tryhackme_username text,
  hackthebox_username text,
  tryhackme_rank text,
  hackthebox_rank text,
  selected_badge_id uuid,
  selected_avatar_frame text,
  is_founding_200 boolean,
  featured_until timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_ids IS NOT NULL THEN
    RETURN QUERY
    SELECT p.id, p.full_name, p.username, p.avatar_url, p.bio, p.location,
           p.created_at, p.is_verified, p.desired_job_title,
           p.tryhackme_username, p.hackthebox_username,
           p.tryhackme_rank, p.hackthebox_rank,
           p.selected_badge_id, p.selected_avatar_frame,
           p.is_founding_200, p.featured_until
    FROM profiles p
    WHERE p.id = ANY(p_user_ids);
  ELSE
    RETURN QUERY
    SELECT p.id, p.full_name, p.username, p.avatar_url, p.bio, p.location,
           p.created_at, p.is_verified, p.desired_job_title,
           p.tryhackme_username, p.hackthebox_username,
           p.tryhackme_rank, p.hackthebox_rank,
           p.selected_badge_id, p.selected_avatar_frame,
           p.is_founding_200, p.featured_until
    FROM profiles p;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_profiles_safe(uuid[]) TO authenticated;

-- Drop the public view since we're using the function approach
DROP VIEW IF EXISTS public.profiles_public;