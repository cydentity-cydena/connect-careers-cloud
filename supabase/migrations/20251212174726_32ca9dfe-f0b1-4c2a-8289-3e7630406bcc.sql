
-- Fix the check_community_achievements function with proper achievement matching
CREATE OR REPLACE FUNCTION public.check_community_achievements(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

  -- Check and award achievements
  FOR v_achievement IN
    SELECT id, name, requirement_value, xp_reward
    FROM public.achievements
    WHERE category = 'community'
  LOOP
    -- Check if user already has this achievement
    IF NOT EXISTS (
      SELECT 1 FROM public.user_achievements
      WHERE user_id = p_user_id AND achievement_id = v_achievement.id
    ) THEN
      v_should_award := FALSE;
      
      -- Post-related achievements (exact name matching)
      IF v_achievement.name = 'First Post' AND v_post_count >= 1 THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Conversation Starter' AND v_post_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Prolific Poster' AND v_post_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Community Voice' AND v_achievement.requirement_value = 100 AND v_post_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Community Leader' AND v_achievement.requirement_value = 25 AND v_post_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      
      -- Comment-related achievements (exact name matching)
      ELSIF v_achievement.name = 'First Comment' AND v_comment_count >= 1 THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Active Commenter' AND v_comment_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Discussion Enthusiast' AND v_comment_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Discussion Master' AND v_comment_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      
      -- Reaction-related achievements (exact name matching)
      ELSIF v_achievement.name = 'First Reaction' AND v_reaction_count >= 1 THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Engaged Member' AND v_reaction_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Super Supporter' AND v_reaction_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      ELSIF v_achievement.name = 'Community Champion' AND v_reaction_count >= v_achievement.requirement_value THEN
        v_should_award := TRUE;
      END IF;
      
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
$$;
