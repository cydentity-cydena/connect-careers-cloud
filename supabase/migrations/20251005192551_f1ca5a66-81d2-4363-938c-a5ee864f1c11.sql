-- Add professional_statement to candidate_profiles
ALTER TABLE candidate_profiles 
ADD COLUMN professional_statement TEXT;

-- Create work_history table
CREATE TABLE public.work_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  location TEXT,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for work_history
ALTER TABLE public.work_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for work_history
CREATE POLICY "Users can view own work history"
  ON public.work_history
  FOR SELECT
  USING (auth.uid() = candidate_id);

CREATE POLICY "Users can insert own work history"
  ON public.work_history
  FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Users can update own work history"
  ON public.work_history
  FOR UPDATE
  USING (auth.uid() = candidate_id);

CREATE POLICY "Users can delete own work history"
  ON public.work_history
  FOR DELETE
  USING (auth.uid() = candidate_id);

CREATE POLICY "Employers with unlocked access can view work history"
  ON public.work_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profile_unlocks
      WHERE profile_unlocks.candidate_id = work_history.candidate_id
      AND profile_unlocks.employer_id = auth.uid()
    )
  );

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT[],
  url TEXT,
  github_url TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for projects
CREATE POLICY "Projects viewable by all"
  ON public.projects
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Users can update own projects"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = candidate_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects
  FOR DELETE
  USING (auth.uid() = candidate_id);

-- Create education table
CREATE TABLE public.education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_date DATE,
  end_date DATE,
  gpa TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for education
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

-- RLS policies for education
CREATE POLICY "Education viewable by all"
  ON public.education
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own education"
  ON public.education
  FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Users can update own education"
  ON public.education
  FOR UPDATE
  USING (auth.uid() = candidate_id);

CREATE POLICY "Users can delete own education"
  ON public.education
  FOR DELETE
  USING (auth.uid() = candidate_id);