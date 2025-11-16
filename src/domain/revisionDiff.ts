/**
 * Domain service voor het genereren van revision diffs
 * Pure functies om verschillen tussen revisies te berekenen
 */

import type {
  OfferRevision,
  OfferLine,
  LineMapping,
  MasterComponent,
  RevisionDiff,
  RevisionDiffComponent,
  RevisionDiffLine,
  RevisionLineChangeStatus,
  ComponentOfferAggregation,
} from './types';

import { aggregateByMasterComponent } from './aggregateByMaster';

/**
 * Genereer complete diff tussen twee revisies
 */
export function generateRevisionDiff(
  fromRevision: OfferRevision,
  toRevision: OfferRevision,
  linesV1: OfferLine[],
  linesV2: OfferLine[],
  mappingsV1: LineMapping[],
  mappingsV2: LineMapping[],
  masterComponents: MasterComponent[]
): RevisionDiff {
  // 1. Bereken component-niveau verschillen
  const componentDiffs = compareComponentAggregations(
    fromRevision,
    toRevision,
    linesV1,
    linesV2,
    mappingsV1,
    mappingsV2,
    masterComponents
  );

  // 2. Bereken line-niveau verschillen
  const lineDiffs = compareRevisionLines(
    linesV1,
    linesV2,
    mappingsV1,
    mappingsV2,
    masterComponents
  );

  // 3. Bereken totalen
  const totalV1 = linesV1.reduce((sum, line) => sum + (line.priceIncl ?? 0), 0);
  const totalV2 = linesV2.reduce((sum, line) => sum + (line.priceIncl ?? 0), 0);
  const totalDelta = totalV2 - totalV1;
  const totalDeltaPercentage = totalV1 > 0 ? (totalDelta / totalV1) * 100 : 0;

  // 4. Tel statistieken
  const linesAdded = lineDiffs.filter(d => d.status === 'ADDED').length;
  const linesRemoved = lineDiffs.filter(d => d.status === 'REMOVED').length;
  const linesChanged = lineDiffs.filter(d => d.status === 'CHANGED').length;
  const linesUnchanged = lineDiffs.filter(d => d.status === 'UNCHANGED').length;

  return {
    fromRevisionId: fromRevision.id,
    fromRevisionLabel: fromRevision.label,
    toRevisionId: toRevision.id,
    toRevisionLabel: toRevision.label,
    offerId: fromRevision.offerId,
    componentDiffs,
    lineDiffs,
    totalV1: round(totalV1),
    totalV2: round(totalV2),
    totalDelta: round(totalDelta),
    totalDeltaPercentage: round(totalDeltaPercentage),
    linesAdded,
    linesRemoved,
    linesChanged,
    linesUnchanged,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Vergelijk aggregaties per component tussen twee revisies
 */
function compareComponentAggregations(
  fromRevision: OfferRevision,
  toRevision: OfferRevision,
  linesV1: OfferLine[],
  linesV2: OfferLine[],
  mappingsV1: LineMapping[],
  mappingsV2: LineMapping[],
  masterComponents: MasterComponent[]
): RevisionDiffComponent[] {
  // Hergebruik bestaande aggregatie functie
  const aggregationsV1 = aggregateByMasterComponent(
    masterComponents,
    linesV1,
    mappingsV1,
    fromRevision.offerId
  );

  const aggregationsV2 = aggregateByMasterComponent(
    masterComponents,
    linesV2,
    mappingsV2,
    toRevision.offerId
  );

  // Maak maps voor snelle lookup
  const aggMapV1 = new Map(aggregationsV1.map(a => [a.masterComponentId, a]));
  const aggMapV2 = new Map(aggregationsV2.map(a => [a.masterComponentId, a]));

  // Verzamel alle unieke component IDs
  const allComponentIds = new Set([
    ...aggregationsV1.map(a => a.masterComponentId),
    ...aggregationsV2.map(a => a.masterComponentId),
  ]);

  const componentDiffs: RevisionDiffComponent[] = [];

  for (const componentId of allComponentIds) {
    const aggV1 = aggMapV1.get(componentId);
    const aggV2 = aggMapV2.get(componentId);

    const component = masterComponents.find(c => c.id === componentId);
    if (!component) continue;

    const totalV1 = getTotalFromAggregation(aggV1);
    const totalV2 = getTotalFromAggregation(aggV2);
    const delta = totalV2 - totalV1;
    const deltaPercentage = totalV1 > 0 ? (delta / totalV1) * 100 : 0;

    // Alleen toevoegen als er een verschil is
    if (Math.abs(delta) > 0.01) {
      componentDiffs.push({
        masterComponentId: componentId,
        masterComponentCode: component.code,
        masterComponentName: component.name,
        totalV1: round(totalV1),
        totalV2: round(totalV2),
        delta: round(delta),
        deltaPercentage: round(deltaPercentage),
        isSignificant: Math.abs(deltaPercentage) > 10, // > 10% is significant
      });
    }
  }

  // Sorteer op absolute delta (grootste eerst)
  componentDiffs.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return componentDiffs;
}

/**
 * Vergelijk individuele lines tussen twee revisies
 * Simpel matching algoritme op basis van masterComponentId + description
 */
function compareRevisionLines(
  linesV1: OfferLine[],
  linesV2: OfferLine[],
  mappingsV1: LineMapping[],
  mappingsV2: LineMapping[],
  masterComponents: MasterComponent[]
): RevisionDiffLine[] {
  const lineDiffs: RevisionDiffLine[] = [];

  // Maak maps voor snelle lookup
  const mappingMapV1 = new Map(mappingsV1.map(m => [m.offerLineId, m]));
  const mappingMapV2 = new Map(mappingsV2.map(m => [m.offerLineId, m]));
  const componentMap = new Map(masterComponents.map(c => [c.id, c]));

  // Maak een map van v2 lines voor matching
  const linesV2ByKey = new Map<string, OfferLine>();
  const matchedV2Ids = new Set<string>();

  for (const lineV2 of linesV2) {
    const mappingV2 = mappingMapV2.get(lineV2.id);
    if (mappingV2) {
      const key = createLineMatchKey(lineV2, mappingV2.masterComponentId);
      linesV2ByKey.set(key, lineV2);
    }
  }

  // Process V1 lines: vind matches of mark als REMOVED
  for (const lineV1 of linesV1) {
    const mappingV1 = mappingMapV1.get(lineV1.id);
    if (!mappingV1) continue;

    const component = componentMap.get(mappingV1.masterComponentId);
    const key = createLineMatchKey(lineV1, mappingV1.masterComponentId);
    const lineV2 = linesV2ByKey.get(key);

    if (lineV2) {
      // Match gevonden
      matchedV2Ids.add(lineV2.id);

      const status = determineLineChangeStatus(lineV1, lineV2);
      const priceDelta = (lineV2.priceIncl ?? 0) - (lineV1.priceIncl ?? 0);
      const descriptionChanged = lineV1.description !== lineV2.description;

      lineDiffs.push({
        masterComponentId: mappingV1.masterComponentId,
        masterComponentName: component?.name,
        lineV1,
        lineV2,
        status,
        priceDelta: Math.abs(priceDelta) > 0.01 ? round(priceDelta) : undefined,
        descriptionChanged,
      });
    } else {
      // Geen match: REMOVED
      lineDiffs.push({
        masterComponentId: mappingV1.masterComponentId,
        masterComponentName: component?.name,
        lineV1,
        lineV2: undefined,
        status: 'REMOVED',
        priceDelta: lineV1.priceIncl ? -lineV1.priceIncl : undefined,
      });
    }
  }

  // Process V2 lines die niet gematched zijn: ADDED
  for (const lineV2 of linesV2) {
    if (!matchedV2Ids.has(lineV2.id)) {
      const mappingV2 = mappingMapV2.get(lineV2.id);
      if (mappingV2) {
        const component = componentMap.get(mappingV2.masterComponentId);

        lineDiffs.push({
          masterComponentId: mappingV2.masterComponentId,
          masterComponentName: component?.name,
          lineV1: undefined,
          lineV2,
          status: 'ADDED',
          priceDelta: lineV2.priceIncl ?? undefined,
        });
      }
    }
  }

  return lineDiffs;
}

/**
 * Creëer een match key voor een line
 * Gebruikt masterComponentId + code (indien beschikbaar) of genormaliseerde description
 */
function createLineMatchKey(line: OfferLine, masterComponentId: string): string {
  // Strategy 1: If code exists (e.g., "21.3"), use that as primary match key
  // Dit is de meest betrouwbare manier om regels te matchen tussen revisies
  if (line.code) {
    return `${masterComponentId}::CODE::${line.code}`;
  }

  // Strategy 2: Fallback to normalized description for lines without codes
  // Gebruik eerste 3 significante woorden voor robuustere matching
  const words = line.description
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 2) // Filter kleine woorden zoals "de", "en", "à"
    .slice(0, 3);

  return `${masterComponentId}::DESC::${words.join('_')}`;
}

/**
 * Bepaal of een line is veranderd of onveranderd
 */
function determineLineChangeStatus(
  lineV1: OfferLine,
  lineV2: OfferLine
): RevisionLineChangeStatus {
  // Check of prijs is veranderd (met kleine tolerantie voor floating point)
  const priceChanged = Math.abs((lineV2.priceIncl ?? 0) - (lineV1.priceIncl ?? 0)) > 0.01;

  // Check of description is veranderd
  const descriptionChanged = lineV1.description !== lineV2.description;

  // Check of quantity is veranderd
  const quantityChanged = lineV1.quantity !== lineV2.quantity;

  if (priceChanged || descriptionChanged || quantityChanged) {
    return 'CHANGED';
  }

  return 'UNCHANGED';
}

/**
 * Haal totaal bedrag uit aggregatie
 */
function getTotalFromAggregation(agg?: ComponentOfferAggregation): number {
  if (!agg) return 0;

  return (
    agg.totalVastIncl +
    agg.totalStelpostIncl +
    agg.totalIndicatieIncl
  );
}

/**
 * Helper: rond af op 2 decimalen
 */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}
