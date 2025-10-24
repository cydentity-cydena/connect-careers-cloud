-- Allow staff and admins to delete pipeline entries
CREATE POLICY "Staff and admins can delete pipeline entries"
ON candidate_pipeline
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'staff'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);