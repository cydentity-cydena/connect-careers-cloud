-- Create CTF challenges table
CREATE TABLE IF NOT EXISTS public.ctf_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  points INTEGER NOT NULL,
  flag TEXT NOT NULL,
  hints JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create CTF submissions table
CREATE TABLE IF NOT EXISTS public.ctf_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.ctf_challenges(id) ON DELETE CASCADE,
  submitted_flag TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  points_awarded INTEGER DEFAULT 0,
  UNIQUE(candidate_id, challenge_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ctf_submissions_candidate ON public.ctf_submissions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_ctf_submissions_challenge ON public.ctf_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_ctf_challenges_difficulty ON public.ctf_challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_ctf_challenges_category ON public.ctf_challenges(category);

-- Enable RLS
ALTER TABLE public.ctf_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ctf_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ctf_challenges
CREATE POLICY "Anyone can view active challenges"
  ON public.ctf_challenges
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage challenges"
  ON public.ctf_challenges
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for ctf_submissions
CREATE POLICY "Users can view own submissions"
  ON public.ctf_submissions
  FOR SELECT
  USING (auth.uid() = candidate_id);

CREATE POLICY "Users can create own submissions"
  ON public.ctf_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Admins can view all submissions"
  ON public.ctf_submissions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create leaderboard view
CREATE OR REPLACE VIEW public.ctf_leaderboard AS
SELECT 
  p.id,
  p.full_name,
  p.username,
  p.avatar_url,
  COUNT(DISTINCT s.challenge_id) as challenges_solved,
  COALESCE(SUM(s.points_awarded), 0) as total_points,
  MAX(s.submitted_at) as last_submission
FROM profiles p
LEFT JOIN ctf_submissions s ON s.candidate_id = p.id AND s.is_correct = true
GROUP BY p.id, p.full_name, p.username, p.avatar_url
HAVING COUNT(DISTINCT s.challenge_id) > 0
ORDER BY total_points DESC, last_submission ASC;

-- Insert starter challenges
INSERT INTO public.ctf_challenges (title, description, category, difficulty, points, flag, hints) VALUES
('Welcome to CTF', 'Your first challenge! The flag is hidden in plain sight. Hint: It''s literally in the description.', 'general', 'beginner', 10, 'FLAG{welcome_to_treccert_ctf}', '[{"cost": 0, "hint": "Look at the challenge description carefully"}]'),
('Base64 Basics', 'Decode this Base64 string: RkxBR3tiYXNlNjRfaXNfZWFzeX0=', 'crypto', 'beginner', 20, 'FLAG{base64_is_easy}', '[{"cost": 5, "hint": "Use a Base64 decoder"}, {"cost": 10, "hint": "Many online tools can decode Base64"}]'),
('Port Scanner', 'Common ports: 21, 22, 80, 443, 3306. One of these is the flag format. Which service uses port 22?', 'network', 'beginner', 25, 'FLAG{ssh}', '[{"cost": 5, "hint": "Think about secure remote access"}, {"cost": 10, "hint": "Secure Shell"}]'),
('SQL Injection 101', 'In SQL injection, what symbol is commonly used to comment out the rest of a query?', 'web', 'intermediate', 50, 'FLAG{--}', '[{"cost": 10, "hint": "It''s a double character"}, {"cost": 20, "hint": "Used in SQL comments"}]'),
('Caesar Cipher', 'Decrypt this Caesar cipher (shift 3): IODJFDHVDU_FLSKHUB', 'crypto', 'intermediate', 75, 'FLAG{caesar_cipher}', '[{"cost": 15, "hint": "Each letter is shifted by 3 positions"}, {"cost": 30, "hint": "A becomes D, B becomes E, etc."}]');

-- Create CTF achievements
INSERT INTO public.achievements (name, description, icon, category, xp_reward, requirement_value) VALUES
('CTF Novice', 'Complete your first CTF challenge', '🎯', 'ctf', 50, 1),
('CTF Apprentice', 'Solve 5 CTF challenges', '🏆', 'ctf', 100, 5),
('CTF Expert', 'Solve 10 CTF challenges', '🔥', 'ctf', 250, 10),
('Crypto Specialist', 'Solve 3 cryptography challenges', '🔐', 'ctf', 150, 3),
('Web Security Pro', 'Solve 3 web security challenges', '🌐', 'ctf', 150, 3)
ON CONFLICT DO NOTHING;