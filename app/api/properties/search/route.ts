// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// API Route: Dedicated Property Search Endpoint (GET /api/properties/search)

import { NextRequest, NextResponse } from 'next/server';
import { searchProperties } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || undefined;
    const district = searchParams.get('district') || undefined;
    const tehsil = searchParams.get('tehsil') || undefined;
    const village = searchParams.get('village') || undefined;
    const khasra = searchParams.get('khasra') || undefined;
    const query = searchParams.get('query') || searchParams.get('q') || undefined;

    const properties = await searchProperties({
      state,
      district,
      tehsil,
      village,
      khasra,
      query,
    });

    return NextResponse.json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Property search failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
