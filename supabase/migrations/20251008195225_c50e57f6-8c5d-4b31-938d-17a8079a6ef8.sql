-- Add RLS policies for employer placements (pay-per-hire model)

-- Employers can view their own hires
CREATE POLICY "Employers can view own hires"
  ON public.placements
  FOR SELECT
  USING (auth.uid() = employer_id);

-- Employers can insert their own hires
CREATE POLICY "Employers can create own hires"
  ON public.placements
  FOR INSERT
  WITH CHECK (auth.uid() = employer_id);