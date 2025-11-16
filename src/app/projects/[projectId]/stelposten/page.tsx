'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPercentage } from '@/lib/formatCurrency';
import type { AllowanceProfile, Offer } from '@/domain/types';

export default function StelpostenPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [profiles, setProfiles] = useState<AllowanceProfile[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/projects/${projectId}/stelposten`);
        const data = await res.json();

        setProfiles(data.profiles || []);
        setOffers(data.offers || []);
      } catch (error) {
        console.error('Error fetching allowances:', error);
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

  // Sort profiles by allowance percentage descending
  const sortedProfiles = [...profiles].sort((a, b) => b.allowancePercentage - a.allowancePercentage);

  // Find offer details for each profile
  const getOffer = (offerId: string) => offers.find(o => o.id === offerId);

  // Determine risk level based on percentage
  const getRiskLevel = (percentage: number): 'low' | 'medium' | 'high' => {
    if (percentage < 10) return 'low';
    if (percentage < 20) return 'medium';
    return 'high';
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'high': return 'text-red-600 bg-red-50';
    }
  };

  const getRiskLabel = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'Laag risico';
      case 'medium': return 'Gemiddeld risico';
      case 'high': return 'Hoog risico';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/projects/${projectId}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Terug naar project
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Stelposten Analyse</h1>
          <p className="mt-2 text-lg text-gray-600">
            Overzicht van onzekere kostenposten per aannemer
          </p>
        </div>

        {/* Warning Box */}
        <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h3 className="font-medium text-orange-900 mb-2">⚠️ Let op: Stelposten zijn risico&apos;s</h3>
          <p className="text-sm text-orange-800">
            Stelposten zijn indicatieve bedragen die tijdens de uitvoering kunnen veranderen.
            Een hoog percentage stelposten betekent meer financieel risico en onzekerheid in de offerte.
            Bespreek grote stelposten altijd met de aannemer voordat u een contract tekent.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {sortedProfiles.map(profile => {
            const offer = getOffer(profile.offerId);
            const risk = getRiskLevel(profile.allowancePercentage);

            return (
              <Card key={profile.offerId}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {profile.contractorName}
                    {offer?.isWinningOffer && (
                      <Badge variant="success" className="ml-2">Winnend</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Totaal stelposten</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(profile.totalAllowance)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatPercentage(profile.allowancePercentage)} van totaal
                      </p>
                    </div>

                    <div className={`p-3 rounded-lg ${getRiskColor(risk)}`}>
                      <p className="font-medium text-sm">{getRiskLabel(risk)}</p>
                      <p className="text-xs mt-1">
                        {risk === 'low' && 'Beperkte onzekerheid in deze offerte'}
                        {risk === 'medium' && 'Aanzienlijke onzekerheid in deze offerte'}
                        {risk === 'high' && 'Hoge onzekerheid - bespreek dit met aannemer'}
                      </p>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600">
                        {profile.bigAllowances.length} grote stelpost{profile.bigAllowances.length === 1 ? '' : 'en'} (≥ €5.000)
                      </p>
                      <p className="text-xs text-gray-600">
                        {profile.allAllowances.length} totaal aantal stelposten
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Tables per Contractor */}
        {sortedProfiles.map(profile => {
          const offer = getOffer(profile.offerId);

          return (
            <div key={profile.offerId} className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Stelposten overzicht - {profile.contractorName}
                    {offer?.isWinningOffer && (
                      <Badge variant="success" className="ml-2">Winnend</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {profile.allAllowances.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Component
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Omschrijving
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bedrag
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            % van totaal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {profile.allAllowances.map((allowance) => (
                          <tr key={allowance.masterComponentId} className={allowance.amount >= 5000 ? 'bg-orange-50' : ''}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {allowance.masterComponentCode} - {allowance.masterComponentName}
                              {allowance.amount >= 5000 && (
                                <Badge variant="warning" className="ml-2 text-xs">Groot</Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              <ul className="space-y-1">
                                {allowance.lines.map(line => (
                                  <li key={line.id}>
                                    {line.description} ({formatCurrency(line.amount)})
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600 text-right">
                              {formatCurrency(allowance.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                              {formatPercentage(allowance.percentage)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-100 font-bold">
                          <td colSpan={2} className="px-6 py-4 text-sm text-gray-900">
                            Totaal stelposten
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 text-right">
                            {formatCurrency(profile.totalAllowance)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                            {formatPercentage(profile.allowancePercentage)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      Geen stelposten gevonden voor deze aannemer
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}

        {/* Legend */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Legenda & Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Stelpost:</strong> Indicatief bedrag dat kan wijzigen op basis van werkelijke uitvoering</li>
            <li>• <strong>Groot:</strong> Stelposten ≥ €5.000 (vraag aannemer om nadere specificatie)</li>
            <li>• <strong>Risicoprofiel:</strong> &lt;10% = laag, 10-20% = gemiddeld, &gt;20% = hoog</li>
            <li>• <strong>Tip:</strong> Vraag bij grote stelposten om een vaste prijs of gedetailleerde opbouw</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
