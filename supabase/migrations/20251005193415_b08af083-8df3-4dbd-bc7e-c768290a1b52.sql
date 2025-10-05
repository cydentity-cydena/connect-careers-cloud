-- Create activity_feed table for tracking platform activities
CREATE TABLE public.activity_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'certification', 'skill_added', 'project_added', 'endorsement_received', 'achievement_earned', 'profile_updated', 'work_added', 'education_added'
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS policies for activity_feed
CREATE POLICY "Public activities viewable by all"
  ON public.activity_feed
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view own activities"
  ON public.activity_feed
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert activities"
  ON public.activity_feed
  FOR INSERT
  WITH CHECK (false);

-- Create index for performance
CREATE INDEX idx_activity_feed_created_at ON public.activity_feed(created_at DESC);
CREATE INDEX idx_activity_feed_user_id ON public.activity_feed(user_id);

-- Create skill_pathways table for career progression
CREATE TABLE public.skill_pathways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'blue_team', 'red_team', 'governance', 'cloud_security', 'ai_security'
  level TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'expert'
  required_skills TEXT[],
  recommended_certs TEXT[],
  next_steps TEXT[],
  estimated_time_months INTEGER,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.skill_pathways ENABLE ROW LEVEL SECURITY;

-- Everyone can view skill pathways
CREATE POLICY "Skill pathways viewable by all"
  ON public.skill_pathways
  FOR SELECT
  USING (true);

-- Admins can manage skill pathways
CREATE POLICY "Admins can manage skill pathways"
  ON public.skill_pathways
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_feed;