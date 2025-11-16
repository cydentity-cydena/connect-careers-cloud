-- Re-enable email notification triggers for DMs and mentions
-- Safely drop existing triggers if present
DROP TRIGGER IF EXISTS trg_send_dm_email ON public.direct_messages;
DROP TRIGGER IF EXISTS trg_send_mention_email ON public.post_comments;

-- Create trigger to send email on new direct messages
CREATE TRIGGER trg_send_dm_email
AFTER INSERT ON public.direct_messages
FOR EACH ROW
EXECUTE FUNCTION public.send_dm_email_notification();

-- Create trigger to send email when users are mentioned in comments
CREATE TRIGGER trg_send_mention_email
AFTER INSERT ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.send_mention_email_notification();