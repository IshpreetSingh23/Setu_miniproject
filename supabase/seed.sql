-- ==============================================================================
-- SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
-- Supabase Master Seed File (supabase/seed.sql)
-- Demonstrating Low Risk, Active Mortgage, Court Disputes, and GIS Inconsistencies
-- ==============================================================================

-- 1. Seed Properties Table with PostGIS Polygon Geometries
INSERT INTO properties (
    id, property_id, state, district, tehsil, village, khasra_number, survey_number,
    owner_name, father_name, co_owners, area_value, area_unit,
    registration_number, registration_date, land_use,
    encumbrance_status, mortgage_details, court_case_status, court_case_details,
    source, source_type, latitude, longitude, geometry
) VALUES
-- PROP-001: Active SBI Mortgage (Medium/High Risk depending on deed)
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a01',
    'PROP-001', 'Uttar Pradesh', 'Lucknow', 'Malihabad', 'Malihabad Rural', '123/4', 'SUR-UP-1234',
    'Rajesh Kumar', 'Ram Lal', '[]'::jsonb, 2.5000, 'Acres',
    'REG-2025-0192', '2025-06-12', 'Agricultural Land',
    'Active Mortgage (SBI)',
    '{"bank": "State Bank of India", "amount": "18,50,000", "date": "15/08/2024"}'::jsonb,
    'None', NULL,
    'SETU Demonstration Dataset', 'DEMO',
    26.92046, 80.7105,
    ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[80.7100,26.9200],[80.7110,26.9200],[80.7110,26.92092],[80.7100,26.92092],[80.7100,26.9200]]]}'), 4326)
),

-- PROP-002: Fully Clear Title & Verified Cadastral GIS (LOW RISK)
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a02',
    'PROP-002', 'Uttar Pradesh', 'Lucknow', 'Malihabad', 'Malihabad Rural', '123/5', 'SUR-UP-1235',
    'Amit Sharma', 'Som Nath', '[]'::jsonb, 1.8000, 'Acres',
    'REG-2025-0456', '2025-08-20', 'Residential Plot',
    'Clear', NULL,
    'None', NULL,
    'SETU Demonstration Dataset', 'DEMO',
    26.92046, 80.7114,
    ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[80.7110,26.9200],[80.71173,26.9200],[80.71173,26.92092],[80.7110,26.92092],[80.7110,26.9200]]]}'), 4326)
),

-- PROP-003: Active Mortgage + Court Litigation (HIGH RISK)
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a03',
    'PROP-003', 'Uttar Pradesh', 'Lucknow', 'Malihabad', 'Malihabad Rural', '123/6', 'SUR-UP-1236',
    'Sunita Devi', 'Jagdish Prasad', '["Rakesh Prasad", "Manoj Prasad"]'::jsonb, 3.2000, 'Acres',
    'REG-2025-0789', '2025-04-15', 'Commercial Land',
    'Active Mortgage (HDFC)',
    '{"bank": "HDFC Bank", "amount": "25,00,000", "date": "10/01/2025"}'::jsonb,
    'Pending',
    '{"caseId": "CIV/2025/0789", "court": "Lucknow District Court", "issue": "Ownership dispute among legal heirs"}'::jsonb,
    'SETU Demonstration Dataset', 'DEMO',
    26.92046, 80.71235,
    ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[80.71173,26.9200],[80.71302,26.9200],[80.71302,26.92092],[80.71173,26.92092],[80.71173,26.9200]]]}'), 4326)
),

-- PROP-004: Clear Punjab Agricultural Parcel (LOW RISK)
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a04',
    'PROP-004', 'Punjab', 'Ludhiana', 'Ludhiana East', 'Gill', '124/1', 'SUR-PB-5501',
    'Mohan Singh', 'Gurnam Singh', '[]'::jsonb, 1.2000, 'Acres',
    'REG-2025-0222', '2025-03-10', 'Agricultural Land',
    'Clear', NULL,
    'None', NULL,
    'SETU Demonstration Dataset', 'DEMO',
    26.92135, 80.71025,
    ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[80.7100,26.92092],[80.7105,26.92092],[80.7105,26.92178],[80.7100,26.92178],[80.7100,26.92092]]]}'), 4326)
),

