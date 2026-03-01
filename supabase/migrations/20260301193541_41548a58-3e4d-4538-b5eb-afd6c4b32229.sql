
-- Yoti verification sessions for all user types (candidates, employers, recruiters)
CREATE TABLE public.yoti_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('identity', 'rtw')),
  session_id TEXT, -- Yoti session ID (mock for now)
  qr_code_url TEXT, -- QR code URL for scanning
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'expired')),
  result JSONB, -- Yoti result payload
  full_name_on_id TEXT, -- Name as it appears on ID document
  document_type TEXT, -- passport, driving_licence, etc.
  nationality TEXT,
  date_of_birth DATE,
  rtw_status TEXT, -- share_code_verified, visa_confirmed, citizen, etc.
  rtw_expiry DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.yoti_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own verifications
CREATE POLICY "Users can view own verifications"
  ON public.yoti_verifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own verifications
CREATE POLICY "Users can insert own verifications"
  ON public.yoti_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own verifications
CREATE POLICY "Users can update own verifications"
  ON public.yoti_verifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all verifications
CREATE POLICY "Admins can view all verifications"
  ON public.yoti_verifications
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  ));

-- Admins can update all verifications
CREATE POLICY "Admins can update all verifications"
  ON public.yoti_verifications
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  ));

-- Index for fast lookups
CREATE INDEX idx_yoti_verifications_user_id ON public.yoti_verifications(user_id);
CREATE INDEX idx_yoti_verifications_status ON public.yoti_verifications(status);
