-- Add explicit public access denial for placements table (defense in depth)
-- This RESTRICTIVE policy ensures that even if authentication is bypassed,
-- financial data in placements cannot be accessed publicly

-- Create restrictive policy to block all unauthenticated access
CREATE POLICY "Block all public access to placements"
  ON public.placements
  AS RESTRICTIVE
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Add additional restrictive policy to ensure only authorized roles can access
CREATE POLICY "Only authorized users can access placements"
  ON public.placements
  AS RESTRICTIVE
  FOR ALL
  USING (
    -- Must be authenticated AND be one of: recruiter who owns it, employer who owns it, or admin
    auth.uid() IS NOT NULL AND (
      auth.uid() = recruiter_id OR
      auth.uid() = employer_id OR
      has_role(auth.uid(), 'admin'::app_role)
    )
  );

COMMENT ON POLICY "Block all public access to placements" ON public.placements 
  IS 'Defense-in-depth: Prevents any unauthenticated access to sensitive financial data';

COMMENT ON POLICY "Only authorized users can access placements" ON public.placements 
  IS 'Restrictive policy ensures only placement owner (recruiter or employer) or admin can access financial data';