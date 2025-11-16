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

export interface MockData {
  project: Project;
  contractors: Contractor[];
  offers: Offer[];
  offerLines: OfferLine[];
  lineMappings: LineMapping[];
  masterComponents: MasterComponent[];
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
};
