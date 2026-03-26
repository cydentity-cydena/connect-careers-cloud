-- Drop the current permissive SELECT policy that exposes the flag column
DROP POLICY IF EXISTS "Authenticated can view active challenges" ON public.ctf_challenges;

-- Create a secure function that returns challenges WITHOUT the flag column for non-admins
CREATE OR REPLACE FUNCTION public.get_ctf_challenges_safe(p_include_inactive boolean DEFAULT false)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  category text,
  difficulty text,
  points integer,
  hints jsonb,
  is_active boolean,
  file_url text,
  file_name text,
  visibility text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF has_role(auth.uid(), 'admin'::app_role) THEN
    -- Admins see everything including inactive (but still no flag in this function)
    RETURN QUERY SELECT c.id, c.title, c.description, c.category, c.difficulty, c.points, 
      c.hints::jsonb, c.is_active, c.file_url, c.file_name, c.visibility, c.created_at
    FROM ctf_challenges c
    ORDER BY c.created_at DESC;
  ELSE
    -- Non-admins only see active challenges, never the flag
    RETURN QUERY SELECT c.id, c.title, c.description, c.category, c.difficulty, c.points,
      c.hints::jsonb, c.is_active, c.file_url, c.file_name, c.visibility, c.created_at
    FROM ctf_challenges c
    WHERE c.is_active = true
    ORDER BY c.points ASC;
  END IF;
END;
$$;

-- Now restrict direct table SELECT to admins only
CREATE POLICY "Only admins can directly query challenges"
ON public.ctf_challenges
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));