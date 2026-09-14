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

## 🏗️ Production Architecture

The system is deployed as **ONE unified Next.js project on Vercel**:

- **Frontend**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Leaflet GeoJSON mapping, bilingual English/Hindi localization.
- **Backend**: Serverless Next.js Route Handlers (`/api/...`), strict request validation, isolated credential management.
- **Database**: Supabase PostgreSQL with **PostGIS spatial extension** for polygon parcel boundary storage and indexing.
- **File Storage**: Supabase Storage bucket (`property-documents`) for deed PDFs and images.
- **OCR Engine**: Google Cloud Vision API (`DOCUMENT_TEXT_DETECTION`) via secure REST gateway with bilingual (English + Hindi) structured attribute parsing.
- **Verification Engine**: Configurable 7-factor weighted scoring algorithm with area unit conversions and geographic tolerance matching.

---

## ⚖️ 7-Factor Verification Engine

| Factor | Weight | Scoring & Logic |
| :--- | :---: | :--- |
| **Ownership Matching** | **25 pts** | Exact match (25 pts), fuzzy match with honorific stripping (20 pts), conflict (0 pts). |
| **Khasra / Survey Number** | **20 pts** | Exact normalized cadastral identifier match (20 pts), mismatch (0 pts). |
| **Area & Tolerance** | **15 pts** | Exact (15 pts), within legal tolerance &le;10% (7 pts), discrepancy &gt;10% (0 pts). Normalized across Acres, Hectares, Gaj, Bigha, and Sq Meters. |
| **Registration Deed** | **15 pts** | Normalized sub-registrar registration number verification (15 pts). |
| **Financial Encumbrance** | **10 pts** | Clear title (10 pts), active bank mortgage or collateral lien (0 pts, flags bank & amount). |
| **Litigation / Dispute Status** | **10 pts** | Clear (10 pts), active lawsuit or judicial stay order (0 pts, flags court & case ID). |
| **GIS Parcel Consistency** | **5 pts** | Valid PostGIS geometry whose geodesic Shoelace area matches recorded area (5 pts). |
| **Total Score** | **100 pts** | **80–100: LOW RISK** \| **60–79: MEDIUM RISK** \| **0–59: HIGH RISK** |

---

## 🧪 Demonstration Dataset & Risk Scenarios

SETU ships with pre-seeded demo properties representing distinct legal scenarios:

| Property ID | Location | Owner | Scenario Tested | Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| **PROP-001** | Malihabad, UP | Rajesh Kumar | Active SBI Mortgage (₹18.5 Lakhs) | **MEDIUM RISK** |
| **PROP-002** | Malihabad, UP | Amit Sharma | Clear Title, Exact Match, Consistent GIS | **LOW RISK (95%)** |
| **PROP-003** | Malihabad, UP | Sunita Devi | Active HDFC Mortgage + Lucknow Court Dispute | **HIGH RISK (<60%)** |
| **PROP-004** | Ludhiana, PB | Mohan Singh | Clear Agricultural Land | **LOW RISK** |
| **PROP-005** | Ludhiana, PB | Priya Gupta | Deed Khasra & Area Discrepancies | **MEDIUM RISK** |
| **PROP-006** | Gurugram, HR | Vikram Malhotra | GIS Polygon Deviates >15% from Revenue Area | **GIS ALERT** |

> **Transparency Notice:** Demo records are explicitly tagged as `SETU Demonstration Dataset (DEMO)`. Live state land gateway integrations (Bhulekh, Bhoomi, Dharani) are architected via `/lib/integrations/landRecords/governmentProvider.ts` pending official authorization.

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Node.js 18+ or 20+
- npm 9+

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(The application includes a built-in demo database fallback, allowing immediate local testing even before Supabase or Google Cloud credentials are added.)*

### 4. Run Automated Test Suite
```bash
npm test
```
Runs Vitest verifying area conversions, fuzzy owner matching, Khasra normalization, GIS Shoelace area calculation, and 7-factor risk scoring.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

The project is architected for zero-configuration, single-project deployment on Vercel:

1. **Push to GitHub**:
   Ensure your code is pushed to your GitHub repository.
2. **Import into Vercel**:
   Go to [vercel.com/new](https://vercel.com/new) and select the repository.
3. **Set Environment Variables**:
   In Vercel Project Settings &rarr; Environment Variables, configure:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GOOGLE_CLOUD_PROJECT_ID`
   - `GOOGLE_CLOUD_CLIENT_EMAIL`
   - `GOOGLE_CLOUD_PRIVATE_KEY` *(or `GOOGLE_CLOUD_API_KEY`)*
4. **Deploy**:
   Click **Deploy**. Next.js App Router will compile all static pages and dynamic route handlers automatically.

---

## 🗄️ Supabase PostGIS Setup

To link your live Supabase cloud database:

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase Dashboard.
3. Execute the migration scripts in numerical order:
   - `supabase/migrations/001_enable_postgis.sql`
   - `supabase/migrations/002_create_tables.sql`
   - `supabase/migrations/003_rls_and_indexes.sql`
   - `supabase/migrations/004_seed_demo_properties.sql`
4. Create a public Storage bucket named `property-documents` in Supabase Storage.
5. Copy your project URL and service role key into your `.env.local` or Vercel settings.

---

## 🔒 Security & Privacy

- **No Secrets in Client Bundle**: Google Cloud private keys and Supabase service role keys are strictly executed within server-side route handlers.
- **Row Level Security (RLS)**: Protects uploaded deed documents and sensitive audit trails.
- **Input & MIME Validation**: Uploaded documents are validated against strict MIME and 15MB size limits.

---

## 📜 Disclaimer
SETU is a Digital Public Infrastructure demonstration prototype developed for Smart India Hackathon. Risk ratings and verification outputs represent automated screening indicators and do not constitute legal title certification.
