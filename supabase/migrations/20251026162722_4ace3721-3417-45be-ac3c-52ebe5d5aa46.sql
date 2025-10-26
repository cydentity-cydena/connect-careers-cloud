-- Allow service role to award achievements
CREATE POLICY "Service role can manage achievements"
ON user_achievements
FOR ALL
USING (true)
WITH CHECK (true);

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(
  p_user_id UUID,
  p_category TEXT,
  p_current_count INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_achievement RECORD;
BEGIN
  -- Get all achievements for this category that match the requirement
  FOR v_achievement IN 
    SELECT id, requirement_value
    FROM achievements
    WHERE category = p_category::achievement_category
    AND p_current_count >= requirement_value
  LOOP
    -- Check if user already has this achievement
    IF NOT EXISTS (
      SELECT 1 
      FROM user_achievements 
      WHERE user_id = p_user_id 
      AND achievement_id = v_achievement.id
    ) THEN
      -- Award the achievement
      INSERT INTO user_achievements (user_id, achievement_id, earned_at)
      VALUES (p_user_id, v_achievement.id, NOW());
    END IF;
  END LOOP;
END;
$$;

-- Trigger function for skills achievements
CREATE OR REPLACE FUNCTION trigger_skill_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_skill_count INTEGER;
BEGIN
  -- Count total skills for the candidate
  SELECT COUNT(*)
  INTO v_skill_count
  FROM candidate_skills
  WHERE candidate_id = NEW.candidate_id;
  
  -- Check and award skill achievements
  PERFORM check_and_award_achievements(NEW.candidate_id, 'skills', v_skill_count);
  
  RETURN NEW;
END;
$$;

-- Trigger function for certification achievements
CREATE OR REPLACE FUNCTION trigger_cert_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cert_count INTEGER;
BEGIN
  -- Count total certifications for the candidate
  SELECT COUNT(*)
  INTO v_cert_count
  FROM certifications
  WHERE candidate_id = NEW.candidate_id;
  
  -- Check and award certification achievements
  PERFORM check_and_award_achievements(NEW.candidate_id, 'certifications', v_cert_count);
  
  RETURN NEW;
END;
$$;

-- Trigger function for training achievements
CREATE OR REPLACE FUNCTION trigger_training_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_training_count INTEGER;
BEGIN
  -- Count completed training courses for the candidate
  SELECT COUNT(*)
  INTO v_training_count
  FROM course_completions
  WHERE candidate_id = NEW.candidate_id
  AND status = 'VERIFIED';
  
  -- Check and award training achievements
  PERFORM check_and_award_achievements(NEW.candidate_id, 'training', v_training_count);
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS award_skill_achievements ON candidate_skills;
CREATE TRIGGER award_skill_achievements
AFTER INSERT ON candidate_skills
FOR EACH ROW
EXECUTE FUNCTION trigger_skill_achievements();

DROP TRIGGER IF EXISTS award_cert_achievements ON certifications;
CREATE TRIGGER award_cert_achievements
AFTER INSERT ON certifications
FOR EACH ROW
EXECUTE FUNCTION trigger_cert_achievements();

DROP TRIGGER IF EXISTS award_training_achievements ON course_completions;
CREATE TRIGGER award_training_achievements
AFTER INSERT OR UPDATE ON course_completions
FOR EACH ROW
WHEN (NEW.status = 'VERIFIED')
EXECUTE FUNCTION trigger_training_achievements();