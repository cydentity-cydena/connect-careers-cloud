-- Ensure resumes bucket exists and stays private
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Create RLS policies for resumes bucket for staff/admin
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Staff/Admin can select resumes'
  ) THEN
    CREATE POLICY "Staff/Admin can select resumes"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'resumes'
      AND (
        public.has_role(auth.uid(), 'staff'::app_role)
        OR public.has_role(auth.uid(), 'admin'::app_role)
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Staff/Admin can insert resumes'
  ) THEN
    CREATE POLICY "Staff/Admin can insert resumes"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'resumes'
      AND (
        public.has_role(auth.uid(), 'staff'::app_role)
        OR public.has_role(auth.uid(), 'admin'::app_role)
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Staff/Admin can update resumes'
  ) THEN
    CREATE POLICY "Staff/Admin can update resumes"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'resumes' AND (
        public.has_role(auth.uid(), 'staff'::app_role)
        OR public.has_role(auth.uid(), 'admin'::app_role)
      )
    )
    WITH CHECK (
      bucket_id = 'resumes' AND (
        public.has_role(auth.uid(), 'staff'::app_role)
        OR public.has_role(auth.uid(), 'admin'::app_role)
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Staff/Admin can delete resumes'
  ) THEN
    CREATE POLICY "Staff/Admin can delete resumes"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'resumes' AND (
        public.has_role(auth.uid(), 'staff'::app_role)
        OR public.has_role(auth.uid(), 'admin'::app_role)
      )
    );
  END IF;
END $$;