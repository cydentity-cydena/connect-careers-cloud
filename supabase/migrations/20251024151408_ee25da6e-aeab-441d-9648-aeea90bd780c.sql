-- Add cv_url column to candidate_pipeline table
ALTER TABLE candidate_pipeline
ADD COLUMN cv_url TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN candidate_pipeline.cv_url IS 'URL to the candidate CV/resume stored in Supabase storage';
