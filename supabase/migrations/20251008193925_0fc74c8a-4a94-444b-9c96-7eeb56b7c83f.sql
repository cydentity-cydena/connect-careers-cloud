-- Fix function search paths
DROP FUNCTION IF EXISTS get_tier_unlock_limit(subscription_tier);
DROP FUNCTION IF EXISTS get_tier_overage_price(subscription_tier);
DROP FUNCTION IF EXISTS get_tier_seat_limit(subscription_tier);

CREATE FUNCTION get_tier_unlock_limit(tier_name subscription_tier)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN CASE tier_name
    WHEN 'employer_starter' THEN 10
    WHEN 'employer_growth' THEN 25
    WHEN 'employer_scale' THEN 75
    WHEN 'recruiter_pro' THEN 50
    ELSE 0
  END;
END;
$$;

CREATE FUNCTION get_tier_overage_price(tier_name subscription_tier)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN CASE tier_name
    WHEN 'employer_starter' THEN 15.00
    WHEN 'employer_growth' THEN 12.00
    WHEN 'employer_scale' THEN 10.00
    WHEN 'recruiter_pro' THEN 10.00
    ELSE 20.00
  END;
END;
$$;

CREATE FUNCTION get_tier_seat_limit(tier_name subscription_tier)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN CASE tier_name
    WHEN 'employer_starter' THEN 1
    WHEN 'employer_growth' THEN 3
    WHEN 'employer_scale' THEN 6
    WHEN 'recruiter_pro' THEN 3
    WHEN 'enterprise' THEN 999
    ELSE 1
  END;
END;
$$;