-- Add skills platform profiles to candidate profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tryhackme_username text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hackthebox_username text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tryhackme_rank text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hackthebox_rank text;

-- Create skills assessments table
CREATE TABLE IF NOT EXISTS skills_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_type text NOT NULL, -- e.g., 'soc_analyst', 'penetration_tester', 'security_engineer'
  questions jsonb NOT NULL,
  answers jsonb NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  ai_feedback jsonb,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on skills assessments
ALTER TABLE skills_assessments ENABLE ROW LEVEL SECURITY;

-- Candidates can view their own assessments
CREATE POLICY "Candidates can view own assessments"
ON skills_assessments FOR SELECT
USING (auth.uid() = candidate_id);

-- Candidates can insert their own assessments
CREATE POLICY "Candidates can insert own assessments"
ON skills_assessments FOR INSERT
WITH CHECK (auth.uid() = candidate_id);

-- Employers with unlocked access can view assessments
CREATE POLICY "Employers with unlocked access can view assessments"
ON skills_assessments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profile_unlocks
    WHERE profile_unlocks.candidate_id = skills_assessments.candidate_id
    AND profile_unlocks.employer_id = auth.uid()
  )
);

-- Staff and admins can view all assessments
CREATE POLICY "Staff and admins can view assessments"
ON skills_assessments FOR SELECT
USING (
  has_role(auth.uid(), 'staff'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Add vendor certifications data
INSERT INTO skills (name, category) VALUES
  ('Splunk Core Certified User', 'Vendor Certification'),
  ('Splunk Enterprise Certified Admin', 'Vendor Certification'),
  ('Palo Alto Networks Certified Network Security Engineer (PCNSE)', 'Vendor Certification'),
  ('CrowdStrike Certified Falcon Administrator', 'Vendor Certification'),
  ('AWS Certified Security - Specialty', 'Vendor Certification'),
  ('Microsoft Certified: Security Operations Analyst Associate', 'Vendor Certification'),
  ('Microsoft Certified: Azure Security Engineer Associate', 'Vendor Certification'),
  ('Cisco Certified CyberOps Associate', 'Vendor Certification'),
  ('Fortinet NSE 4 FortiGate Security', 'Vendor Certification'),
  ('Check Point Certified Security Administrator (CCSA)', 'Vendor Certification')
ON CONFLICT DO NOTHING;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_skills_assessments_candidate ON skills_assessments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_skills_assessments_type ON skills_assessments(assessment_type);