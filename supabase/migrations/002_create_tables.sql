-- Migration 002: Create Core Tables for SETU Land Governance Public Infrastructure
-- PostGIS-enabled schema for parcel geometry and multi-factor verification

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id TEXT UNIQUE NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    tehsil TEXT NOT NULL,
    village TEXT NOT NULL,
    khasra_number TEXT NOT NULL,
    survey_number TEXT,
    owner_name TEXT NOT NULL,
    father_name TEXT,
    co_owners JSONB DEFAULT '[]'::jsonb,
    area_value NUMERIC(10, 4) NOT NULL,
    area_unit TEXT DEFAULT 'Acres',
    registration_number TEXT,
    registration_date DATE,
    land_use TEXT DEFAULT 'Agricultural',
    encumbrance_status TEXT DEFAULT 'Clear',
    mortgage_details JSONB DEFAULT NULL,
    court_case_status TEXT DEFAULT 'None',
    court_case_details JSONB DEFAULT NULL,
    source TEXT DEFAULT 'SETU Demonstration Dataset',
    source_type TEXT DEFAULT 'DEMO',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geometry GEOMETRY(Polygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id TEXT NOT NULL,
    record_type TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_reference TEXT,
    record_data JSONB DEFAULT '{}'::jsonb,
    record_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id TEXT,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    document_type TEXT DEFAULT 'Sale Deed',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ocr_status TEXT DEFAULT 'pending',
    ocr_provider TEXT DEFAULT 'google_cloud_vision',
    ocr_confidence NUMERIC(5, 2),
    raw_ocr_text TEXT,
    extracted_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id TEXT NOT NULL,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    ownership_score NUMERIC(5, 2) NOT NULL,
    khasra_score NUMERIC(5, 2) NOT NULL,
    area_score NUMERIC(5, 2) NOT NULL,
    registration_score NUMERIC(5, 2) NOT NULL,
    encumbrance_score NUMERIC(5, 2) NOT NULL,
    court_score NUMERIC(5, 2) NOT NULL,
    gis_score NUMERIC(5, 2) NOT NULL,
    total_score NUMERIC(5, 2) NOT NULL,
    risk_level TEXT NOT NULL,
    mismatches JSONB DEFAULT '[]'::jsonb,
    verification_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    score NUMERIC(5, 2) NOT NULL,
    risk_level TEXT NOT NULL,
    status TEXT NOT NULL,
    mismatches_count INT DEFAULT 0,
    run_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
