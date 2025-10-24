-- Add desired_job_title field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN desired_job_title text;