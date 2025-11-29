-- Create function to recalculate HR-Ready status
CREATE OR REPLACE FUNCTION public.recalculate_hr_ready()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_candidate_id UUID;
  v_identity_ok BOOLEAN;
  v_cert_ok BOOLEAN;
  v_rtw_ok BOOLEAN;
  v_logistics_ok BOOLEAN;
  v_hr_ready BOOLEAN;
  v_cert_count INTEGER;
BEGIN
  -- Determine the candidate_id based on trigger source
  IF TG_TABLE_NAME = 'certifications' THEN
    v_candidate_id := COALESCE(NEW.candidate_id, OLD.candidate_id);
  ELSE
    v_candidate_id := COALESCE(NEW.candidate_id, OLD.candidate_id);
  END IF;

  -- Check if verification record exists
  IF NOT EXISTS (SELECT 1 FROM candidate_verifications WHERE candidate_id = v_candidate_id) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Get current verification statuses
  SELECT 
    identity_status IN ('green', 'amber'),
    rtw_status IN ('green', 'amber'),
    logistics_status IN ('green', 'amber')
  INTO v_identity_ok, v_rtw_ok, v_logistics_ok
  FROM candidate_verifications
  WHERE candidate_id = v_candidate_id;

  -- Count verified/pending certifications
  SELECT COUNT(*) INTO v_cert_count
  FROM certifications
  WHERE candidate_id = v_candidate_id
    AND verification_status IN ('verified', 'pending');

  v_cert_ok := v_cert_count > 0;

  -- Calculate HR-Ready status
  v_hr_ready := COALESCE(v_identity_ok, FALSE) 
    AND v_cert_ok 
    AND COALESCE(v_rtw_ok, FALSE) 
    AND COALESCE(v_logistics_ok, FALSE);

  -- Update the verification record
  UPDATE candidate_verifications
  SET hr_ready = v_hr_ready, updated_at = NOW()
  WHERE candidate_id = v_candidate_id
    AND (hr_ready IS DISTINCT FROM v_hr_ready);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger on certifications table (INSERT, UPDATE, DELETE)
DROP TRIGGER IF EXISTS trigger_recalculate_hr_ready_on_cert ON certifications;
CREATE TRIGGER trigger_recalculate_hr_ready_on_cert
  AFTER INSERT OR UPDATE OR DELETE ON certifications
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_hr_ready();

-- Trigger on candidate_verifications table (UPDATE of status fields)
DROP TRIGGER IF EXISTS trigger_recalculate_hr_ready_on_verification ON candidate_verifications;
CREATE TRIGGER trigger_recalculate_hr_ready_on_verification
  AFTER UPDATE OF identity_status, rtw_status, logistics_status ON candidate_verifications
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_hr_ready();