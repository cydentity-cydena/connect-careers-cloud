-- Add founding_200 tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_founding_200 boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS founding_200_joined_at timestamp with time zone;

-- Create index for quick counting
CREATE INDEX IF NOT EXISTS idx_profiles_founding_200 ON public.profiles(is_founding_200) WHERE is_founding_200 = true;

-- Function to check if Founding 200 is full
CREATE OR REPLACE FUNCTION public.check_founding_200_availability()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*) < 200 
  FROM public.profiles 
  WHERE is_founding_200 = true;
$$;

-- Function to mark user as Founding 200 member
CREATE OR REPLACE FUNCTION public.mark_as_founding_200(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count integer;
  spaces_available boolean;
BEGIN
  -- Check if spaces are still available
  SELECT check_founding_200_availability() INTO spaces_available;
  
  IF NOT spaces_available THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Founding 200 is now full'
    );
  END IF;
  
  -- Mark user as Founding 200 member
  UPDATE public.profiles
  SET 
    is_founding_200 = true,
    founding_200_joined_at = NOW()
  WHERE id = user_id
  AND is_founding_200 = false;
  
  -- Get current count
  SELECT COUNT(*) INTO current_count
  FROM public.profiles
  WHERE is_founding_200 = true;
  
  RETURN jsonb_build_object(
    'success', true,
    'count', current_count,
    'spaces_remaining', 200 - current_count
  );
END;
$$;