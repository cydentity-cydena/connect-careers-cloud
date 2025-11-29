-- Add human review fields to skills_assessments
ALTER TABLE public.skills_assessments
ADD COLUMN IF NOT EXISTS human_review_status text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS human_reviewed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS human_reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS review_notes text;

-- Add comment explaining values
COMMENT ON COLUMN public.skills_assessments.human_review_status IS 'Values: null (not reviewed), verified (human confirmed authentic), flagged (human confirmed AI-generated), cleared (human overrode AI flag)';

-- Allow admins and staff to update assessments for review
CREATE POLICY "Staff and admins can update assessments for review"
ON public.skills_assessments
FOR UPDATE
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));