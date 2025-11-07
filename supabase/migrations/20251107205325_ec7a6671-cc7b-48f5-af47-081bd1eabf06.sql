-- Fix security warning: Add search_path to calculate_level_from_xp function
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(xp_amount integer)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Level progression: 
  -- Level 1: 0-99 XP
  -- Level 2: 100-249 XP
  -- Level 3: 250-499 XP
  -- Level 4: 500-999 XP
  -- Level 5: 1000-1999 XP
  -- Level 6: 2000-3999 XP
  -- Level 7: 4000-7999 XP
  -- Level 8: 8000-15999 XP
  -- Level 9: 16000-31999 XP
  -- Level 10: 32000+ XP
  
  IF xp_amount < 100 THEN RETURN 1;
  ELSIF xp_amount < 250 THEN RETURN 2;
  ELSIF xp_amount < 500 THEN RETURN 3;
  ELSIF xp_amount < 1000 THEN RETURN 4;
  ELSIF xp_amount < 2000 THEN RETURN 5;
  ELSIF xp_amount < 4000 THEN RETURN 6;
  ELSIF xp_amount < 8000 THEN RETURN 7;
  ELSIF xp_amount < 16000 THEN RETURN 8;
  ELSIF xp_amount < 32000 THEN RETURN 9;
  ELSE RETURN 10;
  END IF;
END;
$$;