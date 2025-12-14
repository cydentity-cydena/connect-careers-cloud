
-- Fix the remaining function without search_path: award_community_points (the one with 4 parameters)
-- Note: There are two overloaded versions, this fixes the one without search_path

CREATE OR REPLACE FUNCTION public.award_community_points(p_candidate_id uuid, p_code text, p_meta jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;
