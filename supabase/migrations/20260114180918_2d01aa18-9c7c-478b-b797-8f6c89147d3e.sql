-- Add admin_comment column to verification_requests table
ALTER TABLE public.verification_requests 
ADD COLUMN IF NOT EXISTS admin_comment TEXT;