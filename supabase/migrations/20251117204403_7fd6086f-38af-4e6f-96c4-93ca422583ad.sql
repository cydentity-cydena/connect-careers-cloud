-- Add reward rule for CTF challenges
INSERT INTO public.reward_rules (code, amount, description, active) 
VALUES ('CTF_SOLVED', 0, 'Completing a CTF challenge (points vary by difficulty)', true)
ON CONFLICT (code) DO NOTHING;