-- Allow authenticated users to insert their own activity feed posts
DROP POLICY IF EXISTS "Service role can insert activities" ON activity_feed;

CREATE POLICY "Users can insert own activities"
ON activity_feed
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);