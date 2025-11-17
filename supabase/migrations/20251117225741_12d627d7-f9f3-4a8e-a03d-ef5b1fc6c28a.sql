-- Create security_iq_attempts table
CREATE TABLE public.security_iq_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_date DATE NOT NULL,
  selected_answer INTEGER NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, challenge_date)
);

-- Create index for faster lookups
CREATE INDEX idx_security_iq_candidate_date ON public.security_iq_attempts(candidate_id, challenge_date DESC);

-- Enable RLS
ALTER TABLE public.security_iq_attempts ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own attempts
CREATE POLICY "Users can insert own attempts"
  ON public.security_iq_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

-- Allow users to view their own attempts
CREATE POLICY "Users can view own attempts"
  ON public.security_iq_attempts
  FOR SELECT
  USING (auth.uid() = candidate_id);

-- Allow anyone to view aggregated stats for leaderboard
CREATE POLICY "Anyone can view attempts for leaderboard"
  ON public.security_iq_attempts
  FOR SELECT
  USING (true);

-- Create function to calculate streak
CREATE OR REPLACE FUNCTION public.calculate_security_iq_streak(p_candidate_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak INTEGER := 0;
  v_check_date DATE := CURRENT_DATE;
  v_has_attempt BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS (
      SELECT 1 
      FROM public.security_iq_attempts
      WHERE candidate_id = p_candidate_id
      AND challenge_date = v_check_date
      AND score = 100
    ) INTO v_has_attempt;
    
    IF NOT v_has_attempt THEN
      EXIT;
    END IF;
    
    v_streak := v_streak + 1;
    v_check_date := v_check_date - INTERVAL '1 day';
  END LOOP;
  
  RETURN v_streak;
END;
$$;