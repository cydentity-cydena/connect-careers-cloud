-- Function to auto-unlock HR Ready badge
CREATE OR REPLACE FUNCTION auto_unlock_hr_ready_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only proceed if hr_ready just became true
  IF NEW.hr_ready = true AND (OLD.hr_ready IS NULL OR OLD.hr_ready = false) THEN
    -- Insert HR Ready badge if not already unlocked
    INSERT INTO user_badges (user_id, badge_id)
    VALUES (NEW.candidate_id, 'a8f2e5d1-4b3c-4f2a-9e1d-8c7b6a5d4e3f')
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-unlock HR Ready badge
CREATE TRIGGER trigger_auto_unlock_hr_ready_badge
  AFTER INSERT OR UPDATE OF hr_ready ON candidate_verifications
  FOR EACH ROW
  EXECUTE FUNCTION auto_unlock_hr_ready_badge();

COMMENT ON TRIGGER trigger_auto_unlock_hr_ready_badge ON candidate_verifications IS 
  'Automatically unlocks HR Ready badge when candidate achieves HR Ready status';