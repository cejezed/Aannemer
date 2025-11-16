/**
 * API route for offer file upload
 * POST /api/offers/[offerId]/upload - Upload and parse offer file (PDF/DOCX/XLSX)
 */

import { NextResponse } from 'next/server';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';
import { getOrCreateContractRevision, bulkInsertOfferLines } from '@/data/offers';
import { parsePdfOffer, parseDocxOffer, parseXlsxOffer } from '@/server/parsers/offerParser';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ offerId: string }> }
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured. Zorg voor NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY in .env' },
      { status: 503 }
    );
  }

  try {
    const { offerId } = await params;

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Get file extension
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();

    if (!fileExtension || !['pdf', 'docx', 'doc', 'xlsx', 'xls'].includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Use PDF, DOCX, or XLSX' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse based on file type
    let parseResult;
    if (fileExtension === 'pdf') {
      parseResult = await parsePdfOffer(buffer);
    } else if (fileExtension === 'docx' || fileExtension === 'doc') {
      parseResult = await parseDocxOffer(buffer);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      parseResult = await parseXlsxOffer(buffer);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // Check if parsing found any lines
    if (parseResult.lines.length === 0) {
      return NextResponse.json(
        {
          error: 'Geen offerteregels gevonden in bestand',
          warnings: parseResult.warnings,
        },
        { status: 400 }
      );
    }

    // Get or create contract revision
    const revision = await getOrCreateContractRevision(offerId);

    // Bulk insert the parsed lines
    const linesCreated = await bulkInsertOfferLines(
      revision.id,
      parseResult.lines.map(line => ({
        description: line.description,
        priceIncl: line.priceIncl,
        priceType: line.priceType,
        rawText: line.rawText || line.description,
        code: line.code,
        quantity: line.quantity,
        unit: line.unit,
      }))
    );

    return NextResponse.json({
      success: true,
      linesCreated,
      warnings: parseResult.warnings,
      revisionId: revision.id,
    });
  } catch (error) {
    console.error('Error uploading offer file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload offer file' },
      { status: 500 }
    );
  }
}
