/**
 * API route voor TechSpec (technische omschrijving)
 * GET /api/projects/[projectId]/techspec - TechSpec met secties en mappings
 */

import { NextResponse } from 'next/server';
import { loadMockData } from '@/mocks';

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

    return NextResponse.json({
      techSpec: mockData.techSpec,
      sections: mockData.techSpecSections,
      mappings: mockData.techSpecMappings,
    });
  } catch (error) {
    console.error('Error fetching TechSpec:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TechSpec' },
      { status: 500 }
    );
  }
}
