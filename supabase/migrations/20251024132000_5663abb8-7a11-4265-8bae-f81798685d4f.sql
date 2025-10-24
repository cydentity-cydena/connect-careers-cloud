-- Add staff role to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'staff';

-- Create pipeline stages table
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  position integer NOT NULL,
  color text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default pipeline stages
INSERT INTO pipeline_stages (name, position, color) VALUES
  ('invited', 1, '#9fb0c6'),
  ('applied', 2, '#57c6ff'),
  ('verified', 3, '#7cf29a'),
  ('published', 4, '#a78bfa'),
  ('needs_info', 5, '#ffcc66')
ON CONFLICT (name) DO NOTHING;

-- Create candidate pipeline table
CREATE TABLE IF NOT EXISTS candidate_pipeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stage text NOT NULL DEFAULT 'invited',
  source text,
  desired_role text,
  sla_due_at timestamp with time zone,
  is_priority boolean DEFAULT false,
  is_founding_20 boolean DEFAULT false,
  staff_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  moved_to_stage_at timestamp with time zone DEFAULT now(),
  moved_by uuid REFERENCES profiles(id)
);

-- Create verification evidence table
CREATE TABLE IF NOT EXISTS verification_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid REFERENCES candidate_pipeline(id) ON DELETE CASCADE NOT NULL,
  evidence_type text NOT NULL,
  file_url text,
  external_url text,
  verified_by uuid REFERENCES profiles(id),
  verified_at timestamp with time zone,
  status text DEFAULT 'pending',
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create candidate notes table
CREATE TABLE IF NOT EXISTS candidate_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid REFERENCES candidate_pipeline(id) ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES profiles(id) NOT NULL,
  note_type text DEFAULT 'general',
  content text NOT NULL,
  is_internal boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create stage history table
CREATE TABLE IF NOT EXISTS pipeline_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid REFERENCES candidate_pipeline(id) ON DELETE CASCADE NOT NULL,
  from_stage text,
  to_stage text NOT NULL,
  moved_by uuid REFERENCES profiles(id) NOT NULL,
  reason text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stage_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pipeline_stages (viewable by all authenticated)
CREATE POLICY "Pipeline stages viewable by authenticated users"
  ON pipeline_stages FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for candidate_pipeline
CREATE POLICY "Staff and admins can view pipeline"
  ON candidate_pipeline FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff and admins can insert pipeline entries"
  ON candidate_pipeline FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff and admins can update pipeline"
  ON candidate_pipeline FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Candidates can view own pipeline entry"
  ON candidate_pipeline FOR SELECT
  TO authenticated
  USING (auth.uid() = candidate_id);

-- RLS Policies for verification_evidence
CREATE POLICY "Staff and admins can manage evidence"
  ON verification_evidence FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Candidates can view own evidence"
  ON verification_evidence FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM candidate_pipeline
    WHERE candidate_pipeline.id = verification_evidence.pipeline_id
    AND candidate_pipeline.candidate_id = auth.uid()
  ));

-- RLS Policies for candidate_notes
CREATE POLICY "Staff and admins can manage notes"
  ON candidate_notes FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for pipeline_stage_history
CREATE POLICY "Staff and admins can view stage history"
  ON pipeline_stage_history FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff and admins can insert stage history"
  ON pipeline_stage_history FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_candidate_pipeline_updated_at
  BEFORE UPDATE ON candidate_pipeline
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes for performance
CREATE INDEX idx_candidate_pipeline_stage ON candidate_pipeline(stage);
CREATE INDEX idx_candidate_pipeline_candidate ON candidate_pipeline(candidate_id);
CREATE INDEX idx_candidate_pipeline_sla ON candidate_pipeline(sla_due_at);
CREATE INDEX idx_verification_evidence_pipeline ON verification_evidence(pipeline_id);
CREATE INDEX idx_candidate_notes_pipeline ON candidate_notes(pipeline_id);
CREATE INDEX idx_pipeline_stage_history_pipeline ON pipeline_stage_history(pipeline_id);