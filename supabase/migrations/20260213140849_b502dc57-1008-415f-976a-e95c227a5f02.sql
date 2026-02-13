
-- ============================================
-- CYDENA MARKETPLACE - Database Schema
-- ============================================

-- 1. Task Categories (seed data for marketplace specialisms)
CREATE TABLE public.task_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  requires_clearance TEXT DEFAULT 'none',
  min_certification_level TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Task categories are publicly readable" ON public.task_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage task categories" ON public.task_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Seed task categories
INSERT INTO public.task_categories (name, slug, description, icon, sort_order) VALUES
('Penetration Testing', 'pentest', 'Web app, network, infrastructure, and mobile penetration testing', 'Shield', 1),
('Red Team Operations', 'red-team', 'Adversary simulation, CBEST/TIBER assessments, social engineering', 'Target', 2),
('Incident Response', 'incident-response', 'Breach investigation, forensics, containment and recovery', 'AlertTriangle', 3),
('SOC Analysis', 'soc', 'Security monitoring, alert triage, threat hunting', 'Eye', 4),
('GRC & Compliance', 'grc', 'Risk assessments, audit preparation, policy development', 'ClipboardCheck', 5),
('Cloud Security', 'cloud-security', 'AWS/Azure/GCP security review, configuration audit', 'Cloud', 6),
('Application Security', 'appsec', 'Code review, SAST/DAST, secure development guidance', 'Code', 7),
('Threat Intelligence', 'threat-intel', 'OSINT, threat landscape analysis, IOC development', 'Search', 8),
('Security Architecture', 'architecture', 'Design review, zero trust implementation, network segmentation', 'Building', 9),
('Training & Awareness', 'training', 'Phishing simulations, security awareness, team upskilling', 'GraduationCap', 10),
('Digital Forensics', 'forensics', 'Evidence acquisition, analysis, expert witness', 'Microscope', 11),
('Vulnerability Management', 'vuln-management', 'Scanning, prioritisation, remediation guidance', 'Bug', 12);

-- 2. Extend candidate_profiles with marketplace fields
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS hourly_rate_gbp DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS day_rate_gbp DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'unavailable' CHECK (availability_status IN ('available', 'busy', 'unavailable', 'on_engagement')),
  ADD COLUMN IF NOT EXISTS available_from DATE,
  ADD COLUMN IF NOT EXISTS ir35_status TEXT CHECK (ir35_status IN ('inside', 'outside', 'not_applicable')),
  ADD COLUMN IF NOT EXISTS max_concurrent_engagements INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS total_engagements_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS response_time_hours INTEGER DEFAULT 24,
  ADD COLUMN IF NOT EXISTS is_marketplace_visible BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_mcp_bookable BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_api_bookable BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS marketplace_headline TEXT,
  ADD COLUMN IF NOT EXISTS industries TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tools TEXT[] DEFAULT '{}';

-- 3. Marketplace Engagements
CREATE TABLE public.marketplace_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  talent_id UUID NOT NULL REFERENCES public.profiles(id),
  category_id UUID REFERENCES public.task_categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  deliverables TEXT,
  source TEXT DEFAULT 'platform' CHECK (source IN ('platform', 'api', 'mcp', 'referral')),
  source_agent_id TEXT,
  source_agent_name TEXT,
  engagement_type TEXT NOT NULL CHECK (engagement_type IN ('hourly', 'daily', 'fixed', 'retainer')),
  estimated_hours DECIMAL(6,1),
  estimated_days INTEGER,
  start_date DATE,
  end_date DATE,
  agreed_rate_gbp DECIMAL(10,2) NOT NULL,
  total_estimated_gbp DECIMAL(10,2),
  platform_fee_percent DECIMAL(4,2) DEFAULT 15.00,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'declined', 'in_progress',
    'delivered', 'under_review', 'completed', 'disputed', 'cancelled'
  )),
  requires_nda BOOLEAN DEFAULT FALSE,
  nda_signed_at TIMESTAMPTZ,
  requires_clearance TEXT DEFAULT 'none',
  compliance_framework TEXT,
  client_rating DECIMAL(3,2),
  client_review TEXT,
  talent_rating DECIMAL(3,2),
  talent_review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.marketplace_engagements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties see own engagements" ON public.marketplace_engagements 
  FOR SELECT USING (client_id = auth.uid() OR talent_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients create engagements" ON public.marketplace_engagements
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Parties update own engagements" ON public.marketplace_engagements
  FOR UPDATE USING (client_id = auth.uid() OR talent_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 4. Task Bounties
CREATE TABLE public.task_bounties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  category_id UUID REFERENCES public.task_categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  required_certifications TEXT[] DEFAULT '{}',
  required_clearance TEXT DEFAULT 'none',
  location_requirement TEXT CHECK (location_requirement IN ('remote', 'onsite', 'hybrid')),
  location_city TEXT,
  budget_min_gbp DECIMAL(10,2),
  budget_max_gbp DECIMAL(10,2),
  engagement_type TEXT NOT NULL CHECK (engagement_type IN ('hourly', 'daily', 'fixed')),
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('critical', 'urgent', 'normal', 'flexible')),
  start_date DATE,
  deadline DATE,
  max_applicants INTEGER DEFAULT 10,
  current_applicants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'in_progress', 'completed', 'expired', 'cancelled')),
  source TEXT DEFAULT 'platform' CHECK (source IN ('platform', 'api', 'mcp')),
  source_agent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

