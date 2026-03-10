
-- Courses table (similar to ctf_events)
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  partner_name TEXT,
  partner_logo_url TEXT,
  banner_url TEXT,
  access_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sequential_modules BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Course modules
CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  module_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Module challenges (junction to ctf_challenges)
CREATE TABLE public.course_module_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.ctf_challenges(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(module_id, challenge_id)
);

-- Course participants (access code gate)
CREATE TABLE public.course_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_module_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_participants ENABLE ROW LEVEL SECURITY;

-- Courses: anyone can read active courses (public listing)
CREATE POLICY "Anyone can view active courses" ON public.courses
  FOR SELECT USING (is_active = true);

-- Admins can manage courses
CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Modules: participants can view modules of their courses
CREATE POLICY "Participants can view course modules" ON public.course_modules
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_participants cp
      WHERE cp.course_id = course_modules.course_id AND cp.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- Admins can manage modules
CREATE POLICY "Admins can manage modules" ON public.course_modules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Module challenges: participants can view
CREATE POLICY "Participants can view module challenges" ON public.course_module_challenges
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_modules cm
      JOIN public.course_participants cp ON cp.course_id = cm.course_id
      WHERE cm.id = course_module_challenges.module_id AND cp.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- Admins can manage module challenges
CREATE POLICY "Admins can manage module challenges" ON public.course_module_challenges
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Participants: users can see their own participation
CREATE POLICY "Users can view own participation" ON public.course_participants
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Join course function (secure, server-side access code verification)
CREATE OR REPLACE FUNCTION public.join_course(p_course_slug TEXT, p_access_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_course_id UUID;
  v_course_title TEXT;
  v_is_active BOOLEAN;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT id, title, is_active
  INTO v_course_id, v_course_title, v_is_active
  FROM public.courses
  WHERE slug = p_course_slug
    AND LOWER(TRIM(access_code)) = LOWER(TRIM(p_access_code));

  IF v_course_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid access code');
  END IF;

  IF NOT v_is_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'This course is not currently active');
  END IF;

  INSERT INTO public.course_participants (course_id, user_id)
  VALUES (v_course_id, v_user_id)
  ON CONFLICT (course_id, user_id) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'course_id', v_course_id, 'course_title', v_course_title);
END;
$$;
