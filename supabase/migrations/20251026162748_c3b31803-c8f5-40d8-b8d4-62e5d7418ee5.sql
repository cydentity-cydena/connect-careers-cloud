-- Trigger function for endorsement achievements
CREATE OR REPLACE FUNCTION trigger_endorsement_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_endorsement_count INTEGER;
BEGIN
  -- Count total endorsements received by the user
  SELECT COUNT(*)
  INTO v_endorsement_count
  FROM peer_endorsements
  WHERE to_user_id = NEW.to_user_id;
  
  -- Check and award endorsement-based achievements (Rising Star at 25)
  PERFORM check_and_award_achievements(NEW.to_user_id, 'community', v_endorsement_count);
  
  RETURN NEW;
END;
$$;

-- Trigger function for community points achievements
CREATE OR REPLACE FUNCTION trigger_community_points_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check and award community points achievements (Community Leader at 1000)
  PERFORM check_and_award_achievements(NEW.candidate_id, 'community', NEW.community_points);
  
  RETURN NEW;
END;
$$;

-- Create triggers for community achievements
DROP TRIGGER IF EXISTS award_endorsement_achievements ON peer_endorsements;
CREATE TRIGGER award_endorsement_achievements
AFTER INSERT ON peer_endorsements
FOR EACH ROW
EXECUTE FUNCTION trigger_endorsement_achievements();

DROP TRIGGER IF EXISTS award_community_points_achievements ON candidate_xp;
CREATE TRIGGER award_community_points_achievements
AFTER INSERT OR UPDATE ON candidate_xp
FOR EACH ROW
WHEN (NEW.community_points IS NOT NULL)
EXECUTE FUNCTION trigger_community_points_achievements();