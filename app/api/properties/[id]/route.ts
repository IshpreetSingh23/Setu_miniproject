// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// API Route: Single Property Detail

import { NextRequest, NextResponse } from 'next/server';
import { getPropertyById } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id;
    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID or Khasra number is required' },
        { status: 400 }
      );
    }

    const property = await getPropertyById(propertyId);
    if (!property) {
      return NextResponse.json(
        { success: false, error: `Property not found for identifier: ${propertyId}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      property,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve property details';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
