
-- Add admin policy for candidate_profiles (staff already has access)
CREATE POLICY "Admins can view all candidate profiles"
ON public.candidate_profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin and staff policy for candidate_resumes
CREATE POLICY "Admins and staff can view all resumes"
ON public.candidate_resumes
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));
