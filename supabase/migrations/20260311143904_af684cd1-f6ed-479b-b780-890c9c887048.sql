INSERT INTO public.ctf_challenges (id, title, description, category, difficulty, flag, points, is_active, visibility)
VALUES (
  'c3a91f04-7b2e-4d8a-b5c1-9e6f3a8d2b47',
  'OSINT Reconnaissance Challenge',
  'Analyse WHOIS records, DNS zone files, and email headers to extract leaked internal infrastructure details from Cydena Dynamics.',
  'OSINT',
  'intermediate',
  'FLAG{build02.cydena.local}',
  200,
  true,
  'course_only'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  flag = EXCLUDED.flag,
  points = EXCLUDED.points;

INSERT INTO public.course_module_challenges (module_id, challenge_id, sort_order)
VALUES ('5d588242-78fa-4cf1-b23d-aa5cc21c8ef1', 'c3a91f04-7b2e-4d8a-b5c1-9e6f3a8d2b47', 0)
ON CONFLICT DO NOTHING;