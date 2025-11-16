-- Migration: Create core tables for real project and offer data
-- This replaces mock data with persistent Supabase storage
-- Author: Claude
-- Date: 2025-11-16

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROJECTS
-- ============================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  client_name TEXT,
  location TEXT,
  description TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED', 'COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

COMMENT ON TABLE projects IS 'Construction projects with offers to compare';

-- ============================================================================
-- CONTRACTORS (Aannemers)
-- ============================================================================

CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contractors_name ON contractors(name);

COMMENT ON TABLE contractors IS 'Construction contractors (aannemers) who submit offers';

-- ============================================================================
-- MASTER COMPONENTS (Canonical building structure)
-- ============================================================================

CREATE TABLE master_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES master_components(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  is_leaf BOOLEAN NOT NULL DEFAULT true,
  level INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_master_components_parent ON master_components(parent_id);
CREATE INDEX idx_master_components_code ON master_components(code);
CREATE INDEX idx_master_components_sort ON master_components(sort_order);

COMMENT ON TABLE master_components IS 'Canonical building structure (Brikx/Hedibouw style) for mapping offer lines';

-- ============================================================================
-- OFFERS
-- ============================================================================

CREATE TYPE pricing_model AS ENUM ('EXCL_OPSLAGEN', 'INCL_OPSLAGEN', 'MIXED', 'ONBEKEND');

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  pricing_model pricing_model NOT NULL DEFAULT 'ONBEKEND',
  is_winning_offer BOOLEAN NOT NULL DEFAULT false,
  source_total_incl NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_offers_project ON offers(project_id);
CREATE INDEX idx_offers_contractor ON offers(contractor_id);
CREATE INDEX idx_offers_winning ON offers(is_winning_offer) WHERE is_winning_offer = true;

COMMENT ON TABLE offers IS 'Contractor offers for a project';

-- ============================================================================
-- OFFER REVISIONS
-- ============================================================================

CREATE TABLE offer_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  revision_index INTEGER NOT NULL,
  label TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(offer_id, revision_index)
);

CREATE INDEX idx_offer_revisions_offer ON offer_revisions(offer_id);

COMMENT ON TABLE offer_revisions IS 'Contract revisions (v1=contract, v2, v3, etc.)';

-- ============================================================================
-- OFFER LINES
-- ============================================================================

CREATE TYPE price_type AS ENUM ('VAST', 'STELPOST', 'INDICATIE', 'NOG', 'ONBEKEND');

CREATE TABLE offer_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  revision_id UUID NOT NULL REFERENCES offer_revisions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  raw_text TEXT,
  description TEXT NOT NULL,
  code TEXT,
  quantity NUMERIC(12, 4),
  unit TEXT,
  price_per_unit_excl NUMERIC(12, 2),
  price_per_unit_incl NUMERIC(12, 2),
  total_price_excl NUMERIC(12, 2),
  total_price_incl NUMERIC(12, 2),
  price_type price_type NOT NULL DEFAULT 'ONBEKEND',
  is_allowance BOOLEAN NOT NULL DEFAULT false,
  clarification TEXT,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_offer_lines_revision ON offer_lines(revision_id);
CREATE INDEX idx_offer_lines_sort ON offer_lines(revision_id, sort_order);
CREATE INDEX idx_offer_lines_price_type ON offer_lines(price_type);

COMMENT ON TABLE offer_lines IS 'Individual line items in an offer revision';

-- ============================================================================
-- LINE MAPPINGS (koppeling naar master components)
-- ============================================================================

CREATE TYPE coverage_status AS ENUM (
  'INCLUSIEF',
  'STELPOST',
  'INDICATIE',
  'NIET_OPGENOMEN',
  'ONDERDEEL_ONBEKEND',
  'BUITEN_SCOPE'
);

CREATE TYPE assigned_by AS ENUM ('AI', 'ARCHITECT', 'SYSTEM', 'MANUAL');

CREATE TABLE line_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_line_id UUID NOT NULL REFERENCES offer_lines(id) ON DELETE CASCADE,
  master_component_id UUID NOT NULL REFERENCES master_components(id) ON DELETE RESTRICT,
  coverage_status coverage_status NOT NULL DEFAULT 'INCLUSIEF',
  assigned_by assigned_by NOT NULL DEFAULT 'MANUAL',
  confidence NUMERIC(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(offer_line_id, master_component_id)
);

CREATE INDEX idx_line_mappings_offer_line ON line_mappings(offer_line_id);
CREATE INDEX idx_line_mappings_master_component ON line_mappings(master_component_id);
CREATE INDEX idx_line_mappings_coverage ON line_mappings(coverage_status);

COMMENT ON TABLE line_mappings IS 'Mapping between offer lines and canonical master components';

-- ============================================================================
-- TRIGGERS for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON contractors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_components_updated_at BEFORE UPDATE ON master_components
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offer_revisions_updated_at BEFORE UPDATE ON offer_revisions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offer_lines_updated_at BEFORE UPDATE ON offer_lines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_line_mappings_updated_at BEFORE UPDATE ON line_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_mappings ENABLE ROW LEVEL SECURITY;

-- For development: Allow all operations for authenticated users
-- TODO: Implement proper authorization based on project ownership in production

CREATE POLICY "Allow all for authenticated users" ON projects
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON contractors
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON master_components
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON offers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON offer_revisions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON offer_lines
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON line_mappings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON projects TO authenticated;
GRANT ALL ON contractors TO authenticated;
GRANT ALL ON master_components TO authenticated;
GRANT ALL ON offers TO authenticated;
GRANT ALL ON offer_revisions TO authenticated;
GRANT ALL ON offer_lines TO authenticated;
GRANT ALL ON line_mappings TO authenticated;
