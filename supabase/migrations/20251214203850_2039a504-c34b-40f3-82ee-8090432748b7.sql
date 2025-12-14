
-- Fix functions missing search_path parameter

-- Fix award_points function
CREATE OR REPLACE FUNCTION public.award_points(p_candidate_id uuid, p_code text, p_meta jsonb DEFAULT NULL::jsonb)
 RETURNS TABLE(xp_awarded integer, new_total_xp integer, already_awarded boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_rule RECORD;
  v_current_xp INTEGER;
  v_duplicate_check RECORD;
BEGIN
  -- Get the reward rule for this code
  SELECT * INTO v_rule
  FROM reward_rules
  WHERE code = p_code AND active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward rule not found or inactive: %', p_code;
  END IF;

  -- Check for duplicate awards based on code and meta
  SELECT * INTO v_duplicate_check
  FROM reward_points
  WHERE candidate_id = p_candidate_id
    AND type = p_code
    AND (
      (p_meta IS NULL AND meta IS NULL) OR
      (p_meta IS NOT NULL AND meta IS NOT NULL AND meta = p_meta)
    );

  IF FOUND THEN
    -- Get current XP
    SELECT COALESCE(total_xp, 0) INTO v_current_xp
    FROM candidate_xp
    WHERE candidate_id = p_candidate_id;

    RETURN QUERY SELECT 
      0 as xp_awarded,
      v_current_xp as new_total_xp,
      true as already_awarded;
    RETURN;
  END IF;

  -- Insert reward point record (keeping for history)
  INSERT INTO reward_points (candidate_id, type, amount, meta)
  VALUES (p_candidate_id, p_code, v_rule.amount, p_meta);

  -- All points now go directly to XP
  INSERT INTO candidate_xp (candidate_id, total_xp)
  VALUES (p_candidate_id, v_rule.amount)
  ON CONFLICT (candidate_id) 
  DO UPDATE SET 
    total_xp = candidate_xp.total_xp + v_rule.amount,
    updated_at = NOW();

  -- Get the new total XP
  SELECT total_xp INTO v_current_xp
  FROM candidate_xp
  WHERE candidate_id = p_candidate_id;

  RETURN QUERY SELECT 
    v_rule.amount as xp_awarded,
    v_current_xp as new_total_xp,
    false as already_awarded;
END;
$function$;

-- Fix generate_invitation_token function
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$function$;
