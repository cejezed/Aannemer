/**
 * API route voor project actuals
 * GET /api/projects/[projectId]/actuals - Haal werkelijke kosten en uren op
 * Gebruikt Supabase als geconfigureerd, anders mock data
 */

import { NextResponse } from 'next/server';
import { loadMockData } from '@/mocks';
import { mockActualsData } from '@/mocks/actuals';
import { fetchComponentActuals, hasActualsData } from '@/lib/supabase/actualsService';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const mockData = loadMockData();

    // Valideer project
    if (mockData.project.id !== projectId) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    let componentActuals;
    let dataSource: 'SUPABASE' | 'MOCK' = 'MOCK';

    // Probeer eerst Supabase
    if (isSupabaseServerConfigured()) {
      const hasData = await hasActualsData(projectId);

      if (hasData) {
        componentActuals = await fetchComponentActuals({
          projectId,
          masterComponents: mockData.masterComponents,
        });
        dataSource = 'SUPABASE';
      }
    }

    // Fallback naar mock data
    if (!componentActuals || componentActuals.length === 0) {
      // Gebruik mock actuals data
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
      dataSource = 'MOCK';
    }

    // Bereken totalen
    const { calculateActualsTotals } = await import('@/domain/actuals');
    const totals = calculateActualsTotals(componentActuals);

    return NextResponse.json({
      projectId,
      componentActuals,
      totalActualCostIncl: totals.totalCostIncl,
      totalActualHours: totals.totalHours,
      dataSource,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching actuals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch actuals' },
      { status: 500 }
    );
  }
}
