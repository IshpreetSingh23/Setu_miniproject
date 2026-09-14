// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// Area Unit Conversion and Tolerance Comparison Utility

export type SupportedAreaUnit = 'acres' | 'hectares' | 'sq_meters' | 'sq_yards' | 'sq_feet' | 'bigha';

// Standard conversion factors to Acres
const CONVERSION_TO_ACRES: Record<SupportedAreaUnit, number> = {
  acres: 1.0,
  hectares: 2.4710538,
  sq_meters: 1 / 4046.8564224,
  sq_yards: 1 / 4840.0,
  sq_feet: 1 / 43560.0,
  bigha: 0.625, // Standard pucca bigha used in Northern India
};

/**
 * Normalizes user/OCR string input to a recognized SupportedAreaUnit
 */
export function normalizeAreaUnit(unitStr?: string | null): SupportedAreaUnit {
  if (!unitStr) return 'acres';
  const str = unitStr.toLowerCase().trim();

  if (str.includes('hec') || str.includes('हेक्टेयर')) return 'hectares';
  if (str.includes('sqm') || str.includes('square_meter') || str.includes('वर्ग_मीटर') || str.includes('meter') || str.includes('वर्ग मीटर')) return 'sq_meters';
  if (str.includes('yard') || str.includes('gaj') || str.includes('गज')) return 'sq_yards';
  if (str.includes('sqft') || str.includes('square_foot') || str.includes('feet') || str.includes('वर्ग_फुट') || str.includes('वर्ग फुट')) return 'sq_feet';
  if (str.includes('bigha') || str.includes('बीघा')) return 'bigha';

  return 'acres';
}

/**
 * Converts any supported area value and unit to Acres.
 */
export function convertToAcres(value: number, unit?: string | null): number {
  if (isNaN(value) || value <= 0) return 0;
  const normalizedUnit = normalizeAreaUnit(unit);
  const factor = CONVERSION_TO_ACRES[normalizedUnit] ?? 1.0;
  return Number((value * factor).toFixed(4));
}

/**
 * Converts area in square meters directly to Acres.
 */
export function sqMetersToAcres(sqMeters: number): number {
  if (isNaN(sqMeters) || sqMeters <= 0) return 0;
  return Number((sqMeters / 4046.8564224).toFixed(4));
}

/**
 * Compares two area quantities with a given fractional tolerance (default 10%).
 * Returns match status, percentage difference, and normalized acre values.
 */
export function compareAreas(
  area1: number,
  unit1: string | null | undefined,
  area2: number,
  unit2: string | null | undefined,
  tolerancePercent = 0.10
): {
  isExact: boolean;
  isWithinTolerance: boolean;
  diffPercent: number;
  area1Acres: number;
  area2Acres: number;
} {
  const acres1 = convertToAcres(area1, unit1);
  const acres2 = convertToAcres(area2, unit2);

  if (acres1 === 0 || acres2 === 0) {
    return {
      isExact: acres1 === acres2,
      isWithinTolerance: false,
      diffPercent: 1.0,
      area1Acres: acres1,
      area2Acres: acres2,
    };
  }

  const diff = Math.abs(acres1 - acres2);
  const diffPercent = diff / acres1;

  return {
    isExact: diff < 0.001,
    isWithinTolerance: diffPercent <= tolerancePercent,
    diffPercent: Number(diffPercent.toFixed(4)),
    area1Acres: acres1,
    area2Acres: acres2,
  };
}
