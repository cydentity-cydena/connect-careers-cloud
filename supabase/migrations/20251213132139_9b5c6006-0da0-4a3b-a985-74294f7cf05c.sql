-- Add Community Builder badge for referral program
INSERT INTO badge_types (
  id,
  name, 
  description, 
  category, 
  rarity, 
  unlock_criteria, 
  display_order, 
  is_active
) VALUES (
  'cb7d8e9f-1a2b-4c3d-5e6f-7a8b9c0d1e2f',
  'Community Builder',
  'Helped grow the Cydena community by referring 2+ members',
  'community',
  'epic',
  '{"type": "referral", "min_referrals": 2}'::jsonb,
  50,
  true
) ON CONFLICT (id) DO NOTHING;