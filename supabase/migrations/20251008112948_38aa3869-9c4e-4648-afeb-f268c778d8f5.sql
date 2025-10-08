-- Add UPDATE policy for activity_feed
CREATE POLICY "Users can update own posts or admins can update any"
ON public.activity_feed
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = user_id) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Add DELETE policy for activity_feed
CREATE POLICY "Users can delete own posts or admins can delete any"
ON public.activity_feed
FOR DELETE
TO authenticated
USING (
  (auth.uid() = user_id) OR 
  has_role(auth.uid(), 'admin'::app_role)
);