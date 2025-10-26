
-- Update all USA-based candidates to UK locations
UPDATE profiles 
SET 
  location = CASE 
    WHEN location ILIKE '%San Francisco%' THEN 'London, UK'
    WHEN location ILIKE '%Los Angeles%' THEN 'Manchester, UK'
    WHEN location ILIKE '%Chicago%' THEN 'Birmingham, UK'
    WHEN location ILIKE '%New York%' THEN 'Leeds, UK'
    WHEN location ILIKE '%CA%' THEN 'Bristol, UK'
    WHEN location ILIKE '%IL%' THEN 'Glasgow, UK'
    WHEN location ILIKE '%NY%' THEN 'Edinburgh, UK'
    ELSE 'London, UK'
  END,
  updated_at = now()
WHERE location ILIKE '%CA%'
   OR location ILIKE '%IL%'
   OR location ILIKE '%NY%'
   OR location ILIKE '%San Francisco%'
   OR location ILIKE '%Los Angeles%'
   OR location ILIKE '%Chicago%'
   OR location ILIKE '%New York%';
