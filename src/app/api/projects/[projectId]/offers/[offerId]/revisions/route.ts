/**
 * API route voor revisies van een offerte
 * GET /api/projects/[projectId]/offers/[offerId]/revisions - lijst van alle revisies voor een offerte
 */

import { NextResponse } from 'next/server';
import {
  loadMockData,
  groupRevisionsByOffer,
  groupLinesByRevision,
  groupMappingsByRevision,
} from '@/mocks';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string; offerId: string }> }
) {
  try {
    const mockData = loadMockData();
    const { projectId, offerId } = await params;

    // Valideer project
    if (mockData.project.id !== projectId) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Valideer offer
    const offer = mockData.offers.find(o => o.id === offerId);
    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    // Groepeer data
    const revisionsByOffer = groupRevisionsByOffer(mockData.revisions);
    const linesByRevision = groupLinesByRevision(mockData.revisionLines);
    const mappingsByRevision = groupMappingsByRevision(
      mockData.revisionMappings,
      mockData.revisionLines
    );

    // Haal revisies voor deze offerte op
    const revisions = revisionsByOffer.get(offerId) || [];

    // Enrich revisies met line counts
    const enrichedRevisions = revisions.map(revision => {
      const lines = linesByRevision.get(revision.id) || [];
      const mappings = mappingsByRevision.get(revision.id) || [];

      return {
        ...revision,
        lineCount: lines.length,
        mappedLineCount: mappings.length,
      };
    });

    return NextResponse.json({
      revisions: enrichedRevisions,
      offerId,
      offerName: offer.contractorId, // Could enrich further with contractor name if needed
    });
  } catch (error) {
    console.error('Error fetching revisions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revisions' },
      { status: 500 }
    );
  }
}
