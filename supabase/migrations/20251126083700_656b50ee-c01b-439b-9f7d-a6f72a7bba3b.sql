-- Add columns to support CTF challenges in security_iq_attempts
ALTER TABLE security_iq_attempts 
ADD COLUMN IF NOT EXISTS submitted_flag TEXT,
ADD COLUMN IF NOT EXISTS challenge_id UUID REFERENCES ctf_challenges(id);