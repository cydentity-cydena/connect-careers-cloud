-- Fix: Remove policy that exposes email addresses to all authenticated users
-- The get_public_profile() function already provides secure access to public data
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;