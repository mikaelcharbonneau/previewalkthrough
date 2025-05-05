/*
  # Import walkthrough data
  
  1. New Data
    - Imports walkthrough data for Island 1
    - Creates inspection records with items
    - Generates issues for problematic components
    - Creates summary report
  
  2. Changes
    - Creates temporary tables and helper functions
    - Processes walkthrough data
    - Creates inspection records
    - Links issues to inspection items
    
  3. Security
    - Uses existing RLS policies
    - No security changes needed
*/

-- Create temporary table for walkthrough data
CREATE TEMPORARY TABLE temp_walkthrough_data (
  walkthrough_id text,
  datacenter_id text,
  datahall_id text,
  rack_id text,
  rack_status text,
  psu_status text,
  psu_id text,
  psu_parent text,
  psu_sn text,
  psu_com text,
  pdu_status text,
  pdu_id text,
  pdu_sn text,
  pdu_com text,
  rdhx_status text,
  rdhx_sn text,
  rdhx_com text,
  technician text
);

-- Function to map status to database enum
CREATE OR REPLACE FUNCTION map_status(status text)
RETURNS text AS $$
BEGIN
  RETURN CASE 
    WHEN status = 'Healty' THEN 'pass'
    WHEN status = 'Warning' THEN 'warning'
    WHEN status = 'Critical' THEN 'fail'
    ELSE 'not_applicable'
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to map severity based on status
CREATE OR REPLACE FUNCTION map_severity(status text)
RETURNS text AS $$
BEGIN
  RETURN CASE 
    WHEN status = 'Critical' THEN 'critical'
    WHEN status = 'Warning' THEN 'medium'
    ELSE 'low'
  END;
END;
$$ LANGUAGE plpgsql;

-- Insert walkthrough data
INSERT INTO temp_walkthrough_data VALUES
  -- Island 1 racks with issues
  ('1', 'Canada - Quebec', 'Island 01', 'X2407', 'Warning', 'Healty', '', '', '', '', 'Tripped Breaker', 'PDU B', '1l039483', 'Circuit 2 Tripped', 'Healty', '', '', 'mc@hpe.com'),
  ('1', 'Canada - Quebec', 'Island 01', 'X2415', 'Warning', 'Amber LED', 'u10 PSU 3', 'S0338483', 'PK474633', '', 'Healty', '', '', '', 'Healty', '', '', 'mc@hpe.com'),
  ('1', 'Canada - Quebec', 'Island 01', 'X2416', 'Critical', 'Healty', '', '', '', '', 'Healty', '', '', '', 'Water Leak', 'MC-1233', 'Water Leak on the CDU connection', 'mc@hpe.com'),
  ('1', 'Canada - Quebec', 'Island 01', 'X2508', 'Critical', 'Healty', '', '', '', '', 'Powered-off', 'PDU A', '1l347464', 'PDU A is down', 'Healty', '', '', 'mc@hpe.com'),
  ('1', 'Canada - Quebec', 'Island 01', 'X2515', 'Warning', 'Powered-off', 'u05 PSU 2', 'S0948763', 'PK364645', '', 'Healty', '', '', '', 'Healty', '', '', 'mc@hpe.com'),
  ('1', 'Canada - Quebec', 'Island 01', 'X2601', 'Warning', 'Healty', '', '', '', '', 'Healty', '', '', '', 'Active Alert', 'MC-17743', 'Error Code : Power source changed from A to B', 'mc@hpe.com'),
  ('1', 'Canada - Quebec', 'Island 01', 'X2609', 'Warning', 'Healty', '', '', '', '', 'Active Alert', 'PDU C', '1l384363', 'PDUC Alert : Low Voltage', 'Healty', '', '', 'mc@hpe.com'),
  ('1', 'Canada - Quebec', 'Island 01', 'X2705', 'Warning', 'Amber LED', 'u30 PSU 5', 'S0949944', 'PK736273', '', 'Healty', '', '', '', 'Healty', '', '', 'mc@hpe.com');

-- Process walkthrough data
DO $$
DECLARE
  v_facility_id uuid;
  v_inspection_id uuid;
  v_rack_id uuid;
  v_inspection_item_id uuid;
  walkthrough_row RECORD;
