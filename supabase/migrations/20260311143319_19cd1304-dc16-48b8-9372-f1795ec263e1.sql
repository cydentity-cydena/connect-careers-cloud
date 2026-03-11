
INSERT INTO public.ctf_challenges (title, category, difficulty, points, description, flag, hints, is_active)
VALUES (
  'Windows Security: NTLM Hash Capture & Crack',
  'OS Security',
  'intermediate',
  150,
  'You have network access to an internal Windows environment. Use Responder to poison LLMNR/NBT-NS requests and capture NTLMv2 credentials, then crack the hash using Hashcat. This simulates a real-world internal network attack.',
  'FLAG{ntlmv2_captured_and_cracked_with_responder_and_hashcat}',
  '[{"cost": 15, "hint": "Start by running Responder with the right interface and flags."}, {"cost": 30, "hint": "Once you capture the hash, save it to a file before cracking. NetNTLMv2 uses hashcat mode 5600."}]'::jsonb,
  true
);
