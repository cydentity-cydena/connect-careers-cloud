-- Temporarily disable triggers that use net.http_post until pg_net is properly configured
DROP TRIGGER IF EXISTS send_dm_notification_trigger ON direct_messages;
DROP TRIGGER IF EXISTS send_mention_notification_trigger ON post_comments;
DROP TRIGGER IF EXISTS send_announcement_email_trigger ON activity_feed;