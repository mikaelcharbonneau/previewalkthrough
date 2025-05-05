-- Create temporary table to store facility IDs
CREATE TEMPORARY TABLE temp_facility_ids (
  temp_id text PRIMARY KEY,
  real_id uuid DEFAULT gen_random_uuid()
);

-- Create temporary table for inspection
CREATE TEMPORARY TABLE temp_inspection (
  id uuid,
  facility_id uuid
);

-- Insert facilities and store their IDs
INSERT INTO temp_facility_ids (temp_id) VALUES 
  ('f1'), ('f2'), ('f3'), ('f4'), ('f5'), ('f6'), ('f7');

INSERT INTO facilities (id, name, location, status, capacity, created_at)
SELECT 
  real_id,
  CASE temp_id
    WHEN 'f1' THEN 'Island 1'
    WHEN 'f2' THEN 'Island 8'
    WHEN 'f3' THEN 'Island 9'
    WHEN 'f4' THEN 'Island 10'
    WHEN 'f5' THEN 'Island 11'
    WHEN 'f6' THEN 'Island 12'
    WHEN 'f7' THEN 'Cirrus'
  END,
  'Datacenter',
  'active',
  100,
  now()
FROM temp_facility_ids;

-- Create inspection record
WITH new_inspection AS (
  INSERT INTO inspections (id, facility_id, status, start_time)
  SELECT 
    gen_random_uuid(),
    real_id,
    'completed',
    now()
  FROM temp_facility_ids 
  WHERE temp_id = 'f1'
  RETURNING id, facility_id
)
INSERT INTO temp_inspection
SELECT id, facility_id FROM new_inspection;

-- Insert racks and their inspection items for Island 1
DO $$
DECLARE
  rack_names TEXT[] := ARRAY[
    'X2401', 'X2402', 'X2403', 'X2404', 'X2405', 'X2406', 'X2407', 'X2408',
    'X2409', 'X2410', 'X2411', 'X2412', 'X2413', 'X2414', 'X2415', 'X2416'
  ];
  inspection_id uuid;
  facility_id uuid;
  rack_id uuid;
  rack_name text;
BEGIN
  -- Get the inspection and facility IDs
  SELECT i.id, i.facility_id INTO inspection_id, facility_id
  FROM temp_inspection i;

  FOREACH rack_name IN ARRAY rack_names
  LOOP
    -- Insert rack
    INSERT INTO racks (id, facility_id, name, location, capacity_units, status)
    VALUES (gen_random_uuid(), facility_id, rack_name, 'Island 1', 42, 'active')
    RETURNING id INTO rack_id;

    -- Insert inspection items for this rack
    INSERT INTO inspection_items (inspection_id, rack_id, category, status, notes)
    VALUES
      (inspection_id, rack_id, 'power', 'pass', 'PSU: Healthy'),
      (inspection_id, rack_id, 'power', 'pass', 'PDU: Healthy'),
      (inspection_id, rack_id, 'cooling', 'pass', 'RDHX: Healthy');
  END LOOP;
END $$;

-- Special case for rack X2402 which has an issue
DO $$
DECLARE
  problem_rack_id uuid;
  inspection_id uuid;
  issue_item_id uuid;
BEGIN
  -- Get the inspection ID
  SELECT i.id INTO inspection_id FROM temp_inspection i;

  -- Get the ID of rack X2402
  SELECT id INTO problem_rack_id
  FROM racks
  WHERE name = 'X2402' AND facility_id = (
    SELECT facility_id FROM temp_inspection
  );

  -- Get the inspection item ID for the power category
  SELECT id INTO issue_item_id
  FROM inspection_items
  WHERE rack_id = problem_rack_id
  AND category = 'power'
  LIMIT 1;

  -- Create an issue for the amber LED
  INSERT INTO issues (
    inspection_item_id,
    title,
    description,
    severity,
    status
  )
  VALUES (
    issue_item_id,
    'Amber LED Warning',
    'Rack X2402 showing amber LED indicator',
    'medium',
    'open'
  );

  -- Update the inspection item status
  UPDATE inspection_items
  SET status = 'warning',
      notes = 'PSU: Amber LED warning detected'
  WHERE id = issue_item_id;
END $$;

-- Generate a report for this inspection
INSERT INTO reports (
  inspection_id,
  title,
  summary,
  recommendations
)
SELECT 
  id,
  'Datacenter Walkthrough Report - Island 1',
  'Completed walkthrough of Island 1. All systems generally healthy with one minor issue detected.',
  'Monitor rack X2402 for potential power supply issues. Schedule preventive maintenance if warning persists.'
FROM temp_inspection;

-- Clean up temporary tables
DROP TABLE temp_facility_ids;
DROP TABLE temp_inspection;