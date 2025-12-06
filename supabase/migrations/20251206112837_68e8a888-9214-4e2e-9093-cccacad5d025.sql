-- Add email notification preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_notifications boolean NOT NULL DEFAULT true;

-- Add comment explaining the column
COMMENT ON COLUMN public.profiles.email_notifications IS 'Whether user wants to receive email notifications like daily challenges';