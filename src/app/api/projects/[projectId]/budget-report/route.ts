/**
 * API route voor budget rapport
 * GET /api/projects/[projectId]/budget-report?budgetId=...&offerId=...
 * Genereert budget variance rapport met vergelijking tussen begroting en werkelijke kosten
 */

import { NextResponse } from 'next/server';
import { loadMockData } from '@/mocks';
import { generateBudgetReport } from '@/domain/budgetTracking';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const mockData = loadMockData();
    const { projectId } = await params;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get('budgetId');
    const offerId = searchParams.get('offerId');

    if (!budgetId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: budgetId' },
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

    // Zoek budget
    const projectBudget = mockData.projectBudgets.find(b => b.id === budgetId);
    if (!projectBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }

    // Filter component budgets voor deze project budget
    const componentBudgets = mockData.componentBudgets.filter(
      cb => cb.projectBudgetId === budgetId
    );

    // Optioneel: zoek offer voor actual costs
    let offer: typeof mockData.offers[0] | undefined;
    let offerLines: typeof mockData.offerLines | undefined;
    let lineMappings: typeof mockData.lineMappings | undefined;

    if (offerId) {
      offer = mockData.offers.find(o => o.id === offerId);
      if (!offer) {
        return NextResponse.json(
          { error: 'Offer not found' },
          { status: 404 }
        );
      }

      // Filter offer lines
      offerLines = mockData.offerLines.filter(l => l.offerId === offerId);

      // Filter line mappings
      lineMappings = mockData.lineMappings.filter(m =>
        offerLines!.some(l => l.id === m.offerLineId)
      );
    }

    // Genereer budget rapport
    const budgetReport = generateBudgetReport({
      projectBudget,
      componentBudgets,
      masterComponents: mockData.masterComponents,
      offer,
      offerLines,
      lineMappings,
    });

    return NextResponse.json(budgetReport);
  } catch (error) {
    console.error('Error generating budget report:', error);
    return NextResponse.json(
      { error: 'Failed to generate budget report' },
      { status: 500 }
    );
  }
}
