'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/formatCurrency';
import type { Project, Offer } from '@/domain/types';

interface OfferWithDetails extends Offer {
  contractorName: string;
  lineCount: number;
}

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [offers, setOffers] = useState<OfferWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectRes, offersRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch(`/api/projects/${projectId}/offers`),
        ]);

        const projectData = await projectRes.json();
        const offersData = await offersRes.json();

        setProject(projectData.project);
        setOffers(offersData.offers || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <p className="text-center text-gray-500">Laden...</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <p className="text-center text-red-500">Project niet gevonden</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Terug naar overzicht
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">{project.name}</h1>
          {project.location && (
            <p className="mt-2 text-lg text-gray-600">Locatie: {project.location}</p>
          )}
        </div>

        {/* Navigation */}
        <div className="mb-8 flex gap-4 overflow-x-auto pb-2">
          <Link
            href={`/projects/${projectId}/offers`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap font-semibold"
          >
            📝 Offertes Beheren
          </Link>
          <Link
            href={`/projects/${projectId}/structure`}
            className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 whitespace-nowrap"
          >
            Structuur & Dekking
          </Link>
          <Link
            href={`/projects/${projectId}/stelposten`}
            className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 whitespace-nowrap"
          >
            Stelposten
          </Link>
          <Link
            href={`/projects/${projectId}/onverdeeld`}
            className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 whitespace-nowrap"
          >
            Onverdeeld & Onduidelijk
          </Link>
          <Link
            href={`/projects/${projectId}/revisies`}
            className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 whitespace-nowrap"
          >
            Revisies
          </Link>
          <Link
            href={`/projects/${projectId}/scope`}
            className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 whitespace-nowrap"
          >
            TechSpec / Scope-check
          </Link>
          <Link
            href={`/projects/${projectId}/begrotingen`}
            className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 whitespace-nowrap"
          >
            Begrotingen
          </Link>
          <Link
            href={`/projects/${projectId}/actuals`}
            className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 whitespace-nowrap"
          >
            Werkelijk vs Budget
          </Link>
          <Link
            href={`/projects/${projectId}/samenvatting`}
            className="px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 whitespace-nowrap"
          >
            Samenvatting
          </Link>
        </div>

        {/* Offertes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Offertes ({offers.length})</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map(offer => (
              <Card key={offer.id}>
                <CardHeader>
                  <CardTitle className="text-base">{offer.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Aannemer:</span> {offer.contractorName}
                    </p>

                    {offer.sourceTotalIncl && (
                      <p className="text-sm">
                        <span className="font-medium">Totaal (incl. BTW):</span>{' '}
                        {formatCurrency(offer.sourceTotalIncl)}
                      </p>
                    )}

                    <p className="text-sm">
                      <span className="font-medium">Aantal posten:</span> {offer.lineCount}
                    </p>

                    <div className="mt-3">
                      <Badge variant={offer.pricingModel === 'EXCL_OPSLAGEN' ? 'info' : 'default'}>
                        {offer.pricingModel === 'EXCL_OPSLAGEN'
                          ? 'Excl. opslagen'
                          : offer.pricingModel === 'INCL_OPSLAGEN'
                            ? 'Incl. opslagen'
                            : offer.pricingModel}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      {new Date(offer.createdAt).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
