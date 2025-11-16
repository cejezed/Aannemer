/**
 * API route for project snapshot
 * GET /api/projects/[projectId]/snapshot - Complete data snapshot for reports
 */

import { NextResponse } from 'next/server';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';
import { getProjectOfferSnapshot } from '@/data/projectSnapshot';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured. Zorg voor NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY in .env' },
      { status: 503 }
    );
  }

  try {
    const { projectId } = await params;
    const snapshot = await getProjectOfferSnapshot(projectId);

    if (!snapshot) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Convert Maps to objects for JSON serialization
    const revisionsObj: Record<string, any[]> = {};
    snapshot.revisions.forEach((value, key) => {
      revisionsObj[key] = value;
    });

    const offerLinesObj: Record<string, any[]> = {};
    snapshot.offerLines.forEach((value, key) => {
      offerLinesObj[key] = value;
    });

    return NextResponse.json({
      project: snapshot.project,
      offers: snapshot.offers,
      contractors: snapshot.contractors,
      masterComponents: snapshot.masterComponents,
      revisions: revisionsObj,
      offerLines: offerLinesObj,
      lineMappings: snapshot.lineMappings,
    });
  } catch (error) {
    console.error('Error fetching project snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project snapshot' },
      { status: 500 }
    );
  }
}
