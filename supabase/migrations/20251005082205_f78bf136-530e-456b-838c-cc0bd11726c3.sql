-- Add community_points column to candidate_xp
ALTER TABLE public.candidate_xp
ADD COLUMN community_points integer NOT NULL DEFAULT 0;

-- Add community_level column
ALTER TABLE public.candidate_xp
ADD COLUMN community_level integer NOT NULL DEFAULT 1;

-- Create community_activities table to track what users do
CREATE TABLE public.community_activities (
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
CREATE TABLE public.peer_endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endorsement_type text NOT NULL, -- 'helpful', 'mentor', 'knowledgeable', etc.
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(from_user_id, to_user_id, endorsement_type)
);

-- Enable RLS
ALTER TABLE public.peer_endorsements ENABLE ROW LEVEL SECURITY;

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

-- Add new community reward rules
INSERT INTO public.reward_rules (code, amount, description, active) VALUES
('PEER_ENDORSEMENT', 50, 'Received a peer endorsement', true),
('HELPED_CANDIDATE', 25, 'Helped another candidate', true),
('MENTOR_SESSION', 100, 'Completed a mentoring session', true),
('FORUM_ANSWER', 15, 'Answered a community question', true),
('RESOURCE_SHARE', 20, 'Shared a helpful resource', true);

-- Add community-specific achievements
INSERT INTO public.achievements (name, description, icon, category, requirement_value, xp_reward) VALUES
('Community Helper', 'Helped 10 other candidates', '🤝', 'community', 10, 100),
('Mentor', 'Completed 5 mentoring sessions', '👨‍🏫', 'community', 5, 250),
('Knowledge Sharer', 'Shared 20 helpful resources', '📚', 'community', 20, 150),
('Rising Star', 'Received 25 peer endorsements', '⭐', 'community', 25, 200),
('Community Leader', 'Reached 1000 community points', '👑', 'community', 1000, 500);

-- Update the award_points function to handle community points
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