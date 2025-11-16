-- Create function to send email notification for direct messages
CREATE OR REPLACE FUNCTION public.send_dm_email_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only send email for new messages, not updates
  IF TG_OP = 'INSERT' THEN
    -- Call edge function to send email notification (fire and forget)
    PERFORM
      net.http_post(
        url := current_setting('app.supabase_url') || '/functions/v1/send-dm-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
        ),
        body := jsonb_build_object(
          'messageId', NEW.id,
          'recipientId', NEW.recipient_id,
          'senderId', NEW.sender_id,
          'content', NEW.content
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for direct messages
DROP TRIGGER IF EXISTS trigger_send_dm_email ON public.direct_messages;

CREATE TRIGGER trigger_send_dm_email
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.send_dm_email_notification();

-- Create function to send email notification for mentions
CREATE OR REPLACE FUNCTION public.send_mention_email_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  mentioned_user_id uuid;
BEGIN
  -- Only process new comments with mentions
  IF TG_OP = 'INSERT' AND NEW.mentioned_users IS NOT NULL THEN
    -- Loop through each mentioned user
    FOREACH mentioned_user_id IN ARRAY NEW.mentioned_users
    LOOP
      -- Don't notify if user mentions themselves
      IF mentioned_user_id != NEW.user_id THEN
        -- Call edge function to send email notification (fire and forget)
        PERFORM
          net.http_post(
            url := current_setting('app.supabase_url') || '/functions/v1/send-mention-notification',
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
            ),
            body := jsonb_build_object(
              'commentId', NEW.id,
              'mentionedUserId', mentioned_user_id,
              'mentionerUserId', NEW.user_id,
              'content', NEW.content,
              'postId', NEW.post_id
            )
          );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for comment mentions
DROP TRIGGER IF EXISTS trigger_send_mention_email ON public.post_comments;

CREATE TRIGGER trigger_send_mention_email
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.send_mention_email_notification();