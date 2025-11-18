-- Add email notification to comment trigger
CREATE OR REPLACE FUNCTION public.send_comment_email_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author UUID;
  v_post_title TEXT;
BEGIN
  -- Get post author and title
  SELECT user_id, title INTO v_post_author, v_post_title
  FROM public.activity_feed
  WHERE id = NEW.post_id;
  
  -- Send email notification if it's not the author commenting on their own post
  IF v_post_author IS NOT NULL AND v_post_author != NEW.user_id THEN
    -- Call edge function to send email (fire and forget)
    PERFORM
      net.http_post(
        url := current_setting('app.supabase_url') || '/functions/v1/send-comment-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
        ),
        body := jsonb_build_object(
          'commentId', NEW.id,
          'postAuthorId', v_post_author,
          'commenterId', NEW.user_id,
          'postTitle', v_post_title
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for email notifications
DROP TRIGGER IF EXISTS send_comment_email ON public.post_comments;
CREATE TRIGGER send_comment_email
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.send_comment_email_notification();