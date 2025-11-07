-- Add mentions support to comments
ALTER TABLE post_comments 
ADD COLUMN IF NOT EXISTS mentioned_users uuid[] DEFAULT ARRAY[]::uuid[];

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_post_comments_mentioned_users ON post_comments USING GIN (mentioned_users);

-- Function to notify mentioned users
CREATE OR REPLACE FUNCTION notify_mentioned_users()
RETURNS TRIGGER AS $$
DECLARE
  mentioned_user_id uuid;
  commenter_name text;
  post_title text;
BEGIN
  -- Get commenter's name
  SELECT COALESCE(full_name, username, 'Someone') INTO commenter_name
  FROM profiles
  WHERE id = NEW.user_id;

  -- Get post info (if community_posts table exists)
  BEGIN
    SELECT COALESCE(title, 'a post') INTO post_title
    FROM community_posts
    WHERE id = NEW.post_id;
  EXCEPTION WHEN undefined_table THEN
    post_title := 'a post';
  END;

  -- Notify each mentioned user
  IF NEW.mentioned_users IS NOT NULL THEN
    FOREACH mentioned_user_id IN ARRAY NEW.mentioned_users
    LOOP
      -- Don't notify if user mentions themselves
      IF mentioned_user_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (
          mentioned_user_id,
          'info',
          commenter_name || ' mentioned you',
          'You were mentioned in a comment on ' || post_title,
          '/community'
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for mentions
DROP TRIGGER IF EXISTS trigger_notify_mentioned_users ON post_comments;
CREATE TRIGGER trigger_notify_mentioned_users
  AFTER INSERT ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_mentioned_users();