/**
 * Mock data voor offer revisies
 * Voor winnende offerte (offerA - De Vries)
 */

import type { OfferRevision, OfferLine } from '@/domain/types';

// ============================================================================
// Revisies voor Offerte A (De Vries - winnende offerte)
// ============================================================================

/**
 * Revisie 1: Contract (originele offerte na gunning)
 */
export const revisionA1: OfferRevision = {
  id: 'rev-a-001',
  offerId: 'offer-001',
  revisionIndex: 1,
  label: 'Contract',
  createdAt: '2024-02-01T10:00:00Z',
  updatedAt: '2024-02-01T10:00:00Z',
};

/**
 * Revisie 2: Meerwerk kelder isolatie + minderwerk dakgoten
 */
export const revisionA2: OfferRevision = {
  id: 'rev-a-002',
  offerId: 'offer-001',
  revisionIndex: 2,
  label: 'Revisie 1 - Meerwerk isolatie & minderwerk dakgoten',
  createdAt: '2024-03-15T14:30:00Z',
  updatedAt: '2024-03-15T14:30:00Z',
};

// ============================================================================
// OfferLines voor Revisie 1 (Contract - identiek aan originele offerte)
// ============================================================================

export const revisionA1Lines: OfferLine[] = [
  // Grondwerk
  {
    id: 'line-rev1-001',
    offerId: 'offer-001',
    revisionId: revisionA1.id,
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
    id: 'line-rev1-002',
    offerId: 'offer-001',
    revisionId: revisionA1.id,
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
    id: 'line-rev1-003',
    offerId: 'offer-001',
    revisionId: revisionA1.id,
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
    id: 'line-rev1-004',
    offerId: 'offer-001',
    revisionId: revisionA1.id,
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
    id: 'line-rev1-005',
    offerId: 'offer-001',
    revisionId: revisionA1.id,
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

  // Dakwerk
  {
    id: 'line-rev1-011',
    offerId: 'offer-001',
    revisionId: revisionA1.id,
    rawText: '24.3 Dakgoten en hemelwaterafvoer compleet',
    code: '24.3',
    description: 'Dakgoten en hemelwaterafvoer compleet',
    quantity: 1,
    unit: 'pst',
    priceExcl: 4500,
    priceIncl: 5445,
    priceType: 'VAST',
    chapterHint: '24',
    sortOrder: 11,
  },
];

// ============================================================================
// OfferLines voor Revisie 2 (Met wijzigingen)
// MEERWERK: Extra isolatie kelderwanden
// MINDERWERK: Simpelere dakgoten
// GEWIJZIGD: Keldervloer isolatie aangepast
// ============================================================================

export const revisionA2Lines: OfferLine[] = [
  // Grondwerk - ONGEWIJZIGD
  {
    id: 'line-rev2-001',
    offerId: 'offer-001',
    revisionId: revisionA2.id,
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
    id: 'line-rev2-002',
    offerId: 'offer-001',
    revisionId: revisionA2.id,
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
    id: 'line-rev2-003',
    offerId: 'offer-001',
    revisionId: revisionA2.id,
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
    id: 'line-rev2-004',
    offerId: 'offer-001',
    revisionId: revisionA2.id,
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
  // NIEUW - MEERWERK: Extra isolatie kelderwanden
  {
    id: 'line-rev2-004b',
    offerId: 'offer-001',
    revisionId: revisionA2.id,
    rawText: '21.2.1 Extra isolatie kelderwanden 60mm XPS',
    code: '21.2.1',
    description: 'Extra isolatie kelderwanden 60mm XPS',
    quantity: 80,
    unit: 'm²',
    priceExcl: 3200,
    priceIncl: 3872,
    priceType: 'VAST',
    chapterHint: '21',
    sortOrder: 5,
  },
  // GEWIJZIGD: Keldervloer isolatie dikker (was 15m³ €10890, nu 18m³ €12500)
  {
    id: 'line-rev2-005',
    offerId: 'offer-001',
    revisionId: revisionA2.id,
    rawText: '21.3 Keldervloer beton 18m³ incl. extra isolatie',
    code: '21.3',
    description: 'Keldervloer beton 18m³ incl. extra isolatie',
    quantity: 18,
    unit: 'm³',
    priceExcl: 10330,
    priceIncl: 12500,
    priceType: 'VAST',
    chapterHint: '21',
    sortOrder: 6,
  },

  // Dakwerk
  // GEWIJZIGD: Simpelere dakgoten (was €5445, nu €3630 - minderwerk)
  {
    id: 'line-rev2-011',
    offerId: 'offer-001',
    revisionId: revisionA2.id,
    rawText: '24.3 Dakgoten en hemelwaterafvoer basis uitvoering',
    code: '24.3',
    description: 'Dakgoten en hemelwaterafvoer basis uitvoering',
    quantity: 1,
    unit: 'pst',
    priceExcl: 3000,
    priceIncl: 3630,
    priceType: 'VAST',
    chapterHint: '24',
    sortOrder: 11,
  },
];

// ============================================================================
// Exporteer alle revisies
// ============================================================================

export const mockRevisions: OfferRevision[] = [
  revisionA1,
  revisionA2,
];

export const mockRevisionLines: OfferLine[] = [
  ...revisionA1Lines,
  ...revisionA2Lines,
];

// Helper: Get lines for specific revision
export function getLinesForRevision(revisionId: string): OfferLine[] {
  return mockRevisionLines.filter(line => line.revisionId === revisionId);
}

// Helper: Get revisions for specific offer
export function getRevisionsForOffer(offerId: string): OfferRevision[] {
  return mockRevisions.filter(rev => rev.offerId === offerId);
}
