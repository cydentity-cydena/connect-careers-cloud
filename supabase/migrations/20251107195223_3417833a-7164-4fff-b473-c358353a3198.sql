-- Create trigger to notify mentioned users when comments are posted
CREATE TRIGGER on_comment_notify_mentions
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_mentioned_users();