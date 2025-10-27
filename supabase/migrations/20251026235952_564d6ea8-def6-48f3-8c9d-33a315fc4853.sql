-- Add business verification columns to existing verification_requests table
ALTER TABLE public.verification_requests
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS company_website text,
  ADD COLUMN IF NOT EXISTS business_registration_number text,
  ADD COLUMN IF NOT EXISTS additional_info text,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Additional RLS policies for business users
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'verification_requests' AND policyname = 'Business users can view own verification requests'
  ) THEN
    CREATE POLICY "Business users can view own verification requests"
    ON public.verification_requests
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'verification_requests' AND policyname = 'Users can create own business verification requests'
  ) THEN
    CREATE POLICY "Users can create own business verification requests"
    ON public.verification_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = COALESCE(user_id, candidate_id));
  END IF;
END $$;