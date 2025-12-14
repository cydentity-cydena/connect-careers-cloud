-- Create table to track hint usage and point deductions
CREATE TABLE IF NOT EXISTS public.ctf_hint_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.ctf_challenges(id) ON DELETE CASCADE,
  hint_index integer NOT NULL,
  points_deducted integer NOT NULL DEFAULT 0,
  revealed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, challenge_id, hint_index)
);

-- Enable RLS
ALTER TABLE public.ctf_hint_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own hint usage
CREATE POLICY "Users can view own hint usage"
ON public.ctf_hint_usage FOR SELECT
USING (auth.uid() = candidate_id);

-- Users can insert their own hint usage
CREATE POLICY "Users can insert own hint usage"
ON public.ctf_hint_usage FOR INSERT
WITH CHECK (auth.uid() = candidate_id);

-- Create index for faster lookups
CREATE INDEX idx_ctf_hint_usage_candidate ON public.ctf_hint_usage(candidate_id);
CREATE INDEX idx_ctf_hint_usage_challenge ON public.ctf_hint_usage(challenge_id);