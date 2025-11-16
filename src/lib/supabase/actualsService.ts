/**
 * Service voor het ophalen van actuals uit Supabase
 * Fallback naar mock data als Supabase niet geconfigureerd is
 */

import { supabaseServer, isSupabaseServerConfigured } from './server';
import type {
  ProjectActual,
  HourEntry,
  CostEntry,
  ComponentActuals,
  MasterComponent,
} from '@/domain/types';
import { aggregateActualsByComponent, projectActualsToEntries } from '@/domain/actuals';

/**
 * Haal hour entries op uit Supabase voor een project
 */
export async function fetchHourEntries(projectId: string): Promise<HourEntry[]> {
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    console.warn('Supabase not configured, returning empty hour entries');
    return [];
  }

  try {
    const { data, error } = await supabaseServer
      .from('hour_entries')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      console.error('Error fetching hour entries:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Map database fields to domain types (camelCase)
    return data.map((row: any) => ({
      id: row.id,
      projectId: row.project_id,
      masterComponentId: row.master_component_id,
      workerName: row.worker_name,
      hours: row.hours,
      hourlyRate: row.hourly_rate,
      date: row.date,
      description: row.description,
      source: row.source,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    console.error('Exception fetching hour entries:', error);
    return [];
  }
}

/**
 * Haal cost entries op uit Supabase voor een project
 */
export async function fetchCostEntries(projectId: string): Promise<CostEntry[]> {
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    console.warn('Supabase not configured, returning empty cost entries');
    return [];
  }

  try {
    const { data, error } = await supabaseServer
      .from('cost_entries')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      console.error('Error fetching cost entries:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Map database fields to domain types (camelCase)
    return data.map((row: any) => ({
      id: row.id,
      projectId: row.project_id,
      masterComponentId: row.master_component_id,
      costType: row.cost_type,
      amountIncl: row.amount_incl,
      description: row.description,
      date: row.date,
      supplier: row.supplier,
      invoiceNumber: row.invoice_number,
      source: row.source,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    console.error('Exception fetching cost entries:', error);
    return [];
  }
}

/**
 * Haal project actuals op uit Supabase (geaggregeerde data per periode)
 */
export async function fetchProjectActuals(
  projectId: string
): Promise<ProjectActual[]> {
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    console.warn('Supabase not configured, returning empty project actuals');
    return [];
  }

  try {
    const { data, error } = await supabaseServer
      .from('project_actuals')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      console.error('Error fetching project actuals:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Map database fields to domain types (camelCase)
    return data.map((row: any) => ({
      id: row.id,
      projectId: row.project_id,
      masterComponentId: row.master_component_id,
      actualCostIncl: row.actual_cost_incl,
      actualHours: row.actual_hours,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      source: row.source,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    console.error('Exception fetching project actuals:', error);
    return [];
  }
}

/**
 * Haal alle actuals op en aggregeer per component
 * Gebruikt hour_entries en cost_entries voor gedetailleerde data
 */
export async function fetchComponentActuals(args: {
  projectId: string;
  masterComponents: MasterComponent[];
}): Promise<ComponentActuals[]> {
  const { projectId, masterComponents } = args;

  // Probeer eerst gedetailleerde entries op te halen
  const [hourEntries, costEntries] = await Promise.all([
    fetchHourEntries(projectId),
    fetchCostEntries(projectId),
  ]);

  // Als er gedetailleerde data is, gebruik die
  if (hourEntries.length > 0 || costEntries.length > 0) {
    return aggregateActualsByComponent({
      hourEntries,
      costEntries,
      masterComponents,
    });
  }

  // Anders, probeer project_actuals (geaggregeerde data)
  const projectActuals = await fetchProjectActuals(projectId);
  if (projectActuals.length > 0) {
    const entries = projectActualsToEntries({
      projectActuals,
      masterComponents,
    });

    return aggregateActualsByComponent({
      hourEntries: entries.hourEntries,
      costEntries: entries.costEntries,
      masterComponents,
    });
  }

  // Geen data gevonden
  return [];
}

/**
 * Check of er actuals data beschikbaar is voor een project
 */
export async function hasActualsData(projectId: string): Promise<boolean> {
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return false;
  }

  try {
    const [hoursResult, costsResult, actualsResult] = await Promise.all([
      supabaseServer
        .from('hour_entries')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId),
      supabaseServer
        .from('cost_entries')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId),
      supabaseServer
        .from('project_actuals')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId),
    ]);

    const totalCount =
      (hoursResult.count || 0) +
      (costsResult.count || 0) +
      (actualsResult.count || 0);

    return totalCount > 0;
  } catch (error) {
    console.error('Exception checking actuals data:', error);
    return false;
  }
}
