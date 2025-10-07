-- Add visibility control to candidate_resumes table
ALTER TABLE candidate_resumes 
ADD COLUMN is_visible_to_employers boolean DEFAULT true;

-- Add comment for clarity
COMMENT ON COLUMN candidate_resumes.is_visible_to_employers IS 'Controls whether this resume is visible to employers who unlock the profile';
