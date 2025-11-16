/**
 * API route voor stelpost analyses
 * GET /api/projects/[projectId]/stelposten - stelpost profielen per offerte
 */

import { NextResponse } from 'next/server';
import {
  loadMockData,
  groupLinesByOffer,
  groupMappingsByOffer,
  createContractorMap,
} from '@/mocks';
import { generateAllowanceProfiles } from '@/domain/allowanceDashboard';

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

    // Genereer allowance profielen voor alle offertes
    const profiles = generateAllowanceProfiles(
      mockData.offers,
      contractorMap,
      offerLinesMap,
      lineMappingsMap,
      mockData.masterComponents,
      5000 // bigAllowanceThreshold
    );

    return NextResponse.json({
      profiles,
      offers: mockData.offers,
    });
  } catch (error) {
    console.error('Error fetching allowances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch allowances' },
      { status: 500 }
    );
  }
}
