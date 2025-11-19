-- Create function to deduct credits atomically
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_employer_id UUID,
  p_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_credits INTEGER;
BEGIN
  -- Get current credits with row lock
  SELECT credits INTO v_current_credits
  FROM employer_credits
  WHERE employer_id = p_employer_id
  FOR UPDATE;
  
  -- Check if sufficient credits
  IF v_current_credits < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits: % available, % required', v_current_credits, p_amount;
  END IF;
  
  -- Deduct credits
  UPDATE employer_credits
  SET 
    credits = credits - p_amount,
    credits_used = credits_used + p_amount,
    updated_at = NOW()
  WHERE employer_id = p_employer_id;
END;
$$;