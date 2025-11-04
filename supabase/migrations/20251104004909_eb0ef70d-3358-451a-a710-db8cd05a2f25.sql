-- Add HackTheBox API key column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS hackthebox_api_key TEXT;