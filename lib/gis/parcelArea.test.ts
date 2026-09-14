// SETU: GIS Parcel Geodesic Area and Consistency Tests

import { describe, it, expect } from 'vitest';
import { calculateParcelAreaAcres, verifyGISConsistency } from './parcelArea';
import { DEMO_PROPERTIES } from '../supabase/demoFallback';

describe('GIS Parcel Area Verification', () => {
  it('calculates realistic parcel area for PROP-001 polygon', () => {
    const prop = DEMO_PROPERTIES.find((p) => p.property_id === 'PROP-001')!;
    const acres = calculateParcelAreaAcres(prop.geometry);
    // Parcel bounding box in Malihabad represents approximately 2.5 acres
    expect(acres).toBeGreaterThan(2.0);
    expect(acres).toBeLessThan(3.0);
  });

  it('verifies consistent GIS parcel geometry against recorded registry area', () => {
    const prop = DEMO_PROPERTIES.find((p) => p.property_id === 'PROP-002')!;
    const verification = verifyGISConsistency(
      prop.geometry,
      prop.latitude,
      prop.longitude,
      prop.area_value,
      0.15
    );

    expect(verification.hasGeometry).toBe(true);
    expect(verification.hasCoordinates).toBe(true);
    expect(verification.gisScore).toBeGreaterThanOrEqual(4);
  });

  it('detects and flags significant parcel geometry deviation (>15%) as warning/mismatch', () => {
    const prop = DEMO_PROPERTIES.find((p) => p.property_id === 'PROP-006')!;
    const verification = verifyGISConsistency(
      prop.geometry,
      prop.latitude,
      prop.longitude,
      prop.area_value, // Recorded: 3.50 Acres, but geometry is ~2.1 acres
      0.12
    );

    expect(verification.areaConsistent).toBe(false);
    expect(verification.diffPercent).toBeGreaterThan(0.12);
    expect(['warning', 'mismatch']).toContain(verification.status);
  });
});
