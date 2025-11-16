/**
 * API route voor project budgets
 * GET /api/projects/[projectId]/budgets - Alle budgets voor project
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

    // Filter budgets voor dit project
    const projectBudgets = mockData.projectBudgets.filter(
      b => b.projectId === projectId
    );

    return NextResponse.json({
      budgets: projectBudgets,
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}
