-- Remove duplicate skill pathways using a CTE
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY name, category, level ORDER BY created_at) as row_num
  FROM skill_pathways
)
DELETE FROM skill_pathways 
WHERE id IN (SELECT id FROM duplicates WHERE row_num > 1);

-- Create pathway_courses junction table
CREATE TABLE IF NOT EXISTS pathway_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id UUID NOT NULL REFERENCES skill_pathways(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES partner_courses(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL DEFAULT 1,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(pathway_id, course_id)
);

-- Enable RLS
ALTER TABLE pathway_courses ENABLE ROW LEVEL SECURITY;

-- Pathway courses viewable by all
CREATE POLICY "Pathway courses viewable by all"
  ON pathway_courses
  FOR SELECT
  USING (true);

-- Admins can manage pathway courses
CREATE POLICY "Admins can manage pathway courses"
  ON pathway_courses
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create index for better query performance
CREATE INDEX idx_pathway_courses_pathway ON pathway_courses(pathway_id);
CREATE INDEX idx_pathway_courses_course ON pathway_courses(course_id);