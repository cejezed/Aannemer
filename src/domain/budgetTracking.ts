/**
 * Domain service voor budget tracking en variantie-analyse
 * Vergelijkt begrotingen met werkelijke kosten uit offertes
 */

import type {
  ProjectBudget,
  ComponentBudget,
  MasterComponent,
  Offer,
  OfferLine,
  LineMapping,
  BudgetReport,
  BudgetVariance,
  BudgetStatus,
} from './types';

export interface BudgetComparisonArgs {
  projectBudget: ProjectBudget;
  componentBudgets: ComponentBudget[];
  masterComponents: MasterComponent[];
  offer?: Offer;           // Optioneel: vergelijk met specifieke offerte
  offerLines?: OfferLine[];
  lineMappings?: LineMapping[];
}

/**
 * Genereer budget rapport: vergelijk begroting met werkelijkheid
 */
export function generateBudgetReport(
  args: BudgetComparisonArgs
): BudgetReport {
  const {
    projectBudget,
    componentBudgets,
    masterComponents,
    offer,
    offerLines = [],
    lineMappings = [],
  } = args;

  // Maps voor snelle lookup
  const componentMap = new Map(masterComponents.map(c => [c.id, c]));
  const budgetMap = new Map(
    componentBudgets.map(cb => [cb.masterComponentId, cb])
  );

  // Groepeer actual costs per masterComponent
  const actualCostsByComponent = new Map<string, number>();

  if (offerLines.length > 0 && lineMappings.length > 0) {
    for (const mapping of lineMappings) {
      const line = offerLines.find(l => l.id === mapping.offerLineId);
      if (!line) continue;

      const currentAmount = actualCostsByComponent.get(mapping.masterComponentId) || 0;
      actualCostsByComponent.set(
        mapping.masterComponentId,
        currentAmount + (line.priceIncl ?? 0)
      );
    }
  }

  // Genereer variances per component
  const componentVariances: BudgetVariance[] = [];
  let componentsWithinBudget = 0;
  let componentsApproachingLimit = 0;
  let componentsOverBudget = 0;

  // Verzamel alle componenten die budget of actual costs hebben
  const relevantComponentIds = new Set([
    ...componentBudgets.map(cb => cb.masterComponentId),
    ...actualCostsByComponent.keys(),
  ]);

  for (const componentId of relevantComponentIds) {
    const component = componentMap.get(componentId);
    if (!component) continue;

    const componentBudget = budgetMap.get(componentId);
    const budgetAmount = componentBudget?.budgetAmountIncl ?? 0;
    const actualAmount = actualCostsByComponent.get(componentId) ?? 0;

    // Skip components met geen budget en geen actual costs
    if (budgetAmount === 0 && actualAmount === 0) continue;

    const variance = actualAmount - budgetAmount;
    const variancePercentage = budgetAmount > 0
      ? (variance / budgetAmount) * 100
      : (actualAmount > 0 ? 100 : 0);

    const status = determineBudgetStatus(actualAmount, budgetAmount);

    // Update counts
    if (status === 'WITHIN_BUDGET') componentsWithinBudget++;
    else if (status === 'APPROACHING_LIMIT') componentsApproachingLimit++;
    else if (status === 'OVER_BUDGET') componentsOverBudget++;

    componentVariances.push({
      masterComponentId: componentId,
      masterComponentCode: component.code,
      masterComponentName: component.name,
      budgetAmountIncl: round(budgetAmount),
      actualAmountIncl: round(actualAmount),
      variance: round(variance),
      variancePercentage: round(variancePercentage),
      status,
    });
  }

  // Sort by component code
  componentVariances.sort((a, b) =>
    a.masterComponentCode.localeCompare(b.masterComponentCode)
  );

  // Calculate totals
  const totalBudgetIncl = componentBudgets.reduce(
    (sum, cb) => sum + cb.budgetAmountIncl,
    0
  );
  const totalActualIncl = Array.from(actualCostsByComponent.values()).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const totalVariance = totalActualIncl - totalBudgetIncl;
  const totalVariancePercentage = totalBudgetIncl > 0
    ? (totalVariance / totalBudgetIncl) * 100
    : 0;

  const overallStatus = determineBudgetStatus(totalActualIncl, totalBudgetIncl);

  return {
    projectBudgetId: projectBudget.id,
    projectBudgetName: projectBudget.name,
    offerId: offer?.id,
    offerTitle: offer?.title,
    totalBudgetIncl: round(totalBudgetIncl),
    totalActualIncl: round(totalActualIncl),
    totalVariance: round(totalVariance),
    totalVariancePercentage: round(totalVariancePercentage),
    overallStatus,
    componentVariances,
    stats: {
      componentsWithinBudget,
      componentsApproachingLimit,
      componentsOverBudget,
    },
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Bepaal budget status op basis van actual vs budget
 */
function determineBudgetStatus(
  actualAmount: number,
  budgetAmount: number
): BudgetStatus {
  if (budgetAmount === 0) {
    return actualAmount > 0 ? 'OVER_BUDGET' : 'WITHIN_BUDGET';
  }

  const usagePercentage = (actualAmount / budgetAmount) * 100;

  if (usagePercentage > 100) {
    return 'OVER_BUDGET';
  } else if (usagePercentage >= 90) {
    return 'APPROACHING_LIMIT';
  } else {
    return 'WITHIN_BUDGET';
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
