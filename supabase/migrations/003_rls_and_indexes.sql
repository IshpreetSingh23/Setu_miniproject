-- Migration 003: Indexes and Row Level Security (RLS)
-- Enables PostGIS spatial indexing and granular access policies

-- 1. Spatial and B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_properties_geometry ON properties USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_properties_property_id ON properties(property_id);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_district ON properties(district);
CREATE INDEX IF NOT EXISTS idx_properties_khasra ON properties(khasra_number);
CREATE INDEX IF NOT EXISTS idx_properties_survey ON properties(survey_number);
CREATE INDEX IF NOT EXISTS idx_documents_property_id ON documents(property_id);
CREATE INDEX IF NOT EXISTS idx_verification_results_property ON verification_results(property_id);
CREATE INDEX IF NOT EXISTS idx_verification_history_property ON verification_history(property_id);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_history ENABLE ROW LEVEL SECURITY;

-- 3. Public Read Policies for Demo & Public Inquiry
CREATE POLICY "Allow public read access for properties"
    ON properties FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access for property_records"
    ON property_records FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access for verification history"
    ON verification_history FOR SELECT
    USING (true);

-- 4. Secure Document & Verification Policies (Read & Insert)
CREATE POLICY "Allow document inserts"
    ON documents FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow document reads"
    ON documents FOR SELECT
    USING (true);

CREATE POLICY "Allow verification results insert"
    ON verification_results FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow verification results read"
    ON verification_results FOR SELECT
    USING (true);

CREATE POLICY "Allow verification history insert"
    ON verification_history FOR INSERT
    WITH CHECK (true);
