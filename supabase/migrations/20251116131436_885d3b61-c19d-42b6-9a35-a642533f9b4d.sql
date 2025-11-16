-- Create a trigger to automatically update level when total_xp changes
CREATE OR REPLACE FUNCTION public.update_level_from_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Calculate the level based on total_xp using the existing function
  NEW.level := calculate_level_from_xp(NEW.total_xp);
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_level_from_xp ON public.candidate_xp;

-- Create the trigger on candidate_xp table
CREATE TRIGGER trigger_update_level_from_xp
  BEFORE INSERT OR UPDATE OF total_xp ON public.candidate_xp
  FOR EACH ROW
  EXECUTE FUNCTION public.update_level_from_xp();

-- Backfill: Update all existing records to have the correct level
UPDATE public.candidate_xp
SET level = calculate_level_from_xp(total_xp)
WHERE level != calculate_level_from_xp(total_xp) OR level IS NULL;