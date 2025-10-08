-- Drop and recreate the foreign key relationship
ALTER TABLE activity_feed 
DROP CONSTRAINT IF EXISTS activity_feed_user_id_fkey;

ALTER TABLE activity_feed
ADD CONSTRAINT activity_feed_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;