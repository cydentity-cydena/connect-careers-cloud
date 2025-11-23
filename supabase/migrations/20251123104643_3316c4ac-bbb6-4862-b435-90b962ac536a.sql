-- Create a function to send announcement emails for AI-generated posts
CREATE OR REPLACE FUNCTION public.send_ai_post_announcement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger for AI-generated posts (user_id is NULL)
  IF NEW.user_id IS NULL THEN
    -- Call the edge function asynchronously using pg_net
    PERFORM
      net.http_post(
        url := 'https://wbeomprrrmteftumwljf.supabase.co/functions/v1/send-announcement-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase.service_role_key', true)
        ),
        body := jsonb_build_object(
          'postId', NEW.id,
          'activityType', NEW.activity_type,
          'title', NEW.title,
          'description', NEW.description
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to fire after AI posts are inserted
DROP TRIGGER IF EXISTS trigger_ai_post_announcement ON activity_feed;
CREATE TRIGGER trigger_ai_post_announcement
  AFTER INSERT ON activity_feed
  FOR EACH ROW
  EXECUTE FUNCTION send_ai_post_announcement();