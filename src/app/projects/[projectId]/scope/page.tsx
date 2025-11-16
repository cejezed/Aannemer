'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/formatCurrency';
import type {
  Offer,
  OfferScopeReport,
  ComponentScopeCoverage,
  TechSpecSection,
} from '@/domain/types';

export default function ScopePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [scopeReport, setScopeReport] = useState<OfferScopeReport | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [expandedComponentId, setExpandedComponentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch(`/api/projects/${projectId}/offers`);
        const data = await res.json();
        const allOffers = data.offers || [];
        setOffers(allOffers);

        // Auto-select winnende offerte
        const winningOffer = allOffers.find((o: Offer) => o.isWinningOffer);
        if (winningOffer) {
          setSelectedOfferId(winningOffer.id);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOffers();
  }, [projectId]);

  useEffect(() => {
    async function fetchScopeReport() {
      if (!selectedOfferId) {
        setScopeReport(null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/projects/${projectId}/scope-report?offerId=${selectedOfferId}`
        );
        const data = await res.json();
        setScopeReport(data);
      } catch (error) {
        console.error('Error fetching scope report:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchScopeReport();
  }, [projectId, selectedOfferId]);

  if (loading && offers.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <p className="text-center text-gray-500">Laden...</p>
        </div>
      </main>
    );
  }

  const getScopeStatusBadge = (status: string) => {
    switch (status) {
      case 'VOLLEDIG_GEDEKT':
        return <Badge variant="success">Volledig gedekt</Badge>;
      case 'ALLEEN_TEKST_GEEN_BEDRAG':
        return <Badge variant="danger">Vereist maar niet begroot</Badge>;
      case 'ALLEEN_BEDRAG_GEEN_TEKST':
        return <Badge variant="warning">Begroot maar niet in spec</Badge>;
      case 'ONBEKEND':
        return <Badge variant="default">Onbekend</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.5) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/projects/${projectId}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Terug naar project
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">TechSpec / Scope-check</h1>
          <p className="mt-2 text-lg text-gray-600">
            Vergelijk offerte met technische omschrijving
          </p>
        </div>

        {/* Offer Selector */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Selecteer offerte</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedOfferId}
                onChange={(e) => setSelectedOfferId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Kies een offerte...</option>
                {offers.map(offer => (
                  <option key={offer.id} value={offer.id}>
                    {offer.title} {offer.isWinningOffer && '(Winnend contract)'}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        {scopeReport && (
          <>
            {/* Statistics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="py-6">
                  <p className="text-sm font-medium text-gray-600">Volledig gedekt</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {scopeReport.stats.fullyCoveredCount}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">componenten</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-6">
                  <p className="text-sm font-medium text-gray-600">Vereist maar niet begroot</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {scopeReport.stats.textOnlyCount}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">componenten</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-6">
                  <p className="text-sm font-medium text-gray-600">Begroot maar niet in spec</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {scopeReport.stats.amountOnlyCount}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">componenten</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-6">
                  <p className="text-sm font-medium text-gray-600">Verdacht gedekt</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {scopeReport.suspiciousCoverageItems.length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">items</p>
                </CardContent>
              </Card>
            </div>

            {/* Missing Cost Items */}
            {scopeReport.missingCostItems.length > 0 && (
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>⚠️ Vereist maar niet begroot</span>
                      <Badge variant="danger">{scopeReport.missingCostItems.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scopeReport.missingCostItems.map(item => (
                        <div
                          key={`${item.masterComponentId}-${item.sectionId}`}
                          className="p-4 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-red-900">
                                §{item.headingNumber} - {item.title}
                              </p>
                              <p className="text-sm text-red-700 mt-1">
                                Component: {item.masterComponentCode} - {item.masterComponentName}
                              </p>
                            </div>
                            <Badge variant="danger">Geen budget</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Suspicious Coverage Items */}
            {scopeReport.suspiciousCoverageItems.length > 0 && (
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>🔍 Verdachte dekking</span>
                      <Badge variant="warning">{scopeReport.suspiciousCoverageItems.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {scopeReport.suspiciousCoverageItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-orange-900">
                                §{item.headingNumber} - {item.sectionTitle}
                              </p>
                              <p className="text-sm text-orange-700 mt-1">
                                {item.masterComponentCode} - {item.masterComponentName}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${getConfidenceColor(item.coverageConfidence)}`}>
                                Betrouwbaarheid: {Math.round(item.coverageConfidence * 100)}%
                              </p>
                            </div>
                          </div>

                          {item.reason && (
                            <p className="text-sm text-orange-800 mt-2">💡 {item.reason}</p>
                          )}

                          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-orange-200">
                            <div>
                              <p className="text-xs text-orange-700">Hoofd-offerte</p>
                              <p className="font-medium text-orange-900">
                                {item.hasMainOfferCoverage
                                  ? formatCurrency(item.mainOfferAmountIncl)
                                  : 'Geen dekking'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-orange-700">Subcontractors</p>
                              <p className="font-medium text-orange-900">
                                {item.hasSubcontractCoverage
                                  ? formatCurrency(item.subcontractAmountIncl)
                                  : 'Geen dekking'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Component Overview Table */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Scope-overzicht per component</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Component
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Totaal
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Hoofd-offerte
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Subcontractors
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          TechSpec
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {scopeReport.components.map(component => (
                        <>
                          <tr
                            key={component.masterComponentId}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() =>
                              setExpandedComponentId(
                                expandedComponentId === component.masterComponentId
                                  ? null
                                  : component.masterComponentId
                              )
                            }
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {component.masterComponentCode} - {component.masterComponentName}
                            </td>
                            <td className="px-6 py-4">
                              {getScopeStatusBadge(component.scopeStatus)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                              {component.totalAmountIncl > 0
                                ? formatCurrency(component.totalAmountIncl)
                                : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                              {component.fromMainOfferAmountIncl > 0
                                ? formatCurrency(component.fromMainOfferAmountIncl)
                                : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                              {component.fromSubcontractorsAmountIncl > 0
                                ? formatCurrency(component.fromSubcontractorsAmountIncl)
                                : '-'}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {component.requirementSections.length > 0 ? (
                                <Badge variant="info">
                                  {component.requirementSections.length} sectie(s)
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                          </tr>

                          {/* Expanded Detail Row */}
                          {expandedComponentId === component.masterComponentId && (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 bg-blue-50">
                                <div className="space-y-4">
                                  <h4 className="font-medium text-gray-900">
                                    TechSpec vereisten
                                  </h4>
                                  {component.requirementSections.length > 0 ? (
                                    <div className="space-y-3">
                                      {component.requirementSections.map(section => (
                                        <div
                                          key={section.id}
                                          className="p-3 bg-white rounded border border-blue-200"
                                        >
                                          <p className="font-medium text-blue-900">
                                            §{section.headingNumber} - {section.title}
                                          </p>
                                          <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                                            {section.body}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-gray-500 text-sm italic">
                                      Geen TechSpec-secties gekoppeld aan dit component
                                    </p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            {/* Legend */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Legenda & Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Volledig gedekt:</strong> Vereiste in TechSpec + budget beschikbaar</li>
                <li>• <strong>Vereist maar niet begroot:</strong> Wel in TechSpec, maar geen budget - mogelijk risico!</li>
                <li>• <strong>Begroot maar niet in spec:</strong> Wel budget, maar niet expliciet vereist in TechSpec</li>
                <li>• <strong>Verdachte dekking:</strong> Alleen stelpost of alleen via subcontractors - verifieer met aannemer</li>
                <li>• Klik op een rij om de volledige TechSpec-secties te zien</li>
              </ul>
            </div>
          </>
        )}

        {!scopeReport && !loading && selectedOfferId && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">
                Geen scope-rapport beschikbaar voor deze offerte
              </p>
            </CardContent>
          </Card>
        )}

        {!selectedOfferId && !loading && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">
                Selecteer een offerte om de scope-check te zien
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
