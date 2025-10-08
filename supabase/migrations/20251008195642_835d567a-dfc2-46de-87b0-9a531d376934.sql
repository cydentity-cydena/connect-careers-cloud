-- Create audit log table for client access tracking
CREATE TABLE IF NOT EXISTS public.client_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('view', 'create', 'update', 'delete')),
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.client_access_logs ENABLE ROW LEVEL SECURITY;

-- Recruiters can only view their own access logs
CREATE POLICY "Recruiters can view own access logs"
  ON public.client_access_logs
  FOR SELECT
  USING (auth.uid() = recruiter_id);

-- Admins can view all access logs for security monitoring
CREATE POLICY "Admins can view all access logs"
  ON public.client_access_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create index for performance
CREATE INDEX idx_client_access_logs_recruiter ON public.client_access_logs(recruiter_id, created_at DESC);
CREATE INDEX idx_client_access_logs_client ON public.client_access_logs(client_id, created_at DESC);

-- Create function to detect suspicious access patterns
CREATE OR REPLACE FUNCTION public.detect_suspicious_client_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_access_count integer;
BEGIN
  -- Count accesses in last 5 minutes
  SELECT COUNT(*)
  INTO recent_access_count
  FROM public.client_access_logs
  WHERE recruiter_id = NEW.recruiter_id
    AND created_at > NOW() - INTERVAL '5 minutes';
  
  -- If more than 50 accesses in 5 minutes, it might be data scraping
  IF recent_access_count > 50 THEN
    -- Log warning (in production, this could trigger alerts)
    RAISE WARNING 'Potential data scraping detected: User % accessed % clients in 5 minutes', 
      NEW.recruiter_id, recent_access_count;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to detect suspicious patterns
CREATE TRIGGER check_suspicious_access
  BEFORE INSERT ON public.client_access_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.detect_suspicious_client_access();

COMMENT ON TABLE public.client_access_logs IS 'Audit trail for client data access to detect unauthorized activity';
COMMENT ON FUNCTION public.detect_suspicious_client_access IS 'Detects potential data scraping by monitoring access frequency';