// SETU: Area Unit Conversion Tests

import { describe, it, expect } from 'vitest';
import { convertToAcres, compareAreas, normalizeAreaUnit } from './areaConverter';

describe('areaConverter', () => {
  it('correctly normalizes different unit strings', () => {
    expect(normalizeAreaUnit('acres')).toBe('acres');
    expect(normalizeAreaUnit('Hectare')).toBe('hectares');
    expect(normalizeAreaUnit('हेक्टेयर')).toBe('hectares');
    expect(normalizeAreaUnit('sq_meters')).toBe('sq_meters');
    expect(normalizeAreaUnit('वर्ग_मीटर')).toBe('sq_meters');
    expect(normalizeAreaUnit('Gaj')).toBe('sq_yards');
    expect(normalizeAreaUnit('गज')).toBe('sq_yards');
    expect(normalizeAreaUnit('Bigha')).toBe('bigha');
    expect(normalizeAreaUnit('बीघा')).toBe('bigha');
  });

  it('converts hectares to acres with high precision', () => {
    const acres = convertToAcres(1, 'hectares');
    expect(acres).toBeCloseTo(2.471, 2);
  });

  it('converts square meters to acres accurately', () => {
    // 4046.86 sq meters ~= 1 acre
    const acres = convertToAcres(4046.86, 'sq_meters');
    expect(acres).toBeCloseTo(1.0, 2);
  });

  it('evaluates exact area match within tolerance', () => {
    const result = compareAreas(2.5, 'acres', 2.5, 'acres', 0.10);
    expect(result.isExact).toBe(true);
    expect(result.isWithinTolerance).toBe(true);
    expect(result.diffPercent).toBe(0);
  });

  it('evaluates minor area difference within 10% tolerance as acceptable', () => {
    // 2.5 acres vs 2.6 acres is a 4% difference
    const result = compareAreas(2.5, 'acres', 2.6, 'acres', 0.10);
    expect(result.isExact).toBe(false);
    expect(result.isWithinTolerance).toBe(true);
    expect(result.diffPercent).toBeLessThanOrEqual(0.10);
  });

  it('flags major area discrepancies exceeding 10% tolerance', () => {
    // 2.5 acres vs 3.2 acres is a 28% difference
    const result = compareAreas(2.5, 'acres', 3.2, 'acres', 0.10);
    expect(result.isExact).toBe(false);
    expect(result.isWithinTolerance).toBe(false);
    expect(result.diffPercent).toBeGreaterThan(0.10);
  });
});
