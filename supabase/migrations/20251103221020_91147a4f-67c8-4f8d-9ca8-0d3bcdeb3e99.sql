
-- Add verification_status and source columns to certifications table
ALTER TABLE certifications 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Create index for faster queries on verification status
CREATE INDEX IF NOT EXISTS idx_certifications_verification_status 
ON certifications(verification_status);

-- Update existing certifications to have verified status
UPDATE certifications 
SET verification_status = 'verified' 
WHERE verification_status = 'pending';
