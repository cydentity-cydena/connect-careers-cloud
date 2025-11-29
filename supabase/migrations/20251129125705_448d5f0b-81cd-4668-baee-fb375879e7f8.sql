-- Create storage policies for course-proofs bucket to allow authenticated users to upload

-- Allow authenticated users to upload files to course-proofs bucket
CREATE POLICY "Authenticated users can upload course proofs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-proofs');

-- Allow public read access for course-proofs bucket (already public)
CREATE POLICY "Public read access for course proofs"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'course-proofs');

-- Allow users to update their own uploads (if needed)
CREATE POLICY "Users can update own course proofs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'course-proofs' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'course-proofs');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own course proofs"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'course-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);