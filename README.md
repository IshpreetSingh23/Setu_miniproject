<div align="center">

# 🌉 SETU
### Integrated GIS-Based Digital Public Infrastructure for Land Governance

**Smart India Hackathon (SIH) | Team Code Seekers**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase PostGIS](https://img.shields.io/badge/PostgreSQL_PostGIS-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet_GIS-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Google Cloud Vision](https://img.shields.io/badge/Google_Cloud_Vision-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com/vision)

*Fragmented data breeds fraud. 🌉 SETU bridges the gap between physical deeds, cadastral GIS parcel geometry, and authoritative digital land registries.*

</div>

---

## 📖 The Vision

Property verification across India is currently hampered by fragmented information: ownership ledgers, cadastral maps, mortgage liens, and court disputes reside in disconnected databases. Physical sale deeds often contain deviations in area, spelling, or unrecorded financial encumbrances.

**SETU** is an **Integrated GIS-Based Digital Public Infrastructure (DPI)** for land governance with an intelligent verification and risk-analysis layer:

```
LAND PARCEL
    ↓
GIS LOCATION + POSTGIS GEOMETRY
    ↓
INTEGRATED LAND INFORMATION
    ├── Ownership & Co-Owners
    ├── Registration Deed Records
    ├── Recorded Area vs Cadastral Geodesic Area
    ├── Khasra / Survey Number
    ├── Banking Encumbrance / Collateral Mortgage
    ├── Judicial Court Litigation / Dispute Status
    └── Land Use Classification
    ↓
DOCUMENT OCR (Google Cloud Vision DOCUMENT_TEXT_DETECTION)
    ↓
CROSS-VERIFICATION ENGINE (7-Factor Analysis)
    ↓
RISK ANALYSIS (Score 0–100, LOW / MEDIUM / HIGH)
    ↓
OFFICIAL VERIFICATION CERTIFICATE (Audit Hash QR)
```

---

## 🗄️ Supabase Relational Database Schema & PostGIS

SETU replaces all in-memory mock structures with a normalized, PostGIS-enabled PostgreSQL schema in Supabase:

### 1. `properties`
Core registry table storing parcels with spatial geometry:
- `id` (UUID, Primary Key, `DEFAULT gen_random_uuid()`)
- `property_id` (TEXT, UNIQUE, NOT NULL, e.g., `PROP-002`)
- `state`, `district`, `tehsil`, `village` (TEXT, NOT NULL)
- `khasra_number` (TEXT, NOT NULL), `survey_number` (TEXT)
- `owner_name` (TEXT, NOT NULL), `father_name` (TEXT), `co_owners` (JSONB)
- `area_value` (NUMERIC(12, 4), NOT NULL), `area_unit` (TEXT, e.g., `Acres`)
- `registration_number` (TEXT), `registration_date` (DATE)
- `land_use` (TEXT), `encumbrance_status` (TEXT), `mortgage_details` (JSONB)
- `court_case_status` (TEXT), `court_case_details` (JSONB)
- `source` (TEXT), `source_type` (TEXT, e.g., `DEMO` or `GOVERNMENT_API`)
- `latitude`, `longitude` (DOUBLE PRECISION)
- `geometry` (`GEOMETRY(GEOMETRY, 4326)` — PostGIS spatial polygon with GIST index)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 2. `property_records`
Provenance and multi-source audit trail ledger:
- `id` (UUID, Primary Key)
- `property_id` (UUID, Foreign Key `REFERENCES properties(id) ON DELETE CASCADE`)
- `record_type` (TEXT, e.g., `REVENUE_RECORD`, `REGISTRATION_RECORD`)
- `source_name` (TEXT), `source_reference` (TEXT)
- `record_data` (JSONB), `record_date` (DATE), `created_at` (TIMESTAMPTZ)

### 3. `documents`
Uploaded deeds and title documents stored in Supabase Storage:
- `id` (UUID, Primary Key)
- `property_id` (UUID, Foreign Key `REFERENCES properties(id) ON DELETE SET NULL`)
- `file_name` (TEXT), `file_path` (TEXT in `property-documents` bucket)
- `mime_type` (TEXT), `file_size` (BIGINT), `document_type` (TEXT)
- `ocr_status` (TEXT: `pending`, `processing`, `completed`, `failed`)
- `ocr_provider` (TEXT), `ocr_confidence` (NUMERIC)
- `raw_ocr_text` (TEXT), `extracted_fields` (JSONB)
- `uploaded_at`, `processed_at` (TIMESTAMPTZ)

### 4. `verification_results`
Detailed breakdown of the 7-factor verification evaluation:
- `id` (UUID, Primary Key)
- `property_id` (UUID, Foreign Key `REFERENCES properties(id) ON DELETE CASCADE`)
- `document_id` (UUID, Foreign Key `REFERENCES documents(id) ON DELETE SET NULL`)
- `ownership_score` (25 pts), `khasra_score` (20 pts), `area_score` (15 pts)
- `registration_score` (15 pts), `encumbrance_score` (10 pts), `court_score` (10 pts), `gis_score` (5 pts)
- `total_score` (NUMERIC, 0–100), `risk_level` (TEXT: `LOW`, `MEDIUM`, `HIGH`)
- `mismatches` (JSONB array), `verification_details` (JSONB)
- `created_at` (TIMESTAMPTZ)

### 5. `verification_history`
Chronological verification run history:
- `id` (UUID, Primary Key)
- `property_id` (UUID, Foreign Key `REFERENCES properties(id) ON DELETE CASCADE`)
- `verification_result_id` (UUID, Foreign Key `REFERENCES verification_results(id) ON DELETE CASCADE`)
- `created_at` (TIMESTAMPTZ)

---

## 🗺️ PostGIS Functions & Stored Procedures

PostGIS stored functions in `supabase/migrations/005_postgis_functions.sql`:
1. `calculate_parcel_area_acres(geom GEOMETRY)`: Computes geodesic area on ellipsoidal geography in square meters and converts directly to Acres using `ST_Area(geom::geography) / 4046.8564224`.
2. `validate_parcel_geometry(geom GEOMETRY)`: Validates topological polygon integrity using `ST_IsValid(geom)` and returns failure reasons if degenerate.
3. `get_property_geojson(p_property_id TEXT)`: Returns GeoJSON Feature representing the parcel boundary and associated registry metadata.
4. `search_properties_spatial(p_lat, p_lng, p_radius_meters)`: Spatial proximity query finding parcels within a given radial distance using `ST_DWithin`.

---

## ⚖️ 7-Factor Verification Weights

| Factor | Max Weight | Logic & Evaluation |
| :--- | :---: | :--- |
| **Ownership Verification** | **25 pts** | Exact normalized match (25 pts), fuzzy match with honorific stripping (20 pts), mismatch (0 pts). |
| **Khasra / Survey Number** | **20 pts** | Exact normalized cadastral identifier match (20 pts), mismatch (0 pts). |
| **Area & Tolerance** | **15 pts** | Exact (15 pts), within legal tolerance &le;10% (7 pts), discrepancy &gt;10% (0 pts). Normalized across Acres, Hectares, Gaj, Bigha, and Sq Meters. |
| **Registration Deed** | **15 pts** | Normalized sub-registrar registration number verification (15 pts). |
| **Financial Encumbrance** | **10 pts** | Clear title (10 pts), active bank mortgage or collateral lien (0 pts, flags bank & amount). |
| **Litigation / Dispute Status** | **10 pts** | Clear (10 pts), active lawsuit or judicial stay order (0 pts, flags court & case ID). |
| **GIS Parcel Consistency** | **5 pts** | Valid PostGIS geometry whose geodesic Shoelace area matches recorded area (5 pts). |
| **Total Score** | **100 pts** | **80–100: LOW RISK** \| **60–79: MEDIUM RISK** \| **0–59: HIGH RISK** |

---

## 🧪 Demonstration Dataset & Risk Scenarios

SETU includes pre-seeded demonstration properties stored in Supabase with PostGIS geometries:

| Property ID | Location | Owner | Scenario Tested | Expected Score / Risk |
| :--- | :--- | :--- | :--- | :--- |
| **PROP-001** | Malihabad, UP | Rajesh Kumar | Active SBI Mortgage (₹18.5 Lakhs) | **MEDIUM RISK (65%)** |
| **PROP-002** | Malihabad, UP | Amit Sharma | Clear Title, Exact Match, Consistent GIS | **LOW RISK (95–100%)** |
| **PROP-003** | Malihabad, UP | Sunita Devi | Active HDFC Mortgage + Lucknow Court Dispute | **HIGH RISK (<60%)** |
| **PROP-004** | Ludhiana, PB | Mohan Singh | Clear Agricultural Land | **LOW RISK (95%)** |
| **PROP-005** | Ludhiana, PB | Priya Gupta | Deed Khasra & Area Discrepancies | **MEDIUM RISK (70%)** |
| **PROP-006** | Gurugram, HR | Vikram Malhotra | GIS Polygon Deviates >15% from Revenue Area | **GIS INCONSISTENCY ALERT** |

> **Transparency Notice:** Demo records are explicitly tagged as `SETU Demonstration Dataset (DEMO)`. Live state land gateway integrations (Bhulekh, Bhoomi, Dharani) are architected via `/lib/integrations/landRecords/governmentProvider.ts` pending official state API authorization.

---

## 🚀 Setting Up Supabase & Running Locally

### 1. Prerequisites
- Node.js 18+ or 20+
- npm 9+
- A Supabase Project (free at [supabase.com](https://supabase.com))

### 2. Configure Supabase Cloud
1. Go to your Supabase project dashboard at [supabase.com](https://supabase.com).
2. Navigate to the **SQL Editor**.
3. Run the migrations in numerical order:
   - `supabase/migrations/001_enable_postgis.sql`
   - `supabase/migrations/002_create_tables.sql`
   - `supabase/migrations/003_rls_and_indexes.sql`
   - `supabase/migrations/005_postgis_functions.sql`
   - `supabase/seed.sql` *(or `supabase/migrations/004_seed_demo_properties.sql`)*
4. Ensure the storage bucket `property-documents` is created (automatically created in migration 003).

### 3. Local Environment Variables
Create `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project details:
```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=property-documents
```
*(The application includes a built-in demo database fallback, allowing immediate testing even before credentials are set.)*

### 4. Run Automated Test Suite
```bash
npm test
```
Executes Vitest verifying area unit conversions, bilingual Hindi/English OCR parsing, Shoelace geodesic parcel calculations, and 7-factor risk scoring (17 tests).

### 5. Build and Run
```bash
npm run build
npm run start
```
The application will be live at [http://localhost:3000](http://localhost:3000).

---

## 🌐 Deploying to Vercel

The project is architected for zero-configuration, single-project deployment on Vercel:

1. **Push to GitHub**:
   Ensure your code is pushed to your GitHub repository.
2. **Import into Vercel**:
   Go to [vercel.com/new](https://vercel.com/new) and select the repository.
3. **Configure Environment Variables**:
   In Vercel Project Settings &rarr; Environment Variables, configure:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`
   - `GOOGLE_CLOUD_PROJECT_ID`
   - `GOOGLE_CLOUD_CLIENT_EMAIL`
   - `GOOGLE_CLOUD_PRIVATE_KEY`
4. **Deploy**:
   Click **Deploy**. Next.js App Router will compile all static pages and dynamic route handlers automatically.

---

## 🔒 Security & Privacy

- **No Secrets in Client Bundle**: Google Cloud private keys and Supabase service role keys are strictly executed within server-side route handlers.
- **Row Level Security (RLS)**: Enforces table policies protecting uploaded documents and sensitive audit trails.
- **Input & MIME Validation**: Uploaded documents are validated against strict MIME and 15MB size limits.

---

## 📜 Disclaimer
SETU is a Digital Public Infrastructure demonstration prototype developed for Smart India Hackathon. Risk ratings and verification outputs represent automated screening indicators and do not constitute legal title certification.
