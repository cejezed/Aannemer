/**
 * API route for offer revisions
 * GET /api/projects/[projectId]/offers/[offerId]/revisions - List revisions for offer
 */

import { NextResponse } from 'next/server';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';
import { listRevisionsForOffer } from '@/data/offers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string; offerId: string }> }
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  try {
    const { offerId } = await params;
    const revisions = await listRevisionsForOffer(offerId);

    return NextResponse.json({ revisions });
  } catch (error) {
    console.error('Error fetching revisions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revisions' },
      { status: 500 }
    );
  }
}
