// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// API Route: Run 7-Factor Cross-Verification Engine

import { NextRequest, NextResponse } from 'next/server';
import { getPropertyById, getDocumentById, saveVerificationResult } from '@/lib/supabase/server';
import { runVerification } from '@/lib/verification/engine';
import { ExtractedDocumentFields } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, documentId, extractedFields } = body;

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'propertyId is required to execute verification' },
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

    let fieldsToVerify: ExtractedDocumentFields | null = extractedFields || null;

    if (!fieldsToVerify && documentId) {
      const doc = await getDocumentById(documentId);
      if (doc?.extracted_fields) {
        fieldsToVerify = doc.extracted_fields;
      }
    }

    // Default fallback if fields are absent
    if (!fieldsToVerify) {
      fieldsToVerify = {
        owner_name: property.owner_name,
        khasra_number: property.khasra_number,
        area_value: property.area_value,
        area_unit: property.area_unit,
        registration_number: property.registration_number,
      };
    }

    const result = runVerification(property, fieldsToVerify);
    result.document_id = documentId;

    // Persist in Supabase and history
    await saveVerificationResult(result);

    return NextResponse.json({
      success: true,
      property,
      extractedFields: fieldsToVerify,
      verification: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification run failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
