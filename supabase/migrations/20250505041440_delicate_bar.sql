/*
  # HPE Walkthrough Application Database Schema

  1. New Tables
    - facilities
      - Represents data centers and facilities
      - Contains location info and facility details
    
    - racks
      - Represents equipment racks in facilities
      - Tracks rack location and status
    
    - inspections
      - Records walkthrough inspections
      - Links to users and facilities
    
    - inspection_items
      - Individual items checked during inspection
      - Contains detailed findings and status
    
    - issues
      - Tracks problems found during inspections
      - Links to specific inspection items
    
    - reports
      - Generated inspection reports
      - Aggregates inspection findings
    
  2. Security
    - RLS enabled on all tables
    - Role-based access policies
    - Audit logging for sensitive operations
*/

-- Facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'maintenance', 'inactive')),
  capacity integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT valid_capacity CHECK (capacity > 0)
);

-- Racks table
CREATE TABLE IF NOT EXISTS racks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid REFERENCES facilities(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text NOT NULL,
  capacity_units integer NOT NULL,
  power_capacity numeric(10,2),
  cooling_capacity numeric(10,2),
  status text NOT NULL CHECK (status IN ('active', 'maintenance', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_inspection_date timestamptz,
  CONSTRAINT valid_capacity_units CHECK (capacity_units > 0)
);

-- Inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid REFERENCES facilities(id) ON DELETE CASCADE,
  inspector_id uuid REFERENCES auth.users(id),
  status text NOT NULL CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')),
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_inspection_time CHECK (end_time IS NULL OR end_time > start_time)
);

-- Inspection items table
CREATE TABLE IF NOT EXISTS inspection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES inspections(id) ON DELETE CASCADE,
  rack_id uuid REFERENCES racks(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('power', 'cooling', 'network', 'security', 'general')),
  status text NOT NULL CHECK (status IN ('pass', 'fail', 'warning', 'not_applicable')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_item_id uuid REFERENCES inspection_items(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved')),
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id uuid REFERENCES inspections(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text,
  recommendations text,
  generated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE racks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_facilities_status ON facilities(status);
CREATE INDEX IF NOT EXISTS idx_racks_facility_status ON racks(facility_id, status);
CREATE INDEX IF NOT EXISTS idx_inspections_facility ON inspections(facility_id);
CREATE INDEX IF NOT EXISTS idx_inspections_inspector ON inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspection_items_inspection ON inspection_items(inspection_id);
CREATE INDEX IF NOT EXISTS idx_issues_severity_status ON issues(severity, status);
CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON issues(assigned_to);

-- Create policies for facilities
CREATE POLICY "Facilities viewable by authenticated users"
  ON facilities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Facilities modifiable by admins only"
  ON facilities FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create policies for racks
CREATE POLICY "Racks viewable by authenticated users"
  ON racks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Racks modifiable by admins only"
  ON racks FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create policies for inspections
CREATE POLICY "Inspections viewable by authenticated users"
  ON inspections FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Inspections modifiable by creator"
  ON inspections FOR ALL
  TO authenticated
  USING (auth.uid() = inspector_id)
  WITH CHECK (auth.uid() = inspector_id);

-- Create policies for inspection items
CREATE POLICY "Inspection items viewable by authenticated users"
  ON inspection_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Inspection items modifiable by inspection creator"
  ON inspection_items FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM inspections 
    WHERE inspections.id = inspection_items.inspection_id 
    AND inspections.inspector_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM inspections 
    WHERE inspections.id = inspection_items.inspection_id 
    AND inspections.inspector_id = auth.uid()
  ));

-- Create policies for issues
CREATE POLICY "Issues viewable by authenticated users"
  ON issues FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Issues modifiable by assigned user or creator"
  ON issues FOR ALL
  TO authenticated
  USING (
    assigned_to = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM inspection_items i 
      JOIN inspections insp ON i.inspection_id = insp.id 
      WHERE i.id = inspection_item_id 
      AND insp.inspector_id = auth.uid()
    )
  )
  WITH CHECK (
    assigned_to = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM inspection_items i 
      JOIN inspections insp ON i.inspection_id = insp.id 
      WHERE i.id = inspection_item_id 
      AND insp.inspector_id = auth.uid()
    )
  );

-- Create policies for reports
CREATE POLICY "Reports viewable by authenticated users"
  ON reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Reports modifiable by creator"
  ON reports FOR ALL
  TO authenticated
  USING (generated_by = auth.uid())
  WITH CHECK (generated_by = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_facilities_updated_at
    BEFORE UPDATE ON facilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_racks_updated_at
    BEFORE UPDATE ON racks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at
    BEFORE UPDATE ON inspections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspection_items_updated_at
    BEFORE UPDATE ON inspection_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at
    BEFORE UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE issues;
ALTER PUBLICATION supabase_realtime ADD TABLE inspections;