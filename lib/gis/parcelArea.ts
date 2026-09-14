// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// Geodesic Parcel Area Calculation & GIS Consistency Checking

import { GeoJSONPolygon } from '../types';
import { sqMetersToAcres } from '../verification/areaConverter';

/**
 * Calculates geodesic area of a GeoJSON Polygon on WGS84 coordinates in square meters.
 * Employs spherical polygonal projection (Shoelace formula with latitude scaling).
 */
export function calculateParcelAreaSqMeters(geometry?: GeoJSONPolygon | null): number {
  if (!geometry || geometry.type !== 'Polygon' || !geometry.coordinates || geometry.coordinates.length === 0) {
    return 0.0;
  }

  const coords = geometry.coordinates[0];
  if (!coords || coords.length < 3) {
    return 0.0;
  }

  // Calculate mean latitude in radians for longitude metric scaling
  const sumLat = coords.reduce((acc, pt) => acc + pt[1], 0);
  const avgLatRad = ((sumLat / coords.length) * Math.PI) / 180.0;
  const cosLat = Math.cos(avgLatRad);

  // Project spherical coords to planar meters:
  // 1 degree latitude ~= 110,540 meters
  // 1 degree longitude ~= 111,320 * cos(latitude) meters
  const projected: [number, number][] = coords.map(([lng, lat]) => [
    lng * 111320.0 * cosLat,
    lat * 110540.0,
  ]);

  // Shoelace formula for polygon area
  let area = 0.0;
  const n = projected.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += projected[i][0] * projected[j][1];
    area -= projected[j][0] * projected[i][1];
  }

  return Math.abs(area) / 2.0;
}

/**
 * Calculates parcel area in Acres from GeoJSON geometry.
 */
export function calculateParcelAreaAcres(geometry?: GeoJSONPolygon | null): number {
  const sqM = calculateParcelAreaSqMeters(geometry);
  return sqMetersToAcres(sqM);
}

/**
 * Validates GIS geometry and evaluates boundary area consistency against recorded registry area.
 */
export function verifyGISConsistency(
  geometry: GeoJSONPolygon | null | undefined,
  latitude: number | undefined,
  longitude: number | undefined,
  recordedAreaAcres: number,
  tolerancePercent = 0.12
): {
  hasCoordinates: boolean;
  hasGeometry: boolean;
  calculatedAreaAcres: number;
  areaConsistent: boolean;
  diffPercent: number;
  gisScore: number;
  status: 'clear' | 'partial' | 'mismatch' | 'warning';
  message: string;
} {
  const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude);
  const hasGeometry = Boolean(geometry && geometry.type === 'Polygon' && geometry.coordinates?.[0]?.length >= 3);

  if (!hasCoordinates && !hasGeometry) {
    return {
      hasCoordinates: false,
      hasGeometry: false,
      calculatedAreaAcres: 0,
      areaConsistent: false,
      diffPercent: 1.0,
      gisScore: 0,
      status: 'mismatch',
      message: 'Parcel geometry and geospatial coordinates unavailable',
    };
  }

  if (!hasGeometry) {
    return {
      hasCoordinates: true,
      hasGeometry: false,
      calculatedAreaAcres: 0,
      areaConsistent: false,
      diffPercent: 1.0,
      gisScore: 2,
      status: 'warning',
      message: 'Centroid coordinates located; Cadastral parcel boundary polygon unavailable',
    };
  }

  const calculatedAcres = calculateParcelAreaAcres(geometry);
  let areaConsistent = false;
  let diffPercent = 1.0;

  if (recordedAreaAcres > 0 && calculatedAcres > 0) {
    diffPercent = Math.abs(calculatedAcres - recordedAreaAcres) / recordedAreaAcres;
    areaConsistent = diffPercent <= tolerancePercent;
  }

  let gisScore = 2; // base points for coordinates & valid polygon
  if (calculatedAcres > 0) gisScore += 1;
  if (areaConsistent) {
    gisScore = 5;
  } else if (diffPercent <= tolerancePercent * 1.5) {
    gisScore = 3;
  }

  let status: 'clear' | 'partial' | 'mismatch' | 'warning' = 'clear';
  let message = `GIS Cadastral boundary verified. Parcel geometry area matches recorded area (${calculatedAcres} vs ${recordedAreaAcres} Acres).`;

  if (!areaConsistent) {
    status = diffPercent > 0.20 ? 'mismatch' : 'warning';
    message = `GIS parcel polygon calculated area (${calculatedAcres} Acres) deviates by ${(diffPercent * 100).toFixed(1)}% from registry record (${recordedAreaAcres} Acres).`;
  }

  return {
    hasCoordinates,
    hasGeometry,
    calculatedAreaAcres: calculatedAcres,
    areaConsistent,
    diffPercent: Number(diffPercent.toFixed(4)),
    gisScore,
    status,
    message,
  };
}
