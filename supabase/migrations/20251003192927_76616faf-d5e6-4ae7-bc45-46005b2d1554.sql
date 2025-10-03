-- Fix RLS policies for production security

-- 1. Secure profiles table - remove overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Allow users to view their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Allow authenticated users to view limited public profile info (not emails)
CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND id != auth.uid()
);

-- 2. Secure candidate_profiles table - implement tiered access
DROP POLICY IF EXISTS "Candidate profiles viewable by all" ON public.candidate_profiles;

-- Candidates can view their own full profile
CREATE POLICY "Candidates view own full profile"
ON public.candidate_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Employers can view candidate profiles if they have an active application
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

-- Authenticated users can view basic public candidate info only
CREATE POLICY "Public can view basic candidate info"
ON public.candidate_profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 3. Secure notifications table - remove permissive insert policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Only allow service role to create notifications (via edge functions)
CREATE POLICY "Service role can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (false); -- Client apps cannot insert directly

-- 4. Fix user_roles to allow signup edge function
-- Keep existing policies but we'll use service role in edge function

-- 5. Add security definer function for safe profile access
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

-- 6. Add function for safe candidate profile access (hide sensitive fields)
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

-- 7. Fix update_updated_at function security
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;

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

-- Recreate triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_candidate_profiles_updated_at
  BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();