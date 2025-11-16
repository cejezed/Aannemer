/**
 * Mock offertes met verschillende karakteristieken
 */

import type { Project, Contractor, Offer, OfferLine, LineMapping } from '@/domain/types';
import { MASTER_COMPONENT_IDS as MC } from './masterComponents';

// ============================================================================
// Project en Contractors
// ============================================================================

export const mockProject: Project = {
  id: 'proj-001',
  name: 'Nieuwbouw woonhuis Amsterdam',
  location: 'Amsterdam Zuid',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

export const mockContractors: Contractor[] = [
  {
    id: 'cont-001',
    name: 'Bouwbedrijf De Vries B.V.',
    contactName: 'Jan de Vries',
    email: 'j.devries@bouwbedrijfdevries.nl',
    phone: '020-1234567',
  },
  {
    id: 'cont-002',
    name: 'Aannemersbedrijf Jansen & Zonen',
    contactName: 'Piet Jansen',
    email: 'info@jansenzonen.nl',
    phone: '020-7654321',
  },
  {
    id: 'cont-003',
    name: 'Bouwgroep Amsterdam',
    contactName: 'Maria Bakker',
    email: 'm.bakker@bouwgroepams.nl',
    phone: '020-5555555',
  },
];

// ============================================================================
// Offerte A: De Vries - EXCL_OPSLAGEN, volledig uitgespecificeerd
// ============================================================================

export const offerA: Offer = {
  id: 'offer-001',
  projectId: mockProject.id,
  contractorId: 'cont-001',
  title: 'Offerte nieuwbouw woonhuis - De Vries',
  sourceFileName: 'offerte_devries_2024.pdf',
  pricingModel: 'EXCL_OPSLAGEN',
  sourceTotalExcl: 385000,
  sourceTotalIncl: 465850, // incl 21% BTW
  currency: 'EUR',
  createdAt: '2024-01-20T09:00:00Z',
  updatedAt: '2024-01-20T09:00:00Z',
};

export const offerALines: OfferLine[] = [
  // Grondwerk
  {
    id: 'line-a-001',
    offerId: offerA.id,
    rawText: '20.1 Grondwerk bouwput - ontgraven, afvoeren grond 150 m³',
    code: '20.1',
    description: 'Grondwerk bouwput - ontgraven, afvoeren grond',
    quantity: 150,
    unit: 'm³',
    priceExcl: 6750,
    priceIncl: 8167.50,
    priceType: 'VAST',
    chapterHint: '20',
    sortOrder: 1,
  },
  {
    id: 'line-a-002',
    offerId: offerA.id,
    rawText: '20.2 Funderingspalen Ø300mm, ca. 40 stuks à 8m diep',
    code: '20.2',
    description: 'Funderingspalen Ø300mm, 40 stuks à 8m diep',
    quantity: 40,
    unit: 'st',
    priceExcl: 28000,
    priceIncl: 33880,
    priceType: 'VAST',
    chapterHint: '20',
    sortOrder: 2,
  },

  // Betonwerk
  {
    id: 'line-a-003',
    offerId: offerA.id,
    rawText: '21.1 Fundering betonpoeren 30m³ C20/25',
    code: '21.1',
    description: 'Fundering betonpoeren 30m³ C20/25',
    quantity: 30,
    unit: 'm³',
    priceExcl: 12000,
    priceIncl: 14520,
    priceType: 'VAST',
    chapterHint: '21',
    sortOrder: 3,
  },
  {
    id: 'line-a-004',
    offerId: offerA.id,
    rawText: '21.2 Kelderwanden beton 25m³ C28/35 waterdicht',
    code: '21.2',
    description: 'Kelderwanden beton 25m³ C28/35 waterdicht',
    quantity: 25,
    unit: 'm³',
    priceExcl: 15000,
    priceIncl: 18150,
    priceType: 'VAST',
    chapterHint: '21',
    sortOrder: 4,
  },
  {
    id: 'line-a-005',
    offerId: offerA.id,
    rawText: '21.3 Keldervloer beton 15m³ incl. isolatie',
    code: '21.3',
    description: 'Keldervloer beton 15m³ incl. isolatie',
    quantity: 15,
    unit: 'm³',
    priceExcl: 9000,
    priceIncl: 10890,
    priceType: 'VAST',
    chapterHint: '21',
    sortOrder: 5,
  },
  {
    id: 'line-a-006',
    offerId: offerA.id,
    rawText: '21.4 Begane grond vloer 120m² incl. isolatie en afwerking',
    code: '21.4',
    description: 'Begane grond vloer incl. isolatie en afwerking',
    quantity: 120,
    unit: 'm²',
    priceExcl: 18000,
    priceIncl: 21780,
    priceType: 'VAST',
    chapterHint: '21',
    sortOrder: 6,
  },

  // Metselwerk
  {
    id: 'line-a-007',
    offerId: offerA.id,
    rawText: '22.1 Metselwerk gevel 280m² metselstenen',
    code: '22.1',
    description: 'Metselwerk gevel 280m² metselstenen',
    quantity: 280,
    unit: 'm²',
    priceExcl: 42000,
    priceIncl: 50820,
    priceType: 'VAST',
    chapterHint: '22',
    sortOrder: 7,
  },
  {
    id: 'line-a-008',
    offerId: offerA.id,
    rawText: '22.2 Metselwerk binnenwanden 150m² gasbetonblokken',
    code: '22.2',
    description: 'Metselwerk binnenwanden 150m² gasbetonblokken',
    quantity: 150,
    unit: 'm²',
    priceExcl: 15000,
    priceIncl: 18150,
    priceType: 'VAST',
    chapterHint: '22',
    sortOrder: 8,
  },

  // Betonvloeren en trappen
  {
    id: 'line-a-009',
    offerId: offerA.id,
    rawText: '23.1 Prefab betonvloeren 240m² incl. montage',
    code: '23.1',
    description: 'Prefab betonvloeren 240m² incl. montage',
    quantity: 240,
    unit: 'm²',
    priceExcl: 36000,
    priceIncl: 43560,
    priceType: 'VAST',
    chapterHint: '23',
    sortOrder: 9,
  },
  {
    id: 'line-a-010',
    offerId: offerA.id,
    rawText: '23.2 Betonnen trap naar 1e verdieping',
    code: '23.2',
    description: 'Betonnen trap naar 1e verdieping',
    quantity: 1,
    unit: 'st',
    priceExcl: 8500,
    priceIncl: 10285,
    priceType: 'VAST',
    chapterHint: '23',
    sortOrder: 10,
  },

  // Dakwerk
  {
    id: 'line-a-011',
    offerId: offerA.id,
    rawText: '24.1 Dakconstructie hout 180m² kap',
    code: '24.1',
    description: 'Dakconstructie hout 180m² kap',
    quantity: 180,
    unit: 'm²',
    priceExcl: 27000,
    priceIncl: 32670,
    priceType: 'VAST',
    chapterHint: '24',
    sortOrder: 11,
  },
  {
    id: 'line-a-012',
    offerId: offerA.id,
    rawText: '24.2 Dakbedekking pannen 200m²',
    code: '24.2',
    description: 'Dakbedekking pannen 200m²',
    quantity: 200,
    unit: 'm²',
    priceExcl: 22000,
    priceIncl: 26620,
    priceType: 'VAST',
    chapterHint: '24',
    sortOrder: 12,
  },
  {
    id: 'line-a-013',
    offerId: offerA.id,
    rawText: '24.3 Dakgoten en hemelwaterafvoer compleet',
    code: '24.3',
    description: 'Dakgoten en hemelwaterafvoer compleet',
    quantity: 1,
    unit: 'pst',
    priceExcl: 4500,
    priceIncl: 5445,
    priceType: 'VAST',
    chapterHint: '24',
    sortOrder: 13,
  },

  // Kozijnen en deuren
  {
    id: 'line-a-014',
    offerId: offerA.id,
    rawText: '30.1 Kozijnen en ramen kunststof HR++ 18 stuks',
    code: '30.1',
    description: 'Kozijnen en ramen kunststof HR++ 18 stuks',
    quantity: 18,
    unit: 'st',
    priceExcl: 27000,
    priceIncl: 32670,
    priceType: 'VAST',
    chapterHint: '30',
    sortOrder: 14,
  },
  {
    id: 'line-a-015',
    offerId: offerA.id,
    rawText: '30.2 Binnendeuren 8 stuks incl. hang- en sluitwerk',
    code: '30.2',
    description: 'Binnendeuren 8 stuks incl. hang- en sluitwerk',
    quantity: 8,
    unit: 'st',
    priceExcl: 6400,
    priceIncl: 7744,
    priceType: 'VAST',
    chapterHint: '30',
    sortOrder: 15,
  },

  // Afbouw
  {
    id: 'line-a-016',
    offerId: offerA.id,
    rawText: '40.1 Gipsplaten en wanden 320m² incl. afwerking',
    code: '40.1',
    description: 'Gipsplaten en wanden 320m² incl. afwerking',
    quantity: 320,
    unit: 'm²',
    priceExcl: 20800,
    priceIncl: 25168,
    priceType: 'VAST',
    chapterHint: '40',
    sortOrder: 16,
  },
  {
    id: 'line-a-017',
    offerId: offerA.id,
    rawText: '40.2 Tegelwerk nat en droog 85m²',
    code: '40.2',
    description: 'Tegelwerk nat en droog 85m²',
    quantity: 85,
    unit: 'm²',
    priceExcl: 12750,
    priceIncl: 15427.50,
    priceType: 'VAST',
    chapterHint: '40',
    sortOrder: 17,
  },
  {
    id: 'line-a-018',
    offerId: offerA.id,
    rawText: '40.3 Stucwerk wanden en plafonds 380m²',
    code: '40.3',
    description: 'Stucwerk wanden en plafonds 380m²',
    quantity: 380,
    unit: 'm²',
    priceExcl: 19000,
    priceIncl: 22990,
    priceType: 'VAST',
    chapterHint: '40',
    sortOrder: 18,
  },

  // Overhead (apart vermeld bij EXCL_OPSLAGEN model)
  {
    id: 'line-a-019',
    offerId: offerA.id,
    rawText: 'Algemene kosten 12%',
    code: '',
    description: 'Algemene kosten 12%',
    quantity: 1,
    unit: 'pst',
    priceExcl: 38400, // 12% van 320000
    priceIncl: 46464,
    priceType: 'VAST',
    chapterHint: '',
    sortOrder: 19,
  },
  {
    id: 'line-a-020',
    offerId: offerA.id,
    rawText: 'Winst & Risico 5%',
    code: '',
    description: 'Winst & Risico 5%',
    quantity: 1,
    unit: 'pst',
    priceExcl: 16000, // 5% van 320000
    priceIncl: 19360,
    priceType: 'VAST',
    chapterHint: '',
    sortOrder: 20,
  },
];

// ============================================================================
// Offerte B: Jansen - INCL_OPSLAGEN, met stelposten
// ============================================================================

export const offerB: Offer = {
  id: 'offer-002',
  projectId: mockProject.id,
  contractorId: 'cont-002',
  title: 'Offerte nieuwbouw woonhuis - Jansen',
  sourceFileName: 'offerte_jansen_2024.pdf',
  pricingModel: 'INCL_OPSLAGEN',
  sourceTotalIncl: 478500,
  currency: 'EUR',
  createdAt: '2024-01-22T14:00:00Z',
  updatedAt: '2024-01-22T14:00:00Z',
};

export const offerBLines: OfferLine[] = [
  // Grondwerk
  {
    id: 'line-b-001',
    offerId: offerB.id,
    rawText: 'Grondwerk en ontgraven bouwput',
    description: 'Grondwerk en ontgraven bouwput',
    priceIncl: 9680,
    priceType: 'VAST',
    sortOrder: 1,
  },
  {
    id: 'line-b-002',
    offerId: offerB.id,
    rawText: 'Funderingspalen - indicatief',
    description: 'Funderingspalen - indicatief',
    priceIncl: 35000,
    priceType: 'INDICATIE',
    chapterHint: '20',
    sortOrder: 2,
  },

  // Betonwerk
  {
    id: 'line-b-003',
    offerId: offerB.id,
    rawText: 'Fundering betonpoeren',
    description: 'Fundering betonpoeren',
    priceIncl: 14520,
    priceType: 'VAST',
    sortOrder: 3,
  },
  {
    id: 'line-b-004',
    offerId: offerB.id,
    rawText: 'Kelderwanden - STELPOST',
    description: 'Kelderwanden - STELPOST',
    priceIncl: 22000,
    priceType: 'STELPOST',
    chapterHint: '21',
    sortOrder: 4,
  },
  {
    id: 'line-b-005',
    offerId: offerB.id,
    rawText: 'Keldervloer beton incl. isolatie',
    description: 'Keldervloer beton incl. isolatie',
    priceIncl: 11500,
    priceType: 'VAST',
    sortOrder: 5,
  },
  {
    id: 'line-b-006',
    offerId: offerB.id,
    rawText: 'Begane grond vloer compleet',
    description: 'Begane grond vloer compleet',
    priceIncl: 23100,
    priceType: 'VAST',
    sortOrder: 6,
  },

  // Metselwerk
  {
    id: 'line-b-007',
    offerId: offerB.id,
    rawText: 'Metselwerk gevel compleet',
    description: 'Metselwerk gevel compleet',
    priceIncl: 54450,
    priceType: 'VAST',
    sortOrder: 7,
  },
  {
    id: 'line-b-008',
    offerId: offerB.id,
    rawText: 'Metselwerk binnenwanden',
    description: 'Metselwerk binnenwanden',
    priceIncl: 19360,
    priceType: 'VAST',
    sortOrder: 8,
  },

  // Betonvloeren en trappen
  {
    id: 'line-b-009',
    offerId: offerB.id,
    rawText: 'Prefab betonvloeren',
    description: 'Prefab betonvloeren',
    priceIncl: 45980,
    priceType: 'VAST',
    sortOrder: 9,
  },
  {
    id: 'line-b-010',
    offerId: offerB.id,
    rawText: 'Betonnen trap',
    description: 'Betonnen trap',
    priceIncl: 11000,
    priceType: 'VAST',
    sortOrder: 10,
  },

  // Dakwerk
  {
    id: 'line-b-011',
    offerId: offerB.id,
    rawText: 'Dakconstructie - STELPOST',
    description: 'Dakconstructie - STELPOST',
    priceIncl: 36000,
    priceType: 'STELPOST',
    chapterHint: '24',
    sortOrder: 11,
  },
  {
    id: 'line-b-012',
    offerId: offerB.id,
    rawText: 'Dakbedekking pannen',
    description: 'Dakbedekking pannen',
    priceIncl: 28000,
    priceType: 'VAST',
    sortOrder: 12,
  },
  {
    id: 'line-b-013',
    offerId: offerB.id,
    rawText: 'Dakgoten en hemelwaterafvoer',
    description: 'Dakgoten en hemelwaterafvoer',
    priceIncl: 5800,
    priceType: 'VAST',
    sortOrder: 13,
  },

  // Kozijnen en deuren
  {
    id: 'line-b-014',
    offerId: offerB.id,
    rawText: 'Kozijnen en ramen HR++ glas',
    description: 'Kozijnen en ramen HR++ glas',
    priceIncl: 35000,
    priceType: 'VAST',
    sortOrder: 14,
  },
  {
    id: 'line-b-015',
    offerId: offerB.id,
    rawText: 'Binnendeuren incl. hang- en sluitwerk',
    description: 'Binnendeuren incl. hang- en sluitwerk',
    priceIncl: 8200,
    priceType: 'VAST',
    sortOrder: 15,
  },

  // Afbouw
  {
    id: 'line-b-016',
    offerId: offerB.id,
    rawText: 'Gipsplaten en wanden',
    description: 'Gipsplaten en wanden',
    priceIncl: 26800,
    priceType: 'VAST',
    sortOrder: 16,
  },
  {
    id: 'line-b-017',
    offerId: offerB.id,
    rawText: 'Tegelwerk badkamers en keuken',
    description: 'Tegelwerk badkamers en keuken',
    priceIncl: 16500,
    priceType: 'VAST',
    sortOrder: 17,
  },
  {
    id: 'line-b-018',
    offerId: offerB.id,
    rawText: 'Stucwerk - STELPOST',
    description: 'Stucwerk - STELPOST',
    priceIncl: 24000,
    priceType: 'STELPOST',
    chapterHint: '40',
    sortOrder: 18,
  },

  // Extra posten (niet duidelijk te plaatsen)
  {
    id: 'line-b-019',
    offerId: offerB.id,
    rawText: 'Onvoorzien en diverse werkzaamheden',
    description: 'Onvoorzien en diverse werkzaamheden',
    priceIncl: 31610,
    priceType: 'STELPOST',
    sortOrder: 19,
  },
];

// ============================================================================
// Offerte C: Bouwgroep - INCL_OPSLAGEN, ontbrekende onderdelen
// ============================================================================

export const offerC: Offer = {
  id: 'offer-003',
  projectId: mockProject.id,
  contractorId: 'cont-003',
  title: 'Offerte nieuwbouw woonhuis - Bouwgroep Amsterdam',
  sourceFileName: 'offerte_bouwgroep_2024.pdf',
  pricingModel: 'INCL_OPSLAGEN',
  sourceTotalIncl: 442000,
  currency: 'EUR',
  createdAt: '2024-01-25T11:00:00Z',
  updatedAt: '2024-01-25T11:00:00Z',
};

export const offerCLines: OfferLine[] = [
  // Grondwerk
  {
    id: 'line-c-001',
    offerId: offerC.id,
    rawText: 'Grondwerk bouwput',
    description: 'Grondwerk bouwput',
    priceIncl: 8500,
    priceType: 'VAST',
    sortOrder: 1,
  },
  {
    id: 'line-c-002',
    offerId: offerC.id,
    rawText: 'Funderingspalen - door opdrachtgever',
    description: 'Funderingspalen - door opdrachtgever',
    priceIncl: 0,
    priceType: 'ONBEKEND',
    chapterHint: '20',
    sortOrder: 2,
  },

  // Betonwerk - ZONDER KELDER!
  {
    id: 'line-c-003',
    offerId: offerC.id,
    rawText: 'Fundering betonpoeren',
    description: 'Fundering betonpoeren',
    priceIncl: 13500,
    priceType: 'VAST',
    sortOrder: 3,
  },
  // Kelderwanden en keldervloer NIET opgenomen
  {
    id: 'line-c-004',
    offerId: offerC.id,
    rawText: 'Begane grond vloer',
    description: 'Begane grond vloer',
    priceIncl: 21000,
    priceType: 'VAST',
    sortOrder: 4,
  },

  // Metselwerk
  {
    id: 'line-c-005',
    offerId: offerC.id,
    rawText: 'Metselwerk gevel',
    description: 'Metselwerk gevel',
    priceIncl: 48000,
    priceType: 'VAST',
    sortOrder: 5,
  },
  {
    id: 'line-c-006',
    offerId: offerC.id,
    rawText: 'Metselwerk binnenwanden',
    description: 'Metselwerk binnenwanden',
    priceIncl: 17500,
    priceType: 'VAST',
    sortOrder: 6,
  },

  // Betonvloeren en trappen
  {
    id: 'line-c-007',
    offerId: offerC.id,
    rawText: 'Prefab betonvloeren compleet',
    description: 'Prefab betonvloeren compleet',
    priceIncl: 42000,
    priceType: 'VAST',
    sortOrder: 7,
  },
  {
    id: 'line-c-008',
    offerId: offerC.id,
    rawText: 'Betonnen trap - STELPOST',
    description: 'Betonnen trap - STELPOST',
    priceIncl: 12000,
    priceType: 'STELPOST',
    chapterHint: '23',
    sortOrder: 8,
  },

  // Dakwerk
  {
    id: 'line-c-009',
    offerId: offerC.id,
    rawText: 'Dakconstructie hout',
    description: 'Dakconstructie hout',
    priceIncl: 31000,
    priceType: 'VAST',
    sortOrder: 9,
  },
  {
    id: 'line-c-010',
    offerId: offerC.id,
    rawText: 'Dakbedekking pannen - STELPOST',
    description: 'Dakbedekking pannen - STELPOST',
    priceIncl: 25000,
    priceType: 'STELPOST',
    chapterHint: '24',
    sortOrder: 10,
  },
  {
    id: 'line-c-011',
    offerId: offerC.id,
    rawText: 'Dakgoten',
    description: 'Dakgoten',
    priceIncl: 5200,
    priceType: 'VAST',
    sortOrder: 11,
  },

  // Kozijnen en deuren
  {
    id: 'line-c-012',
    offerId: offerC.id,
    rawText: 'Kozijnen en ramen - STELPOST',
    description: 'Kozijnen en ramen - STELPOST',
    priceIncl: 32000,
    priceType: 'STELPOST',
    chapterHint: '30',
    sortOrder: 12,
  },
  {
    id: 'line-c-013',
    offerId: offerC.id,
    rawText: 'Binnendeuren',
    description: 'Binnendeuren',
    priceIncl: 7500,
    priceType: 'VAST',
    sortOrder: 13,
  },

  // Afbouw
  {
    id: 'line-c-014',
    offerId: offerC.id,
    rawText: 'Gipsplaten en wanden',
    description: 'Gipsplaten en wanden',
    priceIncl: 24000,
    priceType: 'VAST',
    sortOrder: 14,
  },
  {
    id: 'line-c-015',
    offerId: offerC.id,
    rawText: 'Tegelwerk - STELPOST',
    description: 'Tegelwerk - STELPOST',
    priceIncl: 18000,
    priceType: 'STELPOST',
    chapterHint: '40',
    sortOrder: 15,
  },
  {
    id: 'line-c-016',
    offerId: offerC.id,
    rawText: 'Stucwerk - STELPOST',
    description: 'Stucwerk - STELPOST',
    priceIncl: 22000,
    priceType: 'STELPOST',
    chapterHint: '40',
    sortOrder: 16,
  },

  // Extra's
  {
    id: 'line-c-017',
    offerId: offerC.id,
    rawText: 'Bouwplaatskosten',
    description: 'Bouwplaatskosten',
    priceIncl: 12500,
    priceType: 'VAST',
    sortOrder: 17,
  },
  {
    id: 'line-c-018',
    offerId: offerC.id,
    rawText: 'Diverse afbouwwerkzaamheden - indicatie',
    description: 'Diverse afbouwwerkzaamheden - indicatie',
    priceIncl: 47300,
    priceType: 'INDICATIE',
    sortOrder: 18,
  },
];
