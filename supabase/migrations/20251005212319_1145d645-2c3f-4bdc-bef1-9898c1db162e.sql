-- Add usage tracking columns to employer_credits
ALTER TABLE employer_credits 
ADD COLUMN IF NOT EXISTS credits_used INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS annual_allocation INTEGER,
ADD COLUMN IF NOT EXISTS allocation_reset_date TIMESTAMP WITH TIME ZONE;

-- Add comment explaining the columns
COMMENT ON COLUMN employer_credits.credits IS 'Current available credits balance';
COMMENT ON COLUMN employer_credits.credits_used IS 'Total credits used from current allocation';
COMMENT ON COLUMN employer_credits.annual_allocation IS 'Annual subscription allocation (null for pay-as-you-go)';
COMMENT ON COLUMN employer_credits.allocation_reset_date IS 'Date when annual allocation resets';
