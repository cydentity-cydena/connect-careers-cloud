-- Allow staff to view all user roles for pod management
CREATE POLICY "Staff can view all roles" ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role));