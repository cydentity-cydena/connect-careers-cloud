-- Remove notification triggers for basic signups (keep only verification requests)
DROP TRIGGER IF EXISTS on_employer_recruiter_signup ON user_roles;
DROP TRIGGER IF EXISTS on_company_created ON companies;
DROP FUNCTION IF EXISTS notify_admins_new_employer();
DROP FUNCTION IF EXISTS notify_admins_new_company();

-- Keep only the verification request notification trigger
-- (on_verification_request_created and notify_admins_new_verification_request remain)