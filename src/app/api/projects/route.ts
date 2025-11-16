/**
 * API route voor projecten
 * GET /api/projects - lijst van alle projecten
 */

import { NextResponse } from 'next/server';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';
import { listProjects } from '@/data/projects';

export async function GET() {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured. Zorg voor NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY in .env' },
      { status: 503 }
    );
  }

  try {
    const projects = await listProjects();

    return NextResponse.json({
      projects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
