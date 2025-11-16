/**
 * Line mappings - koppeling tussen offerteregels en mastercomponenten
 */

import type { LineMapping } from '@/domain/types';
import { MASTER_COMPONENT_IDS as MC } from './masterComponents';

// ============================================================================
// Mappings voor Offerte A (De Vries)
// ============================================================================

export const offerAMappings: LineMapping[] = [
  // Grondwerk
  {
    id: 'map-a-001',
    offerLineId: 'line-a-001',
    masterComponentId: MC.GRONDWERK,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'map-a-002',
    offerLineId: 'line-a-002',
    masterComponentId: MC.FUNDERINGSPALEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },

  // Betonwerk
  {
    id: 'map-a-003',
    offerLineId: 'line-a-003',
    masterComponentId: MC.FUNDERING,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'map-a-004',
    offerLineId: 'line-a-004',
    masterComponentId: MC.KELDER_WANDEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'map-a-005',
    offerLineId: 'line-a-005',
    masterComponentId: MC.KELDER_VLOER,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'map-a-006',
    offerLineId: 'line-a-006',
    masterComponentId: MC.BEGANE_GROND_VLOER,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },

  // Metselwerk
  {
    id: 'map-a-007',
    offerLineId: 'line-a-007',
    masterComponentId: MC.METSELWERK_GEVEL,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'map-a-008',
    offerLineId: 'line-a-008',
    masterComponentId: MC.METSELWERK_BINNEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },

  // Betonvloeren en trappen
  {
    id: 'map-a-009',
    offerLineId: 'line-a-009',
    masterComponentId: MC.BETONVLOEREN,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'map-a-010',
    offerLineId: 'line-a-010',
    masterComponentId: MC.BETONTRAPPEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },

  // Dakwerk
  {
    id: 'map-a-011',
    offerLineId: 'line-a-011',
    masterComponentId: MC.DAKCONSTRUCTIE,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'map-a-012',
    offerLineId: 'line-a-012',
    masterComponentId: MC.DAKBEDEKKING,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'map-a-013',
    offerLineId: 'line-a-013',
    masterComponentId: MC.DAKGOTEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },

  // Kozijnen en deuren
  {
    id: 'map-a-014',
    offerLineId: 'line-a-014',
    masterComponentId: MC.KOZIJNEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'map-a-015',
    offerLineId: 'line-a-015',
    masterComponentId: MC.DEUREN,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },

  // Afbouw
  {
    id: 'map-a-016',
    offerLineId: 'line-a-016',
    masterComponentId: MC.AFBOUWWERK,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'map-a-017',
    offerLineId: 'line-a-017',
    masterComponentId: MC.TEGELWERK,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'map-a-018',
    offerLineId: 'line-a-018',
    masterComponentId: MC.STUCWERK,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },

  // Overhead lijnen NIET gemapped (blijven buiten component structuur)
];

// ============================================================================
// Mappings voor Offerte B (Jansen)
// ============================================================================

export const offerBMappings: LineMapping[] = [
  // Grondwerk
  {
    id: 'map-b-001',
    offerLineId: 'line-b-001',
    masterComponentId: MC.GRONDWERK,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },
  {
    id: 'map-b-002',
    offerLineId: 'line-b-002',
    masterComponentId: MC.FUNDERINGSPALEN,
    coverageStatus: 'INDICATIE',
    confidence: 0.9,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },

  // Betonwerk
  {
    id: 'map-b-003',
    offerLineId: 'line-b-003',
    masterComponentId: MC.FUNDERING,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.95,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },
  {
    id: 'map-b-004',
    offerLineId: 'line-b-004',
    masterComponentId: MC.KELDER_WANDEN,
    coverageStatus: 'STELPOST',
    confidence: 1.0,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },
  {
    id: 'map-b-005',
    offerLineId: 'line-b-005',
    masterComponentId: MC.KELDER_VLOER,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },
  {
    id: 'map-b-006',
    offerLineId: 'line-b-006',
    masterComponentId: MC.BEGANE_GROND_VLOER,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.95,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },

  // Metselwerk
  {
    id: 'map-b-007',
    offerLineId: 'line-b-007',
    masterComponentId: MC.METSELWERK_GEVEL,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.95,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },
  {
    id: 'map-b-008',
    offerLineId: 'line-b-008',
    masterComponentId: MC.METSELWERK_BINNEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },

  // Betonvloeren en trappen
  {
    id: 'map-b-009',
    offerLineId: 'line-b-009',
    masterComponentId: MC.BETONVLOEREN,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.95,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },
  {
    id: 'map-b-010',
    offerLineId: 'line-b-010',
    masterComponentId: MC.BETONTRAPPEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },

  // Dakwerk
  {
    id: 'map-b-011',
    offerLineId: 'line-b-011',
    masterComponentId: MC.DAKCONSTRUCTIE,
    coverageStatus: 'STELPOST',
    confidence: 1.0,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },
  {
    id: 'map-b-012',
    offerLineId: 'line-b-012',
    masterComponentId: MC.DAKBEDEKKING,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.95,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },
  {
    id: 'map-b-013',
    offerLineId: 'line-b-013',
    masterComponentId: MC.DAKGOTEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },

  // Kozijnen en deuren
  {
    id: 'map-b-014',
    offerLineId: 'line-b-014',
    masterComponentId: MC.KOZIJNEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.95,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },
  {
    id: 'map-b-015',
    offerLineId: 'line-b-015',
    masterComponentId: MC.DEUREN,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },

  // Afbouw
  {
    id: 'map-b-016',
    offerLineId: 'line-b-016',
    masterComponentId: MC.AFBOUWWERK,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },
  {
    id: 'map-b-017',
    offerLineId: 'line-b-017',
    masterComponentId: MC.TEGELWERK,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },
  {
    id: 'map-b-018',
    offerLineId: 'line-b-018',
    masterComponentId: MC.STUCWERK,
    coverageStatus: 'STELPOST',
    confidence: 1.0,
    createdAt: '2024-01-22T15:00:00Z',
    updatedAt: '2024-01-22T15:00:00Z',
  },

  // line-b-019 ("Onvoorzien") blijft UNMAPPED (onderdeel_onbekend)
];

