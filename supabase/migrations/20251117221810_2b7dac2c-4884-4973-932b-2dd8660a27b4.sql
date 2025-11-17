-- Create table for MFA backup codes
CREATE TABLE IF NOT EXISTS public.mfa_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mfa_backup_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own backup codes
CREATE POLICY "Users can view own backup codes"
  ON public.mfa_backup_codes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own backup codes (mark as used)
CREATE POLICY "Users can update own backup codes"
  ON public.mfa_backup_codes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Only authenticated users can insert backup codes for themselves
CREATE POLICY "Users can insert own backup codes"
  ON public.mfa_backup_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_mfa_backup_codes_user_id ON public.mfa_backup_codes(user_id);
CREATE INDEX idx_mfa_backup_codes_code_hash ON public.mfa_backup_codes(code_hash);