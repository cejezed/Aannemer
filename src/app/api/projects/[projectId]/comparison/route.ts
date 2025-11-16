/**
 * API route voor offerte vergelijking
 * GET /api/projects/[projectId]/comparison - complete vergelijkingssamenvatting
 */

import { NextResponse } from 'next/server';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';
import { getProjectOfferSnapshot, getContractRevisions } from '@/data/projectSnapshot';
import { generateComparisonSummary } from '@/domain/comparisonSummary';

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

    // Get complete project snapshot from Supabase
    const snapshot = await getProjectOfferSnapshot(projectId);

    if (!snapshot) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (snapshot.offers.length === 0) {
      return NextResponse.json({
        message: 'Nog geen offertes voor dit project. Voeg eerst minimaal 2 offertes met regels toe om een vergelijking te maken.',
      });
    }

    // Build contractor map
    const contractorMap = new Map(snapshot.contractors.map(c => [c.id, c]));

    // Get contract revisions
    const contractRevisions = getContractRevisions(snapshot);

    // Build offer lines map per offer
    const offerLinesMap = new Map<string, any[]>();
    const lineMappingsMap = new Map<string, any[]>();

    for (const offer of snapshot.offers) {
      const revision = contractRevisions.get(offer.id);

      if (revision) {
        const offerLines = snapshot.offerLines.get(revision.id) || [];
        offerLinesMap.set(offer.id, offerLines);

        // Filter mappings for this offer's lines
        const lineIds = new Set(offerLines.map(l => l.id));
        const mappings = snapshot.lineMappings.filter(m => lineIds.has(m.offerLineId));
        lineMappingsMap.set(offer.id, mappings);
      } else {
        offerLinesMap.set(offer.id, []);
        lineMappingsMap.set(offer.id, []);
      }
    }

    const summary = generateComparisonSummary(
      snapshot.project,
      snapshot.offers,
      contractorMap,
      offerLinesMap,
      lineMappingsMap,
      snapshot.masterComponents
    );

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating comparison:', error);
    return NextResponse.json(
      { error: 'Failed to generate comparison' },
      { status: 500 }
    );
  }
}
