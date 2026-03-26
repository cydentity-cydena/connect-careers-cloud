-- Create a secure server-side function that validates AND submits in one atomic operation
-- This prevents client-side manipulation of is_correct or points_awarded
CREATE OR REPLACE FUNCTION public.submit_ctf_flag(
  p_challenge_id uuid,
  p_submitted_flag text,
  p_event_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_correct_flag text;
  v_is_correct boolean;
  v_points integer;
  v_xp_bonus integer;
  v_already_solved boolean;
  v_user_id uuid;
  v_hint_penalty integer := 0;
  v_final_points integer;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check if already solved
  SELECT EXISTS (
    SELECT 1 FROM ctf_submissions
    WHERE candidate_id = v_user_id
    AND challenge_id = p_challenge_id
    AND is_correct = true
  ) INTO v_already_solved;

  IF v_already_solved THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already solved', 'already_solved', true);
  END IF;

  -- Get the actual flag and points (SECURITY DEFINER bypasses RLS)
  SELECT flag, points INTO v_correct_flag, v_points
  FROM ctf_challenges
  WHERE id = p_challenge_id AND is_active = true;
  
  IF v_correct_flag IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Challenge not found');
  END IF;
  
  -- Case-insensitive comparison
  v_is_correct := (LOWER(TRIM(p_submitted_flag)) = LOWER(v_correct_flag));

  -- Calculate hint penalty
  SELECT COALESCE(SUM(points_deducted), 0) INTO v_hint_penalty
  FROM ctf_hint_usage
  WHERE candidate_id = v_user_id AND challenge_id = p_challenge_id;

  v_final_points := GREATEST(0, v_points - v_hint_penalty);

  -- Insert submission with SERVER-validated values
  INSERT INTO ctf_submissions (candidate_id, challenge_id, submitted_flag, is_correct, points_awarded)
  VALUES (v_user_id, p_challenge_id, TRIM(p_submitted_flag), v_is_correct, CASE WHEN v_is_correct THEN v_final_points ELSE 0 END);

  -- Award XP for first-time correct solves
  IF v_is_correct THEN
    v_xp_bonus := GREATEST(1, v_points / 5);
    
    INSERT INTO candidate_xp (candidate_id, total_xp, community_points, last_activity_at)
    VALUES (v_user_id, v_xp_bonus, 0, now())
    ON CONFLICT (candidate_id) DO UPDATE SET
      total_xp = candidate_xp.total_xp + v_xp_bonus,
      last_activity_at = now();
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'is_correct', v_is_correct, 
    'points_awarded', CASE WHEN v_is_correct THEN v_final_points ELSE 0 END
  );
END;
$$;

-- Remove the INSERT policy so clients can't directly insert submissions
DROP POLICY IF EXISTS "Users can create own submissions" ON public.ctf_submissions;

-- Delete the fraudulent submissions
DELETE FROM ctf_submissions WHERE candidate_id = '691b2f0f-04ac-4183-a618-e313ae95d0fe';