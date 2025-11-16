/**
 * API route voor onduidelijke/niet-gemapte regels
 * GET /api/projects/[projectId]/unclearlines - alle onduidelijke regels per offerte
 */

import { NextResponse } from 'next/server';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';
import {
  listOffersForProject,
  listRevisionsForOffer,
  listOfferLinesForRevision,
  listMappingsForOfferLines,
} from '@/data/offers';
import { listContractors } from '@/data/contractors';
import { listMasterComponents } from '@/data/masterComponents';

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

    // Fetch all data from Supabase
    const [offers, contractors, masterComponents] = await Promise.all([
      listOffersForProject(projectId),
      listContractors(),
      listMasterComponents(),
    ]);

    if (offers.length === 0) {
      return NextResponse.json({
        unclearLinesByOffer: [],
        masterComponents: masterComponents.filter(mc => mc.isLeaf),
        message: 'Nog geen offertes voor dit project. Voeg eerst offertes en regels toe.',
      });
    }

    // Build contractor map
    const contractorMap = new Map(contractors.map(c => [c.id, c]));

    // Process each offer
    const unclearLinesByOffer = await Promise.all(
      offers.map(async (offer) => {
        const contractor = contractorMap.get(offer.contractorId);

        // Get contract revision
        const revisions = await listRevisionsForOffer(offer.id);
        const contractRevision = revisions.find(r => r.label === 'Contract');

        if (!contractRevision) {
          return {
            offerId: offer.id,
            contractorName: contractor?.name || 'Unknown',
            unclearLines: [],
            totalUnclear: 0,
            totalUnclearPercentage: 0,
          };
        }

        // Get all lines for this revision
        const offerLines = await listOfferLinesForRevision(contractRevision.id);

        if (offerLines.length === 0) {
          return {
            offerId: offer.id,
            contractorName: contractor?.name || 'Unknown',
            unclearLines: [],
            totalUnclear: 0,
            totalUnclearPercentage: 0,
          };
        }

        // Get mappings for these lines
        const lineIds = offerLines.map(l => l.id);
        const mappings = await listMappingsForOfferLines(lineIds);

        // Filter out lines that are already mapped (excluding ONDERDEEL_ONBEKEND)
        const mappedLineIds = new Set(
          mappings
            .filter(m => m.coverageStatus !== 'ONDERDEEL_ONBEKEND')
            .map(m => m.offerLineId)
        );

        const unclearLines = offerLines.filter(line => !mappedLineIds.has(line.id));

        const totalUnclear = unclearLines.reduce(
          (sum, line) => sum + (line.totalPriceIncl ?? 0),
          0
        );

        return {
          offerId: offer.id,
          contractorName: contractor?.name || 'Unknown',
          unclearLines,
          totalUnclear,
          totalUnclearPercentage: offer.sourceTotalIncl
            ? (totalUnclear / offer.sourceTotalIncl) * 100
            : 0,
        };
      })
    );

    return NextResponse.json({
      unclearLinesByOffer,
      masterComponents: masterComponents.filter(mc => mc.isLeaf),
    });
  } catch (error) {
    console.error('Error fetching unclear lines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unclear lines' },
      { status: 500 }
    );
  }
}
