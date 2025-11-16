'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPercentage } from '@/lib/formatCurrency';
import type { OfferLine, MasterComponent } from '@/domain/types';

interface UnclearLinesByOffer {
  offerId: string;
  contractorName: string;
  unclearLines: OfferLine[];
  totalUnclear: number;
  totalUnclearPercentage: number;
}

export default function OnverdeeldPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [unclearLinesByOffer, setUnclearLinesByOffer] = useState<UnclearLinesByOffer[]>([]);
  const [masterComponents, setMasterComponents] = useState<MasterComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/projects/${projectId}/unclearlines`);
        const data = await res.json();

        setUnclearLinesByOffer(data.unclearLinesByOffer || []);
        setMasterComponents(data.masterComponents || []);
      } catch (error) {
        console.error('Error fetching unclear lines:', error);
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

  // Sort master components by code
  const sortedComponents = [...masterComponents].sort((a, b) =>
    a.code.localeCompare(b.code)
  );

  // Calculate totals
  const totalUnclearLines = unclearLinesByOffer.reduce(
    (sum, offer) => sum + offer.unclearLines.length,
    0
  );
  const totalUnclearAmount = unclearLinesByOffer.reduce(
    (sum, offer) => sum + offer.totalUnclear,
    0
  );

  const handleAssignComponent = (lineId: string, componentId: string) => {
    // In a real app, this would make an API call to create the mapping
    console.log(`Assign line ${lineId} to component ${componentId}`);
    alert(`In productie zou deze regel nu gekoppeld worden aan component ${componentId}.\n\nVoor nu is dit een demo zonder persistentie.`);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/projects/${projectId}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Terug naar project
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Onverdeeld & Onduidelijk</h1>
          <p className="mt-2 text-lg text-gray-600">
            Offerteregels die nog niet aan een bouwonderdeel zijn gekoppeld
          </p>
        </div>

        {/* Summary */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="py-6">
              <p className="text-sm font-medium text-gray-600">Onverdeelde regels</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{totalUnclearLines}</p>
              <p className="text-sm text-gray-600 mt-1">totaal aantal posten</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <p className="text-sm font-medium text-gray-600">Totaalbedrag onverdeeld</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {formatCurrency(totalUnclearAmount)}
              </p>
              <p className="text-sm text-gray-600 mt-1">nog niet toegewezen</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6">
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-lg font-bold text-gray-900 mt-2">
                {totalUnclearLines === 0 ? (
                  <span className="text-green-600">✓ Alle regels verdeeld</span>
                ) : (
                  <span className="text-orange-600">⚠ {totalUnclearLines} regels te verdelen</span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        {totalUnclearLines > 0 && (
          <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-medium text-orange-900 mb-2">💡 Wat zijn onverdeelde regels?</h3>
            <p className="text-sm text-orange-800">
              Dit zijn offerteposten die nog niet aan een specifiek bouwonderdeel (zoals &quot;Kelder&quot; of &quot;Dak&quot;)
              zijn gekoppeld. Door ze te verdelen krijg je een beter inzicht in de kostenverdeling
              en kun je aannemers beter vergelijken per onderdeel.
            </p>
          </div>
        )}

        {/* Unclear Lines per Contractor */}
        {unclearLinesByOffer.map(offerData => {
          if (offerData.unclearLines.length === 0) {
            return (
              <div key={offerData.offerId} className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {offerData.contractorName}
                      <Badge variant="success" className="ml-2">Compleet</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-green-600 py-8">
                      ✓ Alle regels van deze aannemer zijn toegewezen aan bouwonderdelen
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          }

          return (
            <div key={offerData.offerId} className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{offerData.contractorName}</span>
                    <div className="text-sm font-normal">
                      <Badge variant="warning">
                        {offerData.unclearLines.length} onverdeeld
                      </Badge>
                      <span className="ml-3 text-gray-600">
                        Totaal: {formatCurrency(offerData.totalUnclear)}
                        ({formatPercentage(offerData.totalUnclearPercentage)})
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Omschrijving
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bedrag
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Toewijzen aan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {offerData.unclearLines.map(line => (
                        <tr key={line.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {line.code || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div>{line.description}</div>
                            {line.quantity && line.unit && (
                              <div className="text-xs text-gray-500 mt-1">
                                {line.quantity} {line.unit}
                              </div>
                            )}
                            {line.chapterHint && (
                              <div className="text-xs text-blue-600 mt-1">
                                Hoofdstuk: {line.chapterHint}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {line.priceIncl !== undefined ? formatCurrency(line.priceIncl) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                line.priceType === 'STELPOST' ? 'warning' :
                                line.priceType === 'INDICATIE' ? 'info' :
                                'default'
                              }
                            >
                              {line.priceType}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <select
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssignComponent(line.id, e.target.value);
                                  }
                                }}
                                defaultValue=""
                              >
                                <option value="">Selecteer component...</option>
                                {sortedComponents.map(comp => (
                                  <option key={comp.id} value={comp.id}>
                                    {comp.code} - {comp.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          );
        })}

        {/* Empty State */}
        {totalUnclearLines === 0 && (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <div className="text-6xl mb-4">✓</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  Alle regels zijn verdeeld!
                </h3>
                <p className="text-gray-600">
                  Alle offerteposten zijn succesvol gekoppeld aan bouwonderdelen.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Legenda & Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Onverdeeld:</strong> Regel is nog niet gekoppeld aan een bouwonderdeel</li>
            <li>• <strong>Hoofdstuk-hint:</strong> Suggestie op basis van de oorspronkelijke hoofdstukindeling</li>
            <li>• <strong>Tip:</strong> Koppel algemene kosten (vergunningen, bouwplaatsinrichting) aan onderdeel &quot;00 - Algemene kosten&quot;</li>
            <li>• <strong>Demo-modus:</strong> Toewijzingen worden momenteel niet opgeslagen (komt in de volgende versie)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
