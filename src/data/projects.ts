/**
 * Data access layer for Projects
 * Replaces mock data with real Supabase storage
 */

import { supabaseServer } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import type { Project } from '@/domain/types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

/**
 * Convert Supabase row to domain Project type
 */
function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    location: row.location || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * List all projects
 */
export async function listProjects(): Promise<Project[]> {
  if (!supabaseServer) {
    console.warn('Supabase not configured');
    return [];
  }

  const { data, error } = await supabaseServer
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  return (data || []).map(rowToProject);
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string): Promise<Project | null> {
  if (!supabaseServer) {
    console.warn('Supabase not configured');
    return null;
  }

  const { data, error } = await supabaseServer
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching project:', error);
    throw new Error(`Failed to fetch project: ${error.message}`);
  }

  return data ? rowToProject(data) : null;
}

/**
 * Create a new project
 */
export async function createProject(input: {
  name: string;
  location?: string;
}): Promise<Project> {
  if (!supabaseServer) {
    throw new Error('Supabase not configured');
  }

  const projectData: ProjectInsert = {
    name: input.name,
    location: input.location || null,
    status: 'ACTIVE',
  };

  const { data, error } = await (supabaseServer.from('projects') as any)
    .insert(projectData)
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw new Error(`Failed to create project: ${error.message}`);
  }

  return rowToProject(data);
}

/**
 * Update an existing project
 */
export async function updateProject(
  projectId: string,
  updates: {
    name?: string;
    location?: string;
  }
): Promise<Project> {
  if (!supabaseServer) {
    throw new Error('Supabase not configured');
  }

  const updateData: ProjectUpdate = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.location !== undefined) updateData.location = updates.location || null;

  const { data, error } = await (supabaseServer.from('projects') as any)
    .update(updateData)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
    throw new Error(`Failed to update project: ${error.message}`);
  }

  return rowToProject(data);
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  if (!supabaseServer) {
    throw new Error('Supabase not configured');
  }

  const { error } = await (supabaseServer.from('projects') as any)
    .delete()
    .eq('id', projectId);

  if (error) {
    console.error('Error deleting project:', error);
    throw new Error(`Failed to delete project: ${error.message}`);
  }
}
