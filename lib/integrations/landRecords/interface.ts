// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// Land Records Provider Adapter Interface

import { Property, GeoJSONPolygon, MortgageDetails, CourtCaseDetails } from '../../types';

export interface LandRecordsProvider {
  name: string;
  sourceType: 'DEMO' | 'AUTHORITATIVE_GOVERNMENT';
  isAvailable(): boolean;

  searchProperty(criteria: {
    state?: string;
    district?: string;
    tehsil?: string;
    village?: string;
    khasra?: string;
    query?: string;
  }): Promise<Property[]>;

  getProperty(idOrKhasra: string): Promise<Property | null>;

  getOwnership(propertyId: string): Promise<{
    ownerName: string;
    fatherName?: string;
    coOwners?: string[];
  } | null>;

  getRegistration(propertyId: string): Promise<{
    registrationNumber?: string;
    registrationDate?: string;
    landUse?: string;
  } | null>;

  getEncumbrance(propertyId: string): Promise<{
    status: string;
    mortgageDetails?: MortgageDetails | null;
  } | null>;

  getDisputes(propertyId: string): Promise<{
    status: string;
    courtCaseDetails?: CourtCaseDetails | null;
  } | null>;

  getParcelGeometry(propertyId: string): Promise<GeoJSONPolygon | null>;
}
