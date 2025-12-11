-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for admins to upload images
CREATE POLICY "Admins can upload post images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'post-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create policy for public read access
CREATE POLICY "Anyone can view post images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'post-images');

-- Create policy for admins to delete their images
CREATE POLICY "Admins can delete post images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'post-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);