ALTER TABLE public.task_bounties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bounties are publicly readable" ON public.task_bounties FOR SELECT USING (true);
CREATE POLICY "Clients manage own bounties" ON public.task_bounties FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Clients update own bounties" ON public.task_bounties FOR UPDATE USING (client_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients delete own bounties" ON public.task_bounties FOR DELETE USING (client_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 5. Bounty Applications
CREATE TABLE public.bounty_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id UUID NOT NULL REFERENCES public.task_bounties(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES public.profiles(id),
  proposed_rate_gbp DECIMAL(10,2),
  cover_message TEXT,
  estimated_completion TEXT,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bounty_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Talent sees own applications" ON public.bounty_applications
  FOR SELECT USING (talent_id = auth.uid() OR bounty_id IN (SELECT id FROM public.task_bounties WHERE client_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Talent creates applications" ON public.bounty_applications
  FOR INSERT WITH CHECK (talent_id = auth.uid());

CREATE POLICY "Parties update applications" ON public.bounty_applications
  FOR UPDATE USING (talent_id = auth.uid() OR bounty_id IN (SELECT id FROM public.task_bounties WHERE client_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- 6. Marketplace API Keys
CREATE TABLE public.marketplace_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{read}',
  rate_limit_per_hour INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.marketplace_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages api keys" ON public.marketplace_api_keys FOR ALL USING (profile_id = auth.uid());

-- 7. API Request Log
CREATE TABLE public.marketplace_api_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.marketplace_api_keys(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  source TEXT CHECK (source IN ('api', 'mcp')),
  agent_identifier TEXT,
  request_body JSONB,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.marketplace_api_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Key owners see own logs" ON public.marketplace_api_log 
  FOR SELECT USING (api_key_id IN (SELECT id FROM public.marketplace_api_keys WHERE profile_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System inserts logs" ON public.marketplace_api_log FOR INSERT WITH CHECK (true);

-- 8. Engagement Messages
CREATE TABLE public.engagement_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES public.marketplace_engagements(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  is_system_message BOOLEAN DEFAULT FALSE,
  is_from_agent BOOLEAN DEFAULT FALSE,
  agent_identifier TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.engagement_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants see engagement messages" ON public.engagement_messages
  FOR SELECT USING (
    engagement_id IN (
      SELECT id FROM public.marketplace_engagements 
      WHERE client_id = auth.uid() OR talent_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Participants send messages" ON public.engagement_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND engagement_id IN (
      SELECT id FROM public.marketplace_engagements 
      WHERE client_id = auth.uid() OR talent_id = auth.uid()
    )
  );

-- Enable realtime for engagement messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.engagement_messages;

-- Trigger for updated_at on engagements
CREATE TRIGGER update_marketplace_engagements_updated_at
  BEFORE UPDATE ON public.marketplace_engagements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pipeline_candidates_updated_at();

-- Index for performance
CREATE INDEX idx_task_bounties_status ON public.task_bounties(status);
CREATE INDEX idx_task_bounties_category ON public.task_bounties(category_id);
CREATE INDEX idx_marketplace_engagements_client ON public.marketplace_engagements(client_id);
CREATE INDEX idx_marketplace_engagements_talent ON public.marketplace_engagements(talent_id);
CREATE INDEX idx_bounty_applications_bounty ON public.bounty_applications(bounty_id);
CREATE INDEX idx_candidate_profiles_marketplace ON public.candidate_profiles(is_marketplace_visible) WHERE is_marketplace_visible = true;
