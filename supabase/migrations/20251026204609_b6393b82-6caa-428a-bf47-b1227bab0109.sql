-- Add is_starred column to applications table for favorites
ALTER TABLE applications ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false;