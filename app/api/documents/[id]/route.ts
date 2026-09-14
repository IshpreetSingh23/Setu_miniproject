// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// API Route: Retrieve Stored Document Record (GET /api/documents/[id])

import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = await getDocumentById(params.id);
    if (!document) {
      return NextResponse.json(
        { success: false, error: `Document not found for ID: ${params.id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve document';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
