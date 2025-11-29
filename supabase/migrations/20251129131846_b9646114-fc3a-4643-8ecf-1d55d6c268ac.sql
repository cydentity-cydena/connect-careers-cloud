-- Add RLS policy for admins and staff to view work history
CREATE POLICY "Admins and staff can view all work history"
ON public.work_history
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'staff'::app_role)
);