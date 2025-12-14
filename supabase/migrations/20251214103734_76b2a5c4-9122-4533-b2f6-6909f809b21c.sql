-- Drop the existing view first
DROP VIEW IF EXISTS public.ctf_challenges_public;

-- Recreate the view with all columns except flag
CREATE VIEW public.ctf_challenges_public AS
SELECT 
  id,
  title,
  description,
  category,
  difficulty,
  points,
  hints,
  is_active,
  file_url,
  file_name,
  created_at,
  updated_at
FROM public.ctf_challenges
WHERE is_active = true;

-- Grant access to the view
GRANT SELECT ON public.ctf_challenges_public TO anon, authenticated;

-- Drop the restrictive admin-only SELECT policy
DROP POLICY IF EXISTS "Only admins can view challenges with flags" ON public.ctf_challenges;

-- Add a policy for authenticated users to view active challenges
DROP POLICY IF EXISTS "Anyone can view active challenges" ON public.ctf_challenges;
CREATE POLICY "Anyone can view active challenges" 
ON public.ctf_challenges 
FOR SELECT 
USING (is_active = true);