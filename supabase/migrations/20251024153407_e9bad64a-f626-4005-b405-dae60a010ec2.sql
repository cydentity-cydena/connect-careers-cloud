-- Add staff role to users who have admin role
-- This ensures admins can also insert into candidate_pipeline
INSERT INTO user_roles (user_id, role)
SELECT user_id, 'staff'::app_role
FROM user_roles
WHERE role = 'admin'::app_role
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur2 
  WHERE ur2.user_id = user_roles.user_id 
  AND ur2.role = 'staff'::app_role
);