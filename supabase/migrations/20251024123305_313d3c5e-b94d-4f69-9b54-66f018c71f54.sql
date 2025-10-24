-- Drop and recreate get_public_profile to include desired_job_title
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

CREATE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE(
  id uuid, 
  full_name text, 
  username text, 
  avatar_url text, 
  location text, 
  bio text,
  desired_job_title text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT id, full_name, username, avatar_url, location, bio, desired_job_title
  FROM public.profiles
  WHERE id = profile_id;
$function$;