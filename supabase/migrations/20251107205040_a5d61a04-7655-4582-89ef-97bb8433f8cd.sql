-- Create function to calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(xp_amount integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Level progression: 
  -- Level 1: 0-99 XP
  -- Level 2: 100-249 XP
  -- Level 3: 250-499 XP
  -- Level 4: 500-999 XP
  -- Level 5: 1000-1999 XP
  -- Level 6: 2000-3999 XP
  -- Level 7: 4000-7999 XP
  -- Level 8: 8000-15999 XP
  -- Level 9: 16000-31999 XP
  -- Level 10: 32000+ XP
  
  IF xp_amount < 100 THEN RETURN 1;
  ELSIF xp_amount < 250 THEN RETURN 2;
  ELSIF xp_amount < 500 THEN RETURN 3;
  ELSIF xp_amount < 1000 THEN RETURN 4;
  ELSIF xp_amount < 2000 THEN RETURN 5;
  ELSIF xp_amount < 4000 THEN RETURN 6;
  ELSIF xp_amount < 8000 THEN RETURN 7;
  ELSIF xp_amount < 16000 THEN RETURN 8;
  ELSIF xp_amount < 32000 THEN RETURN 9;
  ELSE RETURN 10;
  END IF;
END;
$$;

-- Update the award_points function to recalculate level
CREATE OR REPLACE FUNCTION public.award_points(p_candidate_id uuid, p_code text, p_meta jsonb DEFAULT NULL::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_rule reward_rules;
  v_new_balance integer;
  v_new_xp integer;
  v_new_level integer;
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
    level = calculate_level_from_xp(total_xp + v_rule.amount),
    updated_at = now()
  WHERE candidate_id = p_candidate_id
  RETURNING points_balance, total_xp, level INTO v_new_balance, v_new_xp, v_new_level;

  RETURN jsonb_build_object(
    'success', true,
    'reward_id', v_reward_id,
    'amount', v_rule.amount,
    'new_balance', v_new_balance,
    'new_xp', v_new_xp,
    'new_level', v_new_level
  );
END;
$$;

-- Backfill levels for existing users based on their current XP
UPDATE candidate_xp
SET level = calculate_level_from_xp(total_xp)
WHERE level != calculate_level_from_xp(total_xp);