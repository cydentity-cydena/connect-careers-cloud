-- Monetization and Gamification System

-- 1. Employer Credits System
CREATE TABLE public.employer_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employer_id)
);

-- 2. Credit Transactions (purchase history)
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'unlock', 'refund')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Profile Unlocks (track which employers unlocked which candidates)
CREATE TABLE public.profile_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employer_id, candidate_id)
);

-- 4. Candidate XP and Achievements
CREATE TABLE public.candidate_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  profile_completion_percent INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(candidate_id)
);

-- 5. Achievement Definitions
CREATE TYPE achievement_category AS ENUM ('profile', 'skills', 'certifications', 'community', 'training');

CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category achievement_category NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  requirement_value INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. User Achievements (earned badges)
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.employer_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employer_credits
CREATE POLICY "Employers can view own credits"
ON public.employer_credits FOR SELECT
USING (auth.uid() = employer_id);

CREATE POLICY "Employers can update own credits"
ON public.employer_credits FOR UPDATE
USING (auth.uid() = employer_id);

-- RLS Policies for credit_transactions
CREATE POLICY "Employers can view own transactions"
ON public.credit_transactions FOR SELECT
USING (auth.uid() = employer_id);

-- RLS Policies for profile_unlocks
CREATE POLICY "Employers can view own unlocks"
ON public.profile_unlocks FOR SELECT
USING (auth.uid() = employer_id);

CREATE POLICY "Candidates can see who unlocked them"
ON public.profile_unlocks FOR SELECT
USING (auth.uid() = candidate_id);

-- RLS Policies for candidate_xp
CREATE POLICY "Users can view own XP"
ON public.candidate_xp FOR SELECT
USING (auth.uid() = candidate_id);

CREATE POLICY "Everyone can view XP for leaderboard"
ON public.candidate_xp FOR SELECT
USING (true);

-- RLS Policies for achievements
CREATE POLICY "Everyone can view achievements"
ON public.achievements FOR SELECT
USING (true);

CREATE POLICY "Admins can manage achievements"
ON public.achievements FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
ON public.user_achievements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view user achievements"
ON public.user_achievements FOR SELECT
USING (true);

-- Triggers
CREATE TRIGGER update_employer_credits_updated_at
  BEFORE UPDATE ON public.employer_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_candidate_xp_updated_at
  BEFORE UPDATE ON public.candidate_xp
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to calculate profile completion
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  completion_score INTEGER := 0;
  profile_exists BOOLEAN;
  candidate_exists BOOLEAN;
BEGIN
  -- Check profile fields (40 points max)
  SELECT 
    (CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 10 ELSE 0 END) +
    (CASE WHEN bio IS NOT NULL AND bio != '' THEN 10 ELSE 0 END) +
    (CASE WHEN location IS NOT NULL AND location != '' THEN 10 ELSE 0 END) +
    (CASE WHEN avatar_url IS NOT NULL AND avatar_url != '' THEN 10 ELSE 0 END)
  INTO completion_score
  FROM profiles
  WHERE id = user_id;
  
  -- Check candidate profile fields (40 points max)
  SELECT 
    (CASE WHEN title IS NOT NULL AND title != '' THEN 10 ELSE 0 END) +
    (CASE WHEN years_experience > 0 THEN 10 ELSE 0 END) +
    (CASE WHEN resume_url IS NOT NULL AND resume_url != '' THEN 10 ELSE 0 END) +
    (CASE WHEN linkedin_url IS NOT NULL AND linkedin_url != '' THEN 10 ELSE 0 END)
  INTO candidate_exists
  FROM candidate_profiles
  WHERE user_id = calculate_profile_completion.user_id;
  
  completion_score := completion_score + COALESCE(candidate_exists, 0);
  
  -- Check for skills (10 points)
  IF EXISTS (SELECT 1 FROM candidate_skills WHERE candidate_id = user_id LIMIT 1) THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Check for certifications (10 points)
  IF EXISTS (SELECT 1 FROM certifications WHERE candidate_id = user_id LIMIT 1) THEN
    completion_score := completion_score + 10;
  END IF;
  
  RETURN completion_score;
END;
$$;

-- Seed initial achievements
INSERT INTO public.achievements (name, description, category, icon, xp_reward, requirement_value) VALUES
('Profile Complete', 'Complete 100% of your profile', 'profile', '🎯', 100, 100),
('First Steps', 'Complete 50% of your profile', 'profile', '👟', 50, 50),
('Skill Master', 'Add 5 or more skills', 'skills', '⚡', 50, 5),
('Skill Expert', 'Add 10 or more skills', 'skills', '🔥', 100, 10),
('Certified Pro', 'Add your first certification', 'certifications', '🏆', 75, 1),
('Triple Certified', 'Add 3 certifications', 'certifications', '🌟', 150, 3),
('Training Started', 'Complete your first training course', 'training', '📚', 50, 1),
('Training Enthusiast', 'Complete 3 training courses', 'training', '🎓', 100, 3);