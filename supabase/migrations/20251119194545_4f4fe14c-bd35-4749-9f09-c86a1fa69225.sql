-- Check if verification_requests table exists and add unique constraint
DO $$ 
BEGIN
  -- Create table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'verification_requests') THEN
    CREATE TABLE public.verification_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
      candidate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      verification_type TEXT NOT NULL,
      company_name TEXT NOT NULL,
      company_website TEXT NOT NULL,
      business_registration_number TEXT,
      additional_info TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      rejection_reason TEXT,
      reviewed_by UUID REFERENCES profiles(id),
      reviewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view own verification requests"
      ON public.verification_requests FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own verification requests"
      ON public.verification_requests FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own pending requests"
      ON public.verification_requests FOR UPDATE
      USING (auth.uid() = user_id AND status = 'pending');

    CREATE POLICY "Admins can view all verification requests"
      ON public.verification_requests FOR SELECT
      USING (has_role(auth.uid(), 'admin'));

    CREATE POLICY "Admins can update all verification requests"
      ON public.verification_requests FOR UPDATE
      USING (has_role(auth.uid(), 'admin'));

  ELSE
    -- Table exists, ensure unique constraint on user_id
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'verification_requests_user_id_key' 
      AND conrelid = 'public.verification_requests'::regclass
    ) THEN
      ALTER TABLE public.verification_requests ADD CONSTRAINT verification_requests_user_id_key UNIQUE (user_id);
    END IF;
  END IF;
END $$;