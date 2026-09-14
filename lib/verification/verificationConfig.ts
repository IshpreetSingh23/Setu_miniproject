// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// Configurable Multi-Factor Verification Weights & Thresholds

export interface VerificationWeightConfig {
  ownershipMax: number;
  khasraMax: number;
  areaMax: number;
  registrationMax: number;
  encumbranceMax: number;
  courtMax: number;
  gisMax: number;
  areaTolerancePercent: number; // e.g., 0.10 = 10%
  gisAreaTolerancePercent: number; // e.g., 0.10 = 10%
  thresholds: {
    lowRiskMin: number;   // 80
    mediumRiskMin: number; // 60
  };
}

export const defaultVerificationConfig: VerificationWeightConfig = {
  ownershipMax: 25,
  khasraMax: 20,
  areaMax: 15,
  registrationMax: 15,
  encumbranceMax: 10,
  courtMax: 10,
  gisMax: 5,
  areaTolerancePercent: 0.10, // 10% tolerance for physical deed vs digital registry
  gisAreaTolerancePercent: 0.12, // 12% tolerance for GIS calculated boundary vs registry
  thresholds: {
    lowRiskMin: 80,
    mediumRiskMin: 60,
  },
};
