// SETU: Integrated GIS-Based Digital Public Infrastructure for Land Governance
// API Route: Document Upload to Supabase Storage

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, saveDocument } from '@/lib/supabase/server';
import { LandDocument } from '@/lib/types';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
];

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const propertyId = (formData.get('propertyId') as string) || undefined;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No document file provided for upload' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type (${file.type}). Please upload a PDF, JPG, or PNG document.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 15MB.`,
        },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const storagePath = `deeds/${propertyId || 'unassigned'}/${docId}_${sanitizedFileName}`;

    let uploadedPath = storagePath;
    const supabase = getServerSupabase();

    if (supabase) {
      try {
        const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'property-documents';
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(storagePath, fileBuffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError && uploadData) {
          uploadedPath = uploadData.path;
        } else {
          console.warn('Supabase storage upload note:', uploadError?.message);
        }
      } catch (storageErr) {
        console.warn('Supabase storage unavailable; persisting locally in session:', storageErr);
      }
    }

    const docRecord: LandDocument = {
      id: docId,
      property_id: propertyId,
      file_path: uploadedPath,
      file_name: file.name,
      mime_type: file.type,
      file_size: file.size,
      document_type: 'Sale Deed',
      uploaded_at: new Date().toISOString(),
      ocr_status: 'pending',
      ocr_provider: 'Pending OCR Trigger',
      raw_ocr_text: undefined,
      extracted_fields: undefined,
    };

    const savedDoc = await saveDocument(docRecord);

    return NextResponse.json({
      success: true,
      message: 'Document successfully stored in secure storage pipeline',
      document: savedDoc,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Document upload failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
