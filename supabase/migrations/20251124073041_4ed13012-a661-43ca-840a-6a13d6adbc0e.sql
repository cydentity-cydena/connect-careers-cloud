-- Fix RLS policies for course_completions table
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert their own completions" ON public.course_completions;
DROP POLICY IF EXISTS "Users can view their own completions" ON public.course_completions;
DROP POLICY IF EXISTS "Staff can view all completions" ON public.course_completions;
DROP POLICY IF EXISTS "Staff can update completions" ON public.course_completions;

-- Create policy to allow users to insert their own course completions
CREATE POLICY "Users can insert their own completions"
ON public.course_completions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = candidate_id);

-- Create policy to allow users to view their own course completions
CREATE POLICY "Users can view their own completions"
ON public.course_completions
FOR SELECT
TO authenticated
USING (auth.uid() = candidate_id);

-- Create policy to allow staff/admins to view all completions
CREATE POLICY "Staff can view all completions"
ON public.course_completions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'staff'::app_role)
  )
);

-- Create policy to allow staff/admins to update completions (for verification)
CREATE POLICY "Staff can update completions"
ON public.course_completions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'staff'::app_role)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'staff'::app_role)
  )
);