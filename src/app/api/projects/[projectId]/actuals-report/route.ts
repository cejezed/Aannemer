/**
 * API route voor actuals report (budget vs werkelijke kosten)
 * GET /api/projects/[projectId]/actuals-report?budgetId=...
 * Combineert budget tracking met Supabase actuals
 */

import { NextResponse } from 'next/server';
import { loadMockData } from '@/mocks';
import { mockActualsData } from '@/mocks/actuals';
import { fetchComponentActuals, hasActualsData } from '@/lib/supabase/actualsService';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';
import { generateBudgetReport } from '@/domain/budgetTracking';
import type { ActualsReport, ActualSource } from '@/domain/types';

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

    // Haal actuals op (Supabase of mock)
    let componentActuals;
    let dataSource: ActualSource = 'MANUAL';

    if (isSupabaseServerConfigured()) {
      const hasData = await hasActualsData(projectId);

      if (hasData) {
        componentActuals = await fetchComponentActuals({
          projectId,
          masterComponents: mockData.masterComponents,
        });
        dataSource = 'PERSONAL_COACH';
      }
    }

    // Fallback naar mock data
    if (!componentActuals || componentActuals.length === 0) {
      const { aggregateActualsByComponent } = await import('@/domain/actuals');

      componentActuals = aggregateActualsByComponent({
        hourEntries: mockActualsData.hourEntries.filter(
          e => e.projectId === projectId
        ),
        costEntries: mockActualsData.costEntries.filter(
          e => e.projectId === projectId
        ),
        masterComponents: mockData.masterComponents,
      });
      dataSource = 'MANUAL';
    }

    // Maak synthetische offer lines van actuals voor budget rapport
    // Dit simuleert alsof de actuals een offerte zijn
    const syntheticOffer = {
      id: 'actuals-synthetic',
      contractorId: 'actuals',
      projectId,
      title: 'Werkelijke kosten (Actuals)',
      isWinningOffer: false,
      pricingModel: 'INCL_OPSLAGEN' as const,
      currency: 'EUR' as const,
      sourceTotalIncl: componentActuals.reduce((sum, c) => sum + c.actualCostIncl, 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const syntheticOfferLines = componentActuals.map((ca, index) => ({
      id: `actual-line-${ca.masterComponentId}`,
      offerId: 'actuals-synthetic',
      position: index + 1,
      description: `Werkelijke kosten ${ca.masterComponentName}`,
      quantity: 1,
      unit: 'SOM',
      pricePerUnitExcl: ca.actualCostIncl / 1.21, // Backwards from incl
      pricePerUnitIncl: ca.actualCostIncl,
      totalPriceExcl: ca.actualCostIncl / 1.21,
      totalPriceIncl: ca.actualCostIncl,
      priceType: 'VAST' as const,
      isAllowance: false,
      clarification: `${ca.actualHours} uren gewerkt`,
      rawText: `${ca.masterComponentCode} - Werkelijke kosten`,
      sortOrder: index + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const syntheticMappings = componentActuals.map(ca => ({
      id: `actual-mapping-${ca.masterComponentId}`,
      offerLineId: `actual-line-${ca.masterComponentId}`,
      masterComponentId: ca.masterComponentId,
      assignedBy: 'SYSTEM' as const,
      confidence: 1.0,
      coverageStatus: 'INCLUSIEF' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Genereer budget rapport met actuals als "offer"
    const budgetReport = generateBudgetReport({
      projectBudget,
      componentBudgets,
      masterComponents: mockData.masterComponents,
      offer: syntheticOffer,
      offerLines: syntheticOfferLines,
      lineMappings: syntheticMappings,
    });

    // Bereken totalen
    const { calculateActualsTotals } = await import('@/domain/actuals');
    const totals = calculateActualsTotals(componentActuals);

    const actualsReport: ActualsReport = {
      projectId,
      budgetReport,
      actualsByComponent: componentActuals,
      totalActualCostIncl: totals.totalCostIncl,
      totalActualHours: totals.totalHours,
      lastUpdated: new Date().toISOString(),
      dataSource,
    };

    return NextResponse.json(actualsReport);
  } catch (error) {
    console.error('Error generating actuals report:', error);
    return NextResponse.json(
      { error: 'Failed to generate actuals report' },
      { status: 500 }
    );
  }
}