BEGIN
  -- Get facility ID for Island 1
  SELECT id INTO v_facility_id 
  FROM facilities 
  WHERE name = 'Island 1';
  
  -- Create inspection for walkthrough #1
  INSERT INTO inspections (facility_id, status, start_time)
  VALUES (v_facility_id, 'completed', now())
  RETURNING id INTO v_inspection_id;
  
  -- Process each rack with issues
  FOR walkthrough_row IN SELECT * FROM temp_walkthrough_data LOOP
    -- Get or create rack
    SELECT id INTO v_rack_id
    FROM racks r
    WHERE r.name = walkthrough_row.rack_id
    AND r.facility_id = v_facility_id;
    
    IF v_rack_id IS NULL THEN
      INSERT INTO racks (facility_id, name, location, capacity_units, status)
      VALUES (v_facility_id, walkthrough_row.rack_id, walkthrough_row.datahall_id, 42, 'active')
      RETURNING id INTO v_rack_id;
    END IF;
    
    -- Create PSU inspection item
    INSERT INTO inspection_items (
      inspection_id, rack_id, category, status, notes
    )
    VALUES (
      v_inspection_id,
      v_rack_id,
      'power',
      map_status(walkthrough_row.psu_status),
      CASE 
        WHEN walkthrough_row.psu_status != 'Healty' 
        THEN format('PSU Issue: %s (ID: %s, SN: %s)', 
                   walkthrough_row.psu_status, 
                   walkthrough_row.psu_id, 
                   walkthrough_row.psu_sn)
        ELSE 'PSU: Healthy'
      END
    )
    RETURNING id INTO v_inspection_item_id;
    
    -- Create issue if PSU has problems
    IF walkthrough_row.psu_status != 'Healty' THEN
      INSERT INTO issues (
        inspection_item_id,
        title,
        description,
        severity,
        status
      )
      VALUES (
        v_inspection_item_id,
        format('PSU Issue - %s', walkthrough_row.rack_id),
        format('PSU Status: %s\nID: %s\nSerial: %s', 
               walkthrough_row.psu_status,
               walkthrough_row.psu_id,
               walkthrough_row.psu_sn),
        map_severity(walkthrough_row.psu_status),
        'open'
      );
    END IF;
    
    -- Create PDU inspection item
    INSERT INTO inspection_items (
      inspection_id, rack_id, category, status, notes
    )
    VALUES (
      v_inspection_id,
      v_rack_id,
      'power',
      map_status(walkthrough_row.pdu_status),
      CASE 
        WHEN walkthrough_row.pdu_status != 'Healty' 
        THEN format('PDU Issue: %s (ID: %s, SN: %s) - %s', 
                   walkthrough_row.pdu_status,
                   walkthrough_row.pdu_id,
                   walkthrough_row.pdu_sn,
                   walkthrough_row.pdu_com)
        ELSE 'PDU: Healthy'
      END
    )
    RETURNING id INTO v_inspection_item_id;
    
    -- Create issue if PDU has problems
    IF walkthrough_row.pdu_status != 'Healty' THEN
      INSERT INTO issues (
        inspection_item_id,
        title,
        description,
        severity,
        status
      )
      VALUES (
        v_inspection_item_id,
        format('PDU Issue - %s', walkthrough_row.rack_id),
        format('PDU Status: %s\nID: %s\nSerial: %s\nDetails: %s',
               walkthrough_row.pdu_status,
               walkthrough_row.pdu_id,
               walkthrough_row.pdu_sn,
               walkthrough_row.pdu_com),
        map_severity(walkthrough_row.pdu_status),
        'open'
      );
    END IF;
    
    -- Create RDHX inspection item
    INSERT INTO inspection_items (
      inspection_id, rack_id, category, status, notes
    )
    VALUES (
      v_inspection_id,
      v_rack_id,
      'cooling',
      map_status(walkthrough_row.rdhx_status),
      CASE 
        WHEN walkthrough_row.rdhx_status != 'Healty' 
        THEN format('RDHX Issue: %s (SN: %s) - %s',
                   walkthrough_row.rdhx_status,
                   walkthrough_row.rdhx_sn,
                   walkthrough_row.rdhx_com)
        ELSE 'RDHX: Healthy'
      END
    )
    RETURNING id INTO v_inspection_item_id;
    
    -- Create issue if RDHX has problems
    IF walkthrough_row.rdhx_status != 'Healty' THEN
      INSERT INTO issues (
        inspection_item_id,
        title,
        description,
        severity,
        status
      )
      VALUES (
        v_inspection_item_id,
        format('RDHX Issue - %s', walkthrough_row.rack_id),
        format('RDHX Status: %s\nSerial: %s\nDetails: %s',
               walkthrough_row.rdhx_status,
               walkthrough_row.rdhx_sn,
               walkthrough_row.rdhx_com),
        map_severity(walkthrough_row.rdhx_status),
        'open'
      );
    END IF;
  END LOOP;
  
  -- Create summary report
  INSERT INTO reports (
    inspection_id,
    title,
    summary,
    recommendations
  )
  VALUES (
    v_inspection_id,
    'Island 1 Walkthrough Report',
    'Completed walkthrough of Island 1. Multiple issues identified including PDU alerts, PSU warnings, and cooling system alerts.',
    'Immediate attention required for:
     - Water leak in rack X2416
     - PDU power issues in racks X2407 and X2508
     - PSU alerts in racks X2415, X2515, and X2705
     - Cooling system alerts in rack X2601
     
     Recommend scheduling maintenance window to address these issues.'
  );
END $$;

-- Cleanup
DROP FUNCTION map_status(text);
DROP FUNCTION map_severity(text);
DROP TABLE temp_walkthrough_data;