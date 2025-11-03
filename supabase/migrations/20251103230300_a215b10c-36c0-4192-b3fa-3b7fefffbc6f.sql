-- Add is_starred and notes columns to profile_unlocks table
ALTER TABLE profile_unlocks 
ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notes TEXT;