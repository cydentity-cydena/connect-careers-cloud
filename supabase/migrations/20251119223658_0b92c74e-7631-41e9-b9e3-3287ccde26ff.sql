-- Fix the handle_new_post trigger to skip point awarding for AI-generated content (null user_id)
CREATE OR REPLACE FUNCTION public.handle_new_post()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only award points and check achievements if there's a user_id (not AI-generated)
  IF NEW.user_id IS NOT NULL THEN
    -- Award points for creating a post
    PERFORM public.award_community_points(
      NEW.user_id,
      'post_created',
      50,
      jsonb_build_object('post_id', NEW.id, 'post_title', NEW.title)
    );
    
    -- Check for achievements
    PERFORM public.check_community_achievements(NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$function$;