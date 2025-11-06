-- Allow admins to view all clients for analytics
CREATE POLICY "Admins can view all clients"
ON clients
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
);