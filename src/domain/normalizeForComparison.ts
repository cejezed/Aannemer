/**
 * Domain service voor normalisatie van offertes
 * Houdt rekening met verschillende overhead modellen voor eerlijke vergelijking
 */

import type {
  Offer,
  OfferLine,
  LineMapping,
  MasterComponent,
  Contractor,
  NormalizedOfferView,
} from './types';

/**
 * Normaliseer een offerte voor vergelijking
 * Scheidt directe kosten van overhead
 */
export function normalizeOffer(
  offer: Offer,
  contractor: Contractor,
  offerLines: OfferLine[],
  lineMappings: LineMapping[],
  masterComponents: MasterComponent[],
  defaultOverheadPercentages?: {
    ak: number; // Algemene Kosten
    wr: number; // Winst & Risico
  }
): NormalizedOfferView {
  const warnings: string[] = [];

  // Detecteer overhead regels in de offerte
  const overheadInfo = detectOverheadLines(offerLines);

  let componentDirectCosts: Record<string, number> = {};
  let totalDirectCosts = 0;
  let totalOverheadAmount = 0;
  let akPercentage: number | undefined;
  let wrPercentage: number | undefined;
  let isEstimated = false;

  if (offer.pricingModel === 'EXCL_OPSLAGEN') {
    // Expliciete overhead regels aanwezig
    const result = extractExplicitOverhead(
      offerLines,
      lineMappings,
      masterComponents,
      overheadInfo
    );

    componentDirectCosts = result.componentDirectCosts;
    totalDirectCosts = result.totalDirectCosts;
    totalOverheadAmount = result.totalOverheadAmount;
    akPercentage = result.akPercentage;
    wrPercentage = result.wrPercentage;

    warnings.push(
      `Overhead expliciet: AK ${akPercentage?.toFixed(1)}%, W&R ${wrPercentage?.toFixed(1)}%`
    );
  } else if (offer.pricingModel === 'INCL_OPSLAGEN') {
    // Overhead zit in de posten verwerkt - schat met default percentages
    const defaults = defaultOverheadPercentages || { ak: 12, wr: 5 };

    const result = estimateOverhead(
      offerLines,
      lineMappings,
      masterComponents,
      defaults.ak,
      defaults.wr
    );

    componentDirectCosts = result.componentDirectCosts;
    totalDirectCosts = result.totalDirectCosts;
    totalOverheadAmount = result.totalOverheadAmount;
    akPercentage = defaults.ak;
    wrPercentage = defaults.wr;
    isEstimated = true;

    warnings.push(
      `Overhead geschat op ${defaults.ak}% AK + ${defaults.wr}% W&R (totaal ${defaults.ak + defaults.wr}%)`
    );
  } else {
    // MIXED or ONBEKEND - probeer te detecteren
    warnings.push('Overhead model is onduidelijk - geen normalisatie toegepast');

    // Gebruik gewoon de totalen zoals ze zijn
    const mapped = mapLinesToComponents(offerLines, lineMappings, masterComponents);
    componentDirectCosts = mapped;
    totalDirectCosts = Object.values(mapped).reduce((sum, val) => sum + val, 0);
    totalOverheadAmount = 0;
  }

  const totalWithOverhead = totalDirectCosts + totalOverheadAmount;

  return {
    offerId: offer.id,
    contractorName: contractor.name,
    pricingModel: offer.pricingModel,
    componentDirectCosts,
    overheadModel: {
      akPercentage,
      wrPercentage,
      totalOverheadAmount: round(totalOverheadAmount),
      isEstimated,
    },
    totalDirectCosts: round(totalDirectCosts),
    totalWithOverhead: round(totalWithOverhead),
    warnings,
  };
}

/**
 * Detecteer overhead-gerelateerde regels in een offerte
 */
function detectOverheadLines(offerLines: OfferLine[]): {
  akLines: OfferLine[];
  wrLines: OfferLine[];
  akPercentage?: number;
  wrPercentage?: number;
} {
  const akKeywords = ['algemene kosten', 'ak', 'overhead', 'algemeen'];
  const wrKeywords = ['winst', 'risico', 'w&r', 'w & r'];

  const akLines: OfferLine[] = [];
  const wrLines: OfferLine[] = [];

  for (const line of offerLines) {
    const desc = line.description.toLowerCase();

    if (akKeywords.some(kw => desc.includes(kw))) {
      akLines.push(line);
    } else if (wrKeywords.some(kw => desc.includes(kw))) {
      wrLines.push(line);
    }
  }

  // Probeer percentages te extraheren uit beschrijvingen
  const akPercentage = extractPercentageFromLines(akLines);
  const wrPercentage = extractPercentageFromLines(wrLines);

  return { akLines, wrLines, akPercentage, wrPercentage };
}

