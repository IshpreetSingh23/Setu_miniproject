// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// API Route: Retrieve Stored Verification Result by ID (GET /api/verification/[id])

import { NextRequest, NextResponse } from 'next/server';
import { getVerificationResultById } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const verification = await getVerificationResultById(params.id);
    if (!verification) {
      return NextResponse.json(
        { success: false, error: `Verification result not found for ID: ${params.id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      verification,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve verification result';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
