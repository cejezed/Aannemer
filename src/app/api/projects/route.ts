/**
 * API route voor projecten
 * GET /api/projects - lijst van alle projecten
 */

import { NextResponse } from 'next/server';
import { loadMockData } from '@/mocks';

export async function GET() {
  try {
    const mockData = loadMockData();

    return NextResponse.json({
      projects: [mockData.project],
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
