'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Offer, OfferLine, PriceType } from '@/domain/types';

export default function EditOfferLinesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const offerId = params.offerId as string;

  const [offer, setOffer] = useState<Offer | null>(null);
  const [lines, setLines] = useState<OfferLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    priceType: 'VAST' as PriceType,
    totalPriceIncl: '',
    quantity: '',
    unit: '',
    code: '',
    isAllowance: false,
    clarification: '',
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Get offer details
        const offerRes = await fetch(`/api/projects/${projectId}/offers`);
        if (!offerRes.ok) throw new Error('Failed to fetch offer');

        const offersData = await offerRes.json();
        const currentOffer = offersData.offers?.find((o: any) => o.id === offerId);

        if (!currentOffer) {
          throw new Error('Offer not found');
        }

        setOffer(currentOffer);

        // Get offer lines (we need the revision ID first)
        // For now, we'll use the first/contract revision
        const revisionsRes = await fetch(`/api/projects/${projectId}/offers/${offerId}/revisions`);
        if (revisionsRes.ok) {
          const revisionsData = await revisionsRes.json();
          const contractRevision = revisionsData.revisions?.find((r: any) => r.label === 'Contract');

          if (contractRevision) {
            const linesRes = await fetch(
              `/api/offers/${offerId}/revisions/${contractRevision.id}/lines`
            );
            if (linesRes.ok) {
              const linesData = await linesRes.json();
              setLines(linesData.lines || []);
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Fout bij laden. Zorg dat Supabase is geconfigureerd.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [projectId, offerId]);

  async function handleAddLine(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      // Get contract revision
      const revisionsRes = await fetch(`/api/projects/${projectId}/offers/${offerId}/revisions`);
      if (!revisionsRes.ok) throw new Error('Failed to fetch revisions');

      const revisionsData = await revisionsRes.json();
      const contractRevision = revisionsData.revisions?.find((r: any) => r.label === 'Contract');

      if (!contractRevision) {
        throw new Error('Contract revision not found');
      }

      const response = await fetch(
        `/api/offers/${offerId}/revisions/${contractRevision.id}/lines`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: formData.description,
            priceType: formData.priceType,
            totalPriceIncl: formData.totalPriceIncl ? parseFloat(formData.totalPriceIncl) : undefined,
            quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
            unit: formData.unit || undefined,
            code: formData.code || undefined,
            isAllowance: formData.isAllowance,
            clarification: formData.clarification || undefined,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create line');
      }

      const newLine = await response.json();
      setLines([...lines, newLine]);

      // Reset form
      setFormData({
        description: '',
        priceType: 'VAST',
        totalPriceIncl: '',
        quantity: '',
        unit: '',
        code: '',
        isAllowance: false,
        clarification: '',
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding line:', error);
      alert('Fout bij toevoegen regel');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Link
            href={`/projects/${projectId}/offers`}
            className="text-blue-600 hover:underline"
          >
            ← Terug naar offertes
          </Link>
        </div>
        <div>Laden...</div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Link
            href={`/projects/${projectId}/offers`}
            className="text-blue-600 hover:underline"
          >
            ← Terug naar offertes
          </Link>
        </div>
        <div className="text-red-500">Offerte niet gevonden</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/projects/${projectId}/offers`}
          className="text-blue-600 hover:underline"
        >
          ← Terug naar offertes
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Offerteregels Invoeren</h1>
        <p className="text-gray-600">
          Offerte: {offer.title}
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Regels ({lines.length})
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showAddForm ? 'Annuleren' : '+ Regel Toevoegen'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 p-6 border border-gray-300 rounded bg-gray-50">
          <h3 className="text-lg font-bold mb-4">Nieuwe Regel</h3>
          <form onSubmit={handleAddLine} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Omschrijving *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={2}
                  placeholder="Bijv: Fundering storten inclusief bekisting"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Type Prijs
                </label>
                <select
                  value={formData.priceType}
                  onChange={(e) =>
                    setFormData({ ...formData, priceType: e.target.value as PriceType })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="VAST">Vaste prijs</option>
                  <option value="STELPOST">Stelpost</option>
                  <option value="INDICATIE">Indicatie</option>
                  <option value="NOG">Nader overeen te komen</option>
                  <option value="ONBEKEND">Onbekend</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Totaalprijs (incl. BTW) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalPriceIncl}
                  onChange={(e) =>
                    setFormData({ ...formData, totalPriceIncl: e.target.value })
                  }
                  required
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Hoeveelheid
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  placeholder="bijv. 50"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Eenheid
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="bijv. m², stuks, uur"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="bijv. 21.10.0010"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isAllowance}
                    onChange={(e) =>
                      setFormData({ ...formData, isAllowance: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Dit is een stelpost</span>
                </label>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Toelichting
                </label>
                <textarea
                  value={formData.clarification}
                  onChange={(e) =>
                    setFormData({ ...formData, clarification: e.target.value })
                  }
                  rows={2}
                  placeholder="Optionele toelichting bij deze regel"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Opslaan...' : 'Regel Toevoegen'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}

      {lines.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border border-gray-300 rounded">
          <p className="text-lg mb-2">Nog geen regels toegevoegd.</p>
          <p>Klik op &quot;Regel Toevoegen&quot; om de eerste regel in te voeren.</p>
        </div>
      ) : (
        <div className="border border-gray-300 rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">#</th>
                <th className="text-left px-4 py-3 font-semibold">Omschrijving</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-right px-4 py-3 font-semibold">Prijs</th>
                <th className="text-right px-4 py-3 font-semibold">Aantal</th>
                <th className="text-left px-4 py-3 font-semibold">Eenheid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lines.map((line, idx) => (
                <tr key={line.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{line.description}</div>
                    {line.code && (
                      <div className="text-sm text-gray-500">{line.code}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        line.priceType === 'STELPOST'
                          ? 'bg-yellow-100 text-yellow-800'
                          : line.priceType === 'VAST'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {line.priceType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {line.totalPriceIncl
                      ? `€ ${line.totalPriceIncl.toLocaleString('nl-NL', {
                          minimumFractionDigits: 2,
                        })}`
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {line.quantity || '-'}
                  </td>
                  <td className="px-4 py-3">{line.unit || '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-4 py-3 font-semibold">
                  Totaal
                </td>
                <td className="px-4 py-3 text-right font-semibold font-mono">
                  € {lines
                    .reduce((sum, line) => sum + (line.totalPriceIncl || 0), 0)
                    .toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <Link
          href={`/projects/${projectId}/offers`}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Klaar
        </Link>
        {lines.length >= 2 && (
          <Link
            href={`/projects/${projectId}/onverdeeld`}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Naar Mapping (Onverdeeld) →
          </Link>
        )}
      </div>
    </div>
  );
}
