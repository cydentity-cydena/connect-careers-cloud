-- Fix the check_community_achievements function to only award achievements the user actually qualifies for
-- The bug was that achievements like Mentor, Community Helper, Knowledge Sharer, Rising Star 
-- were being iterated over but not properly filtered out, causing them to be incorrectly awarded

CREATE OR REPLACE FUNCTION public.check_community_achievements(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_post_count INTEGER;
  v_comment_count INTEGER;
  v_reaction_count INTEGER;
  v_achievement RECORD;
  v_should_award BOOLEAN;
BEGIN
  -- Count user's activities
  SELECT COUNT(*) INTO v_post_count
  FROM public.activity_feed
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_comment_count
  FROM public.post_comments
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_reaction_count
  FROM public.post_reactions
  WHERE user_id = p_user_id;

  -- Check and award achievements - ONLY for specific achievement names we handle
  FOR v_achievement IN
    SELECT id, name, requirement_value, xp_reward
    FROM public.achievements
    WHERE category = 'community'
    -- Only iterate over achievements we actually check for
    AND name IN (
      'First Post', 'Conversation Starter', 'Prolific Poster', 'Community Voice',
      'First Comment', 'Active Commenter', 'Discussion Enthusiast', 'Discussion Master',
      'First Reaction', 'Engaged Member', 'Super Supporter', 'Community Champion',
      'Popular Post', 'Viral Content'
    )
  LOOP
    -- Check if user already has this achievement
    IF NOT EXISTS (
      SELECT 1 FROM public.user_achievements
      WHERE user_id = p_user_id AND achievement_id = v_achievement.id
    ) THEN
      v_should_award := FALSE;
      
      -- Post-related achievements
      IF v_achievement.name = 'First Post' AND v_post_count >= 1 THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Conversation Starter' AND v_post_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Prolific Poster' AND v_post_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Community Voice' AND v_post_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      
      -- Comment-related achievements
      ELSIF v_achievement.name = 'First Comment' AND v_comment_count >= 1 THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Active Commenter' AND v_comment_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Discussion Enthusiast' AND v_comment_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Discussion Master' AND v_comment_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      
      -- Reaction-related achievements
      ELSIF v_achievement.name = 'First Reaction' AND v_reaction_count >= 1 THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Engaged Member' AND v_reaction_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Super Supporter' AND v_reaction_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Community Champion' AND v_reaction_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      END IF;
      
      -- NOTE: Popular Post and Viral Content are handled separately in handle_new_reaction()
      -- They require reactions on a SINGLE post, not total reactions
      
      -- Award if conditions met
      IF v_should_award THEN
        INSERT INTO public.user_achievements (user_id, achievement_id)
        VALUES (p_user_id, v_achievement.id);
        
        -- Award XP bonus
        PERFORM public.award_community_points(
          p_user_id,
          'achievement_earned',
          v_achievement.xp_reward,
          jsonb_build_object('achievement_name', v_achievement.name)
        );
      END IF;
    END IF;
  END LOOP;
END;
$function$;