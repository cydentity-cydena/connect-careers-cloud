-- Drop the flawed triggers and recreate with proper logic
-- The current check_and_award_achievements RPC is too generic for community achievements
-- since different achievements have different metrics (posts, comments, reactions, endorsements, etc.)

-- Drop old triggers
DROP TRIGGER IF EXISTS trigger_check_endorsement_achievements ON peer_endorsements;
DROP TRIGGER IF EXISTS trigger_check_community_points_achievements ON candidate_xp;
DROP FUNCTION IF EXISTS check_endorsement_achievements();
DROP FUNCTION IF EXISTS check_community_points_achievements();

-- Create specific functions for each community achievement type

-- Function to check post achievements
CREATE OR REPLACE FUNCTION check_post_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_count INTEGER;
  v_achievement RECORD;
BEGIN
  -- Count user's posts
  SELECT COUNT(*) INTO v_post_count
  FROM activity_feed
  WHERE user_id = NEW.user_id;
  
  -- Check each post-related achievement
  FOR v_achievement IN 
    SELECT id, name, requirement_value
    FROM achievements
    WHERE category = 'community'
    AND name IN ('First Post', 'Conversation Starter', 'Prolific Poster', 'Community Voice')
  LOOP
    -- First Post is a special case (requires 1)
    IF v_achievement.name = 'First Post' AND v_post_count >= 1 THEN
      INSERT INTO user_achievements (user_id, achievement_id, earned_at)
      VALUES (NEW.user_id, v_achievement.id, NOW())
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    ELSIF v_post_count >= v_achievement.requirement_value THEN
      INSERT INTO user_achievements (user_id, achievement_id, earned_at)
      VALUES (NEW.user_id, v_achievement.id, NOW())
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Function to check comment achievements
CREATE OR REPLACE FUNCTION check_comment_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_comment_count INTEGER;
  v_achievement RECORD;
BEGIN
  -- Count user's comments
  SELECT COUNT(*) INTO v_comment_count
  FROM post_comments
  WHERE user_id = NEW.user_id;
  
  -- Check each comment-related achievement
  FOR v_achievement IN 
    SELECT id, name, requirement_value
    FROM achievements
    WHERE category = 'community'
    AND name IN ('First Comment', 'Active Commenter', 'Discussion Enthusiast', 'Discussion Master')
  LOOP
    IF v_achievement.name = 'First Comment' AND v_comment_count >= 1 THEN
      INSERT INTO user_achievements (user_id, achievement_id, earned_at)
      VALUES (NEW.user_id, v_achievement.id, NOW())
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    ELSIF v_comment_count >= v_achievement.requirement_value THEN
      INSERT INTO user_achievements (user_id, achievement_id, earned_at)
      VALUES (NEW.user_id, v_achievement.id, NOW())
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Function to check reaction achievements
CREATE OR REPLACE FUNCTION check_reaction_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reaction_count INTEGER;
  v_achievement RECORD;
BEGIN
  -- Count user's reactions
  SELECT COUNT(*) INTO v_reaction_count
  FROM post_reactions
  WHERE user_id = NEW.user_id;
  
  -- Check each reaction-related achievement
  FOR v_achievement IN 
    SELECT id, name, requirement_value
    FROM achievements
    WHERE category = 'community'
    AND name IN ('First Reaction', 'Engaged Member', 'Super Supporter', 'Community Champion')
  LOOP
    IF v_achievement.name = 'First Reaction' AND v_reaction_count >= 1 THEN
      INSERT INTO user_achievements (user_id, achievement_id, earned_at)
      VALUES (NEW.user_id, v_achievement.id, NOW())
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    ELSIF v_reaction_count >= v_achievement.requirement_value THEN
      INSERT INTO user_achievements (user_id, achievement_id, earned_at)
      VALUES (NEW.user_id, v_achievement.id, NOW())
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Function to check endorsement achievements (Rising Star)
CREATE OR REPLACE FUNCTION check_endorsement_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_endorsement_count INTEGER;
  v_achievement_id UUID;
BEGIN
  -- Count endorsements received by this user
  SELECT COUNT(*) INTO v_endorsement_count
  FROM peer_endorsements
  WHERE to_user_id = NEW.to_user_id;
  
  -- Check Rising Star achievement (25 endorsements)
  SELECT id INTO v_achievement_id
  FROM achievements
  WHERE category = 'community'
  AND name = 'Rising Star'
  AND requirement_value <= v_endorsement_count;
  
  IF v_achievement_id IS NOT NULL THEN
    INSERT INTO user_achievements (user_id, achievement_id, earned_at)
    VALUES (NEW.to_user_id, v_achievement_id, NOW())
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to check community points achievements (Community Leader with 1000 points)
CREATE OR REPLACE FUNCTION check_community_points_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_achievement_id UUID;
BEGIN
  -- Check Community Leader achievement (1000 community points - the one with higher requirement)
  SELECT id INTO v_achievement_id
  FROM achievements
  WHERE category = 'community'
  AND name = 'Community Leader'
  AND requirement_value = 1000
  AND requirement_value <= NEW.community_points;
  
  IF v_achievement_id IS NOT NULL THEN
    INSERT INTO user_achievements (user_id, achievement_id, earned_at)
    VALUES (NEW.candidate_id, v_achievement_id, NOW())
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for each type
CREATE TRIGGER trigger_check_post_achievements
AFTER INSERT ON activity_feed
FOR EACH ROW
EXECUTE FUNCTION check_post_achievements();

CREATE TRIGGER trigger_check_comment_achievements
AFTER INSERT ON post_comments
FOR EACH ROW
EXECUTE FUNCTION check_comment_achievements();

CREATE TRIGGER trigger_check_reaction_achievements
AFTER INSERT ON post_reactions
FOR EACH ROW
EXECUTE FUNCTION check_reaction_achievements();

CREATE TRIGGER trigger_check_endorsement_achievements
AFTER INSERT ON peer_endorsements
FOR EACH ROW
EXECUTE FUNCTION check_endorsement_achievements();

CREATE TRIGGER trigger_check_community_points_achievements
AFTER UPDATE OF community_points ON candidate_xp
FOR EACH ROW
WHEN (NEW.community_points > OLD.community_points)
EXECUTE FUNCTION check_community_points_achievements();