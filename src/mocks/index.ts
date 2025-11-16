/**
 * Mock data loader
 * Centraal punt voor het laden van alle mock data
 */

import type {
  Project,
  Contractor,
  Offer,
  OfferLine,
  LineMapping,
  MasterComponent,
  OfferRevision,
} from '@/domain/types';

import { mockMasterComponents } from './masterComponents';
import {
  mockProject,
  mockContractors,
  offerA,
  offerALines,
  offerB,
  offerBLines,
  offerC,
  offerCLines,
} from './offers';
import {
  offerAMappings,
  offerBMappings,
  offerCMappings,
  allMockMappings,
} from './lineMappings';
import {
  mockRevisions,
  mockRevisionLines,
  revisionA1,
  revisionA2,
  revisionA1Lines,
  revisionA2Lines,
} from './revisions';
import {
  revisionA1Mappings,
  revisionA2Mappings,
} from './revisionMappings';

export interface MockData {
  project: Project;
  contractors: Contractor[];
  offers: Offer[];
  offerLines: OfferLine[];
  lineMappings: LineMapping[];
  masterComponents: MasterComponent[];
  revisions: OfferRevision[];
  revisionLines: OfferLine[];
  revisionMappings: LineMapping[];
}

/**
 * Laad alle mock data voor demo doeleinden
 */
export function loadMockData(): MockData {
  return {
    project: mockProject,
    contractors: mockContractors,
    offers: [offerA, offerB, offerC],
    offerLines: [...offerALines, ...offerBLines, ...offerCLines],
    lineMappings: allMockMappings,
    masterComponents: mockMasterComponents,
    revisions: mockRevisions,
    revisionLines: mockRevisionLines,
    revisionMappings: [...revisionA1Mappings, ...revisionA2Mappings],
  };
}

/**
 * Helper: Groepeer offer lines per offerte
 */
export function groupLinesByOffer(offerLines: OfferLine[]): Map<string, OfferLine[]> {
  const map = new Map<string, OfferLine[]>();

  for (const line of offerLines) {
    const lines = map.get(line.offerId) || [];
    lines.push(line);
    map.set(line.offerId, lines);
  }

  return map;
}

/**
 * Helper: Groepeer line mappings per offerte
 */
export function groupMappingsByOffer(
  lineMappings: LineMapping[]
): Map<string, LineMapping[]> {
  const map = new Map<string, LineMapping[]>();

  for (const mapping of lineMappings) {
    // Zoek de offerId via de offerLine
    const offerLine = [...offerALines, ...offerBLines, ...offerCLines].find(
      l => l.id === mapping.offerLineId
    );

    if (offerLine) {
      const mappings = map.get(offerLine.offerId) || [];
      mappings.push(mapping);
      map.set(offerLine.offerId, mappings);
    }
  }

  return map;
}

/**
 * Helper: Maak contractor map voor snelle lookup
 */
export function createContractorMap(contractors: Contractor[]): Map<string, Contractor> {
  return new Map(contractors.map(c => [c.id, c]));
}

/**
 * Helper: Groepeer revisions per offerte
 */
export function groupRevisionsByOffer(revisions: OfferRevision[]): Map<string, OfferRevision[]> {
  const map = new Map<string, OfferRevision[]>();

  for (const revision of revisions) {
    const revisions = map.get(revision.offerId) || [];
    revisions.push(revision);
    map.set(revision.offerId, revisions);
  }

  // Sorteer per offerte op revisionIndex
  for (const [offerId, revs] of map) {
    revs.sort((a, b) => a.revisionIndex - b.revisionIndex);
    map.set(offerId, revs);
  }

  return map;
}

/**
 * Helper: Groepeer revision lines per revision
 */
export function groupLinesByRevision(revisionLines: OfferLine[]): Map<string, OfferLine[]> {
  const map = new Map<string, OfferLine[]>();

  for (const line of revisionLines) {
    if (line.revisionId) {
      const lines = map.get(line.revisionId) || [];
      lines.push(line);
      map.set(line.revisionId, lines);
    }
  }

  return map;
}

/**
 * Helper: Groepeer revision mappings per revision
 */
export function groupMappingsByRevision(
  revisionMappings: LineMapping[],
  revisionLines: OfferLine[]
): Map<string, LineMapping[]> {
  const map = new Map<string, LineMapping[]>();

  for (const mapping of revisionMappings) {
    // Zoek de revisionId via de offerLine
    const line = revisionLines.find(l => l.id === mapping.offerLineId);

    if (line?.revisionId) {
      const mappings = map.get(line.revisionId) || [];
      mappings.push(mapping);
      map.set(line.revisionId, mappings);
    }
  }

  return map;
}

// Re-export specifieke mock data voor directe imports
export {
  mockProject,
  mockContractors,
  mockMasterComponents,
  offerA,
  offerALines,
  offerAMappings,
  offerB,
  offerBLines,
  offerBMappings,
  offerC,
  offerCLines,
  offerCMappings,
  mockRevisions,
  mockRevisionLines,
  revisionA1,
  revisionA2,
  revisionA1Lines,
  revisionA2Lines,
  revisionA1Mappings,
  revisionA2Mappings,
};
