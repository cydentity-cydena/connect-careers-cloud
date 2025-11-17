-- Update the announcement email trigger to send for ALL admin posts, not just releases/bug fixes
CREATE OR REPLACE FUNCTION public.send_announcement_email_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Send emails for all public posts from admins
  IF TG_OP = 'INSERT' AND NEW.is_public = true THEN
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
$function$;