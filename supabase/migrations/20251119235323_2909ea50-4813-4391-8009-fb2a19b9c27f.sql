-- Function to handle comment deletion and XP deduction
CREATE OR REPLACE FUNCTION public.handle_delete_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_points_to_deduct INTEGER := 10;
BEGIN
  -- Deduct XP when comment is deleted
  UPDATE public.candidate_xp
  SET 
    total_xp = GREATEST(0, total_xp - v_points_to_deduct),
    community_points = GREATEST(0, community_points - v_points_to_deduct),
    last_activity_at = now()
  WHERE candidate_id = OLD.user_id;
  
  -- Record the XP deduction in community activities
  INSERT INTO public.community_activities (
    user_id,
    activity_type,
    points_awarded,
    metadata
  ) VALUES (
    OLD.user_id,
    'comment_deleted',
    -v_points_to_deduct,
    jsonb_build_object('comment_id', OLD.id, 'post_id', OLD.post_id)
  );
  
  RETURN OLD;
END;
$function$;

-- Create trigger for comment deletion
DROP TRIGGER IF EXISTS on_comment_delete ON public.post_comments;
CREATE TRIGGER on_comment_delete
  AFTER DELETE ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_delete_comment();