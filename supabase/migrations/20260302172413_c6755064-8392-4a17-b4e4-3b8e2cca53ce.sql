
-- Create storage bucket for CTF event logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('ctf-event-logos', 'ctf-event-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload (admins only enforced at app level)
CREATE POLICY "Authenticated users can upload event logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'ctf-event-logos');

-- Anyone can view event logos (public bucket)
CREATE POLICY "Public can view event logos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'ctf-event-logos');

-- Authenticated users can update/delete their uploads
CREATE POLICY "Authenticated users can update event logos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'ctf-event-logos');

CREATE POLICY "Authenticated users can delete event logos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'ctf-event-logos');
