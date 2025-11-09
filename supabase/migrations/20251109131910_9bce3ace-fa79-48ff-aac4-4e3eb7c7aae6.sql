-- Fix notification type enum usage and set explicit search_path

-- Update notify_mentioned_users to use valid enum and keep search_path fixed
CREATE OR REPLACE FUNCTION public.notify_mentioned_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mentioned_user_id uuid;
  commenter_name text;
  post_title text;
BEGIN
  -- Get commenter's name
  SELECT COALESCE(full_name, username, 'Someone') INTO commenter_name
  FROM profiles
  WHERE id = NEW.user_id;

  -- Get post info (if community_posts table exists)
  BEGIN
    SELECT COALESCE(title, 'a post') INTO post_title
    FROM community_posts
    WHERE id = NEW.post_id;
  EXCEPTION WHEN undefined_table THEN
    post_title := 'a post';
  END;

  -- Notify each mentioned user
  IF NEW.mentioned_users IS NOT NULL THEN
    FOREACH mentioned_user_id IN ARRAY NEW.mentioned_users
    LOOP
      -- Don't notify if user mentions themselves
      IF mentioned_user_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (
          mentioned_user_id,
          'message'::notification_type,
          commenter_name || ' mentioned you',
          'You were mentioned in a comment on ' || post_title,
          '/community'
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Update admin notification helpers to use valid enum values
CREATE OR REPLACE FUNCTION public.notify_admins_cert_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record RECORD;
  cert_name TEXT;
BEGIN
  SELECT name INTO cert_name
  FROM certifications
  WHERE id = NEW.certification_id;

  FOR admin_record IN 
    SELECT DISTINCT user_id 
    FROM user_roles 
    WHERE role IN ('admin'::app_role, 'staff'::app_role)
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      admin_record.user_id,
      'system'::notification_type,
      'New Certification Verification Request',
      'Verification request for ' || '"' || cert_name || '"' || ' needs review',
      '/admin'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_admins_new_verification_request()
RETURNS trigger
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
      'system'::notification_type,
      'New Verification Request',
      'Verification request for ' || '"' || NEW.company_name || '"' || ' needs review',
      '/admin'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;