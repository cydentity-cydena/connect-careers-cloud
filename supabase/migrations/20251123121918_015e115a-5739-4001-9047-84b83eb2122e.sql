-- Enable RLS on course_completions (if not already enabled)
ALTER TABLE public.course_completions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own course completions
CREATE POLICY "Users can view their own course completions"
ON public.course_completions
FOR SELECT
TO authenticated
USING (candidate_id = auth.uid());

-- Policy: Users can insert their own course completions
CREATE POLICY "Users can insert their own course completions"
ON public.course_completions
FOR INSERT
TO authenticated
WITH CHECK (candidate_id = auth.uid());

-- Policy: Users can update their own course completions
CREATE POLICY "Users can update their own course completions"
ON public.course_completions
FOR UPDATE
TO authenticated
USING (candidate_id = auth.uid())
WITH CHECK (candidate_id = auth.uid());

-- Policy: Admins and staff can view all course completions
CREATE POLICY "Admins and staff can view all course completions"
ON public.course_completions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'staff')
  )
);

-- Policy: Admins and staff can update all course completions (for verification)
CREATE POLICY "Admins and staff can update all course completions"
ON public.course_completions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'staff')
  )
);