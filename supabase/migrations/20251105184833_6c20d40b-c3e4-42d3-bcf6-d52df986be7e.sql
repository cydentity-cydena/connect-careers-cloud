-- Create pipeline_candidates table for Founding 20 applications and general pipeline management
CREATE TABLE IF NOT EXISTS public.pipeline_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  current_title TEXT NOT NULL,
  years_experience INTEGER NOT NULL,
  top_certifications TEXT NOT NULL,
  key_skills TEXT NOT NULL,
  availability TEXT NOT NULL,
  salary_expectations TEXT NOT NULL,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  why_top_twenty TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'new_application',
  is_founding_20 BOOLEAN DEFAULT false,
  is_priority BOOLEAN DEFAULT false,
  application_source TEXT DEFAULT 'founding_20_page',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  cv_url TEXT,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(email)
);

-- Create index for faster queries
CREATE INDEX idx_pipeline_candidates_stage ON public.pipeline_candidates(stage);
CREATE INDEX idx_pipeline_candidates_founding_20 ON public.pipeline_candidates(is_founding_20);
CREATE INDEX idx_pipeline_candidates_email ON public.pipeline_candidates(email);

-- Enable RLS
ALTER TABLE public.pipeline_candidates ENABLE ROW LEVEL SECURITY;

-- Only staff and admins can view pipeline candidates
CREATE POLICY "Staff and admins can view pipeline candidates"
  ON public.pipeline_candidates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Only staff and admins can insert pipeline candidates
CREATE POLICY "Staff and admins can insert pipeline candidates"
  ON public.pipeline_candidates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Only staff and admins can update pipeline candidates
CREATE POLICY "Staff and admins can update pipeline candidates"
  ON public.pipeline_candidates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Only staff and admins can delete pipeline candidates
CREATE POLICY "Staff and admins can delete pipeline candidates"
  ON public.pipeline_candidates
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_pipeline_candidates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_pipeline_candidates_timestamp
  BEFORE UPDATE ON public.pipeline_candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pipeline_candidates_updated_at();