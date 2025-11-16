/**
 * API route voor offertes van een project
 * GET /api/projects/[projectId]/offers - lijst van alle offertes voor een project
 */

import { NextResponse } from 'next/server';
import { loadMockData, groupLinesByOffer, createContractorMap } from '@/mocks';

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

    const contractorMap = createContractorMap(mockData.contractors);
    const offerLinesMap = groupLinesByOffer(mockData.offerLines);

    // Enrich offers with contractor info and line counts
    const enrichedOffers = mockData.offers.map(offer => {
      const contractor = contractorMap.get(offer.contractorId);
      const lines = offerLinesMap.get(offer.id) || [];

      return {
        ...offer,
        contractorName: contractor?.name || 'Unknown',
        lineCount: lines.length,
      };
    });

    return NextResponse.json({
      offers: enrichedOffers,
      contractors: mockData.contractors,
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}
