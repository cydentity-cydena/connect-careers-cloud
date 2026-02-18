
-- Create subscription overrides table for admin-granted access
CREATE TABLE public.subscription_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'employer_growth',
  reason TEXT,
  granted_by UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscription_overrides ENABLE ROW LEVEL SECURITY;

-- Admins can manage overrides
CREATE POLICY "Admins can manage subscription overrides"
ON public.subscription_overrides
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Users can read their own override
CREATE POLICY "Users can view own override"
ON public.subscription_overrides
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_subscription_overrides_updated_at
  BEFORE UPDATE ON public.subscription_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pipeline_candidates_updated_at();
