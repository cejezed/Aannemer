/**
 * Mock TechSpec data
 * Technische omschrijving met secties en mappings naar mastercomponenten
 */

import type {
  TechSpec,
  TechSpecSection,
  TechSpecMapping,
} from '@/domain/types';

/**
 * Hoofd TechSpec document
 */
export const mockTechSpec: TechSpec = {
  id: 'techspec-001',
  projectId: 'project-001',
  title: 'Technische omschrijving nieuwbouw Jagersveld',
  version: 'Definitief 2025-01-10',
  createdAt: '2025-01-10T10:00:00Z',
  updatedAt: '2025-01-10T10:00:00Z',
};

/**
 * TechSpec secties/paragrafen
 */
export const mockTechSpecSections: TechSpecSection[] = [
  {
    id: 'sec-10',
    techSpecId: 'techspec-001',
    headingNumber: '3',
    title: 'Grondwerk',
    body: `Het grondwerk omvat:
- Uitgraven bouwput tot 1,50m diepte
- Aanvullen en verdichten van vrijkomende grond
- Afvoeren overtollige grond naar erkende stortplaats
- Inclusief pompkosten en bemaling gedurende de bouw
- Ophoging terrein tot peil +0,00m

Conform NEN 5740 en aanverwante normen.`,
  },
  {
    id: 'sec-21',
    techSpecId: 'techspec-001',
    headingNumber: '5.4',
    title: 'Kelderconstructie',
    body: `Waterdichte kelderconstructie bestaande uit:
- Keldervloer beton C30/37, dikte 200mm
- Kelderwanden beton C30/37, dikte 250mm
- Wapening volgens constructietekening
- Waterdichtheid conform NEN 6707
- Isolatie kelderwanden: XPS isolatie 60mm

Uitvoering door erkend betonbedrijf met WKB-certificering.`,
  },
  {
    id: 'sec-23',
    techSpecId: 'techspec-001',
    headingNumber: '6.2',
    title: 'Metselwerk gevel',
    body: `Buitengevel in traditioneel metselwerk:
- Buitenblad: Gele Waalformaat bakstenen
- Spouwmuur met 100mm isolatie (Rc=4,5)
- Binnenblad: Kalkzandsteen 100mm
- Voegwerk buiten: gestreken voeg

Conform NEN 2741 en BRL 1007.`,
  },
  {
    id: 'sec-31',
    techSpecId: 'techspec-001',
    headingNumber: '8.1',
    title: 'Dakconstructie',
    body: `Traditionele houten kapconstructie:
- Spanten C24, hart-op-hart 600mm
- Gordingen en nokgording C24
- Dakbeschot 22mm vuren multiplex
- Dakisolatie PIR-platen 140mm (Rc=6,5)
- Dampdichte laag
- Dakbedekking: pannen Koramic Pottelberg`,
  },
  {
    id: 'sec-24',
    techSpecId: 'techspec-001',
    headingNumber: '6.5',
    title: 'Dakgoten en hemelwaterafvoer',
    body: `Complete hemelwaterafvoer:
- Dakgoten zink, ontwikkelde breedte 500mm
- Hemelwaterafvoeren zink Ø80
- Inclusief alle hulpstukken en beugels
- Aansluitingen op hemelwaterriool
- Uitvoering conform KOMO-certificering

Let op: afvoer moet aansluiten op gescheiden rioolstelsel.`,
  },
];

/**
 * Mappings tussen TechSpec secties en MasterComponents
 */
export const mockTechSpecMappings: TechSpecMapping[] = [
  {
    id: 'tsm-001',
    sectionId: 'sec-10',
    masterComponentId: 'mc-10',  // Grondwerk
    requirementType: 'KOSTEN',
  },
  {
    id: 'tsm-002',
    sectionId: 'sec-21',
    masterComponentId: 'mc-21',  // Betonwerk kelder
    requirementType: 'KOSTEN',
  },
  {
    id: 'tsm-003',
    sectionId: 'sec-23',
    masterComponentId: 'mc-23',  // Metselwerk
    requirementType: 'KOSTEN',
  },
  {
    id: 'tsm-004',
    sectionId: 'sec-31',
    masterComponentId: 'mc-31',  // Houtconstructies
    requirementType: 'KOSTEN',
  },
  {
    id: 'tsm-005',
    sectionId: 'sec-24',
    masterComponentId: 'mc-24',  // Dakgoten
    requirementType: 'KOSTEN',
  },
];

// Export alles als bundle
export const mockTechSpecData = {
  techSpec: mockTechSpec,
  sections: mockTechSpecSections,
  mappings: mockTechSpecMappings,
};
