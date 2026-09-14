// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// Server-Side Database Service with PostGIS & Supabase

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Property, VerificationHistoryItem, VerificationResult, LandDocument } from '../types';
import { DEMO_PROPERTIES, DEMO_HISTORY } from './demoFallback';
import { calculateParcelAreaAcres } from '../gis/parcelArea';

let serverSupabaseClient: SupabaseClient | null = null;

// In-memory store for fallback execution when Supabase credentials are not provided
const inMemoryHistory: VerificationHistoryItem[] = [...DEMO_HISTORY];
const inMemoryDocuments: Map<string, LandDocument> = new Map();
const inMemoryVerificationResults: Map<string, VerificationResult> = new Map();

export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url && key);
}

export function getServerSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  if (!serverSupabaseClient) {
    const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!;
    const key = (
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    )!;

    serverSupabaseClient = createClient(url, key, {
      auth: { persistSession: false },
    });
  }

  return serverSupabaseClient;
}

/**
 * Searches properties across PostGIS-enabled database with fallback
 */
export async function searchProperties(filters: {
  state?: string;
  district?: string;
  tehsil?: string;
  village?: string;
  khasra?: string;
  query?: string;
}): Promise<Property[]> {
  const supabase = getServerSupabase();

  if (supabase) {
    try {
      let q = supabase.from('properties').select('*');

      if (filters.state) q = q.ilike('state', `%${filters.state}%`);
      if (filters.district) q = q.ilike('district', `%${filters.district}%`);
      if (filters.tehsil) q = q.ilike('tehsil', `%${filters.tehsil}%`);
      if (filters.village) q = q.ilike('village', `%${filters.village}%`);
      if (filters.khasra) q = q.eq('khasra_number', filters.khasra);

      if (filters.query) {
        q = q.or(
          `property_id.ilike.%${filters.query}%,owner_name.ilike.%${filters.query}%,khasra_number.ilike.%${filters.query}%`
        );
      }

      const { data, error } = await q.limit(20);
      if (!error && data && data.length > 0) {
        return data as Property[];
      }
    } catch (err) {
      console.warn('Supabase property query encountered an issue; falling back to demo repository:', err);
    }
  }

  // Fallback to demo properties
  return DEMO_PROPERTIES.filter((p) => {
    if (filters.state && !p.state.toLowerCase().includes(filters.state.toLowerCase())) return false;
    if (filters.district && !p.district.toLowerCase().includes(filters.district.toLowerCase())) return false;
    if (filters.tehsil && !p.tehsil.toLowerCase().includes(filters.tehsil.toLowerCase())) return false;
    if (filters.village && !p.village.toLowerCase().includes(filters.village.toLowerCase())) return false;
    if (filters.khasra && p.khasra_number !== filters.khasra && p.survey_number !== filters.khasra) return false;

    if (filters.query) {
      const q = filters.query.toLowerCase();
      const matchesId = p.property_id.toLowerCase().includes(q);
      const matchesOwner = p.owner_name.toLowerCase().includes(q);
      const matchesKhasra = p.khasra_number.toLowerCase().includes(q);
      const matchesVillage = p.village.toLowerCase().includes(q);
      if (!matchesId && !matchesOwner && !matchesKhasra && !matchesVillage) return false;
    }

    return true;
  });
}

/**
 * Retrieves a single property by Property ID or UUID
 */
export async function getPropertyById(idOrPropId: string): Promise<Property | null> {
  const supabase = getServerSupabase();

  if (supabase) {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrPropId);
      let query = supabase.from('properties').select('*');

      if (isUUID) {
        query = query.or(`id.eq.${idOrPropId},property_id.eq.${idOrPropId}`);
      } else {
        query = query.or(`property_id.eq.${idOrPropId},khasra_number.eq.${idOrPropId}`);
      }

      const { data, error } = await query.single();
      if (!error && data) {
        return data as Property;
      }
    } catch (err) {
      console.warn('Supabase single property query error; using demo dataset:', err);
    }
  }

  const clean = idOrPropId.toLowerCase().trim();
  const found = DEMO_PROPERTIES.find(
    (p) => p.property_id.toLowerCase() === clean || p.id.toLowerCase() === clean || p.khasra_number.toLowerCase() === clean
  );

  return found || null;
}

/**
 * Computes parcel area using PostGIS RPC or fallback geodesic Shoelace
 */
export async function calculateParcelArea(geom: any): Promise<number> {
  const supabase = getServerSupabase();
  if (supabase && geom) {
    try {
      const { data, error } = await supabase.rpc('calculate_parcel_area_acres', { geom });
      if (!error && data !== null && !isNaN(Number(data))) {
        return Number(data);
      }
    } catch (err) {
      console.warn('PostGIS area calculation error:', err);
    }
  }
  return calculateParcelAreaAcres(geom);
}

/**
 * Validates parcel geometry using PostGIS RPC
 */
export async function validateParcelGeometry(geom: any): Promise<{ valid: boolean; reason?: string }> {
  const supabase = getServerSupabase();
  if (supabase && geom) {
    try {
      const { data, error } = await supabase.rpc('validate_parcel_geometry', { geom });
      if (!error && data) {
        return data as { valid: boolean; reason?: string };
      }
    } catch (err) {
      console.warn('PostGIS validate_parcel_geometry error:', err);
    }
  }
  return {
    valid: Boolean(geom && geom.type === 'Polygon' && geom.coordinates?.[0]?.length >= 3),
    reason: 'Evaluated locally',
  };
}

/**
 * Saves document metadata into Supabase or fallback memory
 */
