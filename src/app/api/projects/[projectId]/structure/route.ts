/**
 * API route voor bouwstructuur met aggregaties per offerte
 * GET /api/projects/[projectId]/structure - master components met prijzen per offerte
 */

import { NextResponse } from 'next/server';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';
import { getProjectOfferSnapshot, getContractRevisions } from '@/data/projectSnapshot';
import { aggregateByMasterComponent } from '@/domain/aggregateByMaster';

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
        masterComponents: snapshot.masterComponents,
        aggregationsByOffer: [],
        offers: [],
        message: 'Nog geen offertes voor dit project. Voeg eerst offertes en regels toe.',
      });
    }

    // Get contract revisions for all offers
    const contractRevisions = getContractRevisions(snapshot);

    // Aggregeer per offerte
    const aggregationsByOffer = snapshot.offers.map(offer => {
      const revision = contractRevisions.get(offer.id);

      if (!revision) {
        return {
          offerId: offer.id,
          aggregations: [],
        };
      }

      const offerLines = snapshot.offerLines.get(revision.id) || [];

      // Filter mappings for this offer's lines
      const lineIds = new Set(offerLines.map(l => l.id));
      const lineMappings = snapshot.lineMappings.filter(m => lineIds.has(m.offerLineId));

      const aggregations = aggregateByMasterComponent(
        snapshot.masterComponents,
        offerLines,
        lineMappings,
        offer.id
      );

      return {
        offerId: offer.id,
        aggregations,
      };
    });

    return NextResponse.json({
      masterComponents: snapshot.masterComponents,
      aggregationsByOffer,
      offers: snapshot.offers,
    });
  } catch (error) {
    console.error('Error fetching structure:', error);
    return NextResponse.json(
      { error: 'Failed to fetch structure' },
      { status: 500 }
    );
  }
}
