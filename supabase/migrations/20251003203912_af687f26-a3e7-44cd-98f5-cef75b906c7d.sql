-- Create reward_rules table for configurable point awards
CREATE TABLE public.reward_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  amount integer NOT NULL,
  active boolean DEFAULT true,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create reward_points table to track all point awards
CREATE TABLE public.reward_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount integer NOT NULL,
  meta jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Add points_balance to candidate_xp
ALTER TABLE public.candidate_xp
ADD COLUMN IF NOT EXISTS points_balance integer DEFAULT 0;

-- Enable RLS
ALTER TABLE public.reward_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reward_rules
CREATE POLICY "Everyone can view active reward rules"
  ON public.reward_rules FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage reward rules"
  ON public.reward_rules FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for reward_points
CREATE POLICY "Users can view own reward points"
  ON public.reward_points FOR SELECT
  USING (auth.uid() = candidate_id);

CREATE POLICY "Service role can insert reward points"
  ON public.reward_points FOR INSERT
  WITH CHECK (false);

-- Create indexes for performance
CREATE INDEX idx_reward_points_candidate ON public.reward_points(candidate_id);
CREATE INDEX idx_reward_points_created ON public.reward_points(created_at DESC);
CREATE INDEX idx_reward_rules_code ON public.reward_rules(code) WHERE active = true;

-- Create trigger for updated_at
CREATE TRIGGER update_reward_rules_updated_at
  BEFORE UPDATE ON public.reward_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Seed reward rules
INSERT INTO public.reward_rules (code, amount, description) VALUES
  ('CERT_OPENBADGE_VERIFIED', 500, 'OpenBadge/Credly/Accredible verified certification'),
  ('CERT_MANUAL_PENDING', 100, 'Manual certification submission (pending verification)'),
  ('CERT_VENDOR_WEBHOOK_VERIFIED', 700, 'Vendor webhook verified certification (high trust)'),
  ('CERT_ADMIN_VERIFIED', 300, 'Admin verified manual certification'),
  ('PROFILE_COMPLETE', 250, 'Profile 100% complete'),
  ('FIRST_JOB_APPLICATION', 150, 'First job application submitted'),
  ('SKILL_ADDED', 50, 'Skill added to profile');

-- Add webhook tracking to certifications table
ALTER TABLE public.certifications
ADD COLUMN IF NOT EXISTS signed_webhook boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS webhook_provider text,
ADD COLUMN IF NOT EXISTS webhook_verified_at timestamp with time zone;

-- Create function to award points (called by edge functions with service role)
CREATE OR REPLACE FUNCTION public.award_points(
  p_candidate_id uuid,
  p_code text,
  p_meta jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rule reward_rules;
  v_new_balance integer;
  v_reward_id uuid;
BEGIN
  -- Get the reward rule
  SELECT * INTO v_rule
  FROM reward_rules
  WHERE code = p_code AND active = true;

  IF v_rule IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Rule not found or inactive');
  END IF;

  -- Insert reward point
  INSERT INTO reward_points (candidate_id, type, amount, meta)
  VALUES (p_candidate_id, p_code, v_rule.amount, p_meta)
  RETURNING id INTO v_reward_id;

  -- Update candidate balance
  UPDATE candidate_xp
  SET 
    points_balance = points_balance + v_rule.amount,
    total_xp = total_xp + v_rule.amount,
    updated_at = now()
  WHERE candidate_id = p_candidate_id
  RETURNING points_balance INTO v_new_balance;

  -- Return success with new balance
  RETURN jsonb_build_object(
    'success', true,
    'reward_id', v_reward_id,
    'amount', v_rule.amount,
    'new_balance', v_new_balance
  );
END;
$$;