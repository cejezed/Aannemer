/**
 * API route voor offerte vergelijking
 * GET /api/projects/[projectId]/comparison - complete vergelijkingssamenvatting
 */

import { NextResponse } from 'next/server';
import {
  loadMockData,
  groupLinesByOffer,
  groupMappingsByOffer,
  createContractorMap,
} from '@/mocks';
import { generateComparisonSummary } from '@/domain/comparisonSummary';

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

    const summary = generateComparisonSummary(
      mockData.project,
      mockData.offers,
      contractorMap,
      offerLinesMap,
      lineMappingsMap,
      mockData.masterComponents
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
