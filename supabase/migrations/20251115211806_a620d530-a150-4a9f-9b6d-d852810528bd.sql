-- Update the get_tier_unlock_limit function to set Enterprise to 100 unlocks
CREATE OR REPLACE FUNCTION public.get_tier_unlock_limit(tier_name subscription_tier)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN CASE tier_name
    WHEN 'employer_starter' THEN 10
    WHEN 'employer_growth' THEN 30
    WHEN 'employer_scale' THEN 100
    WHEN 'recruiter_pro' THEN 75
    ELSE 0
  END;
END;
$function$;