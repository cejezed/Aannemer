/**
 * API route voor offertes van een project
 * GET /api/projects/[projectId]/offers - lijst van alle offertes voor een project
 * POST /api/projects/[projectId]/offers - create a new offer for the project
 */

import { NextResponse } from 'next/server';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';
import { listOffersForProject, createOffer } from '@/data/offers';
import { listContractors, getContractor } from '@/data/contractors';

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

    // Use real Supabase data
    const offers = await listOffersForProject(projectId);
    const contractors = await listContractors();

    // Enrich offers with contractor names
    const enrichedOffers = offers.map(offer => {
      const contractor = contractors.find(c => c.id === offer.contractorId);
      return {
        ...offer,
        contractorName: contractor?.name || 'Unknown',
        lineCount: 0, // TODO: count lines when we fetch them
      };
    });

    return NextResponse.json({
      offers: enrichedOffers,
      contractors,
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  try {
    const { projectId } = await params;
    const body = await request.json();
    const { contractorId, title, pricingModel, sourceTotalIncl, isWinningOffer } = body;

    if (!contractorId || !title) {
      return NextResponse.json(
        { error: 'contractorId and title are required' },
        { status: 400 }
      );
    }

    const { offer, revision } = await createOffer({
      projectId,
      contractorId,
      title,
      pricingModel,
      sourceTotalIncl,
      isWinningOffer,
    });

    // Enrich with contractor name
    const contractor = await getContractor(contractorId);

    return NextResponse.json(
      {
        offer: {
          ...offer,
          contractorName: contractor?.name || 'Unknown',
        },
        revision,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    );
  }
}
