/**
 * Development-only API route to seed database with demo data
 * POST /api/dev/seed - Populate database with mock data for testing
 */

import { NextResponse } from 'next/server';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';
import { loadMockData } from '@/mocks';
import { createProject } from '@/data/projects';
import { createContractor } from '@/data/contractors';
import { createOffer } from '@/data/offers';

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Seed endpoint only available in development' },
      { status: 403 }
    );
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured. Cannot seed database.' },
      { status: 503 }
    );
  }

  try {
    const mockData = loadMockData();

    // 1. Create project
    const project = await createProject({
      name: mockData.project.name,
      location: mockData.project.location,
    });

    // 2. Create contractors
    const contractorIdMap = new Map<string, string>();
    for (const mockContractor of mockData.contractors) {
      const contractor = await createContractor({
        name: mockContractor.name,
        contactName: mockContractor.contactName || undefined,
        email: mockContractor.email || undefined,
        phone: mockContractor.phone || undefined,
      });
      contractorIdMap.set(mockContractor.id, contractor.id);
    }

    // 3. Create offers with their first revision
    const offerIdMap = new Map<string, { offerId: string; revisionId: string }>();
    for (const mockOffer of mockData.offers) {
      const newContractorId = contractorIdMap.get(mockOffer.contractorId);
      if (!newContractorId) continue;

      const { offer, revision } = await createOffer({
        projectId: project.id,
        contractorId: newContractorId,
        title: mockOffer.title,
        pricingModel: mockOffer.pricingModel,
        sourceTotalIncl: mockOffer.sourceTotalIncl,
        isWinningOffer: mockOffer.isWinningOffer || false,
      });

      offerIdMap.set(mockOffer.id, { offerId: offer.id, revisionId: revision.id });
    }

    return NextResponse.json({
      message: 'Database seeded successfully with demo data',
      project: {
        id: project.id,
        name: project.name,
      },
      contractors: mockData.contractors.length,
      offers: mockData.offers.length,
      note: 'Offer lines and mappings not seeded - add manually through UI or extend this endpoint',
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
