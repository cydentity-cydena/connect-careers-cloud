-- Create custom_assessments table to track recruiter/employer created assessments
CREATE TABLE public.custom_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_name TEXT NOT NULL,
  assessment_type TEXT NOT NULL, -- e.g., "SOC Analyst", "Penetration Tester", "Custom"
  description TEXT,
  questions JSONB NOT NULL, -- Array of question objects with text, expected_criteria, etc.
  is_active BOOLEAN DEFAULT true,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own custom assessments"
  ON public.custom_assessments
  FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Employers and recruiters can create custom assessments"
  ON public.custom_assessments
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    (has_role(auth.uid(), 'employer'::app_role) OR has_role(auth.uid(), 'recruiter'::app_role))
  );

CREATE POLICY "Users can update own custom assessments"
  ON public.custom_assessments
  FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own custom assessments"
  ON public.custom_assessments
  FOR DELETE
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all custom assessments"
  ON public.custom_assessments
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for performance
CREATE INDEX idx_custom_assessments_created_by ON public.custom_assessments(created_by);
CREATE INDEX idx_custom_assessments_created_at ON public.custom_assessments(created_at);

-- Function to get monthly assessment quota based on tier
CREATE OR REPLACE FUNCTION public.get_assessment_quota(p_tier subscription_tier)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN CASE p_tier
    WHEN 'employer_starter' THEN 1
    WHEN 'employer_growth' THEN 5
    WHEN 'employer_scale' THEN 15
    WHEN 'recruiter_pro' THEN 10
    WHEN 'enterprise' THEN 999
    ELSE 0
  END;
END;
$$;

-- Function to count assessments created this month
CREATE OR REPLACE FUNCTION public.count_monthly_assessments(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM public.custom_assessments
  WHERE created_by = p_user_id
    AND created_at >= date_trunc('month', CURRENT_DATE)
    AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
  
  RETURN COALESCE(v_count, 0);
END;
$$;