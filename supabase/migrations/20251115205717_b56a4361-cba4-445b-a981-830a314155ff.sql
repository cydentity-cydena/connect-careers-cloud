-- Update tier unlock limits and overage pricing
CREATE OR REPLACE FUNCTION public.get_tier_unlock_limit(tier_name subscription_tier)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN CASE tier_name
    WHEN 'employer_starter' THEN 10
    WHEN 'employer_growth' THEN 30
    WHEN 'employer_scale' THEN 999999
    WHEN 'recruiter_pro' THEN 75
    ELSE 0
  END;
END;
$$;

-- Update tier overage pricing
CREATE OR REPLACE FUNCTION public.get_tier_overage_price(tier_name subscription_tier)
RETURNS numeric
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN CASE tier_name
    WHEN 'employer_starter' THEN 8.00
    WHEN 'employer_growth' THEN 8.00
    WHEN 'employer_scale' THEN 0.00
    WHEN 'recruiter_pro' THEN 8.00
    ELSE 20.00
  END;
END;
$$;

-- Update seat limits
CREATE OR REPLACE FUNCTION public.get_tier_seat_limit(tier_name subscription_tier)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN CASE tier_name
    WHEN 'employer_starter' THEN 1
    WHEN 'employer_growth' THEN 5
    WHEN 'employer_scale' THEN 10
    WHEN 'recruiter_pro' THEN 3
    WHEN 'enterprise' THEN 999
    ELSE 1
  END;
END;
$$;