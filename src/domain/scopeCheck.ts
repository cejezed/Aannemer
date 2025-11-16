/**
 * Domain service voor scope-checking
 * Vergelijkt TechSpec-vereisten met werkelijke offertes (hoofd + subcontractors)
 */

import type {
  Offer,
  OfferRevision,
  MasterComponent,
  TechSpec,
  TechSpecSection,
  TechSpecMapping,
  OfferLine,
  SubcontractOfferLine,
  LineMapping,
  SubcontractLineMapping,
  OfferScopeReport,
  ComponentScopeCoverage,
  ComponentScopeStatus,
  MissingCostItem,
  UnscopedCostItem,
  SuspiciousCoverageItem,
} from './types';

export interface ScopeCheckArgs {
  offer: Offer;
  revision?: OfferRevision;
  masterComponents: MasterComponent[];
  techSpec: TechSpec;
  techSpecSections: TechSpecSection[];
  techSpecMappings: TechSpecMapping[];
  offerLines: OfferLine[];
  subcontractOfferLines: SubcontractOfferLine[];
  lineMappings: LineMapping[];
  subcontractLineMappings: SubcontractLineMapping[];
}

/**
 * Controleer compleetheid van een offerte tegen de TechSpec
 */
export function checkOfferCompletenessAgainstTechSpec(
  args: ScopeCheckArgs
): OfferScopeReport {
  const {
    offer,
    revision,
    masterComponents,
    techSpec,
    techSpecSections,
    techSpecMappings,
    offerLines,
    subcontractOfferLines,
    lineMappings,
    subcontractLineMappings,
  } = args;

  // Maps voor snelle lookup
  const componentMap = new Map(masterComponents.map(c => [c.id, c]));
  const sectionMap = new Map(techSpecSections.map(s => [s.id, s]));

  // Groepeer TechSpec secties per masterComponent
  const sectionsByComponent = new Map<string, TechSpecSection[]>();
  for (const mapping of techSpecMappings) {
    const section = sectionMap.get(mapping.sectionId);
    if (!section) continue;

    const sections = sectionsByComponent.get(mapping.masterComponentId) || [];
    sections.push(section);
    sectionsByComponent.set(mapping.masterComponentId, sections);
  }

  // Groepeer offer lines per masterComponent
  const mainOfferLinesByComponent = new Map<string, OfferLine[]>();
  for (const mapping of lineMappings) {
    const line = offerLines.find(l => l.id === mapping.offerLineId);
    if (!line) continue;

    const lines = mainOfferLinesByComponent.get(mapping.masterComponentId) || [];
    lines.push(line);
    mainOfferLinesByComponent.set(mapping.masterComponentId, lines);
  }

  // Groepeer subcontract lines per masterComponent
  const subcontractLinesByComponent = new Map<string, SubcontractOfferLine[]>();
  for (const mapping of subcontractLineMappings) {
    const line = subcontractOfferLines.find(l => l.id === mapping.subcontractOfferLineId);
    if (!line) continue;

    const lines = subcontractLinesByComponent.get(mapping.masterComponentId) || [];
    lines.push(line);
    subcontractLinesByComponent.set(mapping.masterComponentId, lines);
  }

  // Genereer scope coverage per component
  const components: ComponentScopeCoverage[] = [];
  const missingCostItems: MissingCostItem[] = [];
  const unscopedCostItems: UnscopedCostItem[] = [];
  const suspiciousCoverageItems: SuspiciousCoverageItem[] = [];

  let fullyCoveredCount = 0;
  let textOnlyCount = 0;
  let amountOnlyCount = 0;
  let unknownCount = 0;

  // Verzamel alle componenten die ofwel in TechSpec staan ofwel budget hebben
  const relevantComponentIds = new Set([
    ...sectionsByComponent.keys(),
    ...mainOfferLinesByComponent.keys(),
    ...subcontractLinesByComponent.keys(),
  ]);

  for (const componentId of relevantComponentIds) {
    const component = componentMap.get(componentId);
    if (!component) continue;

    const sections = sectionsByComponent.get(componentId) || [];
    const mainLines = mainOfferLinesByComponent.get(componentId) || [];
    const subLines = subcontractLinesByComponent.get(componentId) || [];

    // Bereken bedragen
    const fromMainOfferAmountIncl = mainLines.reduce(
      (sum, line) => sum + (line.totalPriceIncl ?? 0),
      0
    );
    const fromSubcontractorsAmountIncl = subLines.reduce(
      (sum, line) => sum + (line.priceIncl ?? 0),
      0
    );
    const totalAmountIncl = fromMainOfferAmountIncl + fromSubcontractorsAmountIncl;

    // Bepaal scope status
    const hasTechSpec = sections.length > 0;
    const hasBudget = totalAmountIncl > 0;

    let scopeStatus: ComponentScopeStatus;
    if (hasTechSpec && hasBudget) {
      scopeStatus = 'VOLLEDIG_GEDEKT';
      fullyCoveredCount++;
    } else if (hasTechSpec && !hasBudget) {
      scopeStatus = 'ALLEEN_TEKST_GEEN_BEDRAG';
      textOnlyCount++;

      // Voeg toe aan missing cost items
      for (const section of sections) {
        missingCostItems.push({
          masterComponentId: componentId,
          masterComponentCode: component.code,
          masterComponentName: component.name,
          sectionId: section.id,
          title: section.title,
          headingNumber: section.headingNumber,
        });
      }
    } else if (!hasTechSpec && hasBudget) {
      scopeStatus = 'ALLEEN_BEDRAG_GEEN_TEKST';
      amountOnlyCount++;

      unscopedCostItems.push({
        masterComponentId: componentId,
        masterComponentCode: component.code,
        masterComponentName: component.name,
        totalAmountIncl,
      });
    } else {
      scopeStatus = 'ONBEKEND';
      unknownCount++;
    }

    // Check voor verdachte dekking
    if (hasTechSpec && hasBudget) {
      const suspicious = detectSuspiciousCoverage(
        component,
        sections,
        mainLines,
        subLines,
        fromMainOfferAmountIncl,
        fromSubcontractorsAmountIncl
      );

      if (suspicious) {
        suspiciousCoverageItems.push(suspicious);
      }
    }

    components.push({
      masterComponentId: componentId,
      masterComponentCode: component.code,
      masterComponentName: component.name,
      scopeStatus,
      totalAmountIncl: round(totalAmountIncl),
      fromMainOfferAmountIncl: round(fromMainOfferAmountIncl),
      fromSubcontractorsAmountIncl: round(fromSubcontractorsAmountIncl),
      requirementSections: sections,
    });
  }

  // Sort components by code
  components.sort((a, b) => a.masterComponentCode.localeCompare(b.masterComponentCode));

  return {
    offerId: offer.id,
    offerTitle: offer.title,
    revisionId: revision?.id,
    techSpecId: techSpec.id,
    techSpecTitle: techSpec.title,
    components,
    missingCostItems,
    unscopedCostItems,
    suspiciousCoverageItems,
    stats: {
      fullyCoveredCount,
      textOnlyCount,
      amountOnlyCount,
      unknownCount,
    },
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Detecteer verdachte dekking
 */
function detectSuspiciousCoverage(
  component: MasterComponent,
  sections: TechSpecSection[],
  mainLines: OfferLine[],
  subLines: SubcontractOfferLine[],
  mainOfferAmount: number,
  subcontractAmount: number
): SuspiciousCoverageItem | null {
  const hasMainOffer = mainOfferAmount > 0;
  const hasSubcontract = subcontractAmount > 0;

  // Geen dekking = niet verdacht (wordt elders afgehandeld)
  if (!hasMainOffer && !hasSubcontract) {
    return null;
  }

  let confidence = 1.0;
  let reason: string | undefined;

  // Case 1: Alleen subcontractor, geen hoofd-offerte
  if (!hasMainOffer && hasSubcontract) {
    confidence = 0.6;
    reason = 'Alleen via subcontractors gedekt - niet in hoofd-offerte';
  }

  // Case 2: Alleen stelposten in hoofd-offerte
  if (hasMainOffer) {
    const allStelpost = mainLines.every(line => line.priceType === 'STELPOST');
    if (allStelpost && mainLines.length > 0) {
      confidence = Math.min(confidence, 0.3);
      reason = reason
        ? `${reason}; Alleen stelposten in hoofd-offerte`
        : 'Alleen stelposten - geen vaste prijzen';
    }
  }

  // Case 3: Mix van stelpost + subcontractor zonder vaste prijs
  if (hasMainOffer && hasSubcontract) {
    const onlyIndicativeInMain = mainLines.every(
      line => line.priceType === 'STELPOST' || line.priceType === 'INDICATIE'
    );
    if (onlyIndicativeInMain && mainLines.length > 0) {
      confidence = 0.5;
      reason = 'Alleen indicatieve prijzen in hoofd-offerte, vaste prijs bij subcontractor';
    }
  }

  // Als confidence hoog genoeg is, niet markeren als verdacht
  if (confidence >= 0.8) {
    return null;
  }

  // Neem eerste sectie voor metadata
  const firstSection = sections[0];
  if (!firstSection) return null;

  return {
    sectionId: firstSection.id,
    sectionTitle: firstSection.title,
    headingNumber: firstSection.headingNumber,
    masterComponentId: component.id,
    masterComponentCode: component.code,
    masterComponentName: component.name,
    hasMainOfferCoverage: hasMainOffer,
    hasSubcontractCoverage: hasSubcontract,
    mainOfferAmountIncl: round(mainOfferAmount),
    subcontractAmountIncl: round(subcontractAmount),
    coverageConfidence: confidence,
    reason,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
