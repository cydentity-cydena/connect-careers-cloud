-- Add rate limiting and abuse prevention for community XP

-- Function to check comment rate limit
CREATE OR REPLACE FUNCTION public.check_comment_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  comment_count INTEGER;
  recent_comments INTEGER;
BEGIN
  -- Count comments in the last hour
  SELECT COUNT(*)
  INTO recent_comments
  FROM public.post_comments
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Max 10 comments per hour
  IF recent_comments >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 10 comments per hour';
  END IF;
  
  -- Count comments in the last 24 hours
  SELECT COUNT(*)
  INTO comment_count
  FROM public.post_comments
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Max 50 comments per day
  IF comment_count >= 50 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 50 comments per day';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to check post rate limit
CREATE OR REPLACE FUNCTION public.check_post_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  post_count INTEGER;
  recent_posts INTEGER;
BEGIN
  -- Skip check for admin-generated posts
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count posts in the last hour
  SELECT COUNT(*)
  INTO recent_posts
  FROM public.activity_feed
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Max 5 posts per hour
  IF recent_posts >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 5 posts per hour';
  END IF;
  
  -- Count posts in the last 24 hours
  SELECT COUNT(*)
  INTO post_count
  FROM public.activity_feed
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '24 hours';
  
  -- Max 20 posts per day
  IF post_count >= 20 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 20 posts per day';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to check reaction rate limit
CREATE OR REPLACE FUNCTION public.check_reaction_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  reaction_count INTEGER;
BEGIN
  -- Count reactions in the last 5 minutes
  SELECT COUNT(*)
  INTO reaction_count
  FROM public.post_reactions
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '5 minutes';
  
  -- Max 20 reactions per 5 minutes
  IF reaction_count >= 20 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 20 reactions per 5 minutes';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update handle_new_comment to implement diminishing returns
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_post_author UUID;
  v_comment_count INTEGER;
  v_points_to_award INTEGER := 10;
BEGIN
  -- Count comments made today
  SELECT COUNT(*)
  INTO v_comment_count
  FROM public.post_comments
  WHERE user_id = NEW.user_id
    AND created_at > CURRENT_DATE;
  
  -- Implement diminishing returns
  IF v_comment_count > 20 THEN
    v_points_to_award := 2; -- 80% reduction after 20 comments
  ELSIF v_comment_count > 10 THEN
    v_points_to_award := 5; -- 50% reduction after 10 comments
  END IF;
  
  -- Award points for commenting with diminishing returns
  PERFORM public.award_community_points(
    NEW.user_id,
    'comment_created',
    v_points_to_award,
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

-- Update handle_new_post to implement diminishing returns
CREATE OR REPLACE FUNCTION public.handle_new_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_post_count INTEGER;
  v_points_to_award INTEGER := 50;
BEGIN
  -- Only award points and check achievements if there's a user_id (not AI-generated)
  IF NEW.user_id IS NOT NULL THEN
    -- Count posts made today
    SELECT COUNT(*)
    INTO v_post_count
    FROM public.activity_feed
    WHERE user_id = NEW.user_id
      AND created_at > CURRENT_DATE;
    
    -- Implement diminishing returns
    IF v_post_count > 10 THEN
      v_points_to_award := 10; -- 80% reduction after 10 posts
    ELSIF v_post_count > 5 THEN
      v_points_to_award := 25; -- 50% reduction after 5 posts
    END IF;
    
    -- Award points for creating a post with diminishing returns
    PERFORM public.award_community_points(
      NEW.user_id,
      'post_created',
      v_points_to_award,
      jsonb_build_object('post_id', NEW.id, 'post_title', NEW.title)
    );
    
    -- Check for achievements
    PERFORM public.check_community_achievements(NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update handle_new_reaction to implement diminishing returns
CREATE OR REPLACE FUNCTION public.handle_new_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_post_author UUID;
  v_reaction_count INTEGER;
  v_daily_reactions INTEGER;
  v_points_to_award INTEGER := 5;
BEGIN
  -- Count reactions made today
  SELECT COUNT(*)
  INTO v_daily_reactions
  FROM public.post_reactions
  WHERE user_id = NEW.user_id
    AND created_at > CURRENT_DATE;
  
  -- Implement diminishing returns
  IF v_daily_reactions > 50 THEN
    v_points_to_award := 1; -- 80% reduction after 50 reactions
  ELSIF v_daily_reactions > 25 THEN
    v_points_to_award := 2; -- 60% reduction after 25 reactions
  END IF;
  
  -- Award points for reacting with diminishing returns
  PERFORM public.award_community_points(
    NEW.user_id,
    'reaction_added',
    v_points_to_award,
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

-- Create rate limit triggers
DROP TRIGGER IF EXISTS check_comment_rate_limit ON public.post_comments;
CREATE TRIGGER check_comment_rate_limit
  BEFORE INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_comment_rate_limit();

DROP TRIGGER IF EXISTS check_post_rate_limit ON public.activity_feed;
CREATE TRIGGER check_post_rate_limit
  BEFORE INSERT ON public.activity_feed
  FOR EACH ROW
  EXECUTE FUNCTION public.check_post_rate_limit();

DROP TRIGGER IF EXISTS check_reaction_rate_limit ON public.post_reactions;
CREATE TRIGGER check_reaction_rate_limit
  BEFORE INSERT ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_reaction_rate_limit();