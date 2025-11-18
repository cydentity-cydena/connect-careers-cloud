-- Create weekly_challenges table for hot topic discussions
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL DEFAULT 'discussion',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create featured_members table for member spotlight
CREATE TABLE IF NOT EXISTS public.featured_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  feature_date DATE NOT NULL DEFAULT CURRENT_DATE,
  spotlight_text TEXT,
  achievements_highlighted JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for weekly_challenges
CREATE POLICY "Anyone can view active challenges"
  ON public.weekly_challenges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage challenges"
  ON public.weekly_challenges FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for featured_members
CREATE POLICY "Anyone can view featured members"
  ON public.featured_members FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage featured members"
  ON public.featured_members FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Insert community achievement badges
INSERT INTO public.achievements (name, description, icon, category, requirement_value, xp_reward) VALUES
  ('First Post', 'Share your first activity with the community', 'MessageSquare', 'community', 1, 50),
  ('Conversation Starter', 'Create 10 posts in the community', 'MessageCircle', 'community', 10, 200),
  ('Community Leader', 'Create 50 posts in the community', 'Award', 'community', 50, 1000),
  ('First Comment', 'Leave your first comment on a post', 'MessageSquare', 'community', 1, 25),
  ('Active Commenter', 'Leave 25 comments on posts', 'MessagesSquare', 'community', 25, 250),
  ('Discussion Master', 'Leave 100 comments on posts', 'MessageSquareText', 'community', 100, 750),
  ('First Reaction', 'React to your first post', 'Heart', 'community', 1, 10),
  ('Engaged Member', 'React to 50 posts', 'ThumbsUp', 'community', 50, 100),
  ('Community Champion', 'React to 200 posts', 'Sparkles', 'community', 200, 500),
  ('Popular Post', 'Receive 10 reactions on a single post', 'TrendingUp', 'community', 10, 150),
  ('Viral Content', 'Receive 50 reactions on a single post', 'Flame', 'community', 50, 500)
ON CONFLICT DO NOTHING;

-- Function to award community points
CREATE OR REPLACE FUNCTION public.award_community_points(
  p_user_id UUID,
  p_activity_type TEXT,
  p_points INTEGER,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into community_activities
  INSERT INTO public.community_activities (
    user_id,
    activity_type,
    points_awarded,
    metadata
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_points,
    p_metadata
  );

  -- Update candidate_xp
  INSERT INTO public.candidate_xp (
    candidate_id,
    total_xp,
    community_points,
    last_activity_at
  ) VALUES (
    p_user_id,
    p_points,
    p_points,
    now()
  )
  ON CONFLICT (candidate_id) DO UPDATE SET
    total_xp = candidate_xp.total_xp + p_points,
    community_points = candidate_xp.community_points + p_points,
    last_activity_at = now();
END;
$$;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_community_achievements(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post_count INTEGER;
  v_comment_count INTEGER;
  v_reaction_count INTEGER;
  v_achievement RECORD;
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
      -- Award based on achievement type
      IF v_achievement.name LIKE '%Post%' AND v_post_count >= v_achievement.requirement_value THEN
        INSERT INTO public.user_achievements (user_id, achievement_id)
        VALUES (p_user_id, v_achievement.id);
        
        -- Award XP bonus
        PERFORM public.award_community_points(
          p_user_id,
          'achievement_earned',
          v_achievement.xp_reward,
          jsonb_build_object('achievement_name', v_achievement.name)
        );
      ELSIF v_achievement.name LIKE '%Comment%' AND v_comment_count >= v_achievement.requirement_value THEN
        INSERT INTO public.user_achievements (user_id, achievement_id)
        VALUES (p_user_id, v_achievement.id);
        
        PERFORM public.award_community_points(
          p_user_id,
          'achievement_earned',
          v_achievement.xp_reward,
          jsonb_build_object('achievement_name', v_achievement.name)
        );
      ELSIF v_achievement.name LIKE '%Reaction%' OR v_achievement.name LIKE '%Engaged%' AND v_reaction_count >= v_achievement.requirement_value THEN
        INSERT INTO public.user_achievements (user_id, achievement_id)
        VALUES (p_user_id, v_achievement.id);
        
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

-- Trigger function for new posts
CREATE OR REPLACE FUNCTION public.handle_new_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Award points for creating a post
  PERFORM public.award_community_points(
    NEW.user_id,
    'post_created',
    50,
    jsonb_build_object('post_id', NEW.id, 'post_title', NEW.title)
  );
  
  -- Check for achievements
  PERFORM public.check_community_achievements(NEW.user_id);
  
  RETURN NEW;
END;
$$;

-- Trigger function for new comments
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post_author UUID;
BEGIN
  -- Award points for commenting
  PERFORM public.award_community_points(
    NEW.user_id,
    'comment_created',
    10,
    jsonb_build_object('comment_id', NEW.id, 'post_id', NEW.post_id)
  );
  
  -- Check for achievements
  PERFORM public.check_community_achievements(NEW.user_id);
  
  -- Get post author for notification
  SELECT user_id INTO v_post_author
  FROM public.activity_feed
  WHERE id = NEW.post_id;
  
  -- Send notification to post author if it's not their own comment
  IF v_post_author IS NOT NULL AND v_post_author != NEW.user_id THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      link
    ) VALUES (
      v_post_author,
      'comment',
      'New Comment on Your Post',
      'Someone commented on your post',
      '/community'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function for new reactions
CREATE OR REPLACE FUNCTION public.handle_new_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_post_author UUID;
  v_reaction_count INTEGER;
BEGIN
  -- Award points for reacting
  PERFORM public.award_community_points(
    NEW.user_id,
    'reaction_added',
    5,
    jsonb_build_object('reaction_id', NEW.id, 'post_id', NEW.post_id, 'emoji', NEW.emoji)
  );
  
  -- Check for achievements
  PERFORM public.check_community_achievements(NEW.user_id);
  
  -- Get post author and reaction count
  SELECT user_id INTO v_post_author
  FROM public.activity_feed
  WHERE id = NEW.post_id;
  
  SELECT COUNT(*) INTO v_reaction_count
  FROM public.post_reactions
  WHERE post_id = NEW.post_id;
  
  -- Award bonus points to post author for popular posts
  IF v_post_author IS NOT NULL THEN
    IF v_reaction_count = 10 THEN
      PERFORM public.award_community_points(
        v_post_author,
        'popular_post',
        150,
        jsonb_build_object('post_id', NEW.post_id, 'reaction_count', v_reaction_count)
      );
    ELSIF v_reaction_count = 50 THEN
      PERFORM public.award_community_points(
        v_post_author,
        'viral_post',
        500,
        jsonb_build_object('post_id', NEW.post_id, 'reaction_count', v_reaction_count)
      );
    END IF;
    
    -- Check achievements for post author too
    PERFORM public.check_community_achievements(v_post_author);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS award_points_on_post ON public.activity_feed;
CREATE TRIGGER award_points_on_post
  AFTER INSERT ON public.activity_feed
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_post();

DROP TRIGGER IF EXISTS award_points_on_comment ON public.post_comments;
CREATE TRIGGER award_points_on_comment
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_comment();

DROP TRIGGER IF EXISTS award_points_on_reaction ON public.post_reactions;
CREATE TRIGGER award_points_on_reaction
  AFTER INSERT ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_reaction();