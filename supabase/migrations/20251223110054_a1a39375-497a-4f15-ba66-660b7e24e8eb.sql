-- Add RLS policies for candidate_xp table to allow users to update their own XP

-- Allow users to insert their own XP record
CREATE POLICY "Users can insert own XP"
ON public.candidate_xp
FOR INSERT
WITH CHECK (auth.uid() = candidate_id);

-- Allow users to update their own XP
CREATE POLICY "Users can update own XP"
ON public.candidate_xp
FOR UPDATE
USING (auth.uid() = candidate_id)
WITH CHECK (auth.uid() = candidate_id);