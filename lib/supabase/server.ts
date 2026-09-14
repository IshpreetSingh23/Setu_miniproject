// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// Server-Side Database Service with PostGIS & Supabase

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Property, VerificationHistoryItem, VerificationResult, LandDocument } from '../types';
import { DEMO_PROPERTIES, DEMO_HISTORY } from './demoFallback';

let serverSupabaseClient: SupabaseClient | null = null;

// In-memory store for documents and history during demo/fallback execution
const inMemoryHistory: VerificationHistoryItem[] = [...DEMO_HISTORY];
const inMemoryDocuments: Map<string, LandDocument> = new Map();

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  );
}

export function getServerSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  if (!serverSupabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!;
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
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .or(`property_id.eq.${idOrPropId},id.eq.${idOrPropId}`)
        .single();

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
 * Saves document metadata into Supabase or fallback memory
 */
export async function saveDocument(doc: LandDocument): Promise<LandDocument> {
  const supabase = getServerSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('documents').insert(doc).select().single();
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
export async function saveVerificationResult(result: VerificationResult): Promise<void> {
  const supabase = getServerSupabase();

  if (supabase) {
    try {
      await supabase.from('verification_results').insert({
        property_id: result.property_id,
        document_id: result.document_id,
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
      });
    } catch (err) {
      console.warn('Failed to insert verification result to Supabase:', err);
    }
  }

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
}

/**
 * Retrieves verification history
 */
export async function getVerificationHistory(propertyId?: string): Promise<VerificationHistoryItem[]> {
  const supabase = getServerSupabase();

  if (supabase) {
    try {
      let q = supabase.from('verification_history').select('*').order('created_at', { ascending: false });
      if (propertyId) {
        q = q.eq('property_id', propertyId);
      }
      const { data, error } = await q.limit(50);
      if (!error && data && data.length > 0) {
        return data as VerificationHistoryItem[];
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
  const supabase = getServerSupabase();

  if (supabase) {
    try {
      await supabase.from('verification_history').insert({
        property_id: item.property_id,
        owner_name: item.owner_name,
        score: item.score,
        risk_level: item.risk_level,
        status: item.status,
        mismatches_count: item.mismatches_count,
        run_date: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Failed to insert verification history into Supabase:', err);
    }
  }

  // Add to memory, deduplicating previous runs for same property
  const filtered = inMemoryHistory.filter((h) => h.property_id !== item.property_id);
  inMemoryHistory.length = 0;
  inMemoryHistory.push(item, ...filtered);
}
