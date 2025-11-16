/**
 * Data access layer for Offers, Revisions, Lines, and Mappings
 * Handles the complete offer lifecycle and line-to-component mappings
 */

import { supabaseServer } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import type {
  Offer,
  OfferRevision,
  OfferLine,
  LineMapping,
  PricingModel,
  PriceType,
  CoverageStatus,
  AssignedBy,
} from '@/domain/types';

type OfferRow = Database['public']['Tables']['offers']['Row'];
type OfferInsert = Database['public']['Tables']['offers']['Insert'];
type OfferRevisionRow = Database['public']['Tables']['offer_revisions']['Row'];
type OfferRevisionInsert = Database['public']['Tables']['offer_revisions']['Insert'];
type OfferLineRow = Database['public']['Tables']['offer_lines']['Row'];
type OfferLineInsert = Database['public']['Tables']['offer_lines']['Insert'];
type LineMappingRow = Database['public']['Tables']['line_mappings']['Row'];
type LineMappingInsert = Database['public']['Tables']['line_mappings']['Insert'];
type LineMappingUpdate = Database['public']['Tables']['line_mappings']['Update'];

// ============================================================================
// Conversion functions
// ============================================================================

/**
 * Convert Supabase row to domain Offer type
 */
export function rowToOffer(row: OfferRow): Offer {
  return {
    id: row.id,
    projectId: row.project_id,
    contractorId: row.contractor_id,
    title: row.title,
    pricingModel: row.pricing_model as PricingModel,
    sourceTotalIncl: row.source_total_incl !== null ? Number(row.source_total_incl) : undefined,
    currency: 'EUR',
    isWinningOffer: row.is_winning_offer || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert Supabase row to domain OfferRevision type
 */
export function rowToOfferRevision(row: OfferRevisionRow): OfferRevision {
  return {
    id: row.id,
    offerId: row.offer_id,
    revisionIndex: row.revision_index,
    label: row.label,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert Supabase row to domain OfferLine type
 */
export function rowToOfferLine(row: OfferLineRow): OfferLine {
  return {
    id: row.id,
    offerId: '', // Will be populated from revision if needed
    revisionId: row.revision_id,
    position: row.position || undefined,
    rawText: row.raw_text || undefined,
    description: row.description,
    code: row.code || undefined,
    quantity: row.quantity !== null ? Number(row.quantity) : undefined,
    unit: row.unit || undefined,
    pricePerUnitExcl: row.price_per_unit_excl !== null ? Number(row.price_per_unit_excl) : undefined,
    pricePerUnitIncl: row.price_per_unit_incl !== null ? Number(row.price_per_unit_incl) : undefined,
    totalPriceExcl: row.total_price_excl !== null ? Number(row.total_price_excl) : undefined,
    totalPriceIncl: row.total_price_incl !== null ? Number(row.total_price_incl) : undefined,
    priceType: row.price_type as PriceType,
    isAllowance: row.is_allowance || undefined,
    clarification: row.clarification || undefined,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert Supabase row to domain LineMapping type
 */
export function rowToLineMapping(row: LineMappingRow): LineMapping {
  return {
    id: row.id,
    offerLineId: row.offer_line_id,
    masterComponentId: row.master_component_id,
    coverageStatus: row.coverage_status as CoverageStatus,
    assignedBy: row.assigned_by ? (row.assigned_by as AssignedBy) : undefined,
    confidence: row.confidence !== null ? Number(row.confidence) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// Offer operations
// ============================================================================

/**
 * List all offers for a project
 */
export async function listOffersForProject(projectId: string): Promise<Offer[]> {
  if (!supabaseServer) {
    console.warn('Supabase not configured');
    return [];
  }

  const { data, error } = await supabaseServer
    .from('offers')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching offers:', error);
    throw new Error(`Failed to fetch offers: ${error.message}`);
  }

  return (data || []).map(rowToOffer);
}

/**
 * Get a single offer by ID
 */
export async function getOffer(offerId: string): Promise<Offer | null> {
  if (!supabaseServer) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabaseServer
    .from('offers')
    .select('*')
    .eq('id', offerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching offer:', error);
    throw new Error(`Failed to fetch offer: ${error.message}`);
  }

  return data ? rowToOffer(data) : null;
}

/**
 * Create a new offer
 * Automatically creates the first revision with index=1, label="Contract"
 */
export async function createOffer(input: {
  projectId: string;
  contractorId: string;
  title: string;
  pricingModel?: PricingModel;
  sourceTotalIncl?: number;
  isWinningOffer?: boolean;
}): Promise<{ offer: Offer; revision: OfferRevision }> {
  if (!supabaseServer) {
    throw new Error('Supabase not configured');
  }

  // Create the offer
  const offerData: OfferInsert = {
    project_id: input.projectId,
    contractor_id: input.contractorId,
    title: input.title,
    pricing_model: input.pricingModel || 'ONBEKEND',
    source_total_incl: input.sourceTotalIncl || null,
    is_winning_offer: input.isWinningOffer || false,
    currency: 'EUR',
  };

  const { data: offerRow, error: offerError } = await (supabaseServer.from('offers') as any)
    .insert(offerData)
    .select()
    .single();

  if (offerError) {
    console.error('Error creating offer:', offerError);
    throw new Error(`Failed to create offer: ${offerError.message}`);
  }

  const offer = rowToOffer(offerRow);

  // Create the first revision (Contract)
  const revisionData: OfferRevisionInsert = {
    offer_id: offer.id,
    revision_index: 1,
    label: 'Contract',
  };

  const { data: revisionRow, error: revisionError } = await (supabaseServer.from('offer_revisions') as any)
    .insert(revisionData)
    .select()
    .single();

  if (revisionError) {
    console.error('Error creating initial revision:', revisionError);
    throw new Error(`Failed to create initial revision: ${revisionError.message}`);
  }

  const revision = rowToOfferRevision(revisionRow);

  return { offer, revision };
}

// ============================================================================
// Revision operations
// ============================================================================

/**
 * List all revisions for an offer
 */
export async function listRevisionsForOffer(offerId: string): Promise<OfferRevision[]> {
  if (!supabaseServer) {
    console.warn('Supabase not configured');
    return [];
  }

  const { data, error } = await supabaseServer
    .from('offer_revisions')
    .select('*')
    .eq('offer_id', offerId)
    .order('revision_index', { ascending: true });

  if (error) {
    console.error('Error fetching revisions:', error);
    throw new Error(`Failed to fetch revisions: ${error.message}`);
  }

  return (data || []).map(rowToOfferRevision);
}

/**
 * Create a new revision
 * Automatically increments revision_index
 */
export async function createRevision(input: {
  offerId: string;
  label: string;
  notes?: string;
}): Promise<OfferRevision> {
  if (!supabaseServer) {
    throw new Error('Supabase not configured');
  }

  // Get the latest revision index for this offer
  const { data: existingRevisions, error: fetchError } = await (supabaseServer
    .from('offer_revisions') as any)
    .select('revision_index')
    .eq('offer_id', input.offerId)
    .order('revision_index', { ascending: false })
    .limit(1);

  if (fetchError) {
    console.error('Error fetching existing revisions:', fetchError);
    throw new Error(`Failed to fetch existing revisions: ${fetchError.message}`);
  }

  const nextIndex = existingRevisions && existingRevisions.length > 0
    ? existingRevisions[0].revision_index + 1
    : 1;

  const revisionData: OfferRevisionInsert = {
    offer_id: input.offerId,
    revision_index: nextIndex,
    label: input.label,
    notes: input.notes || null,
  };

  const { data, error } = await (supabaseServer.from('offer_revisions') as any)
    .insert(revisionData)
    .select()
    .single();

  if (error) {
    console.error('Error creating revision:', error);
    throw new Error(`Failed to create revision: ${error.message}`);
  }

  return rowToOfferRevision(data);
}

// ============================================================================
// Offer Line operations
// ============================================================================

/**
 * List all offer lines for a revision
 */
export async function listOfferLinesForRevision(revisionId: string): Promise<OfferLine[]> {
  if (!supabaseServer) {
    console.warn('Supabase not configured');
    return [];
  }

  const { data, error } = await supabaseServer
    .from('offer_lines')
    .select('*')
    .eq('revision_id', revisionId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching offer lines:', error);
    throw new Error(`Failed to fetch offer lines: ${error.message}`);
  }

  return (data || []).map(rowToOfferLine);
}

/**
 * Create a new offer line
 * Automatically sets position and sort_order if not provided
 */
export async function createOfferLine(input: {
  revisionId: string;
  description: string;
  quantity?: number;
  unit?: string;
  pricePerUnitExcl?: number;
  pricePerUnitIncl?: number;
  totalPriceExcl?: number;
  totalPriceIncl?: number;
  priceType?: PriceType;
  isAllowance?: boolean;
  clarification?: string;
  code?: string;
}): Promise<OfferLine> {
  if (!supabaseServer) {
    throw new Error('Supabase not configured');
  }

  // Get the latest sort_order for this revision
  const { data: existingLines, error: fetchError } = await (supabaseServer
    .from('offer_lines') as any)
    .select('sort_order, position')
    .eq('revision_id', input.revisionId)
    .order('sort_order', { ascending: false })
    .limit(1);

  if (fetchError) {
    console.error('Error fetching existing lines:', fetchError);
    throw new Error(`Failed to fetch existing lines: ${fetchError.message}`);
  }

  const nextSortOrder = existingLines && existingLines.length > 0
    ? existingLines[0].sort_order + 1
    : 1;

  const nextPosition = existingLines && existingLines.length > 0
    ? existingLines[0].position + 1
    : 1;

  const lineData: OfferLineInsert = {
    revision_id: input.revisionId,
    description: input.description,
    quantity: input.quantity || null,
    unit: input.unit || null,
    price_per_unit_excl: input.pricePerUnitExcl || null,
    price_per_unit_incl: input.pricePerUnitIncl || null,
    total_price_excl: input.totalPriceExcl || null,
    total_price_incl: input.totalPriceIncl || null,
    price_type: input.priceType || 'ONBEKEND',
    is_allowance: input.isAllowance || false,
    clarification: input.clarification || null,
    code: input.code || null,
    position: nextPosition,
    sort_order: nextSortOrder,
  };

  const { data, error } = await (supabaseServer.from('offer_lines') as any)
    .insert(lineData)
    .select()
    .single();

  if (error) {
    console.error('Error creating offer line:', error);
    throw new Error(`Failed to create offer line: ${error.message}`);
  }

  return rowToOfferLine(data);
}

// ============================================================================
// Line Mapping operations
// ============================================================================

/**
 * List all mappings for the given offer line IDs
 */
export async function listMappingsForOfferLines(offerLineIds: string[]): Promise<LineMapping[]> {
  if (!supabaseServer) {
    console.warn('Supabase not configured');
    return [];
  }

  if (offerLineIds.length === 0) {
    return [];
  }

  const { data, error } = await supabaseServer
    .from('line_mappings')
    .select('*')
    .in('offer_line_id', offerLineIds);

  if (error) {
    console.error('Error fetching line mappings:', error);
    throw new Error(`Failed to fetch line mappings: ${error.message}`);
  }

  return (data || []).map(rowToLineMapping);
}

/**
 * Create or update a line mapping (upsert)
 */
export async function createOrUpdateLineMapping(input: {
  offerLineId: string;
  masterComponentId: string;
  coverageStatus?: CoverageStatus;
  assignedBy?: AssignedBy;
  confidence?: number;
}): Promise<LineMapping> {
  if (!supabaseServer) {
    throw new Error('Supabase not configured');
  }

  const mappingData: LineMappingInsert = {
    offer_line_id: input.offerLineId,
    master_component_id: input.masterComponentId,
    coverage_status: input.coverageStatus || 'INCLUSIEF',
    assigned_by: input.assignedBy || 'MANUAL',
    confidence: input.confidence || null,
  };

  // Use upsert with unique constraint on (offer_line_id, master_component_id)
  const { data, error } = await (supabaseServer.from('line_mappings') as any)
    .upsert(mappingData, {
      onConflict: 'offer_line_id,master_component_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting line mapping:', error);
    throw new Error(`Failed to upsert line mapping: ${error.message}`);
  }

  return rowToLineMapping(data);
}

/**
 * Delete a line mapping
 */
export async function deleteLineMapping(mappingId: string): Promise<void> {
  if (!supabaseServer) {
    throw new Error('Supabase not configured');
  }

  const { error } = await (supabaseServer.from('line_mappings') as any)
    .delete()
    .eq('id', mappingId);

  if (error) {
    console.error('Error deleting line mapping:', error);
    throw new Error(`Failed to delete line mapping: ${error.message}`);
  }
}
