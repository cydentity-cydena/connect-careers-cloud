-- Add work_mode column to jobs table
ALTER TABLE jobs ADD COLUMN work_mode text;

-- Update existing jobs based on remote_allowed
UPDATE jobs 
SET work_mode = CASE 
  WHEN remote_allowed = true THEN 'remote'
  WHEN remote_allowed = false THEN 'on-site'
  ELSE 'on-site'
END;

-- Set default and add check constraint
ALTER TABLE jobs 
  ALTER COLUMN work_mode SET DEFAULT 'on-site',
  ADD CONSTRAINT work_mode_check CHECK (work_mode IN ('on-site', 'remote', 'hybrid'));