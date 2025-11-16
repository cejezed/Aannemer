/**
 * API route voor scope rapport
 * GET /api/projects/[projectId]/scope-report?offerId=...&revisionId=...
 * Genereert complete scope-check tegen TechSpec
 */

import { NextResponse } from 'next/server';
import { loadMockData } from '@/mocks';
import { checkOfferCompletenessAgainstTechSpec } from '@/domain/scopeCheck';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const mockData = loadMockData();
    const { projectId } = await params;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get('offerId');
    const revisionId = searchParams.get('revisionId');

    if (!offerId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: offerId' },
        { status: 400 }
      );
    }

    // Valideer project
    if (mockData.project.id !== projectId) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Zoek offer
    const offer = mockData.offers.find(o => o.id === offerId);
    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    // Optioneel: zoek revision
    let revision;
    if (revisionId) {
      revision = mockData.revisions.find(r => r.id === revisionId);
      if (!revision) {
        return NextResponse.json(
          { error: 'Revision not found' },
          { status: 404 }
        );
      }
    }

    // Filter offer lines (revision-specific als revisionId gegeven)
    let offerLines = mockData.offerLines.filter(l => l.offerId === offerId);
    if (revisionId) {
      offerLines = mockData.revisionLines.filter(l => l.revisionId === revisionId);
    }

    // Filter line mappings
    const lineMappings = mockData.lineMappings.filter(m =>
      offerLines.some(l => l.id === m.offerLineId)
    );

    // Filter subcontract data (gekoppeld aan deze offerte)
    const subcontractOffers = mockData.subcontractOffers.filter(
      so => so.mainOfferId === offerId
    );
    const subcontractOfferIds = new Set(subcontractOffers.map(so => so.id));

    const subcontractOfferLines = mockData.subcontractOfferLines.filter(
      sol => subcontractOfferIds.has(sol.subcontractOfferId)
    );

    const subcontractLineMappings = mockData.subcontractLineMappings.filter(m =>
      subcontractOfferLines.some(sol => sol.id === m.subcontractOfferLineId)
    );

    // Genereer scope report
    const scopeReport = checkOfferCompletenessAgainstTechSpec({
      offer,
      revision,
      masterComponents: mockData.masterComponents,
      techSpec: mockData.techSpec,
      techSpecSections: mockData.techSpecSections,
      techSpecMappings: mockData.techSpecMappings,
      offerLines,
      subcontractOfferLines,
      lineMappings,
      subcontractLineMappings,
    });

    return NextResponse.json(scopeReport);
  } catch (error) {
    console.error('Error generating scope report:', error);
    return NextResponse.json(
      { error: 'Failed to generate scope report' },
      { status: 500 }
    );
  }
}
