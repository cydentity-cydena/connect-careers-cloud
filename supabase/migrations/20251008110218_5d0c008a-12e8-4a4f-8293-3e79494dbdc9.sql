-- Allow null user_id for AI-generated system posts
ALTER TABLE activity_feed 
ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policy to handle null user_id (system posts)
DROP POLICY IF EXISTS "Users can insert own activities" ON activity_feed;

CREATE POLICY "Users can insert own activities"
ON activity_feed
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  OR (user_id IS NULL AND has_role(auth.uid(), 'admin'))
);