/**
 * Domain service voor aggregatie per mastercomponent
 * Groepeert offerteregels per mastercomponent en berekent totalen
 */

import type {
  OfferLine,
  LineMapping,
  MasterComponent,
  ComponentOfferAggregation,
  ComponentCoverageStatus,
} from './types';

/**
 * Aggregeer offerteregels per mastercomponent voor één offerte
 */
export function aggregateByMasterComponent(
  masterComponents: MasterComponent[],
  offerLines: OfferLine[],
  lineMappings: LineMapping[],
  offerId: string
): ComponentOfferAggregation[] {
  const aggregations: ComponentOfferAggregation[] = [];

  // Map line IDs to lines voor snelle lookup
  const lineMap = new Map(offerLines.map(line => [line.id, line]));

  // Groepeer mappings per mastercomponent
  const mappingsByComponent = new Map<string, LineMapping[]>();
  for (const mapping of lineMappings) {
    const componentMappings = mappingsByComponent.get(mapping.masterComponentId) || [];
    componentMappings.push(mapping);
    mappingsByComponent.set(mapping.masterComponentId, componentMappings);
  }

  // Verwerk alleen leaf components (waar offerteregels aan hangen)
  const leafComponents = masterComponents.filter(c => c.isLeaf);

  for (const component of leafComponents) {
    const componentMappings = mappingsByComponent.get(component.id) || [];
    const lines = componentMappings
      .map(m => lineMap.get(m.offerLineId))
      .filter((line): line is OfferLine => line !== undefined);

    const aggregation = aggregateLinesForComponent(
      component.id,
      offerId,
      lines,
      componentMappings
    );

    aggregations.push(aggregation);
  }

  return aggregations;
}

/**
 * Aggregeer regels voor één specifiek component
 */
function aggregateLinesForComponent(
  masterComponentId: string,
  offerId: string,
  lines: OfferLine[],
  mappings: LineMapping[]
): ComponentOfferAggregation {
  let totalVastExcl = 0;
  let totalVastIncl = 0;
  let totalStelpostExcl = 0;
  let totalStelpostIncl = 0;
  let totalIndicatieExcl = 0;
  let totalIndicatieIncl = 0;

  for (const line of lines) {
    const excl = line.priceExcl ?? 0;
    const incl = line.priceIncl ?? 0;

    switch (line.priceType) {
      case 'VAST':
        totalVastExcl += excl;
        totalVastIncl += incl;
        break;
      case 'STELPOST':
        totalStelpostExcl += excl;
        totalStelpostIncl += incl;
        break;
      case 'INDICATIE':
        totalIndicatieExcl += excl;
        totalIndicatieIncl += incl;
        break;
    }
  }

  const coverageStatus = determineCoverageStatus(
    totalVastIncl,
    totalStelpostIncl,
    totalIndicatieIncl,
    mappings
  );

  return {
    masterComponentId,
    offerId,
    totalVastExcl: round(totalVastExcl),
    totalVastIncl: round(totalVastIncl),
    totalStelpostExcl: round(totalStelpostExcl),
    totalStelpostIncl: round(totalStelpostIncl),
    totalIndicatieExcl: round(totalIndicatieExcl),
    totalIndicatieIncl: round(totalIndicatieIncl),
    lineCount: lines.length,
    coverageStatus,
  };
}

/**
 * Bepaal coverage status voor een component
 */
function determineCoverageStatus(
  totalVast: number,
  totalStelpost: number,
  totalIndicatie: number,
  mappings: LineMapping[]
): ComponentCoverageStatus {
  // Check eerst of er mappings zijn met NIET_OPGENOMEN status
  const hasNotIncluded = mappings.some(m => m.coverageStatus === 'NIET_OPGENOMEN');
  if (hasNotIncluded || mappings.length === 0) {
    return 'ONTBREEKT';
  }

  const hasVast = totalVast > 0;
  const hasStelpost = totalStelpost > 0;
  const hasIndicatie = totalIndicatie > 0;

  if (hasVast && !hasStelpost && !hasIndicatie) {
    return 'VOLLEDIG';
  }

  if (!hasVast && hasStelpost && !hasIndicatie) {
    return 'STELPOST_ONLY';
  }

  if (!hasVast && !hasStelpost && hasIndicatie) {
    return 'INDICATIE_ONLY';
  }

  if (hasVast && (hasStelpost || hasIndicatie)) {
    return 'GEDEELTELIJK';
  }

  return 'ONTBREEKT';
}

/**
 * Aggregeer alle child components naar parent components
 * Voor hiërarchische weergave in de UI
 */
export function aggregateToParentComponents(
  masterComponents: MasterComponent[],
  leafAggregations: ComponentOfferAggregation[]
): ComponentOfferAggregation[] {
  const result: ComponentOfferAggregation[] = [...leafAggregations];

  // Build parent-child map
  const childrenMap = new Map<string, MasterComponent[]>();
  for (const component of masterComponents) {
    if (component.parentId) {
      const siblings = childrenMap.get(component.parentId) || [];
      siblings.push(component);
      childrenMap.set(component.parentId, siblings);
    }
  }

  // Process parents bottom-up (sorted by code in reverse)
  const parents = masterComponents
    .filter(c => !c.isLeaf)
    .sort((a, b) => b.code.localeCompare(a.code));

  const aggregationMap = new Map(
    leafAggregations.map(agg => [agg.masterComponentId, agg])
  );

  for (const parent of parents) {
    const children = childrenMap.get(parent.id) || [];
    const childAggregations = children
      .map(c => aggregationMap.get(c.id))
      .filter((agg): agg is ComponentOfferAggregation => agg !== undefined);

    if (childAggregations.length > 0) {
      const parentAggregation = sumAggregations(
        parent.id,
        childAggregations[0].offerId,
        childAggregations
      );
      aggregationMap.set(parent.id, parentAggregation);
      result.push(parentAggregation);
    }
  }

  return result;
}

/**
 * Som meerdere aggregaties op tot één parent aggregatie
 */
function sumAggregations(
  masterComponentId: string,
  offerId: string,
  aggregations: ComponentOfferAggregation[]
): ComponentOfferAggregation {
  let totalVastExcl = 0;
  let totalVastIncl = 0;
  let totalStelpostExcl = 0;
  let totalStelpostIncl = 0;
  let totalIndicatieExcl = 0;
  let totalIndicatieIncl = 0;
  let lineCount = 0;

  for (const agg of aggregations) {
    totalVastExcl += agg.totalVastExcl;
    totalVastIncl += agg.totalVastIncl;
    totalStelpostExcl += agg.totalStelpostExcl;
    totalStelpostIncl += agg.totalStelpostIncl;
    totalIndicatieExcl += agg.totalIndicatieExcl;
    totalIndicatieIncl += agg.totalIndicatieIncl;
    lineCount += agg.lineCount;
  }

  const coverageStatus = determineCoverageStatus(
    totalVastIncl,
    totalStelpostIncl,
    totalIndicatieIncl,
    []
  );

  return {
    masterComponentId,
    offerId,
    totalVastExcl: round(totalVastExcl),
    totalVastIncl: round(totalVastIncl),
    totalStelpostExcl: round(totalStelpostExcl),
    totalStelpostIncl: round(totalStelpostIncl),
    totalIndicatieExcl: round(totalIndicatieExcl),
    totalIndicatieIncl: round(totalIndicatieIncl),
    lineCount,
    coverageStatus,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
