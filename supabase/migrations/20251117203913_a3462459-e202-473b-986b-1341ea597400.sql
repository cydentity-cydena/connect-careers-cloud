-- Step 1: Add 'ctf' to achievement_category enum
ALTER TYPE public.achievement_category ADD VALUE IF NOT EXISTS 'ctf';