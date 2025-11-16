/**
 * Data access layer for Contractors
 * Full CRUD operations for contractor management
 */

import { supabaseServer } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import type { Contractor } from '@/domain/types';

type ContractorRow = Database['public']['Tables']['contractors']['Row'];
type ContractorInsert = Database['public']['Tables']['contractors']['Insert'];
type ContractorUpdate = Database['public']['Tables']['contractors']['Update'];

/**
 * Convert Supabase row to domain Contractor type
 */
function rowToContractor(row: ContractorRow): Contractor {
  return {
    id: row.id,
    name: row.name,
    contactName: row.contact_name || undefined,
    email: row.email || undefined,
    phone: row.phone || undefined,
  };
}

/**
 * List all contractors ordered by name
 */
export async function listContractors(): Promise<Contractor[]> {
  if (!supabaseServer) {
    console.warn('Supabase not configured');
    return [];
  }

  const { data, error } = await supabaseServer
    .from('contractors')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching contractors:', error);
    throw new Error(`Failed to fetch contractors: ${error.message}`);
  }

  return (data || []).map(rowToContractor);
}

/**
 * Get a single contractor by ID
 */
export async function getContractor(contractorId: string): Promise<Contractor | null> {
  if (!supabaseServer) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabaseServer
    .from('contractors')
    .select('*')
    .eq('id', contractorId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching contractor:', error);
    throw new Error(`Failed to fetch contractor: ${error.message}`);
  }

  return data ? rowToContractor(data) : null;
}

/**
 * Create a new contractor
 */
export async function createContractor(input: {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
}): Promise<Contractor> {
  if (!supabaseServer) {
    throw new Error('Supabase not configured');
  }

  const contractorData: ContractorInsert = {
    name: input.name,
    contact_name: input.contactName || null,
    email: input.email || null,
    phone: input.phone || null,
  };

  const { data, error } = await (supabaseServer.from('contractors') as any)
    .insert(contractorData)
    .select()
    .single();

  if (error) {
    console.error('Error creating contractor:', error);
    throw new Error(`Failed to create contractor: ${error.message}`);
  }

  return rowToContractor(data);
}

/**
 * Update an existing contractor
 */
export async function updateContractor(
  contractorId: string,
  updates: {
    name?: string;
    contactName?: string;
    email?: string;
    phone?: string;
  }
): Promise<Contractor> {
  if (!supabaseServer) {
    throw new Error('Supabase not configured');
  }

  const updateData: ContractorUpdate = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.contactName !== undefined) updateData.contact_name = updates.contactName || null;
  if (updates.email !== undefined) updateData.email = updates.email || null;
  if (updates.phone !== undefined) updateData.phone = updates.phone || null;

  const { data, error } = await (supabaseServer.from('contractors') as any)
    .update(updateData)
    .eq('id', contractorId)
    .select()
    .single();

  if (error) {
    console.error('Error updating contractor:', error);
    throw new Error(`Failed to update contractor: ${error.message}`);
  }

  return rowToContractor(data);
}

/**
 * Delete a contractor
 */
export async function deleteContractor(contractorId: string): Promise<void> {
  if (!supabaseServer) {
    throw new Error('Supabase not configured');
  }

  const { error } = await (supabaseServer.from('contractors') as any)
    .delete()
    .eq('id', contractorId);

  if (error) {
    console.error('Error deleting contractor:', error);
    throw new Error(`Failed to delete contractor: ${error.message}`);
  }
}
