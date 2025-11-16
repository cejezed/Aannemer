/**
 * Actuals tracking domain service
 * Aggregeert werkelijke kosten en uren vanuit Supabase of mock data
 */

import type {
  ProjectActual,
  HourEntry,
  CostEntry,
  ComponentActuals,
  MasterComponent,
} from './types';

/**
 * Aggregeer hour entries en cost entries naar component actuals
 */
export function aggregateActualsByComponent(args: {
  hourEntries: HourEntry[];
  costEntries: CostEntry[];
  masterComponents: MasterComponent[];
}): ComponentActuals[] {
  const { hourEntries, costEntries, masterComponents } = args;

  // Groepeer uren per component
  const hoursByComponent = new Map<string, HourEntry[]>();
  for (const entry of hourEntries) {
    const existing = hoursByComponent.get(entry.masterComponentId) || [];
    existing.push(entry);
    hoursByComponent.set(entry.masterComponentId, existing);
  }

  // Groepeer kosten per component
  const costsByComponent = new Map<string, CostEntry[]>();
  for (const entry of costEntries) {
    const existing = costsByComponent.get(entry.masterComponentId) || [];
    existing.push(entry);
    costsByComponent.set(entry.masterComponentId, existing);
  }

  // Maak component actuals voor alle componenten die uren of kosten hebben
  const componentIds = new Set([
    ...hoursByComponent.keys(),
    ...costsByComponent.keys(),
  ]);

  const result: ComponentActuals[] = [];

  for (const componentId of componentIds) {
    const component = masterComponents.find(c => c.id === componentId);
    if (!component) continue;

    const compHours = hoursByComponent.get(componentId) || [];
    const compCosts = costsByComponent.get(componentId) || [];

    // Bereken totale uren
    const totalHours = compHours.reduce((sum, entry) => sum + entry.hours, 0);

    // Bereken totale kosten (uren + materiaal/andere kosten)
    const hoursCost = compHours.reduce(
      (sum, entry) => sum + entry.hours * entry.hourlyRate,
      0
    );
    const otherCosts = compCosts.reduce(
      (sum, entry) => sum + entry.amountIncl,
      0
    );
    const totalCost = hoursCost + otherCosts;

    result.push({
      masterComponentId: componentId,
      masterComponentCode: component.code,
      masterComponentName: component.name,
      actualCostIncl: totalCost,
      actualHours: totalHours,
      entries: {
        hourEntries: compHours,
        costEntries: compCosts,
      },
    });
  }

  // Sorteer op component code
  result.sort((a, b) => a.masterComponentCode.localeCompare(b.masterComponentCode));

  return result;
}

/**
 * Bereken totalen van component actuals
 */
export function calculateActualsTotals(componentActuals: ComponentActuals[]): {
  totalCostIncl: number;
  totalHours: number;
} {
  const totalCostIncl = componentActuals.reduce(
    (sum, comp) => sum + comp.actualCostIncl,
    0
  );
  const totalHours = componentActuals.reduce(
    (sum, comp) => sum + comp.actualHours,
    0
  );

  return { totalCostIncl, totalHours };
}

/**
 * Converteer ProjectActual naar hour/cost entries voor aggregatie
 * Gebruikt bij het ophalen van geaggregeerde data uit Supabase
 */
export function projectActualsToEntries(args: {
  projectActuals: ProjectActual[];
  masterComponents: MasterComponent[];
}): {
  hourEntries: HourEntry[];
  costEntries: CostEntry[];
} {
  const { projectActuals, masterComponents } = args;

  const hourEntries: HourEntry[] = [];
  const costEntries: CostEntry[] = [];

  for (const actual of projectActuals) {
    const component = masterComponents.find(c => c.id === actual.masterComponentId);
    if (!component) continue;

    // Maak een hour entry voor de uren
    if (actual.actualHours > 0) {
      hourEntries.push({
        id: `${actual.id}-hours`,
        projectId: actual.projectId,
        masterComponentId: actual.masterComponentId,
        workerName: 'Diverse medewerkers',
        hours: actual.actualHours,
        hourlyRate: actual.actualCostIncl > 0
          ? actual.actualCostIncl / actual.actualHours
          : 0,
        date: actual.periodEnd.split('T')[0], // Extract date from ISO string
        description: actual.notes,
        source: actual.source,
        createdAt: actual.createdAt,
        updatedAt: actual.updatedAt,
      });
    }

    // Maak een cost entry voor de kosten (indien geen uren, zijn dit materiaalkosten)
    if (actual.actualCostIncl > 0 && actual.actualHours === 0) {
      costEntries.push({
        id: `${actual.id}-costs`,
        projectId: actual.projectId,
        masterComponentId: actual.masterComponentId,
        costType: 'OTHER',
        amountIncl: actual.actualCostIncl,
        description: actual.notes || `Kosten voor ${component.name}`,
        date: actual.periodEnd.split('T')[0],
        source: actual.source,
        createdAt: actual.createdAt,
        updatedAt: actual.updatedAt,
      });
    }
  }

  return { hourEntries, costEntries };
}
