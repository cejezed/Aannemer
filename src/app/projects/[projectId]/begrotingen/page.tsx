'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/formatCurrency';
import type {
  Offer,
  ProjectBudget,
  BudgetReport,
  BudgetVariance,
} from '@/domain/types';

export default function BegrotingenPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [budgetReport, setBudgetReport] = useState<BudgetReport | null>(null);
  const [budgets, setBudgets] = useState<ProjectBudget[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBudgetsAndOffers() {
      try {
        // Fetch budgets
        const budgetRes = await fetch(`/api/projects/${projectId}/budgets`);
        const budgetData = await budgetRes.json();
        const allBudgets = budgetData.budgets || [];
        setBudgets(allBudgets);

        // Auto-select baseline budget
        const baselineBudget = allBudgets.find((b: ProjectBudget) => b.isBaseline);
        if (baselineBudget) {
          setSelectedBudgetId(baselineBudget.id);
        }

        // Fetch offers
        const offerRes = await fetch(`/api/projects/${projectId}/offers`);
        const offerData = await offerRes.json();
        const allOffers = offerData.offers || [];
        setOffers(allOffers);

        // Auto-select winning offer
        const winningOffer = allOffers.find((o: Offer) => o.isWinningOffer);
        if (winningOffer) {
          setSelectedOfferId(winningOffer.id);
        }
      } catch (error) {
        console.error('Error fetching budgets and offers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBudgetsAndOffers();
  }, [projectId]);

  useEffect(() => {
    async function fetchBudgetReport() {
      if (!selectedBudgetId) {
        setBudgetReport(null);
        return;
      }

      setLoading(true);
      try {
        const url = selectedOfferId
          ? `/api/projects/${projectId}/budget-report?budgetId=${selectedBudgetId}&offerId=${selectedOfferId}`
          : `/api/projects/${projectId}/budget-report?budgetId=${selectedBudgetId}`;

        const res = await fetch(url);
        const data = await res.json();
        setBudgetReport(data);
      } catch (error) {
        console.error('Error fetching budget report:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBudgetReport();
  }, [projectId, selectedBudgetId, selectedOfferId]);

  if (loading && budgets.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <p className="text-center text-gray-500">Laden...</p>
        </div>
      </main>
    );
  }

  const getBudgetStatusBadge = (status: string) => {
    switch (status) {
      case 'WITHIN_BUDGET':
        return <Badge variant="success">Binnen budget</Badge>;
      case 'APPROACHING_LIMIT':
        return <Badge variant="warning">Bijna op (90-100%)</Badge>;
      case 'OVER_BUDGET':
        return <Badge variant="danger">Over budget</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance < 0) return 'text-green-600'; // Under budget (negative variance)
    if (variance > 0) return 'text-red-600'; // Over budget
    return 'text-gray-600'; // Exactly on budget
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 90) return 'text-orange-600';
    return 'text-green-600';
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/projects/${projectId}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Terug naar project
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Begrotingen</h1>
          <p className="mt-2 text-lg text-gray-600">
            Vergelijk begroting met werkelijke kosten uit offertes
          </p>
        </div>

        {/* Budget & Offer Selector */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Selecteer begroting</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedBudgetId}
                onChange={(e) => setSelectedBudgetId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Kies een begroting...</option>
                {budgets.map(budget => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name} {budget.isBaseline && '(Baseline)'}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vergelijk met offerte (optioneel)</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedOfferId}
                onChange={(e) => setSelectedOfferId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Geen vergelijking</option>
                {offers.map(offer => (
                  <option key={offer.id} value={offer.id}>
                    {offer.title} {offer.isWinningOffer && '(Winnend contract)'}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        {budgetReport && (
          <>
            {/* Overall Summary Card */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Budget overzicht</CardTitle>
                    {getBudgetStatusBadge(budgetReport.overallStatus)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Totaal budget</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(budgetReport.totalBudgetIncl)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Werkelijke kosten</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(budgetReport.totalActualIncl)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Verschil</p>
                      <p className={`text-2xl font-bold mt-1 ${getVarianceColor(budgetReport.totalVariance)}`}>
                        {budgetReport.totalVariance < 0 ? '-' : '+'}{formatCurrency(Math.abs(budgetReport.totalVariance))}
                      </p>
                      <p className={`text-sm ${getVarianceColor(budgetReport.totalVariance)}`}>
                        {formatPercentage(budgetReport.totalVariancePercentage)}
                      </p>
                    </div>
                  </div>

                  {budgetReport.offerTitle && (
                    <p className="mt-4 text-sm text-gray-600">
                      Vergelijking met: <strong>{budgetReport.offerTitle}</strong>
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="py-6">
                  <p className="text-sm font-medium text-gray-600">Binnen budget</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {budgetReport.stats.componentsWithinBudget}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">componenten</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-6">
                  <p className="text-sm font-medium text-gray-600">Bijna op (90-100%)</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {budgetReport.stats.componentsApproachingLimit}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">componenten</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-6">
                  <p className="text-sm font-medium text-gray-600">Over budget</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {budgetReport.stats.componentsOverBudget}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">componenten</p>
                </CardContent>
              </Card>
            </div>

            {/* Warning Alerts */}
            {budgetReport.stats.componentsOverBudget > 0 && (
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>⚠️ Over budget</span>
                      <Badge variant="danger">{budgetReport.stats.componentsOverBudget}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {budgetReport.componentVariances
                        .filter(v => v.status === 'OVER_BUDGET')
                        .map(variance => (
                          <div
                            key={variance.masterComponentId}
                            className="p-4 bg-red-50 border border-red-200 rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-red-900">
                                  {variance.masterComponentCode} - {variance.masterComponentName}
                                </p>
                                <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-red-700">Budget:</p>
                                    <p className="font-medium text-red-900">{formatCurrency(variance.budgetAmountIncl)}</p>
                                  </div>
                                  <div>
                                    <p className="text-red-700">Werkelijk:</p>
                                    <p className="font-medium text-red-900">{formatCurrency(variance.actualAmountIncl)}</p>
                                  </div>
                                  <div>
                                    <p className="text-red-700">Verschil:</p>
                                    <p className="font-medium text-red-900">
                                      +{formatCurrency(variance.variance)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="danger">
                                {formatPercentage(variance.variancePercentage)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {budgetReport.stats.componentsApproachingLimit > 0 && (
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>⚡ Bijna op (90-100% gebruikt)</span>
                      <Badge variant="warning">{budgetReport.stats.componentsApproachingLimit}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {budgetReport.componentVariances
                        .filter(v => v.status === 'APPROACHING_LIMIT')
                        .map(variance => (
                          <div
                            key={variance.masterComponentId}
                            className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-orange-900">
                                  {variance.masterComponentCode} - {variance.masterComponentName}
                                </p>
                                <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-orange-700">Budget:</p>
                                    <p className="font-medium text-orange-900">{formatCurrency(variance.budgetAmountIncl)}</p>
                                  </div>
                                  <div>
                                    <p className="text-orange-700">Werkelijk:</p>
                                    <p className="font-medium text-orange-900">{formatCurrency(variance.actualAmountIncl)}</p>
                                  </div>
                                  <div>
                                    <p className="text-orange-700">Verschil:</p>
                                    <p className={`font-medium ${getVarianceColor(variance.variance)}`}>
                                      {variance.variance < 0 ? '-' : '+'}
                                      {formatCurrency(Math.abs(variance.variance))}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="warning">
                                  {Math.round((variance.actualAmountIncl / variance.budgetAmountIncl) * 100)}%
                                </Badge>
                                <p className="text-xs text-orange-700 mt-1">
                                  {formatPercentage(variance.variancePercentage)}
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

            {/* Component Variance Table */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Budget overzicht per component</CardTitle>
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
                          Budget
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Werkelijk
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
                      {budgetReport.componentVariances.map(variance => (
                        <tr key={variance.masterComponentId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {variance.masterComponentCode} - {variance.masterComponentName}
                          </td>
                          <td className="px-6 py-4">
                            {getBudgetStatusBadge(variance.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(variance.budgetAmountIncl)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {variance.actualAmountIncl > 0
                              ? formatCurrency(variance.actualAmountIncl)
                              : '-'}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${getVarianceColor(variance.variance)}`}>
                            {variance.variance === 0
                              ? '-'
                              : `${variance.variance < 0 ? '-' : '+'}${formatCurrency(Math.abs(variance.variance))}`}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${getPercentageColor(
                            variance.budgetAmountIncl > 0
                              ? (variance.actualAmountIncl / variance.budgetAmountIncl) * 100
                              : 0
                          )}`}>
                            {variance.budgetAmountIncl > 0
                              ? `${Math.round((variance.actualAmountIncl / variance.budgetAmountIncl) * 100)}%`
                              : '-'}
                          </td>
                        </tr>
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
                <li>• <strong>Binnen budget:</strong> Minder dan 90% van budget gebruikt</li>
                <li>• <strong>Bijna op:</strong> 90-100% van budget gebruikt - let op bij eventuele meerwerk</li>
                <li>• <strong>Over budget:</strong> Meer dan 100% van budget gebruikt - overleg nodig!</li>
                <li>• Negatief verschil (groen) betekent ruimte over, positief (rood) betekent tekort</li>
                <li>• Selecteer een offerte om werkelijke kosten te vergelijken</li>
              </ul>
            </div>
          </>
        )}

        {!budgetReport && !loading && selectedBudgetId && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">
                Geen budget-rapport beschikbaar
              </p>
            </CardContent>
          </Card>
        )}

        {!selectedBudgetId && !loading && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">
                Selecteer een begroting om het budget-overzicht te zien
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
