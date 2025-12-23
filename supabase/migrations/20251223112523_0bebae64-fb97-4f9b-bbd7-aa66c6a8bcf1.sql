-- Add RLS policy for admins to view all youtube video completions (for statistics)
CREATE POLICY "Admins can view all video completions" 
ON public.youtube_video_completions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);