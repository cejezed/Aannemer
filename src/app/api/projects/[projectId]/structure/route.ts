/**
 * API route voor bouwstructuur met aggregaties per offerte
 * GET /api/projects/[projectId]/structure - master components met prijzen per offerte
 */

import { NextResponse } from 'next/server';
import {
  loadMockData,
  groupLinesByOffer,
  groupMappingsByOffer,
} from '@/mocks';
import { aggregateByMasterComponent } from '@/domain/aggregateByMaster';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const mockData = loadMockData();
    const { projectId } = await params;

    if (mockData.project.id !== projectId) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const offerLinesMap = groupLinesByOffer(mockData.offerLines);
    const lineMappingsMap = groupMappingsByOffer(mockData.lineMappings);

    // Aggregeer per offerte
    const aggregationsByOffer = mockData.offers.map(offer => {
      const offerLines = offerLinesMap.get(offer.id) || [];
      const lineMappings = lineMappingsMap.get(offer.id) || [];

      const aggregations = aggregateByMasterComponent(
        mockData.masterComponents,
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
      masterComponents: mockData.masterComponents,
      aggregationsByOffer,
      offers: mockData.offers,
    });
  } catch (error) {
    console.error('Error fetching structure:', error);
    return NextResponse.json(
      { error: 'Failed to fetch structure' },
      { status: 500 }
    );
  }
}
