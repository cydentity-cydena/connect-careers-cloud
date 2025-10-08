-- Add annual allocation tracking to employer_credits
ALTER TABLE public.employer_credits
ADD COLUMN IF NOT EXISTS annual_unlocks_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS allocation_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW());

-- Function to get tier unlock limits
CREATE OR REPLACE FUNCTION get_tier_unlock_limit(tier_name subscription_tier)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
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

-- Function to get tier overage price
CREATE OR REPLACE FUNCTION get_tier_overage_price(tier_name subscription_tier)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
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

-- Create team_members table for seat limits
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Team members policies
CREATE POLICY "Users can view team members in their org"
  ON public.team_members
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage team members"
  ON public.team_members
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to get tier seat limit
CREATE OR REPLACE FUNCTION get_tier_seat_limit(tier_name subscription_tier)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
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