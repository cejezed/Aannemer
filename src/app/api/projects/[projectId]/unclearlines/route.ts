/**
 * API route voor onduidelijke/niet-gemapte regels
 * GET /api/projects/[projectId]/unclearlines - alle onduidelijke regels per offerte
 */

import { NextResponse } from 'next/server';
import {
  loadMockData,
  groupLinesByOffer,
  groupMappingsByOffer,
  createContractorMap,
} from '@/mocks';

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
    const contractorMap = createContractorMap(mockData.contractors);

    // Verzamel onduidelijke regels per offerte
    const unclearLinesByOffer = mockData.offers.map(offer => {
      const contractor = contractorMap.get(offer.contractorId);
      const offerLines = offerLinesMap.get(offer.id) || [];
      const lineMappings = lineMappingsMap.get(offer.id) || [];

      const mappedLineIds = new Set(lineMappings.map(m => m.offerLineId));
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
    });

    return NextResponse.json({
      unclearLinesByOffer,
      masterComponents: mockData.masterComponents.filter(mc => mc.isLeaf),
    });
  } catch (error) {
    console.error('Error fetching unclear lines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unclear lines' },
      { status: 500 }
    );
  }
}
