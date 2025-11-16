-- Drop email notification triggers that use net.http_post
-- These cause "net error" issues, so we'll handle emails from frontend instead
DROP TRIGGER IF EXISTS trg_send_dm_email ON public.direct_messages;
DROP TRIGGER IF EXISTS trg_send_mention_email ON public.post_comments;