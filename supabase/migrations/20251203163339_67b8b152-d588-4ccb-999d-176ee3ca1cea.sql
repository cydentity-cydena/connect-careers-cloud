-- Create a public bucket for marketing assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketing', 'marketing', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to marketing bucket
CREATE POLICY "Public read access for marketing" ON storage.objects
FOR SELECT USING (bucket_id = 'marketing');

-- Allow authenticated users to upload to marketing bucket
CREATE POLICY "Authenticated upload to marketing" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'marketing' AND auth.role() = 'authenticated');