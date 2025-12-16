-- Add featured_until column to profiles for referral reward
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE;

-- Add index for featured profiles query
CREATE INDEX IF NOT EXISTS idx_profiles_featured_until ON public.profiles(featured_until) WHERE featured_until IS NOT NULL;

-- Add reward rule for referral milestone bonus (2+ referrals)
INSERT INTO public.reward_rules (code, description, amount, active) 
VALUES ('REFERRAL_MILESTONE_2', 'Bonus for referring 2+ users who sign up', 500, true)
ON CONFLICT (code) DO UPDATE SET amount = 500, active = true;