/**
 * Extraheer percentage uit lijn beschrijvingen
 * Bijv. "Algemene kosten 12%" -> 12
 */
function extractPercentageFromLines(lines: OfferLine[]): number | undefined {
  for (const line of lines) {
    const match = line.description.match(/(\d+(?:\.\d+)?)\s*%/);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  return undefined;
}

/**
 * Extraheer expliciete overhead uit offerte met EXCL_OPSLAGEN model
 */
function extractExplicitOverhead(
  offerLines: OfferLine[],
  lineMappings: LineMapping[],
  masterComponents: MasterComponent[],
  overheadInfo: ReturnType<typeof detectOverheadLines>
): {
  componentDirectCosts: Record<string, number>;
  totalDirectCosts: number;
  totalOverheadAmount: number;
  akPercentage?: number;
  wrPercentage?: number;
} {
  // Filter overhead lines uit
  const overheadLineIds = new Set([
    ...overheadInfo.akLines.map(l => l.id),
    ...overheadInfo.wrLines.map(l => l.id),
  ]);

  const directLines = offerLines.filter(line => !overheadLineIds.has(line.id));

  // Map direct lines to components
  const componentDirectCosts = mapLinesToComponents(
    directLines,
    lineMappings,
    masterComponents
  );

  const totalDirectCosts = Object.values(componentDirectCosts).reduce(
    (sum, val) => sum + val,
    0
  );

  // Bereken overhead totaal
  const akTotal = overheadInfo.akLines.reduce(
    (sum, line) => sum + (line.priceIncl ?? 0),
    0
  );
  const wrTotal = overheadInfo.wrLines.reduce(
    (sum, line) => sum + (line.priceIncl ?? 0),
    0
  );

  const totalOverheadAmount = akTotal + wrTotal;

  // Bereken actuele percentages
  let akPercentage = overheadInfo.akPercentage;
  let wrPercentage = overheadInfo.wrPercentage;

  if (!akPercentage && totalDirectCosts > 0) {
    akPercentage = (akTotal / totalDirectCosts) * 100;
  }
  if (!wrPercentage && totalDirectCosts > 0) {
    wrPercentage = (wrTotal / totalDirectCosts) * 100;
  }

  return {
    componentDirectCosts,
    totalDirectCosts: round(totalDirectCosts),
    totalOverheadAmount: round(totalOverheadAmount),
    akPercentage: akPercentage ? round(akPercentage) : undefined,
    wrPercentage: wrPercentage ? round(wrPercentage) : undefined,
  };
}

/**
 * Schat overhead voor offerte met INCL_OPSLAGEN model
 */
function estimateOverhead(
  offerLines: OfferLine[],
  lineMappings: LineMapping[],
  masterComponents: MasterComponent[],
  akPercentage: number,
  wrPercentage: number
): {
  componentDirectCosts: Record<string, number>;
  totalDirectCosts: number;
  totalOverheadAmount: number;
} {
  const componentCosts = mapLinesToComponents(
    offerLines,
    lineMappings,
    masterComponents
  );

  const totalOverheadPercentage = akPercentage + wrPercentage;
  const divisor = 1 + totalOverheadPercentage / 100;

  // Schat directe kosten door overhead eruit te halen
  const componentDirectCosts: Record<string, number> = {};
  let totalDirectCosts = 0;

  for (const [componentId, totalCost] of Object.entries(componentCosts)) {
    const directCost = totalCost / divisor;
    componentDirectCosts[componentId] = round(directCost);
    totalDirectCosts += directCost;
  }

  const totalOverheadAmount = Object.values(componentCosts).reduce(
    (sum, val) => sum + val,
    0
  ) - totalDirectCosts;

  return {
    componentDirectCosts,
    totalDirectCosts: round(totalDirectCosts),
    totalOverheadAmount: round(totalOverheadAmount),
  };
}

/**
 * Map offerteregels naar mastercomponenten en som per component
 */
function mapLinesToComponents(
  offerLines: OfferLine[],
  lineMappings: LineMapping[],
  masterComponents: MasterComponent[]
): Record<string, number> {
  const lineMap = new Map(offerLines.map(line => [line.id, line]));
  const componentCosts: Record<string, number> = {};

  // Initialiseer alle leaf components met 0
  for (const component of masterComponents) {
    if (component.isLeaf) {
      componentCosts[component.id] = 0;
    }
  }

  // Som regels per component
  for (const mapping of lineMappings) {
    const line = lineMap.get(mapping.offerLineId);
    if (line && line.priceIncl !== undefined) {
      const current = componentCosts[mapping.masterComponentId] || 0;
      componentCosts[mapping.masterComponentId] = current + line.priceIncl;
    }
  }

  return componentCosts;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
