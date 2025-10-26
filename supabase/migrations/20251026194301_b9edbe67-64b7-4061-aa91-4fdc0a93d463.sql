-- Update existing job locations to UK cities
UPDATE jobs 
SET location = CASE
  WHEN location LIKE '%McLean%' OR location LIKE '%VA%' OR location LIKE '%Virginia%' THEN 'London'
  WHEN location LIKE '%Austin%' OR location LIKE '%TX%' OR location LIKE '%Texas%' THEN 'Manchester'
  WHEN location LIKE '%San Francisco%' OR location LIKE '%CA%' OR location LIKE '%California%' THEN 'Birmingham'
  WHEN location LIKE '%Herndon%' THEN 'Leeds'
  WHEN location LIKE '%Hamilton%' OR location LIKE '%OH%' OR location LIKE '%Ohio%' THEN 'Edinburgh'
  WHEN location LIKE '%Seattle%' OR location LIKE '%WA%' OR location LIKE '%Washington%' THEN 'Bristol'
  WHEN location LIKE '%Boston%' OR location LIKE '%MA%' OR location LIKE '%Massachusetts%' THEN 'Glasgow'
  WHEN location LIKE '%Chicago%' OR location LIKE '%IL%' OR location LIKE '%Illinois%' THEN 'Cardiff'
  WHEN location LIKE '%Los Angeles%' THEN 'Liverpool'
  WHEN location LIKE '%New York%' OR location LIKE '%NY%' THEN 'Newcastle'
  WHEN location LIKE '%Denver%' OR location LIKE '%CO%' OR location LIKE '%Colorado%' THEN 'Nottingham'
  WHEN location LIKE '%Atlanta%' OR location LIKE '%GA%' OR location LIKE '%Georgia%' THEN 'Sheffield'
  WHEN location = 'Remote' OR location LIKE 'Remote%' OR location LIKE 'Hybrid%' THEN location
  ELSE location
END
WHERE location IS NOT NULL 
  AND (
    location LIKE '%VA%' OR location LIKE '%TX%' OR location LIKE '%CA%' OR 
    location LIKE '%OH%' OR location LIKE '%WA%' OR location LIKE '%MA%' OR 
    location LIKE '%IL%' OR location LIKE '%NY%' OR location LIKE '%CO%' OR 
    location LIKE '%GA%' OR location LIKE '%Virginia%' OR location LIKE '%Texas%' OR
    location LIKE '%California%' OR location LIKE '%Ohio%' OR location LIKE '%Washington%' OR
    location LIKE '%Massachusetts%' OR location LIKE '%Illinois%' OR 
    location LIKE '%New York%' OR location LIKE '%Colorado%' OR location LIKE '%Georgia%' OR
    location LIKE '%McLean%' OR location LIKE '%Austin%' OR location LIKE '%San Francisco%' OR
    location LIKE '%Herndon%' OR location LIKE '%Hamilton%' OR location LIKE '%Seattle%' OR
    location LIKE '%Boston%' OR location LIKE '%Chicago%' OR location LIKE '%Los Angeles%' OR
    location LIKE '%Denver%' OR location LIKE '%Atlanta%'
  );