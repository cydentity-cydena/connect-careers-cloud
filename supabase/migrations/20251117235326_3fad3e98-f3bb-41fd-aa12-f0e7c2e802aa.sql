-- Create trigger to send email notifications for new direct messages
CREATE TRIGGER send_dm_email_notification_trigger
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.send_dm_email_notification();