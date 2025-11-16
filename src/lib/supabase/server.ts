/**
 * Supabase client voor server-side operaties
 * Gebruikt de service role key voor admin operaties
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase server credentials not found. Running in mock-only mode.');
}

export const supabaseServer = supabaseUrl && supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Check of Supabase server is geconfigureerd
 */
export function isSupabaseServerConfigured(): boolean {
  return supabaseServer !== null;
}
