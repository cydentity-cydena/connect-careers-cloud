-- Add username column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'username'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN username text;
  END IF;
END $$;

-- Add unique constraint on username (drop first if exists)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_unique;
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Add check constraint for username format (drop first if exists)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_format;
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_username_format CHECK (
  username ~ '^[a-zA-Z0-9_]{3,20}$'
);

-- Drop and recreate the get_public_profile function to include username
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

CREATE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE(id uuid, full_name text, username text, avatar_url text, location text, bio text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, full_name, username, avatar_url, location, bio
  FROM public.profiles
  WHERE id = profile_id;
$$;