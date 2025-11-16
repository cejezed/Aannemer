'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/formatCurrency';
import type {
  ActualsReport,
  ProjectBudget,
  ComponentActuals,
} from '@/domain/types';

export default function ActualsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [actualsReport, setActualsReport] = useState<ActualsReport | null>(null);
  const [budgets, setBudgets] = useState<ProjectBudget[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [expandedComponentId, setExpandedComponentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBudgets() {
      try {
        const res = await fetch(`/api/projects/${projectId}/budgets`);
        const data = await res.json();
        const allBudgets = data.budgets || [];
        setBudgets(allBudgets);

        // Auto-select baseline budget
        const baselineBudget = allBudgets.find((b: ProjectBudget) => b.isBaseline);
        if (baselineBudget) {
          setSelectedBudgetId(baselineBudget.id);
        }
      } catch (error) {
        console.error('Error fetching budgets:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBudgets();
  }, [projectId]);

  useEffect(() => {
    async function fetchActualsReport() {
      if (!selectedBudgetId) {
        setActualsReport(null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/projects/${projectId}/actuals-report?budgetId=${selectedBudgetId}`
        );
        const data = await res.json();
        setActualsReport(data);
      } catch (error) {
        console.error('Error fetching actuals report:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchActualsReport();
  }, [projectId, selectedBudgetId]);

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

  const getDataSourceBadge = (source: string) => {
    switch (source) {
      case 'PERSONAL_COACH':
        return <Badge variant="success">📊 Personal Coach</Badge>;
      case 'MANUAL':
        return <Badge variant="info">📝 Handmatig</Badge>;
      case 'IMPORT':
        return <Badge variant="info">📥 Geïmporteerd</Badge>;
      default:
        return <Badge variant="default">{source}</Badge>;
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance < 0) return 'text-green-600';
    if (variance > 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/projects/${projectId}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Terug naar project
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Werkelijk vs Budget</h1>
          <p className="mt-2 text-lg text-gray-600">
            Vergelijk werkelijke kosten en uren met de begroting
          </p>
        </div>

        {/* Budget Selector */}
        <div className="mb-8">
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
        </div>

        {actualsReport && (
          <>
            {/* Data Source Info */}
            <div className="mb-8">
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-600">Data bron:</p>
                      {getDataSourceBadge(actualsReport.dataSource)}
                    </div>
                    <p className="text-sm text-gray-500">
                      Laatst bijgewerkt: {new Date(actualsReport.lastUpdated).toLocaleString('nl-NL')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Overall Summary Card */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Totaaloverzicht</CardTitle>
                    {getBudgetStatusBadge(actualsReport.budgetReport.overallStatus)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Budget</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(actualsReport.budgetReport.totalBudgetIncl)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Werkelijk</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(actualsReport.totalActualCostIncl)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Verschil</p>
                      <p className={`text-2xl font-bold mt-1 ${getVarianceColor(actualsReport.budgetReport.totalVariance)}`}>
                        {actualsReport.budgetReport.totalVariance < 0 ? '-' : '+'}
                        {formatCurrency(Math.abs(actualsReport.budgetReport.totalVariance))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Totaal uren</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        {actualsReport.totalActualHours.toFixed(1)} u
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="py-6">
                  <p className="text-sm font-medium text-gray-600">Binnen budget</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {actualsReport.budgetReport.stats.componentsWithinBudget}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">componenten</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-6">
                  <p className="text-sm font-medium text-gray-600">Bijna op</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {actualsReport.budgetReport.stats.componentsApproachingLimit}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">componenten</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-6">
                  <p className="text-sm font-medium text-gray-600">Over budget</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {actualsReport.budgetReport.stats.componentsOverBudget}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">componenten</p>
                </CardContent>
              </Card>
            </div>

            {/* Component Detail Table */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Details per component</CardTitle>
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
                          Uren
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Verschil
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {actualsReport.budgetReport.componentVariances.map(variance => {
                        const actualData = actualsReport.actualsByComponent.find(
                          a => a.masterComponentId === variance.masterComponentId
                        );

                        return (
                          <>
                            <tr
                              key={variance.masterComponentId}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() =>
                                setExpandedComponentId(
                                  expandedComponentId === variance.masterComponentId
                                    ? null
                                    : variance.masterComponentId
                                )
                              }
                            >
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {variance.masterComponentCode} - {variance.masterComponentName}
                              </td>
                              <td className="px-6 py-4">
                                {getBudgetStatusBadge(variance.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {formatCurrency(variance.budgetAmountIncl)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                {formatCurrency(variance.actualAmountIncl)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right">
                                {actualData ? `${actualData.actualHours.toFixed(1)} u` : '-'}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${getVarianceColor(variance.variance)}`}>
                                {variance.variance === 0
                                  ? '-'
                                  : `${variance.variance < 0 ? '-' : '+'}${formatCurrency(Math.abs(variance.variance))}`}
                              </td>
                            </tr>

                            {/* Expanded Detail Row */}
                            {expandedComponentId === variance.masterComponentId && actualData && (
                              <tr>
                                <td colSpan={6} className="px-6 py-4 bg-blue-50">
                                  <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900">Urenregistratie</h4>
                                    {actualData.entries.hourEntries.length > 0 ? (
                                      <table className="min-w-full text-sm">
                                        <thead>
                                          <tr className="border-b border-blue-200">
                                            <th className="text-left py-2">Medewerker</th>
                                            <th className="text-right py-2">Uren</th>
                                            <th className="text-right py-2">Tarief</th>
                                            <th className="text-right py-2">Totaal</th>
                                            <th className="text-left py-2 pl-4">Datum</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {actualData.entries.hourEntries.map(entry => (
                                            <tr key={entry.id} className="border-b border-blue-100">
                                              <td className="py-2">{entry.workerName}</td>
                                              <td className="text-right">{entry.hours} u</td>
                                              <td className="text-right">{formatCurrency(entry.hourlyRate)}/u</td>
                                              <td className="text-right font-medium">
                                                {formatCurrency(entry.hours * entry.hourlyRate)}
                                              </td>
                                              <td className="pl-4">
                                                {new Date(entry.date).toLocaleDateString('nl-NL')}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    ) : (
                                      <p className="text-gray-500 text-sm italic">Geen urenregistraties</p>
                                    )}

                                    <h4 className="font-medium text-gray-900 mt-4">Kostenposten</h4>
                                    {actualData.entries.costEntries.length > 0 ? (
                                      <table className="min-w-full text-sm">
                                        <thead>
                                          <tr className="border-b border-blue-200">
                                            <th className="text-left py-2">Omschrijving</th>
                                            <th className="text-left py-2">Type</th>
                                            <th className="text-left py-2">Leverancier</th>
                                            <th className="text-right py-2">Bedrag</th>
                                            <th className="text-left py-2 pl-4">Datum</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {actualData.entries.costEntries.map(entry => (
                                            <tr key={entry.id} className="border-b border-blue-100">
                                              <td className="py-2">{entry.description}</td>
                                              <td>{entry.costType}</td>
                                              <td>{entry.supplier || '-'}</td>
                                              <td className="text-right font-medium">
                                                {formatCurrency(entry.amountIncl)}
                                              </td>
                                              <td className="pl-4">
                                                {new Date(entry.date).toLocaleDateString('nl-NL')}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    ) : (
                                      <p className="text-gray-500 text-sm italic">Geen kostenposten</p>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            {/* Legend */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Informatie</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Personal Coach:</strong> Data automatisch gesynchroniseerd vanuit Personal Coach app</li>
                <li>• <strong>Handmatig:</strong> Data handmatig ingevoerd in dit systeem</li>
                <li>• <strong>Geïmporteerd:</strong> Data geïmporteerd vanuit externe bron (Excel, CSV)</li>
                <li>• Klik op een rij om gedetailleerde uren en kosten te zien</li>
                <li>• Negatief verschil (groen) betekent onder budget, positief (rood) over budget</li>
              </ul>
            </div>
          </>
        )}

        {!actualsReport && !loading && selectedBudgetId && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">
                Geen actuals-rapport beschikbaar
              </p>
            </CardContent>
          </Card>
        )}

        {!selectedBudgetId && !loading && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">
                Selecteer een begroting om werkelijke kosten te zien
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
