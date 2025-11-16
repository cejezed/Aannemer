/**
 * Mock Subcontractor data
 * Onderaannemers en hun offertes
 */

import type {
  Subcontractor,
  SubcontractOffer,
  SubcontractOfferLine,
  SubcontractLineMapping,
} from '@/domain/types';

/**
 * Onderaannemers
 */
export const mockSubcontractors: Subcontractor[] = [
  {
    id: 'sub-001',
    name: 'Kelderbouwer van der Meer BV',
    discipline: 'Betonwerk',
    contactName: 'Jan van der Meer',
    email: 'j.vandermeer@kelderbouwer.nl',
    phone: '06-12345678',
  },
  {
    id: 'sub-002',
    name: 'Grondverzet Jansen & Zn',
    discipline: 'Grondwerk',
    contactName: 'Piet Jansen',
    email: 'info@grondverzetjansen.nl',
    phone: '06-87654321',
  },
  {
    id: 'sub-003',
    name: 'Metselwerken de Jong',
    discipline: 'Metselwerk',
    contactName: 'Klaas de Jong',
    email: 'klaas@metselwerkendejong.nl',
    phone: '06-11223344',
  },
];

/**
 * Subcontractor offertes
 */
export const mockSubcontractOffers: SubcontractOffer[] = [
  {
    id: 'suboff-001',
    projectId: 'project-001',
    mainOfferId: 'offer-001',  // Gekoppeld aan De Vries (winnende offerte)
    subcontractorId: 'sub-001',
    title: 'Offerte kelderbouw Jagersveld',
    sourceFileName: 'kelderbouwer_van_der_meer.pdf',
    sourceTotalIncl: 52000,
    currency: 'EUR',
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z',
  },
  {
    id: 'suboff-002',
    projectId: 'project-001',
    mainOfferId: 'offer-001',
    subcontractorId: 'sub-002',
    title: 'Offerte grondwerk Jagersveld',
    sourceFileName: 'grondverzet_jansen.pdf',
    sourceTotalIncl: 19500,
    currency: 'EUR',
    createdAt: '2024-12-10T14:00:00Z',
    updatedAt: '2024-12-10T14:00:00Z',
  },
  {
    id: 'suboff-003',
    projectId: 'project-001',
    mainOfferId: 'offer-002',  // Gekoppeld aan Goorhuis
    subcontractorId: 'sub-003',
    title: 'Offerte metselwerk Jagersveld',
    sourceFileName: 'metselwerken_de_jong.pdf',
    sourceTotalIncl: 87000,
    currency: 'EUR',
    createdAt: '2024-12-20T09:00:00Z',
    updatedAt: '2024-12-20T09:00:00Z',
  },
];

/**
 * Subcontractor offerte regels
 */
export const mockSubcontractOfferLines: SubcontractOfferLine[] = [
  // Kelderbouwer van der Meer (sub-001, suboff-001)
  {
    id: 'sol-001',
    subcontractOfferId: 'suboff-001',
    rawText: 'Complete kelderconstructie incl. bekisting, wapening en storten',
    description: 'Kelderconstructie compleet',
    priceType: 'VAST',
    priceIncl: 52000,
    code: '21.1',
    chapterHint: '21 - Betonwerk',
  },

  // Grondverzet Jansen (sub-002, suboff-002)
  {
    id: 'sol-002',
    subcontractOfferId: 'suboff-002',
    rawText: 'Uitgraven bouwput 1,50m diepte, afvoeren grond',
    description: 'Grondwerk bouwput compleet',
    priceType: 'VAST',
    priceIncl: 18000,
    code: '10.1',
    quantity: 250,
    unit: 'm³',
    chapterHint: '10 - Grondwerk',
  },
  {
    id: 'sol-003',
    subcontractOfferId: 'suboff-002',
    rawText: 'Bemaling gedurende bouwperiode',
    description: 'Bemaling bouwput',
    priceType: 'INDICATIE',
    priceIncl: 1500,
    code: '10.2',
    chapterHint: '10 - Grondwerk',
  },

  // Metselwerken de Jong (sub-003, suboff-003)
  {
    id: 'sol-004',
    subcontractOfferId: 'suboff-003',
    rawText: 'Gevelmetselwerk incl. materiaal en voegen',
    description: 'Metselwerk gevel compleet',
    priceType: 'VAST',
    priceIncl: 87000,
    code: '23.1',
    quantity: 420,
    unit: 'm²',
    chapterHint: '23 - Metselwerk',
  },
];

/**
 * Mappings van subcontractor regels naar mastercomponenten
 */
export const mockSubcontractLineMappings: SubcontractLineMapping[] = [
  // Kelderbouwer -> Betonwerk kelder
  {
    id: 'slm-001',
    subcontractOfferLineId: 'sol-001',
    masterComponentId: 'mc-21',  // Betonwerk kelder
    coverageStatus: 'INCLUSIEF',
    confidence: 0.95,
  },

  // Grondverzet -> Grondwerk
  {
    id: 'slm-002',
    subcontractOfferLineId: 'sol-002',
    masterComponentId: 'mc-10',  // Grondwerk
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
  },
  {
    id: 'slm-003',
    subcontractOfferLineId: 'sol-003',
    masterComponentId: 'mc-10',  // Grondwerk
    coverageStatus: 'INDICATIE',
    confidence: 0.6,
  },

  // Metselwerken -> Metselwerk
  {
    id: 'slm-004',
    subcontractOfferLineId: 'sol-004',
    masterComponentId: 'mc-23',  // Metselwerk
    coverageStatus: 'INCLUSIEF',
    confidence: 0.95,
  },
];

// Export alles als bundle
export const mockSubcontractData = {
  subcontractors: mockSubcontractors,
  subcontractOffers: mockSubcontractOffers,
  subcontractOfferLines: mockSubcontractOfferLines,
  subcontractLineMappings: mockSubcontractLineMappings,
};
