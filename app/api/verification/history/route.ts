// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// API Route: Verification History & Audit Records

import { NextRequest, NextResponse } from 'next/server';
import { getVerificationHistory, saveHistoryItem } from '@/lib/supabase/server';
import { VerificationHistoryItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId') || undefined;

    const history = await getVerificationHistory(propertyId);

    return NextResponse.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve verification history';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, ownerName, score, riskLevel, status, mismatchesCount } = body;

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'propertyId is required' },
        { status: 400 }
      );
    }

    const item: VerificationHistoryItem = {
      id: `hist-${Date.now()}`,
      property_id: propertyId,
      owner_name: ownerName || 'Unknown Owner',
      score: score ?? 0,
      risk_level: riskLevel || (score >= 80 ? 'LOW' : score >= 60 ? 'MEDIUM' : 'HIGH'),
      status: status || (score >= 80 ? 'Verified' : 'Issues Found'),
      mismatches_count: mismatchesCount ?? 0,
      run_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    await saveHistoryItem(item);

    return NextResponse.json({
      success: true,
      message: 'History item recorded',
      item,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save history item';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
