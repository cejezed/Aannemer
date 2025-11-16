/**
 * API route voor het vergelijken van twee revisies
 * GET /api/projects/[projectId]/offers/[offerId]/revisions/compare?from=[revId]&to=[revId]
 */

import { NextResponse } from 'next/server';
import {
  loadMockData,
  groupLinesByRevision,
  groupMappingsByRevision,
} from '@/mocks';
import { generateRevisionDiff } from '@/domain/revisionDiff';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string; offerId: string }> }
) {
  try {
    const mockData = loadMockData();
    const { projectId, offerId } = await params;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const fromRevisionId = searchParams.get('from');
    const toRevisionId = searchParams.get('to');

    // Validatie
    if (!fromRevisionId || !toRevisionId) {
      return NextResponse.json(
        { error: 'Missing required query parameters: from and to' },
        { status: 400 }
      );
    }

    // Valideer project
    if (mockData.project.id !== projectId) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Valideer offer
    const offer = mockData.offers.find(o => o.id === offerId);
    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    // Zoek revisies
    const fromRevision = mockData.revisions.find(r => r.id === fromRevisionId);
    const toRevision = mockData.revisions.find(r => r.id === toRevisionId);

    if (!fromRevision || !toRevision) {
      return NextResponse.json(
        { error: 'One or both revisions not found' },
        { status: 404 }
      );
    }

    // Valideer dat beide revisies bij dezelfde offerte horen
    if (fromRevision.offerId !== offerId || toRevision.offerId !== offerId) {
      return NextResponse.json(
        { error: 'Revisions do not belong to this offer' },
        { status: 400 }
      );
    }

    // Groepeer lines en mappings per revision
    const linesByRevision = groupLinesByRevision(mockData.revisionLines);
    const mappingsByRevision = groupMappingsByRevision(
      mockData.revisionMappings,
      mockData.revisionLines
    );

    // Haal lines en mappings op voor beide revisies
    const linesV1 = linesByRevision.get(fromRevisionId) || [];
    const linesV2 = linesByRevision.get(toRevisionId) || [];
    const mappingsV1 = mappingsByRevision.get(fromRevisionId) || [];
    const mappingsV2 = mappingsByRevision.get(toRevisionId) || [];

    // Genereer diff
    const diff = generateRevisionDiff(
      fromRevision,
      toRevision,
      linesV1,
      linesV2,
      mappingsV1,
      mappingsV2,
      mockData.masterComponents
    );

    return NextResponse.json(diff);
  } catch (error) {
    console.error('Error comparing revisions:', error);
    return NextResponse.json(
      { error: 'Failed to compare revisions' },
      { status: 500 }
    );
  }
}
