-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_employer_recruiter_signup ON user_roles;
DROP TRIGGER IF EXISTS on_company_created ON companies;
DROP TRIGGER IF EXISTS on_verification_request_created ON verification_requests;

-- Create triggers to notify admins of new employer/recruiter signups
CREATE OR REPLACE FUNCTION notify_admins_new_employer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record RECORD;
  employer_email TEXT;
BEGIN
  SELECT email INTO employer_email FROM profiles WHERE id = NEW.user_id;
  
  FOR admin_record IN 
    SELECT DISTINCT user_id 
    FROM user_roles 
    WHERE role = 'admin'::app_role
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      admin_record.user_id,
      'info',
      'New ' || NEW.role || ' Signup',
      'A new ' || NEW.role || ' has signed up: ' || COALESCE(employer_email, 'Unknown'),
      '/admin'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_employer_recruiter_signup
  AFTER INSERT ON user_roles
  FOR EACH ROW
  WHEN (NEW.role IN ('employer', 'recruiter'))
  EXECUTE FUNCTION notify_admins_new_employer();

-- Create trigger to notify admins of new company profiles
CREATE OR REPLACE FUNCTION notify_admins_new_company()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record RECORD;
BEGIN
  FOR admin_record IN 
    SELECT DISTINCT user_id 
    FROM user_roles 
    WHERE role = 'admin'::app_role
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      admin_record.user_id,
      'info',
      'New Company Profile Created',
      'Company "' || NEW.name || '" has been created',
      '/admin'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_company_created
  AFTER INSERT ON companies
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_new_company();

-- Create trigger to notify admins of new verification requests
CREATE OR REPLACE FUNCTION notify_admins_new_verification_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record RECORD;
BEGIN
  FOR admin_record IN 
    SELECT DISTINCT user_id 
    FROM user_roles 
    WHERE role = 'admin'::app_role
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      admin_record.user_id,
      'info',
      'New Verification Request',
      'Verification request for "' || NEW.company_name || '" needs review',
      '/admin'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_verification_request_created
  AFTER INSERT ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_new_verification_request();