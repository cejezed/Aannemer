/**
 * Line mappings voor revision lines naar master components
 */

import type { LineMapping } from '@/domain/types';
import { MASTER_COMPONENT_IDS as MC } from './masterComponents';

// ============================================================================
// Mappings voor Revision 1 (Contract)
// ============================================================================

export const revisionA1Mappings: LineMapping[] = [
  // Grondwerk
  {
    id: 'map-rev1-001',
    offerLineId: 'line-rev1-001',
    masterComponentId: MC.GRONDWERK,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'map-rev1-002',
    offerLineId: 'line-rev1-002',
    masterComponentId: MC.FUNDERINGSPALEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },

  // Betonwerk
  {
    id: 'map-rev1-003',
    offerLineId: 'line-rev1-003',
    masterComponentId: MC.FUNDERING,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'map-rev1-004',
    offerLineId: 'line-rev1-004',
    masterComponentId: MC.KELDER_WANDEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
  {
    id: 'map-rev1-005',
    offerLineId: 'line-rev1-005',
    masterComponentId: MC.KELDER_VLOER,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },

  // Dakwerk
  {
    id: 'map-rev1-011',
    offerLineId: 'line-rev1-011',
    masterComponentId: MC.DAKGOTEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
];

// ============================================================================
// Mappings voor Revision 2 (Met wijzigingen)
// ============================================================================

export const revisionA2Mappings: LineMapping[] = [
  // Grondwerk - ongewijzigd
  {
    id: 'map-rev2-001',
    offerLineId: 'line-rev2-001',
    masterComponentId: MC.GRONDWERK,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-03-15T14:30:00Z',
    updatedAt: '2024-03-15T14:30:00Z',
  },
  {
    id: 'map-rev2-002',
    offerLineId: 'line-rev2-002',
    masterComponentId: MC.FUNDERINGSPALEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-03-15T14:30:00Z',
    updatedAt: '2024-03-15T14:30:00Z',
  },

  // Betonwerk
  {
    id: 'map-rev2-003',
    offerLineId: 'line-rev2-003',
    masterComponentId: MC.FUNDERING,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-03-15T14:30:00Z',
    updatedAt: '2024-03-15T14:30:00Z',
  },
  {
    id: 'map-rev2-004',
    offerLineId: 'line-rev2-004',
    masterComponentId: MC.KELDER_WANDEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-03-15T14:30:00Z',
    updatedAt: '2024-03-15T14:30:00Z',
  },
  // NIEUW: Extra isolatie kelderwanden
  {
    id: 'map-rev2-004b',
    offerLineId: 'line-rev2-004b',
    masterComponentId: MC.KELDER_WANDEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-03-15T14:30:00Z',
    updatedAt: '2024-03-15T14:30:00Z',
  },
  {
    id: 'map-rev2-005',
    offerLineId: 'line-rev2-005',
    masterComponentId: MC.KELDER_VLOER,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-03-15T14:30:00Z',
    updatedAt: '2024-03-15T14:30:00Z',
  },

  // Dakwerk
  {
    id: 'map-rev2-011',
    offerLineId: 'line-rev2-011',
    masterComponentId: MC.DAKGOTEN,
    coverageStatus: 'INCLUSIEF',
    confidence: 1.0,
    createdAt: '2024-03-15T14:30:00Z',
    updatedAt: '2024-03-15T14:30:00Z',
  },
];

export const mockRevisionMappings: LineMapping[] = [
  ...revisionA1Mappings,
  ...revisionA2Mappings,
];
