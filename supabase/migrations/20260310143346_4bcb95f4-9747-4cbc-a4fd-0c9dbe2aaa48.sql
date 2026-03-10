-- Add 'course_only' to the visibility check constraint
ALTER TABLE public.ctf_challenges DROP CONSTRAINT IF EXISTS ctf_challenges_visibility_check;
ALTER TABLE public.ctf_challenges ADD CONSTRAINT ctf_challenges_visibility_check 
  CHECK (visibility IN ('public', 'event_only', 'both', 'course_only'));

-- Update the public view to also exclude course_only challenges
DROP VIEW IF EXISTS public.ctf_challenges_public;
CREATE VIEW public.ctf_challenges_public
WITH (security_invoker = true)
AS
SELECT id, title, description, category, difficulty, points, hints, file_url, file_name
FROM public.ctf_challenges
WHERE is_active = true
AND visibility IN ('public', 'both');