// ============================================================================
// Mappings voor Offerte C (Bouwgroep) - met ontbrekende onderdelen
// ============================================================================

export const offerCMappings: LineMapping[] = [
  // Grondwerk
  {
    id: 'map-c-001',
    offerLineId: 'line-c-001',
    masterComponentId: MC.GRONDWERK,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },
  // line-c-002 (funderingspalen) wordt niet gemapped - buiten scope

  // Betonwerk
  {
    id: 'map-c-003',
    offerLineId: 'line-c-003',
    masterComponentId: MC.FUNDERING,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },
  // KELDER_WANDEN en KELDER_VLOER ontbreken!
  // We maken een expliciet mapping met NIET_OPGENOMEN status
  {
    id: 'map-c-kelder-wand',
    offerLineId: 'line-c-003', // dummy link
    masterComponentId: MC.KELDER_WANDEN,
    coverageStatus: 'NIET_OPGENOMEN',
    confidence: 1.0,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },
  {
    id: 'map-c-kelder-vloer',
    offerLineId: 'line-c-003', // dummy link
    masterComponentId: MC.KELDER_VLOER,
    coverageStatus: 'NIET_OPGENOMEN',
    confidence: 1.0,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },
  {
    id: 'map-c-004',
    offerLineId: 'line-c-004',
    masterComponentId: MC.BEGANE_GROND_VLOER,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },

  // Metselwerk
  {
    id: 'map-c-005',
    offerLineId: 'line-c-005',
    masterComponentId: MC.METSELWERK_GEVEL,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },
  {
    id: 'map-c-006',
    offerLineId: 'line-c-006',
    masterComponentId: MC.METSELWERK_BINNEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },

  // Betonvloeren en trappen
  {
    id: 'map-c-007',
    offerLineId: 'line-c-007',
    masterComponentId: MC.BETONVLOEREN,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.95,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },
  {
    id: 'map-c-008',
    offerLineId: 'line-c-008',
    masterComponentId: MC.BETONTRAPPEN,
    coverageStatus: 'STELPOST',
    confidence: 1.0,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },

  // Dakwerk
  {
    id: 'map-c-009',
    offerLineId: 'line-c-009',
    masterComponentId: MC.DAKCONSTRUCTIE,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },
  {
    id: 'map-c-010',
    offerLineId: 'line-c-010',
    masterComponentId: MC.DAKBEDEKKING,
    coverageStatus: 'STELPOST',
    confidence: 1.0,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },
  {
    id: 'map-c-011',
    offerLineId: 'line-c-011',
    masterComponentId: MC.DAKGOTEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },

  // Kozijnen en deuren
  {
    id: 'map-c-012',
    offerLineId: 'line-c-012',
    masterComponentId: MC.KOZIJNEN,
    coverageStatus: 'STELPOST',
    confidence: 1.0,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },
  {
    id: 'map-c-013',
    offerLineId: 'line-c-013',
    masterComponentId: MC.DEUREN,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },

  // Afbouw
  {
    id: 'map-c-014',
    offerLineId: 'line-c-014',
    masterComponentId: MC.AFBOUWWERK,
    coverageStatus: 'INCLUSIEF',
    confidence: 0.9,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },
  {
    id: 'map-c-015',
    offerLineId: 'line-c-015',
    masterComponentId: MC.TEGELWERK,
    coverageStatus: 'STELPOST',
    confidence: 1.0,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },
  {
    id: 'map-c-016',
    offerLineId: 'line-c-016',
    masterComponentId: MC.STUCWERK,
    coverageStatus: 'STELPOST',
    confidence: 1.0,
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-01-25T12:00:00Z',
  },

  // line-c-017 (bouwplaatskosten) en line-c-018 (diverse afbouw) blijven unmapped
];

export const allMockMappings = [
  ...offerAMappings,
  ...offerBMappings,
  ...offerCMappings,
];
