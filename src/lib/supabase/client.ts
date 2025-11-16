/**
 * Supabase client voor client-side operaties
 * Gebruikt de publieke anon key
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Running in mock-only mode.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Check of Supabase is geconfigureerd
 */
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
