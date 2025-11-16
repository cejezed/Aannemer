/**
 * Project Snapshot - Fetch all data for a project at once
 * Used by report pages (Structure, Stelposten, Samenvatting)
 */

import { supabaseServer } from '@/lib/supabase/server';
import type {
  Project,
  Offer,
  OfferRevision,
  OfferLine,
  LineMapping,
  MasterComponent,
  Contractor,
} from '@/domain/types';
import { getProject } from './projects';
import { listOffersForProject, listRevisionsForOffer, listOfferLinesForRevision, listMappingsForOfferLines } from './offers';
import { listContractors } from './contractors';
import { listMasterComponents } from './masterComponents';

export type ProjectOfferSnapshot = {
  project: Project;
  offers: Offer[];
  contractors: Contractor[];
  masterComponents: MasterComponent[];
  revisions: Map<string, OfferRevision[]>; // offerId -> revisions
  offerLines: Map<string, OfferLine[]>; // revisionId -> lines
  lineMappings: LineMapping[];
};

/**
 * Get complete snapshot of project data for reports
 * Fetches: project, offers, contractors, master components, revisions, lines, mappings
 */
export async function getProjectOfferSnapshot(projectId: string): Promise<ProjectOfferSnapshot | null> {
  if (!supabaseServer) {
    console.warn('Supabase not configured');
    return null;
  }

  try {
    // Fetch base data in parallel
    const [project, offers, contractors, masterComponents] = await Promise.all([
      getProject(projectId),
      listOffersForProject(projectId),
      listContractors(),
      listMasterComponents(),
    ]);

    if (!project) {
      return null;
    }

    if (offers.length === 0) {
      // Return empty snapshot - project exists but no offers yet
      return {
        project,
        offers: [],
        contractors,
        masterComponents,
        revisions: new Map(),
        offerLines: new Map(),
        lineMappings: [],
      };
    }

    // Fetch revisions for all offers
    const revisionsData = await Promise.all(
      offers.map(async (offer) => ({
        offerId: offer.id,
        revisions: await listRevisionsForOffer(offer.id),
      }))
    );

    const revisions = new Map(revisionsData.map(r => [r.offerId, r.revisions]));

    // Get all revision IDs
    const allRevisions = revisionsData.flatMap(r => r.revisions);

    if (allRevisions.length === 0) {
      return {
        project,
        offers,
        contractors,
        masterComponents,
        revisions,
        offerLines: new Map(),
        lineMappings: [],
      };
    }

    // Fetch lines for all revisions
    const linesData = await Promise.all(
      allRevisions.map(async (revision) => ({
        revisionId: revision.id,
        lines: await listOfferLinesForRevision(revision.id),
      }))
    );

    const offerLines = new Map(linesData.map(l => [l.revisionId, l.lines]));

    // Get all line IDs and fetch mappings
    const allLines = linesData.flatMap(l => l.lines);
    const lineIds = allLines.map(l => l.id);

    const lineMappings = lineIds.length > 0
      ? await listMappingsForOfferLines(lineIds)
      : [];

    return {
      project,
      offers,
      contractors,
      masterComponents,
      revisions,
      offerLines,
      lineMappings,
    };
  } catch (error) {
    console.error('Error fetching project snapshot:', error);
    throw new Error(`Failed to fetch project snapshot: ${error}`);
  }
}

/**
 * Get contract revisions for all offers in a snapshot
 */
export function getContractRevisions(snapshot: ProjectOfferSnapshot): Map<string, OfferRevision> {
  const contractRevisions = new Map<string, OfferRevision>();

  for (const offer of snapshot.offers) {
    const revisions = snapshot.revisions.get(offer.id) || [];
    const contractRevision = revisions.find(r => r.label === 'Contract');

    if (contractRevision) {
      contractRevisions.set(offer.id, contractRevision);
    }
  }

  return contractRevisions;
}

/**
 * Get all offer lines for contract revisions
 */
export function getAllContractLines(snapshot: ProjectOfferSnapshot): OfferLine[] {
  const contractRevisions = getContractRevisions(snapshot);
  const allLines: OfferLine[] = [];

  for (const revision of contractRevisions.values()) {
    const lines = snapshot.offerLines.get(revision.id) || [];
    allLines.push(...lines);
  }

  return allLines;
}
