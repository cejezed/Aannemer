/**
 * Domain service voor het genereren van complete offerte vergelijkingssamenvatting
 * Combineert alle analyses tot één coherent overzicht
 */

import type {
  Project,
  Offer,
  Contractor,
  OfferLine,
  LineMapping,
  MasterComponent,
  OfferComparisonSummary,
  ComponentDifference,
  MissingComponentInfo,
  UnclearBucket,
} from './types';

import { aggregateByMasterComponent } from './aggregateByMaster';
import { generateAllowanceProfiles } from './allowanceDashboard';
import { normalizeOffer } from './normalizeForComparison';

/**
 * Genereer complete vergelijkingssamenvatting voor een project
 */
export function generateComparisonSummary(
  project: Project,
  offers: Offer[],
  contractors: Map<string, Contractor>,
  offerLinesMap: Map<string, OfferLine[]>,
  lineMappingsMap: Map<string, LineMapping[]>,
  masterComponents: MasterComponent[]
): OfferComparisonSummary {
  // 1. Genereer normalized views
  const normalizedViews = offers.map(offer => {
    const contractor = contractors.get(offer.contractorId);
    if (!contractor) {
      throw new Error(`Contractor not found: ${offer.contractorId}`);
    }

    const offerLines = offerLinesMap.get(offer.id) || [];
    const lineMappings = lineMappingsMap.get(offer.id) || [];

    return normalizeOffer(
      offer,
      contractor,
      offerLines,
      lineMappings,
      masterComponents
    );
  });

  // 2. Genereer allowance profiles
  const allowanceProfiles = generateAllowanceProfiles(
    offers,
    contractors,
    offerLinesMap,
    lineMappingsMap,
    masterComponents
  );

  // 3. Analyseer verschillen per component
  const componentDifferences = analyzeComponentDifferences(
    offers,
    contractors,
    offerLinesMap,
    lineMappingsMap,
    masterComponents
  );

  // 4. Vind ontbrekende componenten
  const missingComponents = findMissingComponents(
    offers,
    contractors,
    lineMappingsMap,
    masterComponents
  );

  // 5. Verzamel onduidelijke posten
  const unclearBuckets = collectUnclearBuckets(
    offers,
    contractors,
    offerLinesMap,
    lineMappingsMap
  );

  // 6. Bereken meta-info
  const largeDiscrepanciesCount = componentDifferences.filter(
    d => d.isLargeDelta
  ).length;

  const missingComponentsCount = missingComponents.reduce(
    (sum, mc) => sum + mc.missingInOffers.length,
    0
  );

  return {
    projectId: project.id,
    projectName: project.name,
    offerIds: offers.map(o => o.id),
    componentDifferences,
    missingComponents,
    allowanceProfiles,
    unclearBuckets,
    normalizedViews,
    totalComponentsCompared: masterComponents.filter(c => c.isLeaf).length,
    largeDiscrepanciesCount,
    missingComponentsCount,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Analyseer prijsverschillen per mastercomponent tussen offertes
 */
function analyzeComponentDifferences(
  offers: Offer[],
  contractors: Map<string, Contractor>,
  offerLinesMap: Map<string, OfferLine[]>,
  lineMappingsMap: Map<string, LineMapping[]>,
  masterComponents: MasterComponent[],
  largeDiscrepancyThreshold: number = 20 // percentage
): ComponentDifference[] {
  const differences: ComponentDifference[] = [];

  // Aggregeer per offerte
  const aggregationsByOffer = new Map(
    offers.map(offer => {
      const offerLines = offerLinesMap.get(offer.id) || [];
      const lineMappings = lineMappingsMap.get(offer.id) || [];

      const aggregations = aggregateByMasterComponent(
        masterComponents,
        offerLines,
        lineMappings,
        offer.id
      );

      return [offer.id, new Map(aggregations.map(a => [a.masterComponentId, a]))];
    })
  );

  // Analyseer elk leaf component
  const leafComponents = masterComponents.filter(c => c.isLeaf);

  for (const component of leafComponents) {
    const deltaPerOffer: Record<string, number> = {};
    const prices: number[] = [];

    for (const offer of offers) {
      const aggregations = aggregationsByOffer.get(offer.id);
      const agg = aggregations?.get(component.id);

      const totalIncl = agg
        ? agg.totalVastIncl + agg.totalStelpostIncl + agg.totalIndicatieIncl
        : 0;

      deltaPerOffer[offer.id] = round(totalIncl);
      if (totalIncl > 0) {
        prices.push(totalIncl);
      }
    }

    // Skip als er minder dan 2 offertes zijn met prijzen
    if (prices.length < 2) {
      continue;
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const deltaAmount = maxPrice - minPrice;
    const deltaPercentage = minPrice > 0 ? (deltaAmount / minPrice) * 100 : 0;
    const isLargeDelta = deltaPercentage > largeDiscrepancyThreshold;

    // Probeer reden te bepalen
    const reasonHint = determineReasonHint(
      component,
      offers,
      aggregationsByOffer
    );

    differences.push({
      masterComponentId: component.id,
      masterComponentCode: component.code,
      masterComponentName: component.name,
      deltaPerOffer,
      minPrice: round(minPrice),
      maxPrice: round(maxPrice),
      deltaAmount: round(deltaAmount),
      deltaPercentage: round(deltaPercentage),
      isLargeDelta,
      reasonHint,
    });
  }

  // Sort by delta percentage descending
  differences.sort((a, b) => b.deltaPercentage - a.deltaPercentage);

  return differences;
}

/**
 * Probeer een hint te bepalen waarom er een verschil is
 */
function determineReasonHint(
  component: MasterComponent,
  offers: Offer[],
  aggregationsByOffer: Map<string, Map<string, any>>
): string | undefined {
  const coverageTypes = new Set<string>();

  for (const offer of offers) {
    const aggregations = aggregationsByOffer.get(offer.id);
    const agg = aggregations?.get(component.id);

    if (agg) {
      coverageTypes.add(agg.coverageStatus);
    }
  }

  if (coverageTypes.size > 1) {
    const types = Array.from(coverageTypes).join(', ');
    return `Verschillende coverage types: ${types}`;
  }

  return undefined;
}

/**
 * Vind componenten die in sommige offertes ontbreken
 */
function findMissingComponents(
  offers: Offer[],
  contractors: Map<string, Contractor>,
  lineMappingsMap: Map<string, LineMapping[]>,
  masterComponents: MasterComponent[]
): MissingComponentInfo[] {
  const missing: MissingComponentInfo[] = [];
  const leafComponents = masterComponents.filter(c => c.isLeaf);

  for (const component of leafComponents) {
    const missingInOffers: { offerId: string; contractorName: string }[] = [];

    for (const offer of offers) {
      const lineMappings = lineMappingsMap.get(offer.id) || [];
      const hasMappings = lineMappings.some(
        m =>
          m.masterComponentId === component.id &&
          m.coverageStatus !== 'NIET_OPGENOMEN' &&
          m.coverageStatus !== 'BUITEN_SCOPE'
      );

      if (!hasMappings) {
        const contractor = contractors.get(offer.contractorId);
        if (contractor) {
          missingInOffers.push({
            offerId: offer.id,
            contractorName: contractor.name,
          });
        }
      }
    }

    if (missingInOffers.length > 0) {
      missing.push({
        masterComponentId: component.id,
        masterComponentCode: component.code,
        masterComponentName: component.name,
        missingInOffers,
      });
    }
  }

  return missing;
}

/**
 * Verzamel onduidelijke/niet-gemapte posten per offerte
 */
function collectUnclearBuckets(
  offers: Offer[],
  contractors: Map<string, Contractor>,
  offerLinesMap: Map<string, OfferLine[]>,
  lineMappingsMap: Map<string, LineMapping[]>
): UnclearBucket[] {
  const buckets: UnclearBucket[] = [];

  for (const offer of offers) {
    const contractor = contractors.get(offer.contractorId);
    if (!contractor) continue;

    const offerLines = offerLinesMap.get(offer.id) || [];
    const lineMappings = lineMappingsMap.get(offer.id) || [];

    const mappedLineIds = new Set(lineMappings.map(m => m.offerLineId));
    const unclearLines = offerLines.filter(line => !mappedLineIds.has(line.id));

    const unclearTotal = unclearLines.reduce(
      (sum, line) => sum + (line.totalPriceIncl ?? 0),
      0
    );

    const offerTotal = offer.sourceTotalIncl ?? 0;
    const unclearPercentage = offerTotal > 0 ? (unclearTotal / offerTotal) * 100 : 0;

    if (unclearLines.length > 0) {
      buckets.push({
        offerId: offer.id,
        contractorName: contractor.name,
        unclearTotal: round(unclearTotal),
        unclearPercentage: round(unclearPercentage),
        lines: unclearLines.map(line => ({
          id: line.id,
          description: line.description,
          amount: line.totalPriceIncl ?? 0,
          // suggestedComponents kan later door AI worden ingevuld
        })),
      });
    }
  }

  return buckets;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
