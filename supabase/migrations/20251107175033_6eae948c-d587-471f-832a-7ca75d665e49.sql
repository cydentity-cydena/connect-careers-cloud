-- Backfill candidate_xp records for existing profiles without XP
INSERT INTO candidate_xp (candidate_id, total_xp, points_balance, profile_completion_percent, level, community_points)
SELECT 
  p.id,
  0 as total_xp,
  0 as points_balance,
  0 as profile_completion_percent,
  1 as level,
  0 as community_points
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM candidate_xp cx WHERE cx.candidate_id = p.id
);

-- Create function to auto-create candidate_xp for new profiles
CREATE OR REPLACE FUNCTION public.handle_new_profile_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO candidate_xp (candidate_id, total_xp, points_balance, profile_completion_percent, level, community_points)
  VALUES (NEW.id, 0, 0, 0, 1, 0)
  ON CONFLICT (candidate_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create XP record when profile is created
DROP TRIGGER IF EXISTS on_profile_created_xp ON profiles;
CREATE TRIGGER on_profile_created_xp
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile_xp();