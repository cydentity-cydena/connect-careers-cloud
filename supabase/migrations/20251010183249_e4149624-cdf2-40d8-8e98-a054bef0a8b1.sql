-- Ensure applications default to "applied" stage when created
ALTER TABLE applications 
  ALTER COLUMN stage SET DEFAULT 'applied'::pipeline_stage;

-- Add comment for clarity
COMMENT ON COLUMN applications.stage IS 'Pipeline stage - defaults to applied when candidate submits application';

-- Add index for faster pipeline queries
CREATE INDEX IF NOT EXISTS idx_applications_stage ON applications(stage);
CREATE INDEX IF NOT EXISTS idx_applications_job_stage ON applications(job_id, stage);