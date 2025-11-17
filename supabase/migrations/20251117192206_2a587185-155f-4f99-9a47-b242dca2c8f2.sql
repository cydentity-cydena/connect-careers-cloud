-- Create referral codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uses_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Create referrals tracking table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referrer_id, referred_user_id)
);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Users can view their own referral codes"
ON public.referral_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes"
ON public.referral_codes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for referrals
CREATE POLICY "Users can view referrals they made"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view referrals where they were referred"
ON public.referrals FOR SELECT
USING (auth.uid() = referred_user_id);

CREATE POLICY "System can insert referrals"
ON public.referrals FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update referrals"
ON public.referrals FOR UPDATE
USING (true);

-- Add reward rules for referrals
INSERT INTO public.reward_rules (code, description, amount, active) 
VALUES 
  ('REFERRAL_SIGNUP', 'Reward for referring a new user who signs up', 50, true),
  ('REFERRAL_COMPLETE_PROFILE', 'Bonus when referred user completes profile', 100, true),
  ('REFERRED_USER_BONUS', 'Welcome bonus for joining via referral', 25, true)
ON CONFLICT (code) DO NOTHING;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_username TEXT;
  v_exists BOOLEAN;
BEGIN
  -- Get username for code base
  SELECT username INTO v_username
  FROM profiles
  WHERE id = p_user_id;
  
  -- Generate code based on username or random if no username
  IF v_username IS NOT NULL THEN
    v_code := UPPER(SUBSTRING(v_username FROM 1 FOR 6)) || SUBSTRING(md5(random()::text) FROM 1 FOR 4);
  ELSE
    v_code := 'REF' || SUBSTRING(md5(random()::text) FROM 1 FOR 7);
  END IF;
  
  -- Check if code exists
  SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = v_code) INTO v_exists;
  
  -- Regenerate if exists
  WHILE v_exists LOOP
    v_code := 'REF' || SUBSTRING(md5(random()::text) FROM 1 FOR 7);
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = v_code) INTO v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$;

-- Function to process referral rewards
CREATE OR REPLACE FUNCTION public.process_referral_rewards()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a user completes their profile, reward the referrer
  IF NEW.profile_completion_percent >= 80 AND 
     (OLD.profile_completion_percent IS NULL OR OLD.profile_completion_percent < 80) THEN
    
    -- Check if this user was referred
    IF EXISTS (
      SELECT 1 FROM referrals 
      WHERE referred_user_id = NEW.candidate_id 
      AND status = 'completed'
    ) THEN
      -- Award bonus to referrer
      UPDATE referrals
      SET status = 'rewarded'
      WHERE referred_user_id = NEW.candidate_id
      AND status = 'completed';
      
      -- Award points to referrer
      INSERT INTO reward_points (candidate_id, type, amount, meta)
      SELECT 
        referrer_id,
        'REFERRAL_COMPLETE_PROFILE',
        100,
        jsonb_build_object('referred_user', NEW.candidate_id)
      FROM referrals
      WHERE referred_user_id = NEW.candidate_id
      AND status = 'rewarded';
      
      -- Update XP
      UPDATE candidate_xp
      SET total_xp = total_xp + 100
      WHERE candidate_id IN (
        SELECT referrer_id FROM referrals 
        WHERE referred_user_id = NEW.candidate_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for profile completion rewards
CREATE TRIGGER trigger_referral_completion_rewards
AFTER UPDATE ON public.candidate_xp
FOR EACH ROW
EXECUTE FUNCTION public.process_referral_rewards();

-- Create indexes
CREATE INDEX idx_referral_codes_user ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON public.referrals(referred_user_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);