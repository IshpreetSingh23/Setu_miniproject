-- Migration 003: Indexes, Spatial Optimization, and Row Level Security (RLS)
-- Enables PostGIS spatial indexing and granular table access policies

-- 1. Spatial and B-Tree Indexes
CREATE INDEX IF NOT EXISTS idx_properties_geometry ON properties USING GIST(geometry);
CREATE INDEX IF NOT EXISTS idx_properties_property_id ON properties(property_id);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_district ON properties(district);
CREATE INDEX IF NOT EXISTS idx_properties_khasra ON properties(khasra_number);
CREATE INDEX IF NOT EXISTS idx_properties_survey ON properties(survey_number);

CREATE INDEX IF NOT EXISTS idx_property_records_property_id ON property_records(property_id);
CREATE INDEX IF NOT EXISTS idx_documents_property_id ON documents(property_id);
CREATE INDEX IF NOT EXISTS idx_verification_results_property_id ON verification_results(property_id);
CREATE INDEX IF NOT EXISTS idx_verification_results_document_id ON verification_results(document_id);
CREATE INDEX IF NOT EXISTS idx_verification_history_property_id ON verification_history(property_id);
CREATE INDEX IF NOT EXISTS idx_verification_history_result_id ON verification_history(verification_result_id);

-- 2. Enable Row Level Security (RLS) on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_history ENABLE ROW LEVEL SECURITY;

-- 3. Public Read Policies for Public Registry & Demo Data
CREATE POLICY "Allow public read access for properties"
    ON properties FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access for property_records"
    ON property_records FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access for verification_history"
    ON verification_history FOR SELECT
    USING (true);

-- 4. Document & Verification Policies
CREATE POLICY "Allow insert access for documents"
    ON documents FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow select access for documents"
    ON documents FOR SELECT
    USING (true);

CREATE POLICY "Allow insert access for verification_results"
    ON verification_results FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow select access for verification_results"
    ON verification_results FOR SELECT
    USING (true);

CREATE POLICY "Allow insert access for verification_history"
    ON verification_history FOR INSERT
    WITH CHECK (true);

-- 5. Supabase Storage Bucket Setup & Policy for property-documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-documents', 'property-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated and anon uploads to property-documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'property-documents');

CREATE POLICY "Allow read access to property-documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'property-documents');
