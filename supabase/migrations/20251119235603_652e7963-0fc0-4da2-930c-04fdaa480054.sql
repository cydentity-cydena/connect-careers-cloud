-- Drop email notification triggers with CASCADE to handle dependencies
DROP TRIGGER IF EXISTS send_dm_email_notification_trigger ON public.direct_messages CASCADE;
DROP TRIGGER IF EXISTS send_mention_email_notification_trigger ON public.post_comments CASCADE;
DROP TRIGGER IF EXISTS send_comment_email_notification_trigger ON public.post_comments CASCADE;
DROP TRIGGER IF EXISTS send_announcement_email_notification_trigger ON public.activity_feed CASCADE;

-- Now drop the functions with CASCADE
DROP FUNCTION IF EXISTS public.send_dm_email_notification() CASCADE;
DROP FUNCTION IF EXISTS public.send_mention_email_notification() CASCADE;
DROP FUNCTION IF EXISTS public.send_comment_email_notification() CASCADE;
DROP FUNCTION IF EXISTS public.send_announcement_email_notification() CASCADE;