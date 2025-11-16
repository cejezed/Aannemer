/**
 * Data access layer for Master Components
 * Manages the canonical building structure (Brikx/Hedibouw style)
 */

import { supabaseServer } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import type { MasterComponent } from '@/domain/types';

type MasterComponentRow = Database['public']['Tables']['master_components']['Row'];
type MasterComponentInsert = Database['public']['Tables']['master_components']['Insert'];

/**
 * Convert Supabase row to domain MasterComponent type
 */
function rowToMasterComponent(row: MasterComponentRow): MasterComponent {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    parentId: row.parent_id || undefined,
    sortOrder: row.sort_order,
    isLeaf: row.is_leaf,
  };
}

/**
 * List all master components ordered by sort_order
 */
export async function listMasterComponents(): Promise<MasterComponent[]> {
  if (!supabaseServer) {
    console.warn('Supabase not configured');
    return [];
  }

  const { data, error } = await supabaseServer
    .from('master_components')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching master components:', error);
    throw new Error(`Failed to fetch master components: ${error.message}`);
  }

  return (data || []).map(rowToMasterComponent);
}

/**
 * Get a single master component by ID
 */
export async function getMasterComponent(id: string): Promise<MasterComponent | null> {
  if (!supabaseServer) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabaseServer
    .from('master_components')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching master component:', error);
    throw new Error(`Failed to fetch master component: ${error.message}`);
  }

  return data ? rowToMasterComponent(data) : null;
}

/**
 * Seed master components (upsert for one-time seeding)
 * This is used to populate the canonical building structure
 */
export async function seedMasterComponents(
  components: Array<{
    code: string;
    name: string;
    parentId?: string;
    sortOrder: number;
    isLeaf?: boolean;
    level?: number;
  }>
): Promise<MasterComponent[]> {
  if (!supabaseServer) {
    throw new Error('Supabase not configured');
  }

  const componentsData: MasterComponentInsert[] = components.map((comp) => ({
    code: comp.code,
    name: comp.name,
    parent_id: comp.parentId || null,
    sort_order: comp.sortOrder,
    is_leaf: comp.isLeaf ?? true,
    level: comp.level ?? 0,
  }));

  // Use upsert (on_conflict: 'code') to avoid duplicates
  const { data, error } = await (supabaseServer.from('master_components') as any)
    .upsert(componentsData, { onConflict: 'code' })
    .select();

  if (error) {
    console.error('Error seeding master components:', error);
    throw new Error(`Failed to seed master components: ${error.message}`);
  }

  return (data || []).map(rowToMasterComponent);
}

/**
 * Check if any master components exist
 */
export async function hasMasterComponents(): Promise<boolean> {
  if (!supabaseServer) {
    console.warn('Supabase not configured');
    return false;
  }

  const { count, error } = await supabaseServer
    .from('master_components')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error checking master components:', error);
    return false;
  }

  return (count || 0) > 0;
}
