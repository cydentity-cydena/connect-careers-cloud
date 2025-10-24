-- Create candidate verifications table
CREATE TABLE IF NOT EXISTS public.candidate_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Identity verification
  identity_status TEXT CHECK (identity_status IN ('green', 'amber', 'red', 'grey')),
  identity_method TEXT,
  identity_check_id TEXT,
  identity_name_on_id TEXT,
  identity_verifier TEXT,
  identity_checked_at TIMESTAMPTZ,
  identity_expires_at TIMESTAMPTZ,
  
  -- Certifications (stored as JSONB array)
  certifications JSONB DEFAULT '[]'::jsonb,
  
  -- Right to work
  rtw_status TEXT CHECK (rtw_status IN ('green', 'amber', 'red', 'grey')),
  rtw_country TEXT,
  rtw_restriction_notes TEXT,
  rtw_checked_at TIMESTAMPTZ,
  rtw_expires_at TIMESTAMPTZ,
  rtw_verifier TEXT,
  
  -- Logistics
  logistics_status TEXT CHECK (logistics_status IN ('green', 'amber', 'red', 'grey')),
  logistics_location TEXT,
  logistics_commute_radius_km INTEGER,
  logistics_notice_days INTEGER,
  logistics_salary_band TEXT,
  logistics_work_mode TEXT,
  logistics_interview_slots JSONB DEFAULT '[]'::jsonb,
  logistics_confirmed_at TIMESTAMPTZ,
  logistics_expires_at TIMESTAMPTZ,
  
  -- Computed HR Ready status
  hr_ready BOOLEAN DEFAULT false,
  compliance_score INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(candidate_id)
);

-- Enable RLS
ALTER TABLE public.candidate_verifications ENABLE ROW LEVEL SECURITY;

-- Staff and admins can manage verifications
CREATE POLICY "Staff and admins can view verifications"
  ON public.candidate_verifications
  FOR SELECT
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff and admins can insert verifications"
  ON public.candidate_verifications
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff and admins can update verifications"
  ON public.candidate_verifications
  FOR UPDATE
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff and admins can delete verifications"
  ON public.candidate_verifications
  FOR DELETE
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Candidates can view their own verification
CREATE POLICY "Candidates can view own verification"
  ON public.candidate_verifications
  FOR SELECT
  USING (auth.uid() = candidate_id);

-- Add trigger for updated_at
CREATE TRIGGER update_candidate_verifications_updated_at
  BEFORE UPDATE ON public.candidate_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Add optional compliance_score column to candidate_pipeline
ALTER TABLE public.candidate_pipeline
ADD COLUMN IF NOT EXISTS compliance_score INTEGER DEFAULT 0;

-- Seed test data
INSERT INTO public.candidate_verifications (
  candidate_id,
  identity_status, identity_method, identity_verifier, identity_checked_at,
  rtw_status, rtw_country, rtw_checked_at,
  logistics_status, logistics_location, logistics_work_mode, logistics_confirmed_at,
  certifications,
  hr_ready,
  compliance_score
)
SELECT 
  cp.candidate_id,
  'green', 'Document verification', 'System', now(),
  'green', 'UK', now(),
  'green', 'London', 'Hybrid', now(),
  '[{"status": "green", "issuer": "CompTIA", "name": "Security+", "url": "https://example.com", "capturedAt": "2024-01-01T00:00:00Z"}]'::jsonb,
  true,
  20
FROM public.candidate_pipeline cp
WHERE cp.is_founding_20 = true
LIMIT 1
ON CONFLICT (candidate_id) DO NOTHING;

INSERT INTO public.candidate_verifications (
  candidate_id,
  identity_status, identity_method, identity_verifier, identity_checked_at,
  rtw_status,
  logistics_status, logistics_location, logistics_work_mode, logistics_confirmed_at,
  certifications,
  hr_ready,
  compliance_score
)
SELECT 
  cp.candidate_id,
  'green', 'Document verification', 'System', now(),
  'grey',
  'amber', 'Manchester', 'Remote', now(),
  '[{"status": "amber", "issuer": "ISC2", "name": "CISSP", "url": "https://example.com", "capturedAt": "2024-01-01T00:00:00Z"}]'::jsonb,
  false,
  13
FROM public.candidate_pipeline cp
WHERE cp.stage = 'applied' AND NOT cp.is_founding_20
LIMIT 1
ON CONFLICT (candidate_id) DO NOTHING;

INSERT INTO public.candidate_verifications (
  candidate_id,
  identity_status, identity_method, identity_verifier, identity_checked_at, identity_expires_at,
  rtw_status, rtw_country, rtw_checked_at,
  logistics_status, logistics_location, logistics_work_mode, logistics_confirmed_at,
  certifications,
  hr_ready,
  compliance_score
)
SELECT 
  cp.candidate_id,
  'amber', 'Document verification', 'System', now() - interval '400 days', now() - interval '30 days',
  'green', 'US', now(),
  'green', 'Birmingham', 'On-site', now(),
  '[{"status": "grey", "issuer": "EC-Council", "name": "CEH", "url": "https://example.com", "capturedAt": "2023-01-01T00:00:00Z", "expiresAt": "2024-01-01T00:00:00Z"}]'::jsonb,
  false,
  15
FROM public.candidate_pipeline cp
WHERE cp.stage = 'needs_info'
LIMIT 1
ON CONFLICT (candidate_id) DO NOTHING;