-- Create trigger to auto-unlock certification badges when certifications are verified
CREATE TRIGGER trigger_auto_unlock_cert_badges
  AFTER INSERT OR UPDATE OF verification_status ON certifications
  FOR EACH ROW
  WHEN (NEW.verification_status = 'verified')
  EXECUTE FUNCTION auto_unlock_certification_badges();

-- Add comment for documentation
COMMENT ON TRIGGER trigger_auto_unlock_cert_badges ON certifications IS 
  'Automatically unlocks certification badges when a certification is verified';