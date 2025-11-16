-- Create function to send announcement emails for admin posts
CREATE OR REPLACE FUNCTION public.send_announcement_email_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only send emails for release and bug_fix activity types posted by admins
  IF TG_OP = 'INSERT' AND (NEW.activity_type = 'release' OR NEW.activity_type = 'bug_fix') THEN
    -- Check if the user posting is an admin
    IF EXISTS (
      SELECT 1 
      FROM user_roles 
      WHERE user_id = NEW.user_id 
      AND role = 'admin'::app_role
    ) THEN
      -- Call edge function to send announcement emails (fire and forget)
      PERFORM
        net.http_post(
          url := current_setting('app.supabase_url') || '/functions/v1/send-announcement-email',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
          ),
          body := jsonb_build_object(
            'postId', NEW.id,
            'activityType', NEW.activity_type,
            'title', NEW.title,
            'description', NEW.description
          )
        );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on activity_feed for announcement emails
DROP TRIGGER IF EXISTS trigger_send_announcement_email ON public.activity_feed;
CREATE TRIGGER trigger_send_announcement_email
  AFTER INSERT ON public.activity_feed
  FOR EACH ROW
  EXECUTE FUNCTION public.send_announcement_email_notification();