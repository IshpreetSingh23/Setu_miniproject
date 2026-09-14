-- Migration: 004_seed_demo_properties.sql
-- Description: Seed realistic demonstration properties across Uttar Pradesh, Punjab, Haryana, Maharashtra, Karnataka, and Delhi

INSERT INTO properties (
    id, property_id, state, district, tehsil, village,
    khasra_number, survey_number, owner_name, area_value, area_unit,
    registration_number, registration_date, land_use,
    encumbrance_status, court_case_status, latitude, longitude,
    geometry, source, source_type
) VALUES
-- 1. UTTAR PRADESH
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a01',
    'PROP-001',
    'Uttar Pradesh', 'Lucknow', 'Malihabad', 'Malihabad Rural',
    '123/4', 'SUR-UP-1234', 'Rajesh Kumar', 2.50, 'Acres',
    'REG-2025-0192', '2025-06-12', 'Agricultural Land',
    'Active Mortgage (SBI)', 'None', 26.92046, 80.7105,
    ST_GeomFromText('POLYGON((80.7100 26.9200, 80.7110 26.9200, 80.7110 26.92092, 80.7100 26.92092, 80.7100 26.9200))', 4326),
    'SETU Demonstration Dataset', 'DEMO'
),
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a02',
    'PROP-002',
    'Uttar Pradesh', 'Lucknow', 'Malihabad', 'Malihabad Rural',
    '123/5', 'SUR-UP-1235', 'Amit Sharma', 1.80, 'Acres',
    'REG-2025-0456', '2025-08-20', 'Residential Plot',
    'Clear', 'None', 26.92046, 80.7114,
    ST_GeomFromText('POLYGON((80.7110 26.9200, 80.71173 26.9200, 80.71173 26.92092, 80.7110 26.92092, 80.7110 26.9200))', 4326),
    'SETU Demonstration Dataset', 'DEMO'
),
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a03',
    'PROP-003',
    'Uttar Pradesh', 'Lucknow', 'Malihabad', 'Malihabad Rural',
    '123/6', 'SUR-UP-1236', 'Sunita Devi', 3.20, 'Acres',
    'REG-2025-0789', '2025-04-15', 'Commercial Land',
    'Active Mortgage (HDFC)', 'Pending', 26.92046, 80.71235,
    ST_GeomFromText('POLYGON((80.71173 26.9200, 80.71302 26.9200, 80.71302 26.92092, 80.71173 26.92092, 80.71173 26.9200))', 4326),
    'SETU Demonstration Dataset', 'DEMO'
),
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a07',
    'PROP-007',
    'Uttar Pradesh', 'Gautam Buddha Nagar', 'Sadar Noida', 'Chhapraula',
    '45/2', 'SUR-UP-7701', 'Alok Verma', 0.85, 'Acres',
    'REG-2025-0812', '2025-02-14', 'Residential Plot',
    'Clear', 'None', 28.5355, 77.3910,
    ST_GeomFromText('POLYGON((77.3910 28.5350, 77.3916 28.5350, 77.3916 28.53555, 77.3910 28.53555, 77.3910 28.53555))', 4326),
    'SETU Demonstration Dataset', 'DEMO'
),

-- 2. PUNJAB
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a04',
    'PROP-004',
    'Punjab', 'Ludhiana', 'Ludhiana East', 'Gill',
    '124/1', 'SUR-PB-5501', 'Mohan Singh', 1.20, 'Acres',
    'REG-2025-0222', '2025-03-10', 'Agricultural Land',
    'Clear', 'None', 30.8650, 75.8750,
    ST_GeomFromText('POLYGON((75.8750 30.8650, 75.87573 30.8650, 75.87573 30.86563, 75.8750 30.86563, 75.8750 30.8650))', 4326),
    'SETU Demonstration Dataset', 'DEMO'
),
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a05',
    'PROP-005',
    'Punjab', 'Ludhiana', 'Ludhiana East', 'Gill',
    '124/2', 'SUR-PB-5502', 'Priya Gupta', 4.10, 'Acres',
    'REG-2025-0555', '2025-07-05', 'Industrial Plot',
    'Clear', 'None', 30.8660, 75.8760,
    ST_GeomFromText('POLYGON((75.8760 30.8660, 75.87734 30.8660, 75.87734 30.86718, 75.8760 30.86718, 75.8760 30.8660))', 4326),
    'SETU Demonstration Dataset', 'DEMO'
),
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a08',
    'PROP-008',
    'Punjab', 'Amritsar', 'Amritsar-I', 'Khatrai Kalan',
    '88/3', 'SUR-PB-3310', 'Harpreet Singh', 3.00, 'Acres',
    'REG-2025-0914', '2025-01-22', 'Agricultural Land',
    'Active Mortgage (PNB)', 'None', 31.6340, 74.8720,
    ST_GeomFromText('POLYGON((74.8720 31.6340, 74.87317 31.6340, 74.87317 31.6350, 74.8720 31.6350, 74.8720 31.6340))', 4326),
    'SETU Demonstration Dataset', 'DEMO'
),

-- 3. HARYANA
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a06',
    'PROP-006',
    'Haryana', 'Gurugram', 'Gurugram', 'Sukhrali',
    '55/9', 'SUR-HR-9002', 'Vikram Malhotra', 3.50, 'Acres',
    'REG-2025-0991', '2025-05-19', 'Commercial Land',
    'Clear', 'None', 28.4720, 77.0450,
    ST_GeomFromText('POLYGON((77.0440 28.4710, 77.0449 28.4710, 77.0449 28.4719, 77.0440 28.4719, 77.0440 28.4710))', 4326),
    'SETU Demonstration Dataset', 'DEMO'
),
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a09',
    'PROP-009',
    'Haryana', 'Faridabad', 'Faridabad', 'Tilpat',
    '112/7', 'SUR-HR-4401', 'Anil Yadav', 1.65, 'Acres',
    'REG-2025-0441', '2025-04-18', 'Residential Plot',
    'Clear', 'None', 28.4080, 77.3170,
    ST_GeomFromText('POLYGON((77.3170 28.4080, 77.31786 28.4080, 77.31786 28.40872, 77.3170 28.40872, 77.3170 28.4080))', 4326),
    'SETU Demonstration Dataset', 'DEMO'
),

-- 4. MAHARASHTRA
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a10',
    'PROP-010',
    'Maharashtra', 'Pune', 'Haveli', 'Wagholi',
    '304/1', 'SUR-MH-2001', 'Suresh Deshmukh', 2.20, 'Acres',
    'REG-2025-1102', '2025-03-05', 'Mixed Agricultural / Commercial',
    'Clear', 'None', 18.5793, 73.9812,
    ST_GeomFromText('POLYGON((73.9812 18.5790, 73.9821 18.5790, 73.9821 18.57986, 73.9812 18.57986, 73.9812 18.5790))', 4326),
    'SETU Demonstration Dataset', 'DEMO'
),
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a11',
    'PROP-011',
    'Maharashtra', 'Nagpur', 'Nagpur Rural', 'Besur',
    '152/4', 'SUR-MH-6020', 'Nitin Patil', 4.50, 'Acres',
    'REG-2025-1405', '2025-06-28', 'Commercial Logistics Plot',
    'Active Mortgage (Bank of Maharashtra)', 'None', 21.1458, 79.0882,
    ST_GeomFromText('POLYGON((79.0882 21.1450, 79.0895 21.1450, 79.0895 21.14622, 79.0882 21.14622, 79.0882 21.1450))', 4326),
    'SETU Demonstration Dataset', 'DEMO'
),
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a12',
    'PROP-012',
    'Maharashtra', 'Mumbai City', 'Mumbai', 'Colaba Ward',
    '12/C', 'SUR-MH-1008', 'Meera Kulkarni', 0.45, 'Acres',
    'REG-2025-1901', '2025-01-15', 'Commercial Land',
    'Clear', 'Pending', 18.9220, 72.8340,
    ST_GeomFromText('POLYGON((72.8340 18.9220, 72.83439 18.9220, 72.83439 18.92241, 72.8340 18.92241, 72.8340 18.9220))', 4326),
    'SETU Demonstration Dataset', 'DEMO'
),

-- 5. KARNATAKA
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a13',
    'PROP-013',
    'Karnataka', 'Bengaluru Urban', 'Bengaluru East', 'Varthur',
    '142/2', 'SUR-KA-8801', 'Anand Murthy', 1.25, 'Acres',
    'REG-2025-2310', '2025-04-09', 'IT Corridor Tech Park',
    'Clear', 'None', 12.9380, 77.7470,
    ST_GeomFromText('POLYGON((77.7470 12.9380, 77.74767 12.9380, 77.74767 12.93863, 77.7470 12.93863, 77.7470 12.9380))', 4326),
    'SETU Demonstration Dataset', 'DEMO'
),
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a14',
    'PROP-014',
    'Karnataka', 'Mysuru', 'Mysuru', 'Hootagalli',
    '89/1', 'SUR-KA-5502', 'Lakshmi Narayana', 2.00, 'Acres',
    'REG-2025-2511', '2025-05-30', 'Residential Layout',
    'Clear', 'None', 12.3370, 76.5820,
    ST_GeomFromText('POLYGON((76.5820 12.3370, 76.58283 12.3370, 76.58283 12.33781, 76.5820 12.33781, 76.5820 12.3370))', 4326),
    'SETU Demonstration Dataset', 'DEMO'
),

-- 6. DELHI
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a15',
    'PROP-015',
    'Delhi', 'North Delhi', 'Alipur', 'Bakhtawarpur',
    '77/14', 'SUR-DL-3001', 'Ramesh Chand', 1.60, 'Acres',
    'REG-2025-3105', '2025-02-18', 'Farmhouse Land',
    'Clear', 'None', 28.8180, 77.1510,
    ST_GeomFromText('POLYGON((77.1510 28.8180, 77.15183 28.8180, 77.15183 28.81872, 77.1510 28.81872, 77.1510 28.8180))', 4326),
    'SETU Demonstration Dataset', 'DEMO'
),
(
    'd9b7f52a-3023-4e4a-939e-2144d1872a16',
    'PROP-016',
    'Delhi', 'South Delhi', 'Mehrauli', 'Chattarpur',
    '201/5', 'SUR-DL-9040', 'Kavita Singhania', 2.10, 'Acres',
    'REG-2025-3601', '2025-07-11', 'Residential Plot',
    'Clear', 'None', 28.5020, 77.1810,
    ST_GeomFromText('POLYGON((77.1810 28.5020, 77.18197 28.5020, 77.18197 28.50281, 77.1810 28.50281, 77.1810 28.5020))', 4326),
    'SETU Demonstration Dataset', 'DEMO'
)
ON CONFLICT (property_id) DO UPDATE SET
    state = EXCLUDED.state,
    district = EXCLUDED.district,
    tehsil = EXCLUDED.tehsil,
    village = EXCLUDED.village,
    khasra_number = EXCLUDED.khasra_number,
    survey_number = EXCLUDED.survey_number,
    owner_name = EXCLUDED.owner_name,
    area_value = EXCLUDED.area_value,
    area_unit = EXCLUDED.area_unit,
    registration_number = EXCLUDED.registration_number,
    registration_date = EXCLUDED.registration_date,
    land_use = EXCLUDED.land_use,
    encumbrance_status = EXCLUDED.encumbrance_status,
    court_case_status = EXCLUDED.court_case_status,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    geometry = EXCLUDED.geometry,
    updated_at = NOW();
