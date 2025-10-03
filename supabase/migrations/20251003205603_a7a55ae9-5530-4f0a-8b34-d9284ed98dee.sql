-- Create partner_courses table
CREATE TABLE public.partner_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  is_free BOOLEAN NOT NULL DEFAULT true,
  est_minutes INTEGER,
  skill_slug TEXT,
  expected_proof TEXT NOT NULL,
  reward_code TEXT NOT NULL,
  reward_amount INTEGER NOT NULL,
  badge_hint TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active partner courses viewable by all"
  ON public.partner_courses FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage partner courses"
  ON public.partner_courses FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create course_completions table
CREATE TABLE public.course_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_course_id UUID NOT NULL REFERENCES public.partner_courses(id) ON DELETE CASCADE,
  proof_type TEXT NOT NULL,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  awarded_points INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(candidate_id, partner_course_id)
);

ALTER TABLE public.course_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates view own completions"
  ON public.course_completions FOR SELECT
  USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates create own completions"
  ON public.course_completions FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Admins manage completions"
  ON public.course_completions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_partner_courses_updated_at
  BEFORE UPDATE ON public.partner_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Seed initial partner courses
INSERT INTO public.partner_courses (partner_slug, title, url, is_free, est_minutes, skill_slug, expected_proof, reward_code, reward_amount, badge_hint) VALUES
  ('tryhackme', 'Linux Fundamentals', 'https://tryhackme.com/room/linuxfundamentalspart1?utm_source=cydent', true, 90, 'endpoint-security', 'openbadge', 'COURSE_COMPLETE_FREE', 250, 'Complete and import your OpenBadge to auto-verify.'),
  ('hackthebox', 'Introduction to HTB Academy', 'https://academy.hackthebox.com/course/preview/introduction-to-academy?utm_source=cydent', true, 60, 'penetration-testing', 'openbadge', 'COURSE_COMPLETE_FREE', 250, 'Complete to earn your HTB Academy badge.'),
  ('portswigger', 'SQL Injection', 'https://portswigger.net/web-security/sql-injection?utm_source=cydent', true, 90, 'web-security', 'screenshot', 'COURSE_COMPLETE_FREE', 250, 'Complete labs and submit a screenshot of your progress.'),
  ('letsdefend', 'SOC 101', 'https://letsdefend.io/cybersecurity-training?utm_source=cydent', true, 60, 'siem', 'pdf', 'COURSE_COMPLETE_FREE', 250, 'Download and submit your completion certificate.'),
  ('attackiq', 'Intro to Breach & Attack Simulation', 'https://www.academy.attackiq.com/?utm_source=cydent', true, 75, 'purple-team', 'openbadge', 'COURSE_COMPLETE_FREE', 250, 'Complete course to earn certificate.'),
  ('blueteamlabs', 'Intro DFIR Challenge', 'https://blueteamlabs.online/home/challenges?utm_source=cydent', true, 45, 'incident-response', 'screenshot', 'COURSE_COMPLETE_FREE', 200, 'Complete challenge and submit proof.');

-- Add reward rule for free course completions
INSERT INTO public.reward_rules (code, description, amount, active) VALUES
  ('COURSE_COMPLETE_FREE', 'Completed free partner course', 250, true)
ON CONFLICT (code) DO NOTHING;