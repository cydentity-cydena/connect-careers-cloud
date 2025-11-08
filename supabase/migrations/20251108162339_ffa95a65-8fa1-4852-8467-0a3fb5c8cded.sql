-- Add reward rule for assessment completion
INSERT INTO reward_rules (code, description, amount, active)
VALUES (
  'ASSESSMENT_COMPLETED',
  'Complete a skills assessment',
  50,
  true
)
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  amount = EXCLUDED.amount,
  active = EXCLUDED.active;

-- Create function to award points when assessment is completed
CREATE OR REPLACE FUNCTION public.award_assessment_completion_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Award points for completing the assessment
  PERFORM award_points(
    NEW.candidate_id,
    'ASSESSMENT_COMPLETED',
    jsonb_build_object(
      'assessment_id', NEW.id,
      'assessment_type', NEW.assessment_type,
      'score', NEW.score
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger on skills_assessments
DROP TRIGGER IF EXISTS on_assessment_completed ON skills_assessments;
CREATE TRIGGER on_assessment_completed
  AFTER INSERT ON skills_assessments
  FOR EACH ROW
  EXECUTE FUNCTION award_assessment_completion_points();