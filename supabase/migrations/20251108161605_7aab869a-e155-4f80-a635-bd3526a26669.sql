-- Create badge_types table for available badges
CREATE TABLE public.badge_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  category TEXT NOT NULL, -- 'certification', 'level', 'achievement', 'platform'
  unlock_criteria JSONB NOT NULL, -- { "type": "certification", "certifications": ["Security+", "OSCP"], "level_min": 5 }
  rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_badges table for tracking unlocked badges
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badge_types(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_id UUID, -- Reference to certification, achievement, etc that unlocked it
  UNIQUE(user_id, badge_id)
);

-- Add selected badges to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS selected_badge_id UUID REFERENCES badge_types(id),
ADD COLUMN IF NOT EXISTS selected_avatar_frame TEXT; -- 'bronze', 'silver', 'gold', 'platinum', 'cert_oscp', etc

-- Enable RLS
ALTER TABLE public.badge_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badge_types
CREATE POLICY "Everyone can view active badges"
ON public.badge_types
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage badges"
ON public.badge_types
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_badges
CREATE POLICY "Users can view own badges"
ON public.user_badges
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view others' badges"
ON public.user_badges
FOR SELECT
USING (true);

CREATE POLICY "Service role can insert badges"
ON public.user_badges
FOR INSERT
WITH CHECK (false); -- Only via trigger or edge function

CREATE POLICY "Admins can manage user badges"
ON public.user_badges
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to check if user should unlock badge
CREATE OR REPLACE FUNCTION public.check_badge_unlock(p_user_id UUID, p_badge_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_criteria JSONB;
  v_criteria_type TEXT;
  v_required_certs TEXT[];
  v_required_level INTEGER;
  v_user_level INTEGER;
  v_user_has_certs BOOLEAN;
BEGIN
  -- Get badge criteria
  SELECT unlock_criteria INTO v_criteria
  FROM badge_types
  WHERE id = p_badge_id;
  
  v_criteria_type := v_criteria->>'type';
  
  -- Check certification-based unlock
  IF v_criteria_type = 'certification' THEN
    v_required_certs := ARRAY(SELECT jsonb_array_elements_text(v_criteria->'certifications'));
    
    SELECT EXISTS (
      SELECT 1 
      FROM certifications c
      WHERE c.candidate_id = p_user_id
      AND c.name = ANY(v_required_certs)
      AND c.verification_status = 'verified'
    ) INTO v_user_has_certs;
    
    RETURN v_user_has_certs;
  END IF;
  
  -- Check level-based unlock
  IF v_criteria_type = 'level' THEN
    v_required_level := (v_criteria->>'level_min')::INTEGER;
    
    SELECT level INTO v_user_level
    FROM candidate_xp
    WHERE candidate_id = p_user_id;
    
    RETURN COALESCE(v_user_level, 0) >= v_required_level;
  END IF;
  
  -- Check platform-based unlock (TryHackMe, HackTheBox)
  IF v_criteria_type = 'platform' THEN
    -- Check based on platform stats in profiles
    RETURN true; -- Simplified for now
  END IF;
  
  RETURN false;
END;
$$;

-- Trigger to auto-unlock badges when certifications are verified
CREATE OR REPLACE FUNCTION public.auto_unlock_certification_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge RECORD;
BEGIN
  -- Only proceed if certification is newly verified
  IF NEW.verification_status = 'verified' AND (OLD.verification_status IS NULL OR OLD.verification_status != 'verified') THEN
    
    -- Find all badges that should unlock for this certification
    FOR v_badge IN 
      SELECT id 
      FROM badge_types 
      WHERE is_active = true 
      AND category = 'certification'
      AND unlock_criteria->>'type' = 'certification'
      AND NEW.name = ANY(ARRAY(SELECT jsonb_array_elements_text(unlock_criteria->'certifications')))
    LOOP
      -- Insert badge if not already unlocked
      INSERT INTO user_badges (user_id, badge_id, source_id)
      VALUES (NEW.candidate_id, v_badge.id, NEW.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_unlock_certification_badges
AFTER INSERT OR UPDATE ON certifications
FOR EACH ROW
EXECUTE FUNCTION auto_unlock_certification_badges();

-- Trigger to auto-unlock level badges
CREATE OR REPLACE FUNCTION public.auto_unlock_level_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_badge RECORD;
BEGIN
  -- Only proceed if level increased
  IF NEW.level > COALESCE(OLD.level, 0) THEN
    
    -- Find all badges that should unlock at this level
    FOR v_badge IN 
      SELECT id 
      FROM badge_types 
      WHERE is_active = true 
      AND category = 'level'
      AND (unlock_criteria->>'level_min')::INTEGER <= NEW.level
    LOOP
      -- Insert badge if not already unlocked
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (NEW.candidate_id, v_badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_unlock_level_badges
AFTER UPDATE ON candidate_xp
FOR EACH ROW
EXECUTE FUNCTION auto_unlock_level_badges();

-- Insert starter badges
INSERT INTO badge_types (name, description, category, unlock_criteria, rarity, display_order) VALUES
-- Certification Badges
('Security+ Master', 'Verified CompTIA Security+ certification holder', 'certification', '{"type": "certification", "certifications": ["Security+", "CompTIA Security+"]}', 'rare', 100),
('OSCP Elite', 'Verified OSCP certification - Offensive Security Certified Professional', 'certification', '{"type": "certification", "certifications": ["OSCP", "Offensive Security Certified Professional"]}', 'legendary', 200),
('CEH Expert', 'Verified Certified Ethical Hacker', 'certification', '{"type": "certification", "certifications": ["CEH", "Certified Ethical Hacker"]}', 'epic', 150),
('CISSP Professional', 'Verified CISSP certification holder', 'certification', '{"type": "certification", "certifications": ["CISSP"]}', 'legendary', 210),
('Cloud Security Specialist', 'Verified cloud security certification (AWS/Azure/GCP)', 'certification', '{"type": "certification", "certifications": ["AWS Certified Security", "Azure Security Engineer", "Google Professional Cloud Security Engineer"]}', 'epic', 180),

-- Level Badges
('Rising Star', 'Reached Level 3', 'level', '{"type": "level", "level_min": 3}', 'common', 10),
('Skilled Professional', 'Reached Level 5', 'level', '{"type": "level", "level_min": 5}', 'rare', 20),
('Expert Practitioner', 'Reached Level 7', 'level', '{"type": "level", "level_min": 7}', 'epic', 30),
('Elite Guardian', 'Reached Level 10', 'level', '{"type": "level", "level_min": 10}', 'legendary', 40),

-- Platform Badges
('TryHackMe Champion', 'Top rank on TryHackMe platform', 'platform', '{"type": "platform", "platform": "tryhackme", "min_points": 10000}', 'epic', 300),
('HackTheBox Legend', 'Elite rank on HackTheBox', 'platform', '{"type": "platform", "platform": "hackthebox", "min_rank": "Guru"}', 'legendary', 310);

-- Create index for performance
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_badge_types_category ON badge_types(category);
CREATE INDEX idx_profiles_selected_badge ON profiles(selected_badge_id);