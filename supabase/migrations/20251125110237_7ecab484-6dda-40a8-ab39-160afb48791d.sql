-- Fix the auto_unlock_certification_badges function to support partial name matching
-- This allows badges to unlock even when certification names include extra text
CREATE OR REPLACE FUNCTION public.auto_unlock_certification_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge RECORD;
  v_cert_keyword TEXT;
  v_should_unlock BOOLEAN;
BEGIN
  -- Only proceed if certification is newly verified
  IF NEW.verification_status = 'verified' AND (OLD.verification_status IS NULL OR OLD.verification_status != 'verified') THEN
    
    -- Find all certification badges
    FOR v_badge IN 
      SELECT id, unlock_criteria
      FROM badge_types 
      WHERE is_active = true 
      AND category = 'certification'
      AND unlock_criteria->>'type' = 'certification'
    LOOP
      -- Check if any of the required certification keywords match (case-insensitive)
      v_should_unlock := false;
      
      FOR v_cert_keyword IN 
        SELECT jsonb_array_elements_text(v_badge.unlock_criteria->'certifications')
      LOOP
        -- Check if certification name contains the keyword (case-insensitive)
        IF NEW.name ILIKE '%' || v_cert_keyword || '%' THEN
          v_should_unlock := true;
          EXIT;
        END IF;
      END LOOP;
      
      -- Insert badge if it should unlock and isn't already unlocked
      IF v_should_unlock THEN
        INSERT INTO user_badges (user_id, badge_id, source_id)
        VALUES (NEW.candidate_id, v_badge.id, NEW.id)
        ON CONFLICT (user_id, badge_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION auto_unlock_certification_badges() IS 
  'Auto-unlocks certification badges when certifications are verified. Uses case-insensitive pattern matching to support various certification name formats.';