-- Create featured_certifications table
CREATE TABLE IF NOT EXISTS public.featured_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_name TEXT NOT NULL,
  cert_slug TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT NOT NULL,
  slot_position INTEGER NOT NULL CHECK (slot_position BETWEEN 1 AND 4),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  amount_paid NUMERIC,
  purchased_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.featured_certifications ENABLE ROW LEVEL SECURITY;

-- Active featured certifications viewable by all
CREATE POLICY "Active featured certifications viewable by all"
ON public.featured_certifications
FOR SELECT
USING (
  start_date <= now() 
  AND end_date >= now() 
  AND payment_status = 'completed'
);

-- Admins can manage featured certifications
CREATE POLICY "Admins can manage featured certifications"
ON public.featured_certifications
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Users can view own featured certification purchases
CREATE POLICY "Users can view own featured certification purchases"
ON public.featured_certifications
FOR SELECT
USING (auth.uid() = purchased_by);

-- Add index for performance
CREATE INDEX idx_featured_certifications_active 
ON public.featured_certifications(start_date, end_date, payment_status, slot_position);

-- Add trigger for updated_at
CREATE TRIGGER update_featured_certifications_updated_at
BEFORE UPDATE ON public.featured_certifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();
