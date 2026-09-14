// SETU: Verification Engine Tests

import { describe, it, expect } from 'vitest';
import { runVerification, normalizePersonName, normalizeIdentifier } from './engine';
import { DEMO_PROPERTIES } from '../supabase/demoFallback';

describe('Verification Engine', () => {
  it('normalizes person names removing honorifics and extra whitespace', () => {
    expect(normalizePersonName('Shri Rajesh Kumar')).toBe('rajesh kumar');
    expect(normalizePersonName('Smt. Sunita Devi')).toBe('sunita devi');
    expect(normalizePersonName('श्री अमित शर्मा')).toBe('अमित शर्मा');
  });

  it('normalizes identifiers removing dashes, slashes, and spaces', () => {
    expect(normalizeIdentifier('123 / 4')).toBe('123/4'.replace(/[\s\-_]/g, ''));
    expect(normalizeIdentifier('REG-2025-0192')).toBe('REG20250192');
  });

  it('correctly classifies a clear property as LOW RISK with high score', () => {
    const prop = DEMO_PROPERTIES.find((p) => p.property_id === 'PROP-002')!;
    const extractedFields = {
      owner_name: 'Amit Sharma',
      father_name: 'Som Nath',
      khasra_number: '123/5',
      area_value: 1.80,
      area_unit: 'Acres',
      registration_number: 'REG-2025-0456',
    };

    const result = runVerification(prop, extractedFields);
    expect(result.total_score).toBeGreaterThanOrEqual(80);
    expect(result.risk_level).toBe('LOW');
    expect(result.factors.ownership.status).toBe('match');
    expect(result.factors.khasra.status).toBe('match');
    expect(result.factors.encumbrance.status).toBe('clear');
    expect(result.factors.court.status).toBe('clear');
  });

  it('correctly flags an active mortgage and area mismatch dropping score to MEDIUM RISK', () => {
    const prop = DEMO_PROPERTIES.find((p) => p.property_id === 'PROP-001')!; // Active mortgage
    const extractedFields = {
      owner_name: 'Rajesh Kumar',
      khasra_number: '123/4',
      area_value: 2.80, // Mismatch (2.8 vs 2.5)
      area_unit: 'Acres',
      registration_number: 'REG-2025-0192',
    };

    const result = runVerification(prop, extractedFields);
    expect(result.risk_level).toBe('MEDIUM');
    expect(result.factors.encumbrance.status).toBe('active');
    expect(result.mismatches.some((m) => m.field === 'Encumbrance / Lien')).toBe(true);
  });

  it('correctly flags ownership conflict and court dispute as HIGH RISK', () => {
    const prop = DEMO_PROPERTIES.find((p) => p.property_id === 'PROP-003')!; // Pending court case + active mortgage
    const extractedFields = {
      owner_name: 'Kavita Sen', // Conflict with Sunita Devi
      khasra_number: '123/6',
      area_value: 3.20,
      area_unit: 'Acres',
      registration_number: 'REG-2025-0789',
    };

    const result = runVerification(prop, extractedFields);
    expect(result.total_score).toBeLessThan(60);
    expect(result.risk_level).toBe('HIGH');
    expect(result.factors.court.status).toBe('pending');
    expect(result.mismatches.some((m) => m.field === 'Dispute Registry')).toBe(true);
  });
});