-- PROP-005: Deed Khasra & Area Discrepancy (MEDIUM RISK)
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a05',
    'PROP-005', 'Punjab', 'Ludhiana', 'Ludhiana East', 'Gill', '124/2', 'SUR-PB-5502',
    'Priya Gupta', 'Ramesh Gupta', '[]'::jsonb, 4.1000, 'Acres',
    'REG-2025-0555', '2025-07-05', 'Industrial Plot',
    'Clear', NULL,
    'None', NULL,
    'SETU Demonstration Dataset', 'DEMO',
    26.92135, 80.7113,
    ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[80.7105,26.92092],[80.71216,26.92092],[80.71216,26.92178],[80.7105,26.92178],[80.7105,26.92092]]]}'), 4326)
),

-- PROP-006: GIS Parcel Area Deviation >15% (GIS INCONSISTENCY ALERT)
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a06',
    'PROP-006', 'Haryana', 'Gurugram', 'Gurugram', 'Sukhrali', '55/9', 'SUR-HR-9002',
    'Vikram Malhotra', 'K.L. Malhotra', '[]'::jsonb, 3.5000, 'Acres',
    'REG-2025-0991', '2025-05-19', 'Commercial Land',
    'Clear', NULL,
    'None', NULL,
    'SETU Demonstration Dataset', 'DEMO',
    28.4720, 77.0450,
    ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[77.0440,28.4710],[77.0450,28.4710],[77.0450,28.4718],[77.0440,28.4718],[77.0440,28.4710]]]}'), 4326)
)
ON CONFLICT (property_id) DO NOTHING;

-- 2. Seed Multi-Source Property Records (Provenance Ledger)
INSERT INTO property_records (
    id, property_id, record_type, source_name, source_reference, record_data, record_date
) VALUES
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c01',
    'd9b7f52a-3023-4e4a-939e-2144d1872a01',
    'REVENUE_RECORD', 'UP Bhulekh Portal', 'BHU-LKO-2025-9981',
    '{"khata_number": "00441", "fasli_year": "1430-1435", "soil_type": "Dumat", "revenue_demand": "142.50"}'::jsonb,
    '2025-06-12'
),
(
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c02',
    'd9b7f52a-3023-4e4a-939e-2144d1872a02',
    'SUB_REGISTRAR_REGISTRATION', 'IGRS Uttar Pradesh', 'REG-2025-0456',
    '{"book_no": "1", "volume_no": "4421", "page_start": 101, "page_end": 115, "stamp_duty_paid": "48000"}'::jsonb,
    '2025-08-20'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Sample Stored Documents
INSERT INTO documents (
    id, property_id, file_name, file_path, mime_type, file_size,
    document_type, ocr_status, ocr_provider, ocr_confidence,
    raw_ocr_text, extracted_fields, uploaded_at, processed_at
) VALUES
(
    'f0e1d2c3-b4a5-4987-6543-210fedcba987',
    'd9b7f52a-3023-4e4a-939e-2144d1872a02',
    'Sale_Deed_PROP-002.pdf',
    'deeds/PROP-002/Sale_Deed_PROP-002.pdf',
    'application/pdf',
    245760,
    'Sale Deed',
    'completed',
    'Google Cloud Vision (DOCUMENT_TEXT_DETECTION)',
    96.50,
    'SUB-REGISTRAR OFFICE, MALIHABAD\nREGISTRATION CERTIFICATE: REG-2025-0456\nOWNER: AMIT SHARMA\nKHASRA: 123/5\nAREA: 1.80 ACRES',
    '{"owner_name": "Amit Sharma", "khasra_number": "123/5", "area_value": 1.80, "area_unit": "Acres", "registration_number": "REG-2025-0456"}'::jsonb,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Historical Verification Result
INSERT INTO verification_results (
    id, property_id, document_id,
    ownership_score, khasra_score, area_score, registration_score,
    encumbrance_score, court_score, gis_score, total_score,
    risk_level, mismatches, verification_details
) VALUES
(
    'e5d4c3b2-a1f0-4876-5432-10fedcba9876',
    'd9b7f52a-3023-4e4a-939e-2144d1872a02',
    'f0e1d2c3-b4a5-4987-6543-210fedcba987',
    25.0, 20.0, 15.0, 15.0, 10.0, 10.0, 5.0, 100.0,
    'LOW',
    '[]'::jsonb,
    '{"recommendation": "Authoritative digital land registry records and deed documentation align. Title verified with high confidence."}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Verification History
INSERT INTO verification_history (
    id, property_id, verification_result_id, created_at
) VALUES
(
    'c3b2a1f0-e5d4-4765-4321-0fedcba98765',
    'd9b7f52a-3023-4e4a-939e-2144d1872a02',
    'e5d4c3b2-a1f0-4876-5432-10fedcba9876',
    NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;
