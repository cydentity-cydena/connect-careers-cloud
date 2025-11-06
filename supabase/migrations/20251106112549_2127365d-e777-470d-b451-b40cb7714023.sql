-- Create table for allowed signup emails
CREATE TABLE public.allowed_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  allowed_role app_role NULL,
  notes TEXT,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.allowed_signups ENABLE ROW LEVEL SECURITY;

-- Only admins can manage the allowlist
CREATE POLICY "Admins can manage allowed signups"
ON public.allowed_signups
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create index for faster email lookups
CREATE INDEX idx_allowed_signups_email ON public.allowed_signups(email);

COMMENT ON TABLE public.allowed_signups IS 'Allowlist of emails permitted to sign up during private beta';