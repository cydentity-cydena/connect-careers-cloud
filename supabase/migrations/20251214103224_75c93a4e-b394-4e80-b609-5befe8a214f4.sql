-- Create storage bucket for CTF challenge files
INSERT INTO storage.buckets (id, name, public)
VALUES ('ctf-files', 'ctf-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files (admin only in practice via RLS)
CREATE POLICY "Admins can upload CTF files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ctf-files' 
  AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Allow public read access to CTF files
CREATE POLICY "Anyone can view CTF files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ctf-files');

-- Allow admins to delete CTF files
CREATE POLICY "Admins can delete CTF files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'ctf-files'
  AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Add file_url column to ctf_challenges table
ALTER TABLE public.ctf_challenges
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT;