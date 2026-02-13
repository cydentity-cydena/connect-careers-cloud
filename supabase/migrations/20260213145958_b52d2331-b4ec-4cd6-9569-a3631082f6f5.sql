
-- Add monetization columns to task_bounties
ALTER TABLE public.task_bounties
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC NOT NULL DEFAULT 0.12,
  ADD COLUMN IF NOT EXISTS featured_fee_gbp NUMERIC DEFAULT 0;

-- Function to get monthly bounty limit per tier
CREATE OR REPLACE FUNCTION public.get_tier_bounty_limit(tier_name subscription_tier)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN CASE tier_name
    WHEN 'employer_starter' THEN 2
    WHEN 'employer_growth' THEN 10
    WHEN 'employer_scale' THEN 999
    WHEN 'recruiter_pro' THEN 5
    WHEN 'enterprise' THEN 999
    ELSE 0
  END;
END;
$$;

-- Function to count monthly bounties for a user
CREATE OR REPLACE FUNCTION public.count_monthly_bounties(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM public.task_bounties
  WHERE client_id = p_user_id
    AND created_at >= date_trunc('month', CURRENT_DATE)
    AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
  RETURN COALESCE(v_count, 0);
END;
$$;
