
INSERT INTO public.ctf_challenges (title, category, difficulty, points, description, flag, hints, is_active)
VALUES (
  'Client Brief: Professional Practice',
  'Professional Practice',
  'beginner',
  100,
  'Review the penetration testing client brief from PENTEST LTD and answer questions about scope boundaries, legal authorizations, and risk acknowledgments. Attention to detail is critical — one wrong answer and you''ll need to try again.',
  'FLAG{scope_boundaries_verified_and_risks_acknowledged}',
  '[{"cost": 10, "hint": "Read every section of the brief carefully, including the risk acknowledgment."}, {"cost": 20, "hint": "Pay close attention to what is explicitly listed vs what is not mentioned."}]'::jsonb,
  true
);
