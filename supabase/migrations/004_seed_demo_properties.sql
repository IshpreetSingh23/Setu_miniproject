-- Migration 004: Seed Realistic Demo Properties
-- SETU Demonstration Dataset with PostGIS parcel geometries and diverse risk profiles

INSERT INTO properties (
    property_id, state, district, tehsil, village, khasra_number, survey_number,
    owner_name, father_name, co_owners, area_value, area_unit,
    registration_number, registration_date, land_use,
    encumbrance_status, mortgage_details, court_case_status, court_case_details,
    source, source_type, latitude, longitude, geometry
) VALUES
-- 1. PROP-001: Active Mortgage (Medium/High Risk depending on deed)
(
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

-- 2. PROP-002: Fully Clear Title & Consistent GIS (Low Risk)
(
    'PROP-002', 'Uttar Pradesh', 'Lucknow', 'Malihabad', 'Malihabad Rural', '123/5', 'SUR-UP-1235',
    'Amit Sharma', 'Som Nath', '[]'::jsonb, 1.8000, 'Acres',
    'REG-2025-0456', '2025-08-20', 'Residential Plot',
    'Clear', NULL,
    'None', NULL,
    'SETU Demonstration Dataset', 'DEMO',
    26.92046, 80.7114,
    ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[80.7110,26.9200],[80.71173,26.9200],[80.71173,26.92092],[80.7110,26.92092],[80.7110,26.9200]]]}'), 4326)
),

-- 3. PROP-003: Active Mortgage + Court Dispute (High Risk)
(
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

-- 4. PROP-004: Punjab Clear Agricultural Parcel (Low Risk)
(
    'PROP-004', 'Punjab', 'Ludhiana', 'Ludhiana East', 'Gill', '124/1', 'SUR-PB-5501',
    'Mohan Singh', 'Gurnam Singh', '[]'::jsonb, 1.2000, 'Acres',
    'REG-2025-0222', '2025-03-10', 'Agricultural Land',
    'Clear', NULL,
    'None', NULL,
    'SETU Demonstration Dataset', 'DEMO',
    26.92135, 80.71025,
    ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[80.7100,26.92092],[80.7105,26.92092],[80.7105,26.92178],[80.7100,26.92178],[80.7100,26.92092]]]}'), 4326)
),

-- 5. PROP-005: Discrepancy & Medium Risk Scenario
(
    'PROP-005', 'Punjab', 'Ludhiana', 'Ludhiana East', 'Gill', '124/2', 'SUR-PB-5502',
    'Priya Gupta', 'Ramesh Gupta', '[]'::jsonb, 4.1000, 'Acres',
    'REG-2025-0555', '2025-07-05', 'Industrial Plot',
    'Clear', NULL,
    'None', NULL,
    'SETU Demonstration Dataset', 'DEMO',
    26.92135, 80.7113,
    ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[80.7105,26.92092],[80.71216,26.92092],[80.71216,26.92178],[80.7105,26.92178],[80.7105,26.92092]]]}'), 4326)
),

-- 6. PROP-006: GIS Parcel Area Inconsistency Scenario (>15% deviation from recorded)
(
    'PROP-006', 'Haryana', 'Gurugram', 'Gurugram', 'Sukhrali', '55/9', 'SUR-HR-9002',
    'Vikram Malhotra', 'K.L. Malhotra', '[]'::jsonb, 3.5000, 'Acres',
    'REG-2025-0991', '2025-05-19', 'Commercial Land',
    'Clear', NULL,
    'None', NULL,
    'SETU Demonstration Dataset', 'DEMO',
    28.4720, 77.0450,
    -- Polygon area is intentionally only ~2.1 acres to trigger GIS parcel inconsistency alert
    ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Polygon","coordinates":[[[77.0440,28.4710],[77.0450,28.4710],[77.0450,28.4718],[77.0440,28.4718],[77.0440,28.4710]]]}'), 4326)
)
ON CONFLICT (property_id) DO NOTHING;

-- Seed initial verification history records
INSERT INTO verification_history (
    property_id, owner_name, score, risk_level, status, mismatches_count, run_date
) VALUES
('PROP-001', 'Rajesh Kumar', 65.0, 'MEDIUM', 'Issues Found', 2, NOW() - INTERVAL '1 day'),
('PROP-002', 'Amit Sharma', 95.0, 'LOW', 'Verified', 0, NOW() - INTERVAL '2 days'),
('PROP-003', 'Sunita Devi', 45.0, 'HIGH', 'High Risk Liabilities', 3, NOW() - INTERVAL '3 days');
