-- Fix 1: Add RESTRICTIVE policies to user_roles table to prevent privilege escalation
CREATE POLICY "Only admins can create roles"
  ON public.user_roles
  AS RESTRICTIVE
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles
  AS RESTRICTIVE
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
  ON public.user_roles
  AS RESTRICTIVE
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Add authorization checks to SECURITY DEFINER functions
CREATE OR REPLACE FUNCTION public.award_points(p_candidate_id uuid, p_code text, p_meta jsonb DEFAULT NULL)
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
  -- Authorization check: only the candidate themselves or admins can award points
  IF auth.uid() != p_candidate_id AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot award points to other users';
  END IF;

  SELECT * INTO v_rule
  FROM reward_rules
  WHERE code = p_code AND active = true;

  IF v_rule IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Rule not found or inactive');
  END IF;

  INSERT INTO reward_points (candidate_id, type, amount, meta)
  VALUES (p_candidate_id, p_code, v_rule.amount, p_meta)
  RETURNING id INTO v_reward_id;

  UPDATE candidate_xp
  SET 
    points_balance = points_balance + v_rule.amount,
    total_xp = total_xp + v_rule.amount,
    updated_at = now()
  WHERE candidate_id = p_candidate_id
  RETURNING points_balance INTO v_new_balance;

  RETURN jsonb_build_object(
    'success', true,
    'reward_id', v_reward_id,
    'amount', v_rule.amount,
    'new_balance', v_new_balance
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.award_community_points(p_candidate_id uuid, p_code text, p_meta jsonb DEFAULT NULL)
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
  -- Authorization check: only the candidate themselves or admins can award community points
  IF auth.uid() != p_candidate_id AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot award community points to other users';
  END IF;

  SELECT * INTO v_rule
  FROM reward_rules
  WHERE code = p_code AND active = true;

  IF v_rule IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Rule not found or inactive');
  END IF;

  INSERT INTO reward_points (candidate_id, type, amount, meta)
  VALUES (p_candidate_id, p_code, v_rule.amount, p_meta)
  RETURNING id INTO v_reward_id;

  UPDATE candidate_xp
  SET 
    community_points = community_points + v_rule.amount,
    updated_at = now()
  WHERE candidate_id = p_candidate_id;

  IF NOT FOUND THEN
    INSERT INTO candidate_xp (candidate_id, total_xp, points_balance, profile_completion_percent, level, community_points)
    VALUES (p_candidate_id, 0, 0, 0, 1, v_rule.amount);
  END IF;

  SELECT community_points INTO v_new_balance
  FROM candidate_xp
  WHERE candidate_id = p_candidate_id;

  RETURN jsonb_build_object(
    'success', true,
    'reward_id', v_reward_id,
    'amount', v_rule.amount,
    'new_balance', v_new_balance
  );
END;
$$;