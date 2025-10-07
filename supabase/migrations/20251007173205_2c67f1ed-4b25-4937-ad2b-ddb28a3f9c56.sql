-- Create profile views tracking table
CREATE TABLE IF NOT EXISTS public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  UNIQUE(candidate_id, employer_id, viewed_at)
);

-- Enable RLS
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Candidates can view who viewed their profile
CREATE POLICY "Candidates can view their profile views"
ON public.profile_views
FOR SELECT
USING (auth.uid() = candidate_id);

-- Employers can view their own profile views
CREATE POLICY "Employers can view profiles they viewed"
ON public.profile_views
FOR SELECT
USING (auth.uid() = employer_id);

-- Employers can insert profile views
CREATE POLICY "Employers can track profile views"
ON public.profile_views
FOR INSERT
WITH CHECK (auth.uid() = employer_id);

-- Create index for performance
CREATE INDEX idx_profile_views_candidate ON public.profile_views(candidate_id, viewed_at DESC);
CREATE INDEX idx_profile_views_employer ON public.profile_views(employer_id, viewed_at DESC);

-- Create candidate resumes table for multiple CVs
CREATE TABLE IF NOT EXISTS public.candidate_resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_name text NOT NULL,
  resume_type text NOT NULL DEFAULT 'general',
  resume_url text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.candidate_resumes ENABLE ROW LEVEL SECURITY;

-- Candidates manage their own resumes
CREATE POLICY "Candidates can manage own resumes"
ON public.candidate_resumes
FOR ALL
USING (auth.uid() = candidate_id);

-- Employers can view resumes of unlocked profiles
CREATE POLICY "Employers can view unlocked candidate resumes"
ON public.candidate_resumes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profile_unlocks
    WHERE profile_unlocks.candidate_id = candidate_resumes.candidate_id
    AND profile_unlocks.employer_id = auth.uid()
  )
);

-- Create index for performance
CREATE INDEX idx_candidate_resumes_candidate ON public.candidate_resumes(candidate_id);

-- Create direct messages table (separate from application messages)
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT different_users CHECK (sender_id != recipient_id)
);

-- Enable RLS
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received
CREATE POLICY "Users can view their direct messages"
ON public.direct_messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can send direct messages
CREATE POLICY "Users can send direct messages"
ON public.direct_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can mark messages as read
CREATE POLICY "Recipients can update message read status"
ON public.direct_messages
FOR UPDATE
USING (auth.uid() = recipient_id);

-- Create indexes for performance
CREATE INDEX idx_direct_messages_sender ON public.direct_messages(sender_id, created_at DESC);
CREATE INDEX idx_direct_messages_recipient ON public.direct_messages(recipient_id, created_at DESC);

-- Trigger to update updated_at on resumes
CREATE TRIGGER update_candidate_resumes_updated_at
BEFORE UPDATE ON public.candidate_resumes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();