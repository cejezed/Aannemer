'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/formatCurrency';
import type { MasterComponent, Offer, ComponentOfferAggregation } from '@/domain/types';

interface OfferAggregation {
  offerId: string;
  aggregations: ComponentOfferAggregation[];
}

export default function StructurePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [masterComponents, setMasterComponents] = useState<MasterComponent[]>([]);
  const [aggregationsByOffer, setAggregationsByOffer] = useState<OfferAggregation[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/projects/${projectId}/structure`);
        const data = await res.json();

        setMasterComponents(data.masterComponents || []);
        setAggregationsByOffer(data.aggregationsByOffer || []);
        setOffers(data.offers || []);
      } catch (error) {
        console.error('Error fetching structure:', error);
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

  // Build a map for quick lookup: componentId -> offerId -> aggregate
  const aggregateMap = new Map<string, Map<string, ComponentOfferAggregation>>();
  for (const offerAgg of aggregationsByOffer) {
    for (const agg of offerAgg.aggregations) {
      if (!aggregateMap.has(agg.masterComponentId)) {
        aggregateMap.set(agg.masterComponentId, new Map());
      }
      aggregateMap.get(agg.masterComponentId)!.set(offerAgg.offerId, agg);
    }
  }

  // Filter only leaf components (the actual work items)
  const leafComponents = masterComponents.filter(c => c.isLeaf);

  // Build component hierarchy for display (parent sections)
  const componentsByParent = new Map<string | null, MasterComponent[]>();
  for (const comp of masterComponents) {
    const parent = comp.parentId || null;
    if (!componentsByParent.has(parent)) {
      componentsByParent.set(parent, []);
    }
    componentsByParent.get(parent)!.push(comp);
  }

  // Sort components
  const sortedRootComponents = (componentsByParent.get(null) || []).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  // Render tree recursively
  const renderComponentTree = (component: MasterComponent, depth = 0): JSX.Element[] => {
    const elements: JSX.Element[] = [];

    if (component.isLeaf) {
      // Leaf component - show data row
      const offerData = aggregateMap.get(component.id) || new Map();

      elements.push(
        <tr key={component.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 text-sm font-medium text-gray-900" style={{ paddingLeft: `${depth * 1.5 + 1.5}rem` }}>
            {component.code} - {component.name}
          </td>
          {offers.map(offer => {
            const agg = offerData.get(offer.id);
            const totalAmount = agg ? agg.totalVastIncl + agg.totalStelpostIncl + agg.totalIndicatieIncl : 0;

            if (!agg || totalAmount === 0) {
              return (
                <td key={offer.id} className="px-6 py-4 text-sm text-gray-400 text-right">
                  -
                </td>
              );
            }

            return (
              <td key={offer.id} className="px-6 py-4 text-sm text-gray-900 text-right">
                <div className="space-y-1">
                  <div className="font-medium">{formatCurrency(totalAmount)}</div>
                  {agg.lineCount > 0 && (
                    <div className="text-xs text-gray-500">
                      {agg.lineCount} {agg.lineCount === 1 ? 'post' : 'posten'}
                    </div>
                  )}
                  {agg.totalStelpostIncl > 0 && (
                    <Badge variant="warning" className="text-xs">
                      {formatCurrency(agg.totalStelpostIncl)} stelpost
                    </Badge>
                  )}
                </div>
              </td>
            );
          })}
        </tr>
      );
    } else {
      // Non-leaf component - show header row
      elements.push(
        <tr key={component.id} className="bg-gray-100">
          <td
            colSpan={offers.length + 1}
            className="px-6 py-3 text-sm font-bold text-gray-700"
            style={{ paddingLeft: `${depth * 1.5 + 1.5}rem` }}
          >
            {component.code} - {component.name}
          </td>
        </tr>
      );

      // Recurse children
      const children = (componentsByParent.get(component.id) || []).sort(
        (a, b) => a.sortOrder - b.sortOrder
      );
      for (const child of children) {
        elements.push(...renderComponentTree(child, depth + 1));
      }
    }

    return elements;
  };

  // Calculate totals per offer
  const offerTotals = offers.map(offer => {
    const offerAgg = aggregationsByOffer.find(a => a.offerId === offer.id);
    const total = offerAgg?.aggregations.reduce(
      (sum, agg) => sum + agg.totalVastIncl + agg.totalStelpostIncl + agg.totalIndicatieIncl,
      0
    ) || 0;
    const allowances = offerAgg?.aggregations.reduce(
      (sum, agg) => sum + agg.totalStelpostIncl,
      0
    ) || 0;
    const lineCount = offerAgg?.aggregations.reduce((sum, agg) => sum + agg.lineCount, 0) || 0;

    return { offer, total, allowances, lineCount };
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/projects/${projectId}`} className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Terug naar project
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Structuur & Dekking</h1>
          <p className="mt-2 text-lg text-gray-600">
            Overzicht van alle bouwonderdelen met prijzen per aannemer
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {offerTotals.map(({ offer, total, allowances, lineCount }) => (
            <Card key={offer.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {offer.title}
                  {offer.isWinningOffer && (
                    <Badge variant="success" className="ml-2">Winnend</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Totaal gedekt</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</p>
                  </div>
                  {allowances > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Waarvan stelposten</p>
                      <p className="text-lg font-medium text-orange-600">{formatCurrency(allowances)}</p>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      {lineCount} posten toegewezen
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Structure Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bouwstructuur met prijsvergelijking</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Component
                    </th>
                    {offers.map(offer => (
                      <th key={offer.id} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {offer.title}
                        {offer.isWinningOffer && <span className="ml-1">★</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRootComponents.flatMap(comp => renderComponentTree(comp))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Legenda</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Bedragen zijn inclusief BTW zoals opgegeven in de offerte</li>
            <li>• Stelposten worden apart weergegeven met een oranje badge</li>
            <li>• &quot;-&quot; betekent dat er geen posten aan dit onderdeel zijn gekoppeld</li>
            <li>• ★ markeert de winnende offerte (geselecteerd contract)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
