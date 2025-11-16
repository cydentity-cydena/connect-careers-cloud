-- Drop remaining triggers that reference net.http_post to stop errors when creating posts/messages
-- These are safe to drop; email sending is handled by edge functions that can be re-wired later

-- Activity feed announcement emails
DROP TRIGGER IF EXISTS trigger_send_announcement_email ON public.activity_feed;

-- Direct message email notifications
DROP TRIGGER IF EXISTS trigger_send_dm_email ON public.direct_messages;

-- Mention email notifications on comments
DROP TRIGGER IF EXISTS trigger_send_mention_email ON public.post_comments;