// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// Multi-Factor Verification Engine

import { Property, ExtractedDocumentFields, VerificationResult, VerificationMismatch, RiskLevel } from '../types';
import { defaultVerificationConfig, VerificationWeightConfig } from './verificationConfig';
import { compareAreas, convertToAcres } from './areaConverter';
import { verifyGISConsistency } from '../gis/parcelArea';

/**
 * Normalizes person names by removing honorifics and extra whitespace.
 */
export function normalizePersonName(name?: string | null): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/(?:^|\s+)(?:shri|smt|mr|mrs|ms|late|dr|श्री|श्रीमती|स्वर्गवासी|बाबू)(?:\.|\s+|$)/gi, ' ')
    .replace(/[^\w\s\u0900-\u097F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes identifier strings (Khasra, Survey, Registration No).
 */
export function normalizeIdentifier(idStr?: string | null): string {
  if (!idStr) return '';
  return idStr.toUpperCase().replace(/[\s\-_]/g, '').trim();
}

/**
 * Executes full cross-verification between authoritative property records and extracted deed data.
 */
export function runVerification(
  property: Property,
  extractedDoc: ExtractedDocumentFields,
  config: VerificationWeightConfig = defaultVerificationConfig
): VerificationResult {
  const mismatches: VerificationMismatch[] = [];

  // 1. Ownership Verification (Max: config.ownershipMax = 25)
  let ownershipScore = 0;
  let ownershipStatus: 'match' | 'partial' | 'mismatch' = 'mismatch';
  const govtOwnerNorm = normalizePersonName(property.owner_name);
  const docOwnerNorm = normalizePersonName(extractedDoc.owner_name);

  if (govtOwnerNorm && docOwnerNorm && govtOwnerNorm === docOwnerNorm) {
    ownershipScore = config.ownershipMax;
    ownershipStatus = 'match';
  } else if (govtOwnerNorm && docOwnerNorm) {
    const govtTokens = new Set(govtOwnerNorm.split(' '));
    const docTokens = new Set(docOwnerNorm.split(' '));
    const commonStopwords = new Set(['kumar', 'singh', 'devi', 'lal', 'ram', 'prasad', 'sen', 'sharma', 'gupta', 'patel']);
    const intersection = [...govtTokens].filter(t => docTokens.has(t) && !commonStopwords.has(t));

    if (intersection.length > 0) {
      ownershipScore = Math.round(config.ownershipMax * 0.8);
      ownershipStatus = 'partial';
      mismatches.push({
        field: 'Owner Name',
        expected: property.owner_name,
        found: extractedDoc.owner_name || 'N/A',
        severity: 'medium',
        description: 'Partial owner name match detected. Transliteration or middle name variance present.',
      });
    } else {
      ownershipScore = 0;
      ownershipStatus = 'mismatch';
      mismatches.push({
        field: 'Owner Name',
        expected: property.owner_name,
        found: extractedDoc.owner_name || 'N/A',
        severity: 'high',
        description: `Owner name on sale deed (${extractedDoc.owner_name || 'Missing'}) conflicts with official registry record (${property.owner_name}).`,
      });
    }
  } else {
    ownershipScore = 0;
    ownershipStatus = 'mismatch';
    mismatches.push({
      field: 'Owner Name',
      expected: property.owner_name,
      found: extractedDoc.owner_name || 'Unextracted',
      severity: 'high',
      description: 'Owner name could not be verified against the physical deed.',
    });
  }

  // 2. Khasra / Survey Number (Max: config.khasraMax = 20)
  let khasraScore = 0;
  let khasraStatus: 'match' | 'mismatch' = 'mismatch';
  const govtKhasraNorm = normalizeIdentifier(property.khasra_number);
  const docKhasraNorm = normalizeIdentifier(extractedDoc.khasra_number);

  if (govtKhasraNorm && docKhasraNorm && govtKhasraNorm === docKhasraNorm) {
    khasraScore = config.khasraMax;
    khasraStatus = 'match';
  } else {
    khasraScore = 0;
    khasraStatus = 'mismatch';
    mismatches.push({
      field: 'Khasra / Survey Number',
      expected: property.khasra_number,
      found: extractedDoc.khasra_number || 'N/A',
      severity: 'high',
      description: `Khasra parcel number on deed (${extractedDoc.khasra_number || 'None'}) does not match the registry (${property.khasra_number}).`,
    });
  }

  // 3. Area Measurement & Tolerance (Max: config.areaMax = 15)
  let areaScore = 0;
  let areaStatus: 'match' | 'partial' | 'mismatch' = 'mismatch';
  const docAreaVal = extractedDoc.area_value ?? 0;
  const areaComparison = compareAreas(
    property.area_value,
    property.area_unit,
    docAreaVal,
    extractedDoc.area_unit,
    config.areaTolerancePercent
  );

  if (areaComparison.isExact) {
    areaScore = config.areaMax;
    areaStatus = 'match';
  } else if (areaComparison.isWithinTolerance) {
    areaScore = Math.round(config.areaMax * 0.5);
    areaStatus = 'partial';
    mismatches.push({
      field: 'Parcel Area',
      expected: `${property.area_value} ${property.area_unit}`,
      found: `${docAreaVal} ${extractedDoc.area_unit || 'Acres'}`,
      severity: 'low',
      description: `Area variance is within acceptable tolerance (${(areaComparison.diffPercent * 100).toFixed(1)}% difference).`,
    });
  } else {
    areaScore = 0;
    areaStatus = 'mismatch';
    mismatches.push({
      field: 'Parcel Area',
      expected: `${property.area_value} ${property.area_unit}`,
      found: `${docAreaVal} ${extractedDoc.area_unit || 'Acres'}`,
      severity: 'medium',
      description: `Significant area discrepancy detected: Deed specifies ${docAreaVal} ${extractedDoc.area_unit || 'Acres'}, whereas government record lists ${property.area_value} ${property.area_unit}.`,
    });
  }

  // 4. Registration Deed Match (Max: config.registrationMax = 15)
  let regScore = 0;
  let regStatus: 'match' | 'mismatch' = 'mismatch';
  const govtRegNorm = normalizeIdentifier(property.registration_number);
  const docRegNorm = normalizeIdentifier(extractedDoc.registration_number || extractedDoc.document_number);

  if (govtRegNorm && docRegNorm && (govtRegNorm === docRegNorm || govtRegNorm.includes(docRegNorm) || docRegNorm.includes(govtRegNorm))) {
    regScore = config.registrationMax;
    regStatus = 'match';
  } else {
    regScore = 0;
    regStatus = 'mismatch';
    mismatches.push({
      field: 'Registration Number',
      expected: property.registration_number || 'N/A',
      found: extractedDoc.registration_number || extractedDoc.document_number || 'N/A',
      severity: 'medium',
      description: 'Registration number on the deed does not match the authoritative registry record.',
    });
  }

  // 5. Encumbrance / Mortgage (Max: config.encumbranceMax = 10)
  let encScore = 0;
  let encStatus: 'clear' | 'active' = 'clear';
  const isMortgageActive = property.encumbrance_status && property.encumbrance_status.toLowerCase() !== 'clear' && property.encumbrance_status.toLowerCase() !== 'none';

  if (!isMortgageActive) {
    encScore = config.encumbranceMax;
    encStatus = 'clear';
  } else {
    encScore = 0;
    encStatus = 'active';
    const bank = property.mortgage_details?.bank || property.encumbrance_status;
    const amount = property.mortgage_details?.amount ? ` (₹${property.mortgage_details.amount})` : '';
    mismatches.push({
      field: 'Encumbrance / Lien',
      expected: 'Clear Title',
      found: `Active Mortgage: ${bank}${amount}`,
      severity: 'high',
      description: `Active financial encumbrance on property: mortgaged to ${bank}${amount}. Title transfer requires No Objection Certificate (NOC).`,
    });
  }

  // 6. Court / Dispute Status (Max: config.courtMax = 10)
  let courtScore = 0;
  let courtStatus: 'clear' | 'pending' = 'clear';
  const hasCourtCase = property.court_case_status && property.court_case_status.toLowerCase() !== 'none' && property.court_case_status.toLowerCase() !== 'clear';

  if (!hasCourtCase) {
    courtScore = config.courtMax;
    courtStatus = 'clear';
  } else {
    courtScore = 0;
    courtStatus = 'pending';
    const caseId = property.court_case_details?.caseId || 'Pending Litigation';
    const court = property.court_case_details?.court ? ` at ${property.court_case_details.court}` : '';
    const issue = property.court_case_details?.issue ? ` (${property.court_case_details.issue})` : '';
    mismatches.push({
      field: 'Dispute Registry',
      expected: 'No Pending Litigations',
      found: `${caseId}${court}`,
      severity: 'high',
      description: `Active litigation filed in court: ${caseId}${court}${issue}. Conveyance may violate judicial stay orders.`,
    });
  }

  // 7. GIS Parcel Consistency (Max: config.gisMax = 5)
  const recordedAcres = convertToAcres(property.area_value, property.area_unit);
  const gisVerification = verifyGISConsistency(
    property.geometry,
    property.latitude,
    property.longitude,
    recordedAcres,
    config.gisAreaTolerancePercent
  );
  const gisScore = gisVerification.gisScore;
  const gisStatus = gisVerification.status;

  if (gisStatus === 'mismatch' || gisStatus === 'warning') {
    mismatches.push({
      field: 'GIS Boundary Consistency',
      expected: `${recordedAcres} Acres (Registry)`,
      found: `${gisVerification.calculatedAreaAcres} Acres (PostGIS Geodesic)`,
      severity: gisStatus === 'mismatch' ? 'medium' : 'low',
      description: gisVerification.message,
    });
  }

  // Calculate Total Score
  const totalScore = ownershipScore + khasraScore + areaScore + regScore + encScore + courtScore + gisScore;

  // Determine Risk Level
  let riskLevel: RiskLevel = 'LOW';
  if (totalScore >= config.thresholds.lowRiskMin) {
    riskLevel = 'LOW';
  } else if (totalScore >= config.thresholds.mediumRiskMin) {
    riskLevel = 'MEDIUM';
  } else {
    riskLevel = 'HIGH';
  }

  // Generate Actionable Recommendation
  let recommendation = '';
  if (riskLevel === 'LOW') {
    recommendation = 'Authoritative digital land registry records and deed documentation align. Title verified with high confidence. Clear to proceed with standard verification protocol.';
  } else if (riskLevel === 'MEDIUM') {
    recommendation = 'Moderate title discrepancies detected (area tolerance variance or partial record alignment). Recommended to inspect original paper deed and verify sub-registrar stamps prior to deed registration.';
  } else {
    recommendation = 'CRITICAL TITLE ALERTS DETECTED: Significant discrepancies identified involving ownership conflicts, active financial liens, or unresolved court litigations. Do not proceed without comprehensive legal clearance and bank NOC.';
  }

  return {
    property_id: property.property_id,
    ownership_score: ownershipScore,
    khasra_score: khasraScore,
    area_score: areaScore,
    registration_score: regScore,
    encumbrance_score: encScore,
    court_score: courtScore,
    gis_score: gisScore,
    total_score: totalScore,
    risk_level: riskLevel,
    mismatches,
    factors: {
      ownership: {
        score: ownershipScore,
        maxScore: config.ownershipMax,
        status: ownershipStatus,
        title: 'Ownership Verification',
        details: ownershipStatus === 'match' ? 'Owner name matches authoritative digital registry' : ownershipStatus === 'partial' ? 'Partial name match detected' : 'Owner mismatch',
        govtValue: property.owner_name,
        docValue: extractedDoc.owner_name,
      },
      khasra: {
        score: khasraScore,
        maxScore: config.khasraMax,
        status: khasraStatus,
        title: 'Khasra / Survey Number',
        details: khasraStatus === 'match' ? 'Parcel cadastral number verified' : 'Cadastral number mismatch',
        govtValue: property.khasra_number,
        docValue: extractedDoc.khasra_number,
      },
      area: {
        score: areaScore,
        maxScore: config.areaMax,
        status: areaStatus,
        title: 'Area Measurement',
        details: areaStatus === 'match' ? 'Exact area match' : areaStatus === 'partial' ? 'Area within legal tolerance' : 'Area mismatch exceeds tolerance',
        govtValue: `${property.area_value} ${property.area_unit}`,
        docValue: `${docAreaVal} ${extractedDoc.area_unit || 'Acres'}`,
      },
      registration: {
        score: regScore,
        maxScore: config.registrationMax,
        status: regStatus,
        title: 'Registration Deed Status',
        details: regStatus === 'match' ? 'Registration deed verified' : 'Deed identifier mismatch',
        govtValue: property.registration_number,
        docValue: extractedDoc.registration_number || extractedDoc.document_number,
      },
      encumbrance: {
        score: encScore,
        maxScore: config.encumbranceMax,
        status: encStatus,
        title: 'Financial Encumbrance',
        details: encStatus === 'clear' ? 'No active bank mortgages or liens recorded' : `Active mortgage: ${property.mortgage_details?.bank || property.encumbrance_status}`,
        govtValue: property.encumbrance_status,
      },
      court: {
        score: courtScore,
        maxScore: config.courtMax,
        status: courtStatus,
        title: 'Litigation & Court Status',
        details: courtStatus === 'clear' ? 'No pending court litigations or stay orders' : `Pending Court Case: ${property.court_case_details?.caseId || 'Litigation Active'}`,
        govtValue: property.court_case_status,
      },
      gis: {
        score: gisScore,
        maxScore: config.gisMax,
        status: gisStatus,
        title: 'GIS Cadastral Consistency',
        details: gisVerification.message,
        govtValue: `${recordedAcres} Acres (Registry)`,
        docValue: `${gisVerification.calculatedAreaAcres} Acres (GIS Polygon)`,
      },
    },
    recommendation,
  };
}
