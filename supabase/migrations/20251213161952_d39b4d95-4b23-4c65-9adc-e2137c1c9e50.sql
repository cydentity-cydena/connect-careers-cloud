
-- Fix the assessment XP exploit by requiring minimum score and scaling XP
-- Drop and recreate the trigger function
CREATE OR REPLACE FUNCTION public.award_assessment_completion_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp_to_award INTEGER;
BEGIN
  -- Require minimum score of 40% to earn any XP (40 out of 100)
  IF NEW.score < 40 THEN
    -- No XP awarded for low-effort/failing submissions
    RETURN NEW;
  END IF;
  
  -- Scale XP based on score:
  -- Score 40-59: 25 XP (passing but needs improvement)
  -- Score 60-79: 40 XP (good performance)
  -- Score 80-100: 50 XP (excellent performance)
  IF NEW.score >= 80 THEN
    v_xp_to_award := 50;
  ELSIF NEW.score >= 60 THEN
    v_xp_to_award := 40;
  ELSE
    v_xp_to_award := 25;
  END IF;
  
  -- Award scaled points for completing the assessment
  -- Using a custom insert to handle variable XP amount
  INSERT INTO reward_points (candidate_id, type, amount, meta)
  VALUES (
    NEW.candidate_id,
    'ASSESSMENT_COMPLETED',
    v_xp_to_award,
    jsonb_build_object(
      'assessment_id', NEW.id,
      'assessment_type', NEW.assessment_type,
      'score', NEW.score
    )
  )
  ON CONFLICT DO NOTHING;
  
  -- Only update XP if insert succeeded (not a duplicate)
  IF FOUND THEN
    INSERT INTO candidate_xp (candidate_id, total_xp)
    VALUES (NEW.candidate_id, v_xp_to_award)
    ON CONFLICT (candidate_id) 
    DO UPDATE SET 
      total_xp = candidate_xp.total_xp + v_xp_to_award,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;
