/**
 * API route voor een specifiek project
 * GET /api/projects/[projectId] - haal project details op
 */

import { NextResponse } from 'next/server';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';
import { getProject } from '@/data/projects';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured. Zorg voor NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY in .env' },
      { status: 503 }
    );
  }

  try {
    const { projectId } = await params;
    const project = await getProject(projectId);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      project,
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}
