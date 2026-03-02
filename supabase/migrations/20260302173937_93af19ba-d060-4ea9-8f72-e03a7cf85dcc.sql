-- Add visibility column to ctf_challenges
-- Values: 'public' (main CTF page only), 'event_only' (only in assigned events), 'both' (everywhere)
ALTER TABLE public.ctf_challenges 
ADD COLUMN visibility text NOT NULL DEFAULT 'both' 
CHECK (visibility IN ('public', 'event_only', 'both'));

-- Update the public view to exclude event_only challenges
DROP VIEW IF EXISTS public.ctf_challenges_public;
CREATE VIEW public.ctf_challenges_public
WITH (security_invoker = true)
AS
SELECT id, title, description, category, difficulty, points, hints, file_url, file_name
FROM public.ctf_challenges
WHERE is_active = true
AND visibility IN ('public', 'both');