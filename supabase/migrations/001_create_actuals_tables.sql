-- Migration: Create tables for project actuals, hours, and costs tracking
-- This enables integration with Personal Coach app and manual entry
-- Author: Claude
-- Date: 2025-11-16

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE actual_source AS ENUM ('MANUAL', 'PERSONAL_COACH', 'IMPORT');
CREATE TYPE cost_type AS ENUM ('MATERIAL', 'EQUIPMENT', 'SUBCONTRACTOR', 'OTHER');
CREATE TYPE sync_status AS ENUM ('SUCCESS', 'FAILED', 'IN_PROGRESS');

-- Table: project_actuals
-- Aggregated actuals per component per period
CREATE TABLE project_actuals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id VARCHAR(255) NOT NULL,
  master_component_id VARCHAR(255) NOT NULL,
  actual_cost_incl NUMERIC(10, 2) NOT NULL DEFAULT 0,
  actual_hours NUMERIC(10, 2) NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  source actual_source NOT NULL DEFAULT 'MANUAL',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: hour_entries
-- Detailed hour registration per worker
CREATE TABLE hour_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id VARCHAR(255) NOT NULL,
  master_component_id VARCHAR(255) NOT NULL,
  worker_name VARCHAR(255) NOT NULL,
  hours NUMERIC(6, 2) NOT NULL,
  hourly_rate NUMERIC(10, 2) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  source actual_source NOT NULL DEFAULT 'MANUAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: cost_entries
-- Detailed cost registration (materials, equipment, etc)
CREATE TABLE cost_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id VARCHAR(255) NOT NULL,
  master_component_id VARCHAR(255) NOT NULL,
  cost_type cost_type NOT NULL,
  amount_incl NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  supplier VARCHAR(255),
  invoice_number VARCHAR(255),
  source actual_source NOT NULL DEFAULT 'MANUAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: personal_coach_sync
-- Track sync status with Personal Coach app
CREATE TABLE personal_coach_sync (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id VARCHAR(255) NOT NULL UNIQUE,
  personal_coach_project_id VARCHAR(255) NOT NULL,
  last_sync_at TIMESTAMPTZ,
  sync_status sync_status NOT NULL DEFAULT 'SUCCESS',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_project_actuals_project ON project_actuals(project_id);
CREATE INDEX idx_project_actuals_component ON project_actuals(master_component_id);
CREATE INDEX idx_project_actuals_period ON project_actuals(period_start, period_end);

CREATE INDEX idx_hour_entries_project ON hour_entries(project_id);
CREATE INDEX idx_hour_entries_component ON hour_entries(master_component_id);
CREATE INDEX idx_hour_entries_date ON hour_entries(date);

CREATE INDEX idx_cost_entries_project ON cost_entries(project_id);
CREATE INDEX idx_cost_entries_component ON cost_entries(master_component_id);
CREATE INDEX idx_cost_entries_date ON cost_entries(date);

CREATE INDEX idx_personal_coach_sync_project ON personal_coach_sync(project_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_actuals_updated_at
  BEFORE UPDATE ON project_actuals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hour_entries_updated_at
  BEFORE UPDATE ON hour_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cost_entries_updated_at
  BEFORE UPDATE ON cost_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_coach_sync_updated_at
  BEFORE UPDATE ON personal_coach_sync
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE project_actuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hour_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_coach_sync ENABLE ROW LEVEL SECURITY;

-- For now, allow all authenticated users to read/write
-- TODO: Implement proper authorization based on project ownership
CREATE POLICY "Allow all for authenticated users" ON project_actuals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON hour_entries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON cost_entries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON personal_coach_sync
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON project_actuals TO authenticated;
GRANT ALL ON hour_entries TO authenticated;
GRANT ALL ON cost_entries TO authenticated;
GRANT ALL ON personal_coach_sync TO authenticated;

-- Comments for documentation
COMMENT ON TABLE project_actuals IS 'Aggregated actual costs and hours per component per period';
COMMENT ON TABLE hour_entries IS 'Detailed hour entries per worker for time tracking';
COMMENT ON TABLE cost_entries IS 'Detailed cost entries for materials, equipment, and other expenses';
COMMENT ON TABLE personal_coach_sync IS 'Sync status with Personal Coach app for automated actuals import';
