-- Create profile view audit log table
CREATE TABLE IF NOT EXISTS public.profile_view_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id uuid NOT NULL,
  candidate_id uuid NOT NULL,
  view_type text NOT NULL DEFAULT 'preview', -- 'preview', 'full', 'unlock'
  viewer_role text,
  ip_hash text, -- hashed IP for pattern detection
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_view_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read logs, viewers can only insert their own logs
CREATE POLICY "Users can log their own views"
ON public.profile_view_logs
FOR INSERT
TO authenticated
WITH CHECK (viewer_id = auth.uid());

CREATE POLICY "Admins can view all logs"
ON public.profile_view_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for rate limit queries
CREATE INDEX idx_profile_view_logs_viewer_date 
ON public.profile_view_logs(viewer_id, created_at DESC);

CREATE INDEX idx_profile_view_logs_candidate 
ON public.profile_view_logs(candidate_id, created_at DESC);

-- Function to check daily view rate limit (returns true if within limit)
CREATE OR REPLACE FUNCTION public.check_profile_view_rate_limit(p_viewer_id uuid, p_daily_limit integer DEFAULT 50)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today_count integer;
  v_hourly_count integer;
BEGIN
  -- Count views today
  SELECT COUNT(*) INTO v_today_count
  FROM profile_view_logs
  WHERE viewer_id = p_viewer_id
  AND created_at > CURRENT_DATE;
  
  -- Count views in last hour
  SELECT COUNT(*) INTO v_hourly_count
  FROM profile_view_logs
  WHERE viewer_id = p_viewer_id
  AND created_at > NOW() - INTERVAL '1 hour';
  
  RETURN jsonb_build_object(
    'allowed', v_today_count < p_daily_limit AND v_hourly_count < 30,
    'daily_count', v_today_count,
    'daily_limit', p_daily_limit,
    'hourly_count', v_hourly_count,
    'hourly_limit', 30,
    'daily_remaining', GREATEST(0, p_daily_limit - v_today_count)
  );
END;
$$;

-- Function to log profile view and check rate limit
CREATE OR REPLACE FUNCTION public.log_profile_view(
  p_viewer_id uuid, 
  p_candidate_id uuid, 
  p_view_type text DEFAULT 'preview',
  p_viewer_role text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rate_check jsonb;
  v_daily_limit integer;
BEGIN
  -- Get daily limit based on role (employers: 50, recruiters: 75)
  v_daily_limit := CASE 
    WHEN p_viewer_role = 'recruiter' THEN 75
    WHEN p_viewer_role = 'employer' THEN 50
    ELSE 50
  END;
  
  -- Check rate limit
  v_rate_check := check_profile_view_rate_limit(p_viewer_id, v_daily_limit);
  
  -- If not allowed, return error
  IF NOT (v_rate_check->>'allowed')::boolean THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Rate limit exceeded',
      'rate_info', v_rate_check
    );
  END IF;
  
  -- Log the view
  INSERT INTO profile_view_logs (viewer_id, candidate_id, view_type, viewer_role)
  VALUES (p_viewer_id, p_candidate_id, p_view_type, p_viewer_role);
  
  RETURN jsonb_build_object(
    'success', true,
    'rate_info', v_rate_check
  );
END;
$$;

-- Function to detect suspicious activity patterns
CREATE OR REPLACE FUNCTION public.detect_suspicious_profile_access(p_viewer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_5min_count integer;
  v_unique_profiles_hour integer;
  v_is_suspicious boolean := false;
  v_reason text;
BEGIN
  -- Count views in last 5 minutes
  SELECT COUNT(*) INTO v_5min_count
  FROM profile_view_logs
  WHERE viewer_id = p_viewer_id
  AND created_at > NOW() - INTERVAL '5 minutes';
  
  -- Count unique profiles viewed in last hour
  SELECT COUNT(DISTINCT candidate_id) INTO v_unique_profiles_hour
  FROM profile_view_logs
  WHERE viewer_id = p_viewer_id
  AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Flag if more than 20 views in 5 minutes (automated scraping)
  IF v_5min_count > 20 THEN
    v_is_suspicious := true;
    v_reason := 'High velocity: ' || v_5min_count || ' views in 5 minutes';
    
    -- Notify admins
    INSERT INTO notifications (user_id, type, title, message, link)
    SELECT user_id, 'system'::notification_type, 
           'Suspicious Activity Detected',
           'User may be scraping profiles: ' || v_5min_count || ' views in 5 minutes',
           '/admin'
    FROM user_roles WHERE role = 'admin'::app_role;
  END IF;
  
  -- Flag if viewing more than 25 unique profiles per hour
  IF v_unique_profiles_hour > 25 THEN
    v_is_suspicious := true;
    v_reason := COALESCE(v_reason || '; ', '') || 'High breadth: ' || v_unique_profiles_hour || ' unique profiles/hour';
  END IF;
  
  RETURN jsonb_build_object(
    'suspicious', v_is_suspicious,
    'reason', v_reason,
    'metrics', jsonb_build_object(
      '5min_views', v_5min_count,
      'unique_profiles_hour', v_unique_profiles_hour
    )
  );
END;
$$;

-- Add rate limit tier to subscription_tier enum handling
-- Create table to track ATS push rate limits  
CREATE TABLE IF NOT EXISTS public.ats_push_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  candidate_id uuid NOT NULL,
  integration_id uuid NOT NULL,
  integration_type text NOT NULL, -- 'ats' or 'webhook'
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ats_push_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can log their own pushes"
ON public.ats_push_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own pushes"
ON public.ats_push_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Index for rate limiting
CREATE INDEX idx_ats_push_logs_user_date ON public.ats_push_logs(user_id, created_at DESC);

-- Function to check ATS push rate limit (max 10 per day)
CREATE OR REPLACE FUNCTION public.check_ats_push_rate_limit(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today_count integer;
  v_daily_limit integer := 10;
BEGIN
  SELECT COUNT(*) INTO v_today_count
  FROM ats_push_logs
  WHERE user_id = p_user_id
  AND created_at > CURRENT_DATE;
  
  RETURN jsonb_build_object(
    'allowed', v_today_count < v_daily_limit,
    'count', v_today_count,
    'limit', v_daily_limit,
    'remaining', GREATEST(0, v_daily_limit - v_today_count)
  );
END;
$$;