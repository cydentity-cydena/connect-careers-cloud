-- Create enum for candidate activation status
CREATE TYPE candidate_activation_status AS ENUM ('unclaimed', 'invited', 'claimed', 'declined');

-- Table to track batch imports by recruiters
CREATE TABLE recruiter_candidate_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_name TEXT NOT NULL,
  import_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  total_candidates INTEGER NOT NULL DEFAULT 0,
  activated_candidates INTEGER NOT NULL DEFAULT 0,
  invited_candidates INTEGER NOT NULL DEFAULT 0,
  file_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table to track relationships between recruiters and candidates
CREATE TABLE recruiter_candidate_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  import_batch_id UUID REFERENCES recruiter_candidate_imports(id) ON DELETE SET NULL,
  activation_status candidate_activation_status NOT NULL DEFAULT 'unclaimed',
  invitation_sent_at TIMESTAMP WITH TIME ZONE,
  invitation_token TEXT UNIQUE,
  activated_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  recruiter_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(recruiter_id, candidate_id)
);

-- Add activation status to profiles (optional for tracking)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS imported_by_recruiter BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_claimed BOOLEAN DEFAULT TRUE;

-- Indexes for performance
CREATE INDEX idx_recruiter_imports_recruiter ON recruiter_candidate_imports(recruiter_id);
CREATE INDEX idx_recruiter_relationships_recruiter ON recruiter_candidate_relationships(recruiter_id);
CREATE INDEX idx_recruiter_relationships_candidate ON recruiter_candidate_relationships(candidate_id);
CREATE INDEX idx_recruiter_relationships_status ON recruiter_candidate_relationships(activation_status);
CREATE INDEX idx_recruiter_relationships_batch ON recruiter_candidate_relationships(import_batch_id);

-- Enable RLS
ALTER TABLE recruiter_candidate_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_candidate_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recruiter_candidate_imports
CREATE POLICY "Recruiters can view own imports"
  ON recruiter_candidate_imports FOR SELECT
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can create own imports"
  ON recruiter_candidate_imports FOR INSERT
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can update own imports"
  ON recruiter_candidate_imports FOR UPDATE
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can delete own imports"
  ON recruiter_candidate_imports FOR DELETE
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Admins can manage all imports"
  ON recruiter_candidate_imports FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for recruiter_candidate_relationships
CREATE POLICY "Recruiters can view own relationships"
  ON recruiter_candidate_relationships FOR SELECT
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can create own relationships"
  ON recruiter_candidate_relationships FOR INSERT
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can update own relationships"
  ON recruiter_candidate_relationships FOR UPDATE
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can delete own relationships"
  ON recruiter_candidate_relationships FOR DELETE
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Candidates can view relationships where they are the candidate"
  ON recruiter_candidate_relationships FOR SELECT
  USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can update their activation status"
  ON recruiter_candidate_relationships FOR UPDATE
  USING (auth.uid() = candidate_id);

CREATE POLICY "Admins can manage all relationships"
  ON recruiter_candidate_relationships FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to update import statistics
CREATE OR REPLACE FUNCTION update_import_batch_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the import batch statistics
  UPDATE recruiter_candidate_imports
  SET 
    activated_candidates = (
      SELECT COUNT(*) 
      FROM recruiter_candidate_relationships 
      WHERE import_batch_id = NEW.import_batch_id 
      AND activation_status = 'claimed'
    ),
    invited_candidates = (
      SELECT COUNT(*) 
      FROM recruiter_candidate_relationships 
      WHERE import_batch_id = NEW.import_batch_id 
      AND activation_status IN ('invited', 'claimed')
    ),
    updated_at = NOW()
  WHERE id = NEW.import_batch_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update import batch statistics
CREATE TRIGGER update_import_stats_trigger
AFTER INSERT OR UPDATE ON recruiter_candidate_relationships
FOR EACH ROW
WHEN (NEW.import_batch_id IS NOT NULL)
EXECUTE FUNCTION update_import_batch_stats();

-- Function to generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Update existing profiles RLS to allow recruiters to view their imported candidates
CREATE POLICY "Recruiters can view imported candidate profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recruiter_candidate_relationships
      WHERE candidate_id = profiles.id 
      AND recruiter_id = auth.uid()
    )
  );