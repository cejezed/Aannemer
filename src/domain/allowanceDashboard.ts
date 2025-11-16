/**
 * Domain service voor stelpost (allowance) analyses
 * Genereert stelpost dashboard data
 */

import type {
  OfferLine,
  LineMapping,
  MasterComponent,
  Offer,
  Contractor,
  AllowanceDetail,
  AllowanceProfile,
} from './types';

/**
 * Genereer stelpost profiel voor één offerte
 */
export function generateAllowanceProfile(
  offer: Offer,
  contractor: Contractor,
  offerLines: OfferLine[],
  lineMappings: LineMapping[],
  masterComponents: MasterComponent[],
  bigAllowanceThreshold: number = 5000 // in EUR
): AllowanceProfile {
  const stelpostLines = offerLines.filter(line => line.priceType === 'STELPOST');

  // Map lines to master components
  const componentMap = new Map(masterComponents.map(c => [c.id, c]));
  const mappingMap = new Map(lineMappings.map(m => [m.offerLineId, m]));

  // Groepeer stelpost regels per mastercomponent
  const stelpostByComponent = new Map<string, OfferLine[]>();

  for (const line of stelpostLines) {
    const mapping = mappingMap.get(line.id);
    if (mapping) {
      const componentId = mapping.masterComponentId;
      const lines = stelpostByComponent.get(componentId) || [];
      lines.push(line);
      stelpostByComponent.set(componentId, lines);
    }
  }

  // Bereken totaal stelpost bedrag
  const totalAllowance = stelpostLines.reduce(
    (sum, line) => sum + (line.priceIncl ?? 0),
    0
  );

  // Bereken percentage van totale offerte
  const offerTotal = offer.sourceTotalIncl ?? 0;
  const allowancePercentage = offerTotal > 0 ? (totalAllowance / offerTotal) * 100 : 0;

  // Genereer allowance details per component
  const allAllowances: AllowanceDetail[] = [];

  for (const [componentId, lines] of stelpostByComponent.entries()) {
    const component = componentMap.get(componentId);
    if (!component) continue;

    const amount = lines.reduce((sum, line) => sum + (line.priceIncl ?? 0), 0);
    const percentage = offerTotal > 0 ? (amount / offerTotal) * 100 : 0;

    const detail: AllowanceDetail = {
      offerId: offer.id,
      masterComponentId: componentId,
      masterComponentName: component.name,
      masterComponentCode: component.code,
      amount: round(amount),
      percentage: round(percentage),
      lines: lines.map(line => ({
        id: line.id,
        description: line.description,
        amount: line.priceIncl ?? 0,
      })),
    };

    allAllowances.push(detail);
  }

  // Sort by amount descending
  allAllowances.sort((a, b) => b.amount - a.amount);

  // Filter big allowances
  const bigAllowances = allAllowances.filter(a => a.amount >= bigAllowanceThreshold);

  return {
    offerId: offer.id,
    contractorName: contractor.name,
    totalAllowance: round(totalAllowance),
    allowancePercentage: round(allowancePercentage),
    bigAllowances,
    allAllowances,
  };
}

/**
 * Genereer stelpost profielen voor meerdere offertes
 */
export function generateAllowanceProfiles(
  offers: Offer[],
  contractors: Map<string, Contractor>,
  offerLinesMap: Map<string, OfferLine[]>,
  lineMappingsMap: Map<string, LineMapping[]>,
  masterComponents: MasterComponent[],
  bigAllowanceThreshold: number = 5000
): AllowanceProfile[] {
  const profiles: AllowanceProfile[] = [];

  for (const offer of offers) {
    const contractor = contractors.get(offer.contractorId);
    const offerLines = offerLinesMap.get(offer.id) || [];
    const lineMappings = lineMappingsMap.get(offer.id) || [];

    if (!contractor) continue;

    const profile = generateAllowanceProfile(
      offer,
      contractor,
      offerLines,
      lineMappings,
      masterComponents,
      bigAllowanceThreshold
    );

    profiles.push(profile);
  }

  return profiles;
}

/**
 * Vind alle stelposten die niet gemapt zijn
 */
export function findUnmappedAllowances(
  offerLines: OfferLine[],
  lineMappings: LineMapping[]
): OfferLine[] {
  const mappedLineIds = new Set(lineMappings.map(m => m.offerLineId));

  return offerLines.filter(
    line => line.priceType === 'STELPOST' && !mappedLineIds.has(line.id)
  );
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
