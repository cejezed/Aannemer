/**
 * API route for offer lines
 * GET /api/offers/[offerId]/revisions/[revisionId]/lines - List all lines for revision
 * POST /api/offers/[offerId]/revisions/[revisionId]/lines - Create new line
 */

import { NextResponse } from 'next/server';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';
import { listOfferLinesForRevision, createOfferLine } from '@/data/offers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ offerId: string; revisionId: string }> }
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  try {
    const { revisionId } = await params;
    const lines = await listOfferLinesForRevision(revisionId);

    return NextResponse.json({ lines });
  } catch (error) {
    console.error('Error fetching offer lines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offer lines' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ offerId: string; revisionId: string }> }
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  try {
    const { revisionId } = await params;
    const body = await request.json();

    const {
      description,
      priceType,
      totalPriceIncl,
      totalPriceExcl,
      pricePerUnitIncl,
      pricePerUnitExcl,
      quantity,
      unit,
      code,
      isAllowance,
      clarification,
    } = body;

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const line = await createOfferLine({
      revisionId,
      description,
      priceType: priceType || 'ONBEKEND',
      totalPriceIncl,
      totalPriceExcl,
      pricePerUnitIncl,
      pricePerUnitExcl,
      quantity,
      unit,
      code,
      isAllowance: isAllowance || false,
      clarification,
    });

    return NextResponse.json(line, { status: 201 });
  } catch (error) {
    console.error('Error creating offer line:', error);
    return NextResponse.json(
      { error: 'Failed to create offer line' },
      { status: 500 }
    );
  }
}
