-- Populate skills table with common cybersecurity skills
INSERT INTO public.skills (name, category) VALUES
  -- Technical Skills
  ('Penetration Testing', 'Technical'),
  ('Vulnerability Assessment', 'Technical'),
  ('Network Security', 'Technical'),
  ('Cloud Security', 'Technical'),
  ('Application Security', 'Technical'),
  ('Security Operations', 'Technical'),
  ('Incident Response', 'Technical'),
  ('Threat Hunting', 'Technical'),
  ('Malware Analysis', 'Technical'),
  ('Digital Forensics', 'Technical'),
  ('Risk Assessment', 'Technical'),
  ('Security Architecture', 'Technical'),
  ('Identity and Access Management', 'Technical'),
  ('Encryption', 'Technical'),
  ('SIEM', 'Technical'),
  ('Firewall Management', 'Technical'),
  ('Intrusion Detection', 'Technical'),
  ('Security Auditing', 'Technical'),
  ('Compliance', 'Governance'),
  ('GRC', 'Governance'),
  ('ISO 27001', 'Governance'),
  ('NIST', 'Governance'),
  ('PCI DSS', 'Governance'),
  ('GDPR', 'Governance'),
  ('SOC 2', 'Governance'),
  ('HIPAA', 'Governance'),
  -- Tools & Platforms
  ('Wireshark', 'Tools'),
  ('Metasploit', 'Tools'),
  ('Burp Suite', 'Tools'),
  ('Nmap', 'Tools'),
  ('Splunk', 'Tools'),
  ('AWS Security', 'Cloud'),
  ('Azure Security', 'Cloud'),
  ('GCP Security', 'Cloud'),
  ('Linux Security', 'Operating Systems'),
  ('Windows Security', 'Operating Systems'),
  ('Python', 'Programming'),
  ('PowerShell', 'Programming'),
  ('Bash', 'Programming')
ON CONFLICT DO NOTHING;

-- Auto-assign skills based on certifications
DO $$
DECLARE
  candidate_record RECORD;
  cert_record RECORD;
BEGIN
  -- Loop through all candidates with certifications
  FOR candidate_record IN 
    SELECT DISTINCT candidate_id FROM certifications
  LOOP
    -- Get their certifications
    FOR cert_record IN 
      SELECT name, issuer FROM certifications WHERE candidate_id = candidate_record.candidate_id
    LOOP
      -- Assign skills based on certification type
      
      -- CISSP holders get governance, risk, compliance, architecture
      IF cert_record.name ILIKE '%CISSP%' THEN
        INSERT INTO candidate_skills (candidate_id, skill_id, proficiency_level, years_experience)
        SELECT candidate_record.candidate_id, id, 4, 5
        FROM skills 
        WHERE name IN ('GRC', 'Risk Assessment', 'Security Architecture', 'Compliance', 'ISO 27001', 'NIST')
        ON CONFLICT DO NOTHING;
      END IF;
      
      -- OSCP/CEH holders get pentesting skills
      IF cert_record.name ILIKE '%OSCP%' OR cert_record.name ILIKE '%CEH%' THEN
        INSERT INTO candidate_skills (candidate_id, skill_id, proficiency_level, years_experience)
        SELECT candidate_record.candidate_id, id, 5, 3
        FROM skills 
        WHERE name IN ('Penetration Testing', 'Vulnerability Assessment', 'Metasploit', 'Burp Suite', 'Nmap', 'Python')
        ON CONFLICT DO NOTHING;
      END IF;
      
      -- GPEN holders get advanced pentesting
      IF cert_record.name ILIKE '%GPEN%' THEN
        INSERT INTO candidate_skills (candidate_id, skill_id, proficiency_level, years_experience)
        SELECT candidate_record.candidate_id, id, 5, 4
        FROM skills 
        WHERE name IN ('Penetration Testing', 'Network Security', 'Metasploit', 'Wireshark')
        ON CONFLICT DO NOTHING;
      END IF;
      
      -- GCIA/CySA+ holders get detection/analysis skills
      IF cert_record.name ILIKE '%GCIA%' OR cert_record.name ILIKE '%CySA%' THEN
        INSERT INTO candidate_skills (candidate_id, skill_id, proficiency_level, years_experience)
        SELECT candidate_record.candidate_id, id, 4, 3
        FROM skills 
        WHERE name IN ('Incident Response', 'Threat Hunting', 'SIEM', 'Intrusion Detection', 'Wireshark', 'Splunk')
        ON CONFLICT DO NOTHING;
      END IF;
      
      -- Security+ holders get foundational skills
      IF cert_record.name ILIKE '%Security+%' THEN
        INSERT INTO candidate_skills (candidate_id, skill_id, proficiency_level, years_experience)
        SELECT candidate_record.candidate_id, id, 3, 2
        FROM skills 
        WHERE name IN ('Network Security', 'Security Operations', 'Firewall Management', 'Encryption')
        ON CONFLICT DO NOTHING;
      END IF;
      
      -- CCSP holders get cloud security
      IF cert_record.name ILIKE '%CCSP%' THEN
        INSERT INTO candidate_skills (candidate_id, skill_id, proficiency_level, years_experience)
        SELECT candidate_record.candidate_id, id, 4, 3
        FROM skills 
        WHERE name IN ('Cloud Security', 'AWS Security', 'Azure Security', 'Security Architecture')
        ON CONFLICT DO NOTHING;
      END IF;
      
      -- CISM holders get GRC skills
      IF cert_record.name ILIKE '%CISM%' THEN
        INSERT INTO candidate_skills (candidate_id, skill_id, proficiency_level, years_experience)
        SELECT candidate_record.candidate_id, id, 4, 5
        FROM skills 
        WHERE name IN ('GRC', 'Risk Assessment', 'Compliance', 'Security Auditing', 'ISO 27001')
        ON CONFLICT DO NOTHING;
      END IF;
      
      -- GCFE holders get forensics skills
      IF cert_record.name ILIKE '%GCFE%' OR cert_record.name ILIKE '%CHFI%' THEN
        INSERT INTO candidate_skills (candidate_id, skill_id, proficiency_level, years_experience)
        SELECT candidate_record.candidate_id, id, 4, 3
        FROM skills 
        WHERE name IN ('Digital Forensics', 'Malware Analysis', 'Incident Response')
        ON CONFLICT DO NOTHING;
      END IF;
      
    END LOOP;
  END LOOP;
END $$;

-- For profiles without usernames, generate unique anonymous usernames
UPDATE profiles
SET username = 'candidate_' || SUBSTRING(id::text, 1, 8)
WHERE username IS NULL;