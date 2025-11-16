'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPercentage } from '@/lib/formatCurrency';
import type { OfferComparisonSummary } from '@/domain/types';

export default function SamenvattingPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [summary, setSummary] = useState<OfferComparisonSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await fetch(`/api/projects/${projectId}/comparison`);
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error('Error fetching summary:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
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

  if (!summary) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <p className="text-center text-red-500">Samenvatting kon niet worden geladen</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/projects/${projectId}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Terug naar project
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Vergelijkingssamenvatting</h1>
          <p className="mt-2 text-lg text-gray-600">{summary.projectName}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="py-6">
              <p className="text-sm font-medium text-gray-600">Componenten vergeleken</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{summary.totalComponentsCompared}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <p className="text-sm font-medium text-gray-600">Grote verschillen</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{summary.largeDiscrepanciesCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <p className="text-sm font-medium text-gray-600">Ontbrekende onderdelen</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{summary.missingComponentsCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Stelpost Profielen */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Stelpost Profielen</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {summary.allowanceProfiles.map(profile => (
              <Card key={profile.offerId}>
                <CardHeader>
                  <CardTitle className="text-base">{profile.contractorName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(profile.totalAllowance)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatPercentage(profile.allowancePercentage)} van totaal
                    </p>
                    <p className="text-sm text-gray-600 mt-3">
                      Grote stelposten (&gt; €5000): {profile.bigAllowances.length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Opvallende Verschillen */}
        {summary.componentDifferences.filter(d => d.isLargeDelta).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Opvallende Prijsverschillen</h2>
            <Card>
              <CardContent className="p-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Component
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Min Prijs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Max Prijs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Verschil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Reden
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summary.componentDifferences
                      .filter(d => d.isLargeDelta)
                      .slice(0, 10)
                      .map(diff => (
                        <tr key={diff.masterComponentId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {diff.masterComponentCode} - {diff.masterComponentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(diff.minPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(diff.maxPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="warning">
                              {formatPercentage(diff.deltaPercentage)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {diff.reasonHint || '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ontbrekende Componenten */}
        {summary.missingComponents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ontbrekende Onderdelen</h2>
            <Card>
              <CardContent className="p-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Component
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ontbreekt bij
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summary.missingComponents.map(missing => (
                      <tr key={missing.masterComponentId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {missing.masterComponentCode} - {missing.masterComponentName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {missing.missingInOffers.map(o => o.contractorName).join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Onduidelijke Posten */}
        {summary.unclearBuckets.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Onduidelijke Posten</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {summary.unclearBuckets.map(bucket => (
                <Card key={bucket.offerId}>
                  <CardHeader>
                    <CardTitle className="text-base">{bucket.contractorName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(bucket.unclearTotal)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatPercentage(bucket.unclearPercentage)} van totaal
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {bucket.lines.length} {bucket.lines.length === 1 ? 'post' : 'posten'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Genormaliseerde Views */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Genormaliseerde Vergelijking</h2>
          <Card>
            <CardContent className="p-0">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Aannemer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Directe Kosten
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Overhead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Totaal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Opmerking
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summary.normalizedViews.map(view => (
                    <tr key={view.offerId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {view.contractorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(view.totalDirectCosts)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(view.overheadModel.totalOverheadAmount)}
                        {view.overheadModel.isEstimated && (
                          <Badge variant="info" className="ml-2">
                            Geschat
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(view.totalWithOverhead)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {view.warnings[0] || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
