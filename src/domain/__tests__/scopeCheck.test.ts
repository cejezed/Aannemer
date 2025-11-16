/**
 * Tests voor scope checking functionality
 */

import { describe, it, expect } from 'vitest';
import { checkOfferCompletenessAgainstTechSpec } from '../scopeCheck';
import type {
  Offer,
  MasterComponent,
  TechSpec,
  TechSpecSection,
  TechSpecMapping,
  OfferLine,
  SubcontractOfferLine,
  LineMapping,
  SubcontractLineMapping,
} from '../types';

describe('scopeCheck', () => {
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

  // Mock TechSpec
  const techSpec: TechSpec = {
    id: 'ts-1',
    projectId: 'proj-1',
    title: 'Technische omschrijving Jagersveld',
    version: 'Definitief 2025-01-10',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
  };

  // Mock TechSpec Sections
  const techSpecSections: TechSpecSection[] = [
    {
      id: 'sec-10',
      techSpecId: 'ts-1',
      headingNumber: '3',
      title: 'Grondwerk',
      body: 'Uitgraven bouwput, aanvullen en verdichten, afvoeren vrijkomende grond...',
    },
    {
      id: 'sec-21',
      techSpecId: 'ts-1',
      headingNumber: '5.4',
      title: 'Kelderconstructie',
      body: 'Waterdichte keldervloer en wanden, beton C30/37, wapening volgens tekening...',
    },
  ];

  // Mock TechSpec Mappings
  const techSpecMappings: TechSpecMapping[] = [
    {
      id: 'tsm-10',
      sectionId: 'sec-10',
      masterComponentId: 'mc-10',
      requirementType: 'KOSTEN',
    },
    {
      id: 'tsm-21',
      sectionId: 'sec-21',
      masterComponentId: 'mc-21',
      requirementType: 'KOSTEN',
    },
  ];

  // Mock Offer
  const offer: Offer = {
    id: 'off-1',
    projectId: 'proj-1',
    contractorId: 'ctr-1',
    title: 'Aannemersofferte Goorhuis',
    pricingModel: 'EXCL_OPSLAGEN',
    sourceTotalIncl: 525000,
    currency: 'EUR',
    isWinningOffer: true,
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  };

  it('should detect VOLLEDIG_GEDEKT when both TechSpec and budget exist', () => {
    const offerLines: OfferLine[] = [
      {
        id: 'ol-1',
        offerId: 'off-1',
        rawText: 'Grondwerk bouwput inclusief afvoer',
        description: 'Grondwerk bouwput',
        priceType: 'VAST',
        priceIncl: 18000,
      },
    ];

    const lineMappings: LineMapping[] = [
      {
        id: 'lm-1',
        offerLineId: 'ol-1',
        masterComponentId: 'mc-10',
        coverageStatus: 'INCLUSIEF',
      },
    ];

    const report = checkOfferCompletenessAgainstTechSpec({
      offer,
      masterComponents,
      techSpec,
      techSpecSections,
      techSpecMappings,
      offerLines,
      subcontractOfferLines: [],
      lineMappings,
      subcontractLineMappings: [],
    });

    expect(report.stats.fullyCoveredCount).toBe(1);
    expect(report.stats.textOnlyCount).toBe(1); // Kelder heeft wel tekst maar geen budget
    expect(report.components).toHaveLength(2);

    const grondwerk = report.components.find(c => c.masterComponentId === 'mc-10');
    expect(grondwerk?.scopeStatus).toBe('VOLLEDIG_GEDEKT');
    expect(grondwerk?.totalAmountIncl).toBe(18000);
  });

  it('should detect ALLEEN_TEKST_GEEN_BEDRAG when TechSpec exists but no budget', () => {
    const report = checkOfferCompletenessAgainstTechSpec({
      offer,
      masterComponents,
      techSpec,
      techSpecSections,
      techSpecMappings,
      offerLines: [],
      subcontractOfferLines: [],
      lineMappings: [],
      subcontractLineMappings: [],
    });

    expect(report.stats.textOnlyCount).toBe(2); // Both Grondwerk and Kelder
    expect(report.missingCostItems).toHaveLength(2);

    const missingGrondwerk = report.missingCostItems.find(
      item => item.masterComponentId === 'mc-10'
    );
    expect(missingGrondwerk?.title).toBe('Grondwerk');
    expect(missingGrondwerk?.headingNumber).toBe('3');
  });

  it('should detect ALLEEN_BEDRAG_GEEN_TEKST when budget exists but no TechSpec', () => {
    const offerLines: OfferLine[] = [
      {
        id: 'ol-1',
        offerId: 'off-1',
        rawText: 'Dakgoten compleet',
        description: 'Dakgoten',
        priceType: 'VAST',
        priceIncl: 5400,
      },
    ];

    const lineMappings: LineMapping[] = [
      {
        id: 'lm-1',
        offerLineId: 'ol-1',
        masterComponentId: 'mc-24', // Dakgoten - niet in TechSpec
        coverageStatus: 'INCLUSIEF',
      },
    ];

    const report = checkOfferCompletenessAgainstTechSpec({
      offer,
      masterComponents,
      techSpec,
      techSpecSections,
      techSpecMappings,
      offerLines,
      subcontractOfferLines: [],
      lineMappings,
      subcontractLineMappings: [],
    });

    expect(report.stats.amountOnlyCount).toBe(1);
    expect(report.unscopedCostItems).toHaveLength(1);
    expect(report.unscopedCostItems[0].masterComponentId).toBe('mc-24');
    expect(report.unscopedCostItems[0].totalAmountIncl).toBe(5400);
  });

  it('should combine main offer and subcontractor amounts', () => {
    const offerLines: OfferLine[] = [
      {
        id: 'ol-1',
        offerId: 'off-1',
        rawText: 'Kelder indicatieve post',
        description: 'Kelder stelpost',
        priceType: 'STELPOST',
        priceIncl: 45000,
      },
    ];

    const lineMappings: LineMapping[] = [
      {
        id: 'lm-1',
        offerLineId: 'ol-1',
        masterComponentId: 'mc-21',
        coverageStatus: 'STELPOST',
      },
    ];

    const subcontractOfferLines: SubcontractOfferLine[] = [
      {
        id: 'sol-1',
        subcontractOfferId: 'suboff-1',
        rawText: 'Complete kelder inclusief beton, wapening en bekisting',
        description: 'Complete kelder',
        priceType: 'VAST',
        priceIncl: 52000,
      },
    ];

    const subcontractLineMappings: SubcontractLineMapping[] = [
      {
        id: 'slm-1',
        subcontractOfferLineId: 'sol-1',
        masterComponentId: 'mc-21',
        coverageStatus: 'INCLUSIEF',
      },
    ];

    const report = checkOfferCompletenessAgainstTechSpec({
      offer,
      masterComponents,
      techSpec,
      techSpecSections,
      techSpecMappings,
      offerLines,
      subcontractOfferLines,
      lineMappings,
      subcontractLineMappings,
    });

    const kelder = report.components.find(c => c.masterComponentId === 'mc-21');
    expect(kelder?.scopeStatus).toBe('VOLLEDIG_GEDEKT');
    expect(kelder?.fromMainOfferAmountIncl).toBe(45000);
    expect(kelder?.fromSubcontractorsAmountIncl).toBe(52000);
    expect(kelder?.totalAmountIncl).toBe(97000);
  });

  it('should detect suspicious coverage when only stelpost in main offer', () => {
    const offerLines: OfferLine[] = [
      {
        id: 'ol-1',
        offerId: 'off-1',
        rawText: 'Kelder stelpost',
        description: 'Kelder stelpost',
        priceType: 'STELPOST',
        priceIncl: 45000,
      },
    ];

    const lineMappings: LineMapping[] = [
      {
        id: 'lm-1',
        offerLineId: 'ol-1',
        masterComponentId: 'mc-21',
        coverageStatus: 'STELPOST',
      },
    ];

    const report = checkOfferCompletenessAgainstTechSpec({
      offer,
      masterComponents,
      techSpec,
      techSpecSections,
      techSpecMappings,
      offerLines,
      subcontractOfferLines: [],
      lineMappings,
      subcontractLineMappings: [],
    });

    expect(report.suspiciousCoverageItems).toHaveLength(1);
    const suspicious = report.suspiciousCoverageItems[0];
    expect(suspicious.masterComponentId).toBe('mc-21');
    expect(suspicious.coverageConfidence).toBe(0.3); // Low confidence
    expect(suspicious.reason).toContain('stelpost');
  });

  it('should detect suspicious coverage when only subcontractor coverage', () => {
    const subcontractOfferLines: SubcontractOfferLine[] = [
      {
        id: 'sol-1',
        subcontractOfferId: 'suboff-1',
        rawText: 'Grondwerk compleet',
        description: 'Grondwerk',
        priceType: 'VAST',
        priceIncl: 18000,
      },
    ];

    const subcontractLineMappings: SubcontractLineMapping[] = [
      {
        id: 'slm-1',
        subcontractOfferLineId: 'sol-1',
        masterComponentId: 'mc-10',
        coverageStatus: 'INCLUSIEF',
      },
    ];

    const report = checkOfferCompletenessAgainstTechSpec({
      offer,
      masterComponents,
      techSpec,
      techSpecSections,
      techSpecMappings,
      offerLines: [],
      subcontractOfferLines,
      lineMappings: [],
      subcontractLineMappings,
    });

    expect(report.suspiciousCoverageItems).toHaveLength(1);
    const suspicious = report.suspiciousCoverageItems[0];
    expect(suspicious.masterComponentId).toBe('mc-10');
    expect(suspicious.hasMainOfferCoverage).toBe(false);
    expect(suspicious.hasSubcontractCoverage).toBe(true);
    expect(suspicious.coverageConfidence).toBe(0.6);
    expect(suspicious.reason).toContain('subcontractor');
  });

  it('should include TechSpec sections in component coverage', () => {
    const offerLines: OfferLine[] = [
      {
        id: 'ol-1',
        offerId: 'off-1',
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
        masterComponentId: 'mc-10',
        coverageStatus: 'INCLUSIEF',
      },
    ];

    const report = checkOfferCompletenessAgainstTechSpec({
      offer,
      masterComponents,
      techSpec,
      techSpecSections,
      techSpecMappings,
      offerLines,
      subcontractOfferLines: [],
      lineMappings,
      subcontractLineMappings: [],
    });

    const grondwerk = report.components.find(c => c.masterComponentId === 'mc-10');
    expect(grondwerk?.requirementSections).toHaveLength(1);
    expect(grondwerk?.requirementSections[0].title).toBe('Grondwerk');
    expect(grondwerk?.requirementSections[0].headingNumber).toBe('3');
  });
});
