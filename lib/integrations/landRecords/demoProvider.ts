// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// Demo Land Records Provider backed by Supabase / Demo Repository

import { LandRecordsProvider } from './interface';
import { Property, GeoJSONPolygon, MortgageDetails, CourtCaseDetails } from '../../types';
import { searchProperties, getPropertyById } from '../../supabase/server';

export class DemoLandRecordsProvider implements LandRecordsProvider {
  name = 'SETU Demonstration Land Records Provider';
  sourceType = 'DEMO' as const;

  isAvailable(): boolean {
    return true;
  }

  async searchProperty(criteria: {
    state?: string;
    district?: string;
    tehsil?: string;
    village?: string;
    khasra?: string;
    query?: string;
  }): Promise<Property[]> {
    return searchProperties(criteria);
  }

  async getProperty(idOrKhasra: string): Promise<Property | null> {
    return getPropertyById(idOrKhasra);
  }

  async getOwnership(propertyId: string): Promise<{
    ownerName: string;
    fatherName?: string;
    coOwners?: string[];
  } | null> {
    const prop = await this.getProperty(propertyId);
    if (!prop) return null;
    return {
      ownerName: prop.owner_name,
      fatherName: prop.father_name,
      coOwners: prop.co_owners,
    };
  }

  async getRegistration(propertyId: string): Promise<{
    registrationNumber?: string;
    registrationDate?: string;
    landUse?: string;
  } | null> {
    const prop = await this.getProperty(propertyId);
    if (!prop) return null;
    return {
      registrationNumber: prop.registration_number,
      registrationDate: prop.registration_date,
      landUse: prop.land_use,
    };
  }

  async getEncumbrance(propertyId: string): Promise<{
    status: string;
    mortgageDetails?: MortgageDetails | null;
  } | null> {
    const prop = await this.getProperty(propertyId);
    if (!prop) return null;
    return {
      status: prop.encumbrance_status,
      mortgageDetails: prop.mortgage_details,
    };
  }

  async getDisputes(propertyId: string): Promise<{
    status: string;
    courtCaseDetails?: CourtCaseDetails | null;
  } | null> {
    const prop = await this.getProperty(propertyId);
    if (!prop) return null;
    return {
      status: prop.court_case_status,
      courtCaseDetails: prop.court_case_details,
    };
  }

  async getParcelGeometry(propertyId: string): Promise<GeoJSONPolygon | null> {
    const prop = await this.getProperty(propertyId);
    return prop?.geometry || null;
  }
}
