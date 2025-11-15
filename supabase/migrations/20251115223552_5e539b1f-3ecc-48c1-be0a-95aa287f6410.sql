-- Create a security definer function to get community stats
-- This allows anyone to see aggregate counts without exposing individual user data
CREATE OR REPLACE FUNCTION public.get_community_stats()
RETURNS TABLE (
  active_members bigint,
  certs_earned bigint,
  projects_shared bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM user_roles WHERE role = 'candidate'::app_role) as active_members,
    (SELECT COUNT(*) FROM certifications) as certs_earned,
    (SELECT COUNT(*) FROM activity_feed WHERE activity_type = 'project') as projects_shared;
END;
$$;