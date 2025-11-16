/**
 * API route for contractors (Aannemers)
 * GET /api/contractors - List all contractors
 * POST /api/contractors - Create a new contractor
 */

import { NextResponse } from 'next/server';
import { listContractors, createContractor } from '@/data/contractors';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';

export async function GET() {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({
      contractors: [],
      message: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
    });
  }

  try {
    const contractors = await listContractors();
    return NextResponse.json({ contractors });
  } catch (error) {
    console.error('Error fetching contractors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contractors' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { name, contactName, email, phone } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Contractor name is required' },
        { status: 400 }
      );
    }

    const contractor = await createContractor({
      name,
      contactName,
      email,
      phone,
    });

    return NextResponse.json(contractor, { status: 201 });
  } catch (error) {
    console.error('Error creating contractor:', error);
    return NextResponse.json(
      { error: 'Failed to create contractor' },
      { status: 500 }
    );
  }
}
