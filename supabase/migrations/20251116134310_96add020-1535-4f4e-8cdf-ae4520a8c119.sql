-- Fix the RLS policy for activity_feed INSERT to allow admins to post with their user_id
DROP POLICY IF EXISTS "Users can insert own activities" ON public.activity_feed;

CREATE POLICY "Users can insert own activities"
ON public.activity_feed
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id) OR 
  has_role(auth.uid(), 'admin'::app_role)
);