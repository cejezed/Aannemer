/**
 * API route for line mappings
 * POST /api/line-mappings - Create or update a line mapping
 */

import { NextResponse } from 'next/server';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';
import { createOrUpdateLineMapping } from '@/data/offers';

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { offerLineId, masterComponentId, coverageStatus, assignedBy, confidence } = body;

    if (!offerLineId || !masterComponentId) {
      return NextResponse.json(
        { error: 'offerLineId and masterComponentId are required' },
        { status: 400 }
      );
    }

    const mapping = await createOrUpdateLineMapping({
      offerLineId,
      masterComponentId,
      coverageStatus: coverageStatus || 'INCLUSIEF',
      assignedBy: assignedBy || 'MANUAL',
      confidence,
    });

    return NextResponse.json(mapping, { status: 201 });
  } catch (error) {
    console.error('Error creating line mapping:', error);
    return NextResponse.json(
      { error: 'Failed to create line mapping' },
      { status: 500 }
    );
  }
}
