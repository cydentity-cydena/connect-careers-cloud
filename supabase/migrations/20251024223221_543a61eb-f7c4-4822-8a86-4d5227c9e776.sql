-- Add 'staff' role to app_role enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typcategory = 'E') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'candidate', 'employer', 'recruiter', 'staff');
  ELSE
    -- Check if 'staff' value already exists
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'staff' AND enumtypid = 'public.app_role'::regtype) THEN
      ALTER TYPE public.app_role ADD VALUE 'staff';
    END IF;
  END IF;
END $$;

-- Create a staff test user
-- Password: Staff123!
-- Email: staff@test.com
DO $$
DECLARE
  staff_user_id uuid;
BEGIN
  -- Insert into auth.users (this requires service role, so we'll do it via the secure-signup function instead)
  -- For now, we'll just ensure the role assignment works
  
  -- Note: You'll need to sign up with email: staff@test.com and password: Staff123!
  -- Then we'll assign the staff role to that user
END $$;

-- Grant staff members view access to candidate profiles
CREATE POLICY "Staff can view all candidate profiles" 
ON public.candidate_profiles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'staff'));

-- Grant staff members view access to all profiles
CREATE POLICY "Staff can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'staff'));