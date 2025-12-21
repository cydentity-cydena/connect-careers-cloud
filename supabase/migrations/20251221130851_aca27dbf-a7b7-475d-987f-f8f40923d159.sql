-- Create youtube learning paths table
CREATE TABLE public.youtube_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  channel_name TEXT NOT NULL,
  channel_url TEXT,
  thumbnail_url TEXT,
  difficulty TEXT DEFAULT 'beginner',
  category TEXT DEFAULT 'general',
  total_xp INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create youtube path videos table
CREATE TABLE public.youtube_path_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID REFERENCES public.youtube_learning_paths(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  video_order INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create video completions tracking table
CREATE TABLE public.youtube_video_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_id UUID REFERENCES public.youtube_path_videos(id) ON DELETE CASCADE NOT NULL,
  path_id UUID REFERENCES public.youtube_learning_paths(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  xp_awarded INTEGER DEFAULT 0,
  UNIQUE(user_id, video_id)
);

-- Enable RLS
ALTER TABLE public.youtube_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_path_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_video_completions ENABLE ROW LEVEL SECURITY;

-- Policies for learning paths (public read)
CREATE POLICY "Anyone can view active learning paths"
ON public.youtube_learning_paths FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage learning paths"
ON public.youtube_learning_paths FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policies for path videos (public read)
CREATE POLICY "Anyone can view path videos"
ON public.youtube_path_videos FOR SELECT
USING (true);

CREATE POLICY "Admins can manage path videos"
ON public.youtube_path_videos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policies for completions (user-owned)
CREATE POLICY "Users can view their own completions"
ON public.youtube_video_completions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
ON public.youtube_video_completions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_path_videos_path_id ON public.youtube_path_videos(path_id);
CREATE INDEX idx_video_completions_user ON public.youtube_video_completions(user_id);
CREATE INDEX idx_video_completions_path ON public.youtube_video_completions(path_id);

-- Seed with popular cybersecurity channels
INSERT INTO public.youtube_learning_paths (title, description, channel_name, channel_url, difficulty, category, total_xp, display_order) VALUES
('HackTheBox Walkthroughs', 'Learn penetration testing through detailed HackTheBox machine walkthroughs', 'IppSec', 'https://youtube.com/@ippsec', 'intermediate', 'penetration-testing', 150, 1),
('Networking Fundamentals', 'Master networking concepts for cybersecurity careers', 'NetworkChuck', 'https://youtube.com/@NetworkChuck', 'beginner', 'networking', 100, 2),
('Bug Bounty & CTF', 'Learn bug bounty hunting and CTF techniques', 'John Hammond', 'https://youtube.com/@_JohnHammond', 'intermediate', 'bug-bounty', 150, 3),
('Malware Analysis', 'Deep dive into malware analysis and reverse engineering', 'MalwareAnalysisForHedgehogs', 'https://youtube.com/@MalwareAnalysisForHedgehogs', 'advanced', 'malware-analysis', 200, 4),
('Web Security Basics', 'Foundation course for web application security', 'PwnFunction', 'https://youtube.com/@PwnFunction', 'beginner', 'web-security', 100, 5);

-- Seed sample videos for IppSec path
INSERT INTO public.youtube_path_videos (path_id, title, youtube_video_id, description, duration_minutes, video_order, xp_reward)
SELECT id, 'Getting Started with HackTheBox', 'dIUQvt7KZCE', 'Introduction to the HackTheBox platform', 15, 1, 10
FROM public.youtube_learning_paths WHERE channel_name = 'IppSec';

INSERT INTO public.youtube_path_videos (path_id, title, youtube_video_id, description, duration_minutes, video_order, xp_reward)
SELECT id, 'Enumeration Techniques', '2LNyAbroZUk', 'Learn essential enumeration for pentesting', 25, 2, 15
FROM public.youtube_learning_paths WHERE channel_name = 'IppSec';

-- Seed sample videos for NetworkChuck path
INSERT INTO public.youtube_path_videos (path_id, title, youtube_video_id, description, duration_minutes, video_order, xp_reward)
SELECT id, 'Subnetting Made Easy', 'ecCuyq-Wprc', 'Master subnetting in under 30 minutes', 28, 1, 15
FROM public.youtube_learning_paths WHERE channel_name = 'NetworkChuck';

INSERT INTO public.youtube_path_videos (path_id, title, youtube_video_id, description, duration_minutes, video_order, xp_reward)
SELECT id, 'What is a Firewall?', 'kDEX1HXybrU', 'Understanding firewalls and network security', 18, 2, 10
FROM public.youtube_learning_paths WHERE channel_name = 'NetworkChuck';

-- Seed sample videos for John Hammond path
INSERT INTO public.youtube_path_videos (path_id, title, youtube_video_id, description, duration_minutes, video_order, xp_reward)
SELECT id, 'CTF for Beginners', 'Lqehvpe_djs', 'Getting started with Capture The Flag competitions', 20, 1, 15
FROM public.youtube_learning_paths WHERE channel_name = 'John Hammond';

INSERT INTO public.youtube_path_videos (path_id, title, youtube_video_id, description, duration_minutes, video_order, xp_reward)
SELECT id, 'Bug Bounty Hunting Tips', 'CU9Iafc-Igs', 'Tips for starting your bug bounty journey', 22, 2, 15
FROM public.youtube_learning_paths WHERE channel_name = 'John Hammond';