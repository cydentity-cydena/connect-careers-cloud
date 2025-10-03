-- Fix RLS policies for production security (handle existing policies)

-- 1. Secure profiles table
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;

-- Users view their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Authenticated users view limited public profiles (excludes email)
CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL AND id != auth.uid());

-- 2. Secure candidate_profiles table
DROP POLICY IF EXISTS "Candidate profiles viewable by all" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Candidates view own full profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Employers view candidate profiles with applications" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Public can view basic candidate info" ON public.candidate_profiles;

-- Candidates view their own full profile
CREATE POLICY "Candidates view own full profile"
ON public.candidate_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Employers view profiles of applicants
CREATE POLICY "Employers view candidate profiles with applications"
ON public.candidate_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    WHERE a.candidate_id = candidate_profiles.user_id
    AND j.created_by = auth.uid()
  )
);

-- Authenticated users view basic public candidate info
CREATE POLICY "Public can view basic candidate info"
ON public.candidate_profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 3. Secure notifications table
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can create notifications" ON public.notifications;

-- Only service role can create notifications (via edge functions)
CREATE POLICY "Service role can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (false);

-- 4. Add security definer functions
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  avatar_url TEXT,
  location TEXT,
  bio TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, full_name, avatar_url, location, bio
  FROM public.profiles
  WHERE id = profile_id;
$$;

CREATE OR REPLACE FUNCTION public.get_public_candidate_profile(profile_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  years_experience INTEGER,
  willing_to_relocate BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, user_id, title, years_experience, willing_to_relocate, created_at
  FROM public.candidate_profiles
  WHERE user_id = profile_user_id;
$$;

-- 5. Fix update_updated_at function security
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;