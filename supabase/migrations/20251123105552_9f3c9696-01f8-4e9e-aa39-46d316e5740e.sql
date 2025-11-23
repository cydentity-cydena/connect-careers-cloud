-- Add PCI QSA status and enhanced clearance tracking to candidate_verifications
ALTER TABLE candidate_verifications 
ADD COLUMN IF NOT EXISTS pci_qsa_status text,
ADD COLUMN IF NOT EXISTS pci_qsa_verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS pci_qsa_company text,
ADD COLUMN IF NOT EXISTS clearance_level text,
ADD COLUMN IF NOT EXISTS clearance_verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS clearance_expires_at timestamp with time zone;

-- Add comment for clarity
COMMENT ON COLUMN candidate_verifications.pci_qsa_status IS 'PCI QSA certification status: active, expired, or null';
COMMENT ON COLUMN candidate_verifications.clearance_level IS 'Security clearance level: DV, SC, CTC, BPSS, or other government clearance';

-- Create index for faster clearance/QSA searches
CREATE INDEX IF NOT EXISTS idx_candidate_verifications_clearance ON candidate_verifications(clearance_level) WHERE clearance_level IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidate_verifications_pci_qsa ON candidate_verifications(pci_qsa_status) WHERE pci_qsa_status = 'active';