-- Fix ctf_challenges_public view to use security invoker
DROP VIEW IF EXISTS public.ctf_challenges_public;

CREATE VIEW public.ctf_challenges_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  title,
  description,
  category,
  difficulty,
  points,
  hints,
  is_active,
  created_at,
  updated_at
FROM ctf_challenges
WHERE is_active = true;

-- Grant access to the public view
GRANT SELECT ON public.ctf_challenges_public TO authenticated;
GRANT SELECT ON public.ctf_challenges_public TO anon;