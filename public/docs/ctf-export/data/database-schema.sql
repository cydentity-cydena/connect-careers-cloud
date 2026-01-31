-- =====================================================
-- Cydena CTF Platform - Database Schema
-- =====================================================

-- CTF Challenges table
CREATE TABLE public.ctf_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,           -- 'crypto', 'web', 'network', 'forensics', 'puzzle'
  difficulty TEXT NOT NULL,         -- 'beginner', 'intermediate', 'advanced', 'expert'
  points INTEGER NOT NULL,
  flag TEXT NOT NULL,               -- The correct flag (server-side only)
  hints JSONB,                      -- [{hint: "text", cost: 10}, ...]
  file_url TEXT,                    -- Optional downloadable file
  file_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ctf_challenges ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active challenges (but not flag)
-- Note: Use the public view below instead of direct access

-- CTF Submissions (tracks solve attempts)
CREATE TABLE public.ctf_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES auth.users(id),
  challenge_id UUID NOT NULL REFERENCES public.ctf_challenges(id),
  submitted_flag TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points_awarded INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  -- Only allow one correct submission per user per challenge
  UNIQUE(candidate_id, challenge_id, is_correct) 
);

-- Enable RLS
ALTER TABLE public.ctf_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own submissions
CREATE POLICY "Users can view own submissions" 
  ON public.ctf_submissions 
  FOR SELECT 
  USING (auth.uid() = candidate_id);

-- Policy: Users can insert their own submissions
CREATE POLICY "Users can create submissions" 
  ON public.ctf_submissions 
  FOR INSERT 
  WITH CHECK (auth.uid() = candidate_id);

-- CTF Hint Usage (tracks hint reveals for point deductions)
CREATE TABLE public.ctf_hint_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES auth.users(id),
  challenge_id UUID NOT NULL REFERENCES public.ctf_challenges(id),
  hint_index INTEGER NOT NULL,
  points_deducted INTEGER DEFAULT 0,
  revealed_at TIMESTAMPTZ DEFAULT now(),
  -- Only one reveal per hint per user
  UNIQUE(candidate_id, challenge_id, hint_index)
);

-- Enable RLS
ALTER TABLE public.ctf_hint_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own hint usage
CREATE POLICY "Users can view own hint usage" 
  ON public.ctf_hint_usage 
  FOR SELECT 
  USING (auth.uid() = candidate_id);

-- Policy: Users can insert their own hint reveals
CREATE POLICY "Users can reveal hints" 
  ON public.ctf_hint_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = candidate_id);

-- =====================================================
-- Views
-- =====================================================

-- Public view (hides flag from clients)
CREATE VIEW public.ctf_challenges_public AS
SELECT 
  id, 
  title, 
  description, 
  category, 
  difficulty, 
  points, 
  hints, 
  file_url, 
  file_name
FROM public.ctf_challenges
WHERE is_active = true;

-- Leaderboard View (aggregates scores)
CREATE VIEW public.ctf_leaderboard AS
SELECT 
  p.id,
  p.full_name,
  p.username,
  p.avatar_url,
  COUNT(DISTINCT s.challenge_id) as challenges_solved,
  COALESCE(SUM(s.points_awarded), 0) as total_points,
  MAX(s.submitted_at) as last_submission
FROM public.profiles p
LEFT JOIN public.ctf_submissions s ON s.candidate_id = p.id AND s.is_correct = true
GROUP BY p.id, p.full_name, p.username, p.avatar_url
HAVING COUNT(DISTINCT s.challenge_id) > 0
ORDER BY total_points DESC, last_submission ASC;

-- =====================================================
-- Functions
-- =====================================================

-- Secure flag verification function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.verify_ctf_flag(
  p_challenge_id UUID,
  p_submitted_flag TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  correct_flag TEXT;
BEGIN
  SELECT flag INTO correct_flag 
  FROM public.ctf_challenges 
  WHERE id = p_challenge_id;
  
  -- Case-insensitive comparison with trimmed whitespace
  RETURN LOWER(TRIM(p_submitted_flag)) = LOWER(TRIM(correct_flag));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Seed Data (Example Challenges)
-- =====================================================

INSERT INTO public.ctf_challenges (title, description, category, difficulty, points, flag, hints, is_active)
VALUES 
  (
    'Advanced Chess Gambit',
    'Solve four checkmate-in-one puzzles. The destination squares of your moves will reveal the flag.',
    'puzzle',
    'intermediate',
    100,
    'FLAG{FACE}',
    '[{"hint": "Think about which files the pieces move to", "cost": 20}]'::jsonb,
    true
  ),
  (
    'Quiz Quantlet',
    'Answer 11 security trivia questions. The first letter of each answer spells the flag.',
    'puzzle',
    'beginner',
    50,
    'FLAG{NEVERGIVEUP}',
    '[{"hint": "Pay attention to the first letter of each answer", "cost": 10}]'::jsonb,
    true
  ),
  (
    'Port Probe Protocols',
    'A hidden service is running on localhost. Use network tools to discover it and retrieve the banner.',
    'network',
    'beginner',
    75,
    'FLAG{banner_found_via_scan}',
    '[{"hint": "Try scanning with nmap first", "cost": 15}]'::jsonb,
    true
  ),
  (
    'The Curious Web',
    'Navigate a simulated website to find hidden content. The AI assistant might help... or might not.',
    'web',
    'beginner',
    75,
    'FLAG{ai_was_trying_to_distract_you}',
    '[{"hint": "Check robots.txt and view page source", "cost": 15}]'::jsonb,
    true
  ),
  (
    'Injection Junction',
    'Bypass the Web Application Firewall to extract data from the database. Not all keywords are blocked...',
    'web',
    'intermediate',
    150,
    'FLAG{sql_injection_master}',
    '[{"hint": "The WAF blocks OR, AND, -- but what about UNION?", "cost": 30}]'::jsonb,
    true
  ),
  (
    'Deepfakes and Dollars',
    'Analyze audio recordings to identify AI-generated voice calls attempting wire fraud.',
    'forensics',
    'advanced',
    150,
    'FLAG{deepfake_detector_elite}',
    '[{"hint": "Use the spectrum analyzer to find unnatural patterns", "cost": 25}]'::jsonb,
    true
  ),
  (
    'SOC In The Loop',
    'Your AI SOC assistant has analyzed server logs. But can you trust its conclusions? Verify the threat manually.',
    'forensics',
    'advanced',
    250,
    'FLAG{ai_guided_but_human_verified}',
    '[{"hint": "The AI focused on blocked attacks - look for successful ones", "cost": 40}]'::jsonb,
    true
  );
