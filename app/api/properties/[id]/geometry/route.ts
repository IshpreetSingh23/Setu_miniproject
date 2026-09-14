// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// API Route: Parcel PostGIS Geometry Endpoint (GET /api/properties/[id]/geometry)

import { NextRequest, NextResponse } from 'next/server';
import { getPropertyById, calculateParcelArea, validateParcelGeometry } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await getPropertyById(params.id);
    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    if (!property.geometry) {
      return NextResponse.json({
        success: true,
        available: false,
        message: 'Cadastral parcel polygon geometry unavailable for this record',
        latitude: property.latitude,
        longitude: property.longitude,
      });
    }

    const calculatedAcres = await calculateParcelArea(property.geometry);
    const validation = await validateParcelGeometry(property.geometry);

    return NextResponse.json({
      success: true,
      available: true,
      property_id: property.property_id,
      khasra: property.khasra_number,
      owner: property.owner_name,
      recorded_area: property.area_value,
      recorded_unit: property.area_unit,
      calculated_acres: calculatedAcres,
      validation,
      latitude: property.latitude,
      longitude: property.longitude,
      geometry: property.geometry,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve parcel geometry';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
