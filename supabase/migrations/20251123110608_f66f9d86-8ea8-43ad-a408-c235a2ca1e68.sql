-- Create storage bucket for course completion proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-proofs', 'course-proofs', true);