export async function saveDocument(doc: LandDocument): Promise<LandDocument> {
  const supabase = getServerSupabase();

  if (supabase) {
    try {
      let resolvedPropertyUuid: string | null = null;
      if (doc.property_id) {
        const prop = await getPropertyById(doc.property_id);
        resolvedPropertyUuid = prop?.id || null;
      }

      const { data, error } = await supabase
        .from('documents')
        .insert({
          id: doc.id.includes('-') && doc.id.length === 36 ? doc.id : undefined,
          property_id: resolvedPropertyUuid,
          file_name: doc.file_name,
          file_path: doc.file_path,
          mime_type: doc.mime_type,
          file_size: doc.file_size,
          document_type: doc.document_type,
          ocr_status: doc.ocr_status,
          ocr_provider: doc.ocr_provider,
          ocr_confidence: doc.ocr_confidence,
          raw_ocr_text: doc.raw_ocr_text,
          extracted_fields: doc.extracted_fields,
          uploaded_at: doc.uploaded_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && data) {
        return data as LandDocument;
      }
    } catch (err) {
      console.warn('Failed to insert document into Supabase:', err);
    }
  }

  inMemoryDocuments.set(doc.id, doc);
  return doc;
}

/**
 * Retrieves document by ID
 */
export async function getDocumentById(id: string): Promise<LandDocument | null> {
  const supabase = getServerSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('documents').select('*').eq('id', id).single();
      if (!error && data) {
        return data as LandDocument;
      }
    } catch (err) {
      console.warn('Failed to fetch document from Supabase:', err);
    }
  }

  return inMemoryDocuments.get(id) || null;
}

/**
 * Saves verification audit result
 */
export async function saveVerificationResult(result: VerificationResult): Promise<string> {
  const supabase = getServerSupabase();
  const generatedResultId = result.id || `res-${Date.now()}`;
  result.id = generatedResultId;

  if (supabase) {
    try {
      const prop = await getPropertyById(result.property_id);
      const propertyUuid = prop?.id || null;

      let validDocumentUuid: string | null = null;
      if (result.document_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(result.document_id)) {
        validDocumentUuid = result.document_id;
      }

      if (propertyUuid) {
        const { data, error } = await supabase
          .from('verification_results')
          .insert({
            property_id: propertyUuid,
            document_id: validDocumentUuid,
            ownership_score: result.ownership_score,
            khasra_score: result.khasra_score,
            area_score: result.area_score,
            registration_score: result.registration_score,
            encumbrance_score: result.encumbrance_score,
            court_score: result.court_score,
            gis_score: result.gis_score,
            total_score: result.total_score,
            risk_level: result.risk_level,
            mismatches: result.mismatches,
            verification_details: result.factors,
          })
          .select('id')
          .single();

        if (!error && data) {
          result.id = data.id;
          // Record in verification_history table
          await supabase.from('verification_history').insert({
            property_id: propertyUuid,
            verification_result_id: data.id,
          });
        }
      }
    } catch (err) {
      console.warn('Failed to insert verification result to Supabase:', err);
    }
  }

  const finalId = result.id || generatedResultId;
  result.id = finalId;
  inMemoryVerificationResults.set(finalId, result);

  // Also record in verification history
  const historyItem: VerificationHistoryItem = {
    id: `hist-${Date.now()}`,
    property_id: result.property_id,
    owner_name: result.factors.ownership.govtValue ? String(result.factors.ownership.govtValue) : 'Verified Title',
    score: result.total_score,
    risk_level: result.risk_level,
    status: result.total_score >= 80 ? 'Verified' : 'Issues Found',
    mismatches_count: result.mismatches.length,
    run_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  };

  await saveHistoryItem(historyItem);
  return result.id;
}

/**
 * Retrieves verification result by ID
 */
export async function getVerificationResultById(id: string): Promise<VerificationResult | null> {
  const supabase = getServerSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('verification_results').select('*').eq('id', id).single();
      if (!error && data) {
        return data as VerificationResult;
      }
    } catch (err) {
      console.warn('Failed to fetch verification result from Supabase:', err);
    }
  }

  return inMemoryVerificationResults.get(id) || null;
}

/**
 * Retrieves verification history
 */
export async function getVerificationHistory(propertyId?: string): Promise<VerificationHistoryItem[]> {
  const supabase = getServerSupabase();

  if (supabase) {
    try {
      let q = supabase
        .from('verification_history')
        .select(`
          id,
          created_at,
          properties (
            property_id,
            owner_name
          ),
          verification_results (
            total_score,
            risk_level,
            mismatches
          )
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await q.limit(50);
      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          property_id: row.properties?.property_id || 'PROP-001',
          owner_name: row.properties?.owner_name || 'Verified Owner',
          score: row.verification_results?.total_score ?? 100,
          risk_level: row.verification_results?.risk_level || 'LOW',
          status: (row.verification_results?.total_score ?? 100) >= 80 ? 'Verified' : 'Issues Found',
          mismatches_count: row.verification_results?.mismatches?.length ?? 0,
          run_date: new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch verification history from Supabase:', err);
    }
  }

  if (propertyId) {
    return inMemoryHistory.filter((h) => h.property_id.toLowerCase() === propertyId.toLowerCase());
  }

  return inMemoryHistory;
}

export async function saveHistoryItem(item: VerificationHistoryItem): Promise<void> {
  // Add to memory, deduplicating previous runs for same property
  const filtered = inMemoryHistory.filter((h) => h.property_id !== item.property_id);
  inMemoryHistory.length = 0;
  inMemoryHistory.push(item, ...filtered);
}
