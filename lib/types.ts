// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// Centralized TypeScript Type Definitions

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // GeoJSON format: array of linear ring coordinate arrays [lng, lat]
}

export interface MortgageDetails {
  bank: string;
  amount: string;
  date: string;
}

export interface CourtCaseDetails {
  caseId: string;
  court: string;
  status: string;
  issue: string;
}

export interface Property {
  id: string;
  property_id: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  khasra_number: string;
  survey_number?: string;
  owner_name: string;
  father_name?: string;
  co_owners?: string[];
  area_value: number;
  area_unit: string;
  registration_number?: string;
  registration_date?: string;
  land_use?: string;
  encumbrance_status: string;
  mortgage_details?: MortgageDetails | null;
  court_case_status: string;
  court_case_details?: CourtCaseDetails | null;
  source: string;
  source_type: string;
  latitude: number;
  longitude: number;
  geometry?: GeoJSONPolygon | null;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PropertyRecord {
  id: string;
  property_id: string;
  record_type: string;
  source_name: string;
  source_reference?: string;
  record_data: Record<string, unknown>;
  record_date?: string;
  created_at?: string;
}

export interface ExtractedDocumentFields {
  owner_name?: string | null;
  father_name?: string | null;
  co_owner_names?: string[] | null;
  khasra_number?: string | null;
  survey_number?: string | null;
  area_value?: number | null;
  area_unit?: string | null;
  village?: string | null;
  tehsil?: string | null;
  district?: string | null;
  state?: string | null;
  registration_number?: string | null;
  registration_date?: string | null;
  property_address?: string | null;
  land_use?: string | null;
  boundaries?: string | null;
  document_number?: string | null;
}

export interface LandDocument {
  id: string;
  property_id?: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  document_type: string;
  uploaded_at: string;
  ocr_status: 'pending' | 'processing' | 'completed' | 'failed';
  ocr_provider: string;
  ocr_confidence?: number;
  raw_ocr_text?: string;
  extracted_fields?: ExtractedDocumentFields;
  created_at?: string;
}

export interface VerificationFactor {
  score: number;
  maxScore: number;
  status: 'match' | 'partial' | 'mismatch' | 'clear' | 'active' | 'pending' | 'warning';
  title: string;
  details: string;
  govtValue?: string | number | null;
  docValue?: string | number | null;
}

export interface VerificationMismatch {
  field: string;
  expected: string;
  found: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export interface VerificationResult {
  id?: string;
  property_id: string;
  document_id?: string;
  ownership_score: number;
  khasra_score: number;
  area_score: number;
  registration_score: number;
  encumbrance_score: number;
  court_score: number;
  gis_score: number;
  total_score: number;
  risk_level: RiskLevel;
  mismatches: VerificationMismatch[];
  factors: {
    ownership: VerificationFactor;
    khasra: VerificationFactor;
    area: VerificationFactor;
    registration: VerificationFactor;
    encumbrance: VerificationFactor;
    court: VerificationFactor;
    gis: VerificationFactor;
  };
  recommendation: string;
  created_at?: string;
}

export interface VerificationHistoryItem {
  id: string;
  property_id: string;
  owner_name: string;
  score: number;
  risk_level: RiskLevel;
  status: string;
  mismatches_count: number;
  run_date: string;
  created_at?: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  provider: string;
  isFallback?: boolean;
}
