
-- Fix calculate_security_iq_streak function - add search_path
CREATE OR REPLACE FUNCTION public.calculate_security_iq_streak(p_candidate_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_streak INTEGER := 0;
  v_check_date DATE;
  v_has_attempt BOOLEAN;
  v_today_answered BOOLEAN;
BEGIN
  -- First check if they answered correctly today
  SELECT EXISTS (
    SELECT 1 
    FROM public.security_iq_attempts
    WHERE candidate_id = p_candidate_id
    AND challenge_date = CURRENT_DATE
    AND score > 0
  ) INTO v_today_answered;
  
  -- Start from today if they answered, otherwise from yesterday
  IF v_today_answered THEN
    v_check_date := CURRENT_DATE;
  ELSE
    v_check_date := CURRENT_DATE - INTERVAL '1 day';
  END IF;
  
  -- Count consecutive days with correct answers
  LOOP
    SELECT EXISTS (
      SELECT 1 
      FROM public.security_iq_attempts
      WHERE candidate_id = p_candidate_id
      AND challenge_date = v_check_date
      AND score > 0
    ) INTO v_has_attempt;
    
    IF NOT v_has_attempt THEN
      EXIT;
    END IF;
    
    v_streak := v_streak + 1;
    v_check_date := v_check_date - INTERVAL '1 day';
  END LOOP;
  
  RETURN v_streak;
END;
$function$;
