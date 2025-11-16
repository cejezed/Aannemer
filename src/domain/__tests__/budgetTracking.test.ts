/**
 * Tests voor budget tracking functionality
 */

import { describe, it, expect } from 'vitest';
import { generateBudgetReport } from '../budgetTracking';
import type {
  ProjectBudget,
  ComponentBudget,
  MasterComponent,
  Offer,
  OfferLine,
  LineMapping,
} from '../types';

describe('budgetTracking', () => {
  // Mock master components
  const masterComponents: MasterComponent[] = [
    {
      id: 'mc-10',
      code: '10',
      name: 'Grondwerk',
      parentId: null,
      sortOrder: 10,
      isLeaf: true,
    },
    {
      id: 'mc-21',
      code: '21',
      name: 'Betonwerk kelder',
      parentId: null,
      sortOrder: 21,
      isLeaf: true,
    },
    {
      id: 'mc-24',
      code: '24',
      name: 'Dakgoten',
      parentId: null,
      sortOrder: 24,
      isLeaf: true,
    },
  ];

  // Mock project budget
  const projectBudget: ProjectBudget = {
    id: 'budget-001',
    projectId: 'proj-1',
    name: 'Interne projectbegroting',
    totalBudgetIncl: 500000,
    currency: 'EUR',
    isBaseline: true,
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  };

  // Mock component budgets
  const componentBudgets: ComponentBudget[] = [
    {
      id: 'cb-10',
      projectBudgetId: 'budget-001',
      masterComponentId: 'mc-10',
      budgetAmountIncl: 20000,
    },
    {
      id: 'cb-21',
      projectBudgetId: 'budget-001',
      masterComponentId: 'mc-21',
      budgetAmountIncl: 50000,
    },
    {
      id: 'cb-24',
      projectBudgetId: 'budget-001',
      masterComponentId: 'mc-24',
      budgetAmountIncl: 6000,
    },
  ];

  it('should generate report with no actual costs', () => {
    const report = generateBudgetReport({
      projectBudget,
      componentBudgets,
      masterComponents,
    });

    expect(report.projectBudgetId).toBe('budget-001');
    expect(report.totalBudgetIncl).toBe(76000); // Sum of component budgets
    expect(report.totalActualIncl).toBe(0);
    expect(report.totalVariance).toBe(-76000);
    expect(report.overallStatus).toBe('WITHIN_BUDGET');
    expect(report.stats.componentsWithinBudget).toBe(3);
  });

  it('should calculate variance when actual costs are within budget', () => {
    const offer: Offer = {
      id: 'offer-1',
      projectId: 'proj-1',
      contractorId: 'ctr-1',
      title: 'Test Offer',
      pricingModel: 'EXCL_OPSLAGEN',
      sourceTotalIncl: 50000,
      currency: 'EUR',
      createdAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-01-01T10:00:00Z',
    };

    const offerLines: OfferLine[] = [
      {
        id: 'ol-1',
        offerId: 'offer-1',
        rawText: 'Grondwerk',
        description: 'Grondwerk',
        priceType: 'VAST',
        priceIncl: 17000, // Under budget (20000), 85%
      },
      {
        id: 'ol-2',
        offerId: 'offer-1',
        rawText: 'Kelder',
        description: 'Kelder',
        priceType: 'VAST',
        priceIncl: 45000, // Under budget (50000), 90%
      },
    ];

    const lineMappings: LineMapping[] = [
      {
        id: 'lm-1',
        offerLineId: 'ol-1',
        masterComponentId: 'mc-10',
        coverageStatus: 'INCLUSIEF',
      },
      {
        id: 'lm-2',
        offerLineId: 'ol-2',
        masterComponentId: 'mc-21',
        coverageStatus: 'INCLUSIEF',
      },
    ];

    const report = generateBudgetReport({
      projectBudget,
      componentBudgets,
      masterComponents,
      offer,
      offerLines,
      lineMappings,
    });

    expect(report.totalActualIncl).toBe(62000);
    expect(report.totalVariance).toBe(-14000); // Under budget
    expect(report.overallStatus).toBe('WITHIN_BUDGET');

    const grondwerk = report.componentVariances.find(v => v.masterComponentId === 'mc-10');
    expect(grondwerk?.budgetAmountIncl).toBe(20000);
    expect(grondwerk?.actualAmountIncl).toBe(17000);
    expect(grondwerk?.variance).toBe(-3000);
    expect(grondwerk?.variancePercentage).toBe(-15);
    expect(grondwerk?.status).toBe('WITHIN_BUDGET');
  });

  it('should detect APPROACHING_LIMIT status (90-100%)', () => {
    const offerLines: OfferLine[] = [
      {
        id: 'ol-1',
        offerId: 'offer-1',
        rawText: 'Dakgoten',
        description: 'Dakgoten',
        priceType: 'VAST',
        priceIncl: 5700, // 95% of budget (6000)
      },
    ];

    const lineMappings: LineMapping[] = [
      {
        id: 'lm-1',
        offerLineId: 'ol-1',
        masterComponentId: 'mc-24',
        coverageStatus: 'INCLUSIEF',
      },
    ];

    const report = generateBudgetReport({
      projectBudget,
      componentBudgets,
      masterComponents,
      offerLines,
      lineMappings,
    });

    const dakgoten = report.componentVariances.find(v => v.masterComponentId === 'mc-24');
    expect(dakgoten?.status).toBe('APPROACHING_LIMIT');
    expect(report.stats.componentsApproachingLimit).toBe(1);
  });

  it('should detect OVER_BUDGET status (>100%)', () => {
    const offerLines: OfferLine[] = [
      {
        id: 'ol-1',
        offerId: 'offer-1',
        rawText: 'Kelder',
        description: 'Kelder',
        priceType: 'VAST',
        priceIncl: 55000, // Over budget (50000)
      },
    ];

    const lineMappings: LineMapping[] = [
      {
        id: 'lm-1',
        offerLineId: 'ol-1',
        masterComponentId: 'mc-21',
        coverageStatus: 'INCLUSIEF',
      },
    ];

    const report = generateBudgetReport({
      projectBudget,
      componentBudgets,
      masterComponents,
      offerLines,
      lineMappings,
    });

    const kelder = report.componentVariances.find(v => v.masterComponentId === 'mc-21');
    expect(kelder?.status).toBe('OVER_BUDGET');
    expect(kelder?.variance).toBe(5000);
    expect(kelder?.variancePercentage).toBe(10);
    expect(report.stats.componentsOverBudget).toBe(1);
  });

  it('should handle components with budget but no actual costs', () => {
    const report = generateBudgetReport({
      projectBudget,
      componentBudgets,
      masterComponents,
      offerLines: [],
      lineMappings: [],
    });

    // All components have budget but no actuals
    expect(report.componentVariances).toHaveLength(3);
    expect(report.stats.componentsWithinBudget).toBe(3);

    for (const variance of report.componentVariances) {
      expect(variance.actualAmountIncl).toBe(0);
      expect(variance.variance).toBeLessThan(0); // Negative = under budget
    }
  });

  it('should calculate correct total variance', () => {
    const offerLines: OfferLine[] = [
      {
        id: 'ol-1',
        offerId: 'offer-1',
        rawText: 'Grondwerk',
        description: 'Grondwerk',
        priceType: 'VAST',
        priceIncl: 22000, // +2000 over
      },
      {
        id: 'ol-2',
        offerId: 'offer-1',
        rawText: 'Kelder',
        description: 'Kelder',
        priceType: 'VAST',
        priceIncl: 48000, // -2000 under
      },
    ];

    const lineMappings: LineMapping[] = [
      {
        id: 'lm-1',
        offerLineId: 'ol-1',
        masterComponentId: 'mc-10',
        coverageStatus: 'INCLUSIEF',
      },
      {
        id: 'lm-2',
        offerLineId: 'ol-2',
        masterComponentId: 'mc-21',
        coverageStatus: 'INCLUSIEF',
      },
    ];

    const report = generateBudgetReport({
      projectBudget,
      componentBudgets,
      masterComponents,
      offerLines,
      lineMappings,
    });

    // Total: 70000 actual vs 70000 budget = 0 variance
    expect(report.totalActualIncl).toBe(70000);
    expect(report.totalBudgetIncl).toBe(76000);
    expect(report.totalVariance).toBe(-6000);
  });

  it('should sort component variances by component code', () => {
    const offerLines: OfferLine[] = [
      {
        id: 'ol-1',
        offerId: 'offer-1',
        rawText: 'Dakgoten',
        description: 'Dakgoten',
        priceType: 'VAST',
        priceIncl: 5000,
      },
      {
        id: 'ol-2',
        offerId: 'offer-1',
        rawText: 'Grondwerk',
        description: 'Grondwerk',
        priceType: 'VAST',
        priceIncl: 18000,
      },
    ];

    const lineMappings: LineMapping[] = [
      {
        id: 'lm-1',
        offerLineId: 'ol-1',
        masterComponentId: 'mc-24',
        coverageStatus: 'INCLUSIEF',
      },
      {
        id: 'lm-2',
        offerLineId: 'ol-2',
        masterComponentId: 'mc-10',
        coverageStatus: 'INCLUSIEF',
      },
    ];

    const report = generateBudgetReport({
      projectBudget,
      componentBudgets,
      masterComponents,
      offerLines,
      lineMappings,
    });

    // Should be sorted by code: 10, 21, 24
    expect(report.componentVariances[0].masterComponentCode).toBe('10');
    expect(report.componentVariances[1].masterComponentCode).toBe('21');
    expect(report.componentVariances[2].masterComponentCode).toBe('24');
  });
});
