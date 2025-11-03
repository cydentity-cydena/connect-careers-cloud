
-- Add proof document URLs to certifications table
ALTER TABLE certifications 
ADD COLUMN IF NOT EXISTS proof_document_urls JSONB DEFAULT '[]'::jsonb;

-- Create certification_verification_requests table
CREATE TABLE IF NOT EXISTS certification_verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_id UUID NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  document_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE certification_verification_requests ENABLE ROW LEVEL SECURITY;

-- Candidates can view their own requests
CREATE POLICY "Candidates can view own cert verification requests"
ON certification_verification_requests
FOR SELECT
USING (auth.uid() = candidate_id);

-- Candidates can create requests for their own certs
CREATE POLICY "Candidates can create cert verification requests"
ON certification_verification_requests
FOR INSERT
WITH CHECK (auth.uid() = candidate_id);

-- Staff and admins can view all requests
CREATE POLICY "Staff and admins can view all cert verification requests"
ON certification_verification_requests
FOR SELECT
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Staff and admins can update requests (approve/reject)
CREATE POLICY "Staff and admins can update cert verification requests"
ON certification_verification_requests
FOR UPDATE
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_cert_verification_requests_status ON certification_verification_requests(status);
CREATE INDEX idx_cert_verification_requests_candidate ON certification_verification_requests(candidate_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_cert_verification_requests_updated_at
BEFORE UPDATE ON certification_verification_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Function to notify admins of new cert verification requests
CREATE OR REPLACE FUNCTION notify_admins_cert_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record RECORD;
  cert_name TEXT;
BEGIN
  -- Get certification name
  SELECT name INTO cert_name
  FROM certifications
  WHERE id = NEW.certification_id;

  -- Notify all admins
  FOR admin_record IN 
    SELECT DISTINCT user_id 
    FROM user_roles 
    WHERE role IN ('admin'::app_role, 'staff'::app_role)
  LOOP
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      admin_record.user_id,
      'info',
      'New Certification Verification Request',
      'Verification request for "' || cert_name || '" needs review',
      '/admin'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger to notify admins when new verification request is created
CREATE TRIGGER on_cert_verification_request_created
AFTER INSERT ON certification_verification_requests
FOR EACH ROW
EXECUTE FUNCTION notify_admins_cert_verification();
