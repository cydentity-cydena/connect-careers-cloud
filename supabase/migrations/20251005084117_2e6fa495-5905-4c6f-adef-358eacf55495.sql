-- Make award_community_points only callable by service role (not by users)
-- This prevents users from calling it directly to give themselves points
REVOKE EXECUTE ON FUNCTION public.award_community_points(uuid, text, jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.award_community_points(uuid, text, jsonb) FROM anon;

-- Create a trigger function to automatically award points when endorsements are created
CREATE OR REPLACE FUNCTION public.handle_new_endorsement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Automatically award community points when a new endorsement is created
  PERFORM award_community_points(
    NEW.to_user_id,
    'PEER_ENDORSEMENT',
    jsonb_build_object(
      'endorsed_by', NEW.from_user_id,
      'type', NEW.endorsement_type,
      'endorsement_id', NEW.id
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger on peer_endorsements
DROP TRIGGER IF EXISTS trigger_award_endorsement_points ON public.peer_endorsements;
CREATE TRIGGER trigger_award_endorsement_points
AFTER INSERT ON public.peer_endorsements
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_endorsement();

-- Add rate limiting: max 10 endorsements per user per day
CREATE OR REPLACE FUNCTION public.check_endorsement_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  endorsement_count integer;
BEGIN
  -- Count endorsements from this user in the last 24 hours
  SELECT COUNT(*)
  INTO endorsement_count
  FROM public.peer_endorsements
  WHERE from_user_id = NEW.from_user_id
    AND created_at > NOW() - INTERVAL '24 hours';
  
  IF endorsement_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 10 endorsements per 24 hours';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add rate limit trigger
DROP TRIGGER IF EXISTS trigger_check_endorsement_rate_limit ON public.peer_endorsements;
CREATE TRIGGER trigger_check_endorsement_rate_limit
BEFORE INSERT ON public.peer_endorsements
FOR EACH ROW
EXECUTE FUNCTION public.check_endorsement_rate_limit();