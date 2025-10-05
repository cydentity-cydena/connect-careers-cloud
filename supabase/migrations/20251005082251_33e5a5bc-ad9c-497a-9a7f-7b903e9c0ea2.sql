-- Add community_level column (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidate_xp' AND column_name = 'community_level'
  ) THEN
    ALTER TABLE public.candidate_xp ADD COLUMN community_level integer NOT NULL DEFAULT 1;
  END IF;
END $$;

-- Create community_activities table to track what users do
CREATE TABLE IF NOT EXISTS public.community_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb,
  points_awarded integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own activities" ON public.community_activities;
DROP POLICY IF EXISTS "Users can view activities where they are target" ON public.community_activities;
DROP POLICY IF EXISTS "Service role can insert activities" ON public.community_activities;

-- Policies for community_activities
CREATE POLICY "Users can view own activities"
ON public.community_activities
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view activities where they are target"
ON public.community_activities
FOR SELECT
USING (auth.uid() = target_user_id);

CREATE POLICY "Service role can insert activities"
ON public.community_activities
FOR INSERT
WITH CHECK (false);

-- Create peer_endorsements table for community validation
CREATE TABLE IF NOT EXISTS public.peer_endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endorsement_type text NOT NULL,
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(from_user_id, to_user_id, endorsement_type)
);

-- Enable RLS
ALTER TABLE public.peer_endorsements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view endorsements they received" ON public.peer_endorsements;
DROP POLICY IF EXISTS "Users can view endorsements they gave" ON public.peer_endorsements;
DROP POLICY IF EXISTS "Users can create endorsements" ON public.peer_endorsements;
DROP POLICY IF EXISTS "Everyone can view all endorsements for public profiles" ON public.peer_endorsements;

-- Policies for peer_endorsements
CREATE POLICY "Users can view endorsements they received"
ON public.peer_endorsements
FOR SELECT
USING (auth.uid() = to_user_id);

CREATE POLICY "Users can view endorsements they gave"
ON public.peer_endorsements
FOR SELECT
USING (auth.uid() = from_user_id);

CREATE POLICY "Users can create endorsements"
ON public.peer_endorsements
FOR INSERT
WITH CHECK (auth.uid() = from_user_id AND from_user_id != to_user_id);

CREATE POLICY "Everyone can view all endorsements for public profiles"
ON public.peer_endorsements
FOR SELECT
USING (true);

-- Add new community reward rules (only if they don't exist)
INSERT INTO public.reward_rules (code, amount, description, active)
SELECT 'PEER_ENDORSEMENT', 50, 'Received a peer endorsement', true
WHERE NOT EXISTS (SELECT 1 FROM public.reward_rules WHERE code = 'PEER_ENDORSEMENT');

INSERT INTO public.reward_rules (code, amount, description, active)
SELECT 'HELPED_CANDIDATE', 25, 'Helped another candidate', true
WHERE NOT EXISTS (SELECT 1 FROM public.reward_rules WHERE code = 'HELPED_CANDIDATE');

INSERT INTO public.reward_rules (code, amount, description, active)
SELECT 'MENTOR_SESSION', 100, 'Completed a mentoring session', true
WHERE NOT EXISTS (SELECT 1 FROM public.reward_rules WHERE code = 'MENTOR_SESSION');

INSERT INTO public.reward_rules (code, amount, description, active)
SELECT 'FORUM_ANSWER', 15, 'Answered a community question', true
WHERE NOT EXISTS (SELECT 1 FROM public.reward_rules WHERE code = 'FORUM_ANSWER');

INSERT INTO public.reward_rules (code, amount, description, active)
SELECT 'RESOURCE_SHARE', 20, 'Shared a helpful resource', true
WHERE NOT EXISTS (SELECT 1 FROM public.reward_rules WHERE code = 'RESOURCE_SHARE');

-- Add community-specific achievements
INSERT INTO public.achievements (name, description, icon, category, requirement_value, xp_reward)
SELECT 'Community Helper', 'Helped 10 other candidates', '🤝', 'community', 10, 100
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Community Helper');

INSERT INTO public.achievements (name, description, icon, category, requirement_value, xp_reward)
SELECT 'Mentor', 'Completed 5 mentoring sessions', '👨‍🏫', 'community', 5, 250
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Mentor');

INSERT INTO public.achievements (name, description, icon, category, requirement_value, xp_reward)
SELECT 'Knowledge Sharer', 'Shared 20 helpful resources', '📚', 'community', 20, 150
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Knowledge Sharer');

INSERT INTO public.achievements (name, description, icon, category, requirement_value, xp_reward)
SELECT 'Rising Star', 'Received 25 peer endorsements', '⭐', 'community', 25, 200
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Rising Star');

INSERT INTO public.achievements (name, description, icon, category, requirement_value, xp_reward)
SELECT 'Community Leader', 'Reached 1000 community points', '👑', 'community', 1000, 500
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Community Leader');

-- Create function to handle community points
CREATE OR REPLACE FUNCTION public.award_community_points(
  p_candidate_id uuid,
  p_code text,
  p_meta jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rule reward_rules;
  v_new_balance integer;
  v_reward_id uuid;
BEGIN
  -- Get the reward rule
  SELECT * INTO v_rule
  FROM reward_rules
  WHERE code = p_code AND active = true;

  IF v_rule IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Rule not found or inactive');
  END IF;

  -- Insert reward point
  INSERT INTO reward_points (candidate_id, type, amount, meta)
  VALUES (p_candidate_id, p_code, v_rule.amount, p_meta)
  RETURNING id INTO v_reward_id;

  -- Update candidate community points
  UPDATE candidate_xp
  SET 
    community_points = community_points + v_rule.amount,
    updated_at = now()
  WHERE candidate_id = p_candidate_id
  RETURNING community_points INTO v_new_balance;

  -- Return success with new balance
  RETURN jsonb_build_object(
    'success', true,
    'reward_id', v_reward_id,
    'amount', v_rule.amount,
    'new_balance', v_new_balance
  );
END;
$$;