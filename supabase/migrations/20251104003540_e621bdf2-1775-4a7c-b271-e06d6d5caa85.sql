-- Add detailed stats columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS tryhackme_level INTEGER,
ADD COLUMN IF NOT EXISTS tryhackme_points INTEGER,
ADD COLUMN IF NOT EXISTS tryhackme_badges INTEGER,
ADD COLUMN IF NOT EXISTS hackthebox_points INTEGER,
ADD COLUMN IF NOT EXISTS hackthebox_rank_text TEXT,
ADD COLUMN IF NOT EXISTS hackthebox_user_owns INTEGER;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_platform_stats ON public.profiles(tryhackme_username, hackthebox_username) WHERE tryhackme_username IS NOT NULL OR hackthebox_username IS NOT NULL;
