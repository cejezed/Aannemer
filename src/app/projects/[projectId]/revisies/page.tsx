'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPercentage } from '@/lib/formatCurrency';
import type {
  OfferRevision,
  RevisionDiff,
  Offer,
} from '@/domain/types';

interface EnrichedRevision extends OfferRevision {
  lineCount: number;
  mappedLineCount: number;
}

export default function RevisiesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [revisions, setRevisions] = useState<EnrichedRevision[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedFromId, setSelectedFromId] = useState<string | null>(null);
  const [selectedToId, setSelectedToId] = useState<string | null>(null);
  const [diff, setDiff] = useState<RevisionDiff | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Haal eerst de offers op om de winnende offerte te vinden
        const offersRes = await fetch(`/api/projects/${projectId}/offers`);
        const offersData = await offersRes.json();
        const allOffers = offersData.offers || [];
        setOffers(allOffers);

        // Zoek de winnende offerte
        const winningOffer = allOffers.find((o: Offer) => o.isWinningOffer);

        if (winningOffer) {
          // Haal revisies op voor de winnende offerte
          const revisionsRes = await fetch(
            `/api/projects/${projectId}/offers/${winningOffer.id}/revisions`
          );
          const revisionsData = await revisionsRes.json();
          const allRevisions = revisionsData.revisions || [];
          setRevisions(allRevisions);

          // Selecteer automatisch de eerste twee revisies als standaard vergelijking
          if (allRevisions.length >= 2) {
            setSelectedFromId(allRevisions[0].id);
            setSelectedToId(allRevisions[1].id);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectId]);

  // Fetch diff wanneer beide revisies geselecteerd zijn
  useEffect(() => {
    async function fetchDiff() {
      if (!selectedFromId || !selectedToId) {
        setDiff(null);
        return;
      }

      setComparing(true);
      try {
        const winningOffer = offers.find(o => o.isWinningOffer);
        if (!winningOffer) return;

        const res = await fetch(
          `/api/projects/${projectId}/offers/${winningOffer.id}/revisions/compare?from=${selectedFromId}&to=${selectedToId}`
        );
        const diffData = await res.json();
        setDiff(diffData);
      } catch (error) {
        console.error('Error fetching diff:', error);
      } finally {
        setComparing(false);
      }
    }

    fetchDiff();
  }, [selectedFromId, selectedToId, projectId, offers]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <p className="text-center text-gray-500">Laden...</p>
        </div>
      </main>
    );
  }

  const winningOffer = offers.find(o => o.isWinningOffer);

  if (!winningOffer) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <Link href={`/projects/${projectId}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Terug naar project
          </Link>
          <p className="text-center text-gray-600">
            Geen winnende offerte gevonden. Markeer eerst een offerte als winnend contract.
          </p>
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
          <h1 className="text-4xl font-bold text-gray-900">Revisies</h1>
          <p className="mt-2 text-lg text-gray-600">
            Contract wijzigingen - {winningOffer.title}
          </p>
        </div>

        {/* Revision Selector */}
        {revisions.length > 0 ? (
          <>
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Selecteer revisies om te vergelijken</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Van (oude versie)
                      </label>
                      <select
                        value={selectedFromId || ''}
                        onChange={(e) => setSelectedFromId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecteer revisie...</option>
                        {revisions.map(rev => (
                          <option key={rev.id} value={rev.id}>
                            Revisie {rev.revisionIndex} - {rev.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Naar (nieuwe versie)
                      </label>
                      <select
                        value={selectedToId || ''}
                        onChange={(e) => setSelectedToId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecteer revisie...</option>
                        {revisions.map(rev => (
                          <option key={rev.id} value={rev.id}>
                            Revisie {rev.revisionIndex} - {rev.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Diff Summary */}
            {comparing ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Vergelijking aan het laden...</p>
              </div>
            ) : diff ? (
              <>
                {/* Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="py-6">
                      <p className="text-sm font-medium text-gray-600">Totaal wijziging</p>
                      <p className={`text-3xl font-bold mt-2 ${
                        diff.totalDelta > 0 ? 'text-red-600' : diff.totalDelta < 0 ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {diff.totalDelta > 0 ? '+' : ''}{formatCurrency(diff.totalDelta)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatPercentage(diff.totalDeltaPercentage)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="py-6">
                      <p className="text-sm font-medium text-gray-600">Toegevoegd</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">{diff.linesAdded}</p>
                      <p className="text-sm text-gray-600 mt-1">nieuwe posten</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="py-6">
                      <p className="text-sm font-medium text-gray-600">Verwijderd</p>
                      <p className="text-3xl font-bold text-red-600 mt-2">{diff.linesRemoved}</p>
                      <p className="text-sm text-gray-600 mt-1">posten weg</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="py-6">
                      <p className="text-sm font-medium text-gray-600">Gewijzigd</p>
                      <p className="text-3xl font-bold text-orange-600 mt-2">{diff.linesChanged}</p>
                      <p className="text-sm text-gray-600 mt-1">posten aangepast</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Component Level Diffs */}
                {diff.componentDiffs.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Wijzigingen per Component</h2>
                    <Card>
                      <CardContent className="p-0">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Component
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Was
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Wordt
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Verschil
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                %
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {diff.componentDiffs.map(compDiff => (
                              <tr key={compDiff.masterComponentId} className={compDiff.isSignificant ? 'bg-orange-50' : ''}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  {compDiff.masterComponentCode} - {compDiff.masterComponentName}
                                  {compDiff.isSignificant && (
                                    <Badge variant="warning" className="ml-2">
                                      Significant
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {formatCurrency(compDiff.totalV1)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {formatCurrency(compDiff.totalV2)}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                                  compDiff.delta > 0 ? 'text-red-600' : compDiff.delta < 0 ? 'text-green-600' : 'text-gray-900'
                                }`}>
                                  {compDiff.delta > 0 ? '+' : ''}{formatCurrency(compDiff.delta)}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                                  compDiff.delta > 0 ? 'text-red-600' : compDiff.delta < 0 ? 'text-green-600' : 'text-gray-900'
                                }`}>
                                  {compDiff.deltaPercentage > 0 ? '+' : ''}{formatPercentage(compDiff.deltaPercentage)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Line Level Diffs - Only show ADDED, REMOVED, and CHANGED */}
                {(diff.linesAdded > 0 || diff.linesRemoved > 0 || diff.linesChanged > 0) && (
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Gedetailleerde Wijzigingen</h2>
                    <Card>
                      <CardContent className="p-0">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Component
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Omschrijving
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Wijziging
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {diff.lineDiffs
                              .filter(d => d.status !== 'UNCHANGED')
                              .map((lineDiff, idx) => (
                                <tr key={idx} className={
                                  lineDiff.status === 'ADDED' ? 'bg-green-50' :
                                  lineDiff.status === 'REMOVED' ? 'bg-red-50' :
                                  lineDiff.status === 'CHANGED' ? 'bg-orange-50' : ''
                                }>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge
                                      variant={
                                        lineDiff.status === 'ADDED' ? 'success' :
                                        lineDiff.status === 'REMOVED' ? 'danger' :
                                        lineDiff.status === 'CHANGED' ? 'warning' : 'default'
                                      }
                                    >
                                      {lineDiff.status === 'ADDED' ? 'Nieuw' :
                                       lineDiff.status === 'REMOVED' ? 'Verwijderd' :
                                       lineDiff.status === 'CHANGED' ? 'Gewijzigd' : lineDiff.status}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900">
                                    {lineDiff.masterComponentName}
                                  </td>
                                  <td className="px-6 py-4 text-sm">
                                    {lineDiff.status === 'ADDED' && (
                                      <span className="text-green-900">{lineDiff.lineV2?.description}</span>
                                    )}
                                    {lineDiff.status === 'REMOVED' && (
                                      <span className="text-red-900 line-through">{lineDiff.lineV1?.description}</span>
                                    )}
                                    {lineDiff.status === 'CHANGED' && (
                                      <>
                                        <div className="text-red-900 line-through mb-1">{lineDiff.lineV1?.description}</div>
                                        <div className="text-green-900">{lineDiff.lineV2?.description}</div>
                                      </>
                                    )}
                                  </td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                                    lineDiff.priceDelta && lineDiff.priceDelta > 0 ? 'text-red-600' :
                                    lineDiff.priceDelta && lineDiff.priceDelta < 0 ? 'text-green-600' : 'text-gray-900'
                                  }`}>
                                    {lineDiff.priceDelta !== undefined ? (
                                      <>
                                        {lineDiff.priceDelta > 0 ? '+' : ''}{formatCurrency(lineDiff.priceDelta)}
                                      </>
                                    ) : '-'}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            ) : selectedFromId && selectedToId ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Selecteer twee verschillende revisies om te vergelijken</p>
              </div>
            ) : null}
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">
                Nog geen revisies beschikbaar voor deze offerte
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
