-- Create featured training partners table
CREATE TABLE public.featured_training_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name TEXT NOT NULL,
  partner_slug TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT NOT NULL,
  slot_position INTEGER NOT NULL CHECK (slot_position BETWEEN 1 AND 4),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  amount_paid NUMERIC(10,2),
  purchased_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(slot_position, start_date, end_date)
);

-- Enable RLS
ALTER TABLE public.featured_training_partners ENABLE ROW LEVEL SECURITY;

-- Everyone can view active featured partners
CREATE POLICY "Active featured partners viewable by all"
ON public.featured_training_partners
FOR SELECT
USING (
  start_date <= now() AND 
  end_date >= now() AND 
  payment_status = 'completed'
);

-- Admins can manage all featured partners
CREATE POLICY "Admins can manage featured partners"
ON public.featured_training_partners
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Purchasers can view their own
CREATE POLICY "Users can view own featured partner purchases"
ON public.featured_training_partners
FOR SELECT
USING (auth.uid() = purchased_by);

-- Create trigger for updated_at
CREATE TRIGGER update_featured_training_partners_updated_at
BEFORE UPDATE ON public.featured_training_partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();