-- Create youtube_creators table for content creators/channels
CREATE TABLE public.youtube_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_name TEXT NOT NULL,
  channel_url TEXT,
  channel_id TEXT,
  thumbnail_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS
ALTER TABLE public.youtube_creators ENABLE ROW LEVEL SECURITY;

-- Allow public read for active creators
CREATE POLICY "Anyone can view active creators"
ON public.youtube_creators
FOR SELECT
USING (is_active = true);

-- Allow admins/staff to manage creators
CREATE POLICY "Admins can manage creators"
ON public.youtube_creators
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));

-- Add creator_id to youtube_learning_paths
ALTER TABLE public.youtube_learning_paths
ADD COLUMN creator_id UUID REFERENCES public.youtube_creators(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_learning_paths_creator ON public.youtube_learning_paths(creator_id);

-- Create trigger for updated_at using existing function
CREATE TRIGGER update_youtube_creators_updated_at
BEFORE UPDATE ON public.youtube_creators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();