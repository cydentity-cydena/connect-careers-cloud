-- Create partner communities table
CREATE TABLE public.partner_communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL DEFAULT 'discord',
  invite_url TEXT NOT NULL,
  logo_url TEXT,
  member_count INTEGER,
  specializations TEXT[] DEFAULT '{}',
  webhook_url TEXT,
  webhook_secret TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_communities ENABLE ROW LEVEL SECURITY;

-- Public read access for active communities
CREATE POLICY "Anyone can view active partner communities"
ON public.partner_communities
FOR SELECT
USING (is_active = true);

-- Create index for active communities
CREATE INDEX idx_partner_communities_active ON public.partner_communities(is_active) WHERE is_active = true;

-- Add trigger for updated_at using existing update_updated_at function
CREATE TRIGGER update_partner_communities_updated_at
BEFORE UPDATE ON public.partner_communities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();