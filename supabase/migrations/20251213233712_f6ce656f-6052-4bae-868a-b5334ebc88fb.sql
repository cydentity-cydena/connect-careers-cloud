-- Update verify_ctf_flag to award XP on first-time correct solves
CREATE OR REPLACE FUNCTION public.verify_ctf_flag(p_challenge_id uuid, p_submitted_flag text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_correct_flag text;
  v_is_correct boolean;
  v_points integer;
  v_xp_bonus integer;
  v_already_solved boolean;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  -- Get the actual flag and points (only accessible via this function)
  SELECT flag, points INTO v_correct_flag, v_points
  FROM ctf_challenges
  WHERE id = p_challenge_id AND is_active = true;
  
  IF v_correct_flag IS NULL THEN
    RETURN false;
  END IF;
  
  -- Case-sensitive comparison
  v_is_correct := (v_submitted_flag = v_correct_flag);
  
  -- If correct and user is authenticated, award XP bonus (first-time only)
  IF v_is_correct AND v_user_id IS NOT NULL THEN
    -- Check if already solved
    SELECT EXISTS (
      SELECT 1 FROM ctf_submissions
      WHERE candidate_id = v_user_id
      AND challenge_id = p_challenge_id
      AND is_correct = true
    ) INTO v_already_solved;
    
    -- Award XP only for first-time solves (20% of CTF points)
    IF NOT v_already_solved THEN
      v_xp_bonus := GREATEST(1, v_points / 5);
      
      -- Update candidate_xp
      INSERT INTO candidate_xp (candidate_id, total_xp, community_points, last_activity_at)
      VALUES (v_user_id, v_xp_bonus, 0, now())
      ON CONFLICT (candidate_id) DO UPDATE SET
        total_xp = candidate_xp.total_xp + v_xp_bonus,
        last_activity_at = now();
    END IF;
  END IF;
  
  RETURN v_is_correct;
END;
$function$;