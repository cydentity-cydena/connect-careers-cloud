-- Add username_changes tracking to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username_changes INTEGER DEFAULT 0;