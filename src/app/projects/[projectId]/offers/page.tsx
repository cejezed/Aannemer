'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Offer, Contractor } from '@/domain/types';

type EnrichedOffer = Offer & {
  contractorName: string;
  lineCount: number;
};

export default function OffersPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [offers, setOffers] = useState<EnrichedOffer[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewOfferForm, setShowNewOfferForm] = useState(false);
  const [showNewContractorForm, setShowNewContractorForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [offerFormData, setOfferFormData] = useState({
    contractorId: '',
    title: '',
    pricingModel: 'ONBEKEND' as const,
    sourceTotalIncl: '',
  });

  const [contractorFormData, setContractorFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [offersRes, contractorsRes] = await Promise.all([
          fetch(`/api/projects/${projectId}/offers`),
          fetch('/api/contractors'),
        ]);

        if (!offersRes.ok || !contractorsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const offersData = await offersRes.json();
        const contractorsData = await contractorsRes.json();

        setOffers(offersData.offers || []);
        setContractors(contractorsData.contractors || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Fout bij ophalen data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId]);

  async function fetchData() {
    setLoading(true);
    try {
      const [offersRes, contractorsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/offers`),
        fetch('/api/contractors'),
      ]);

      if (!offersRes.ok || !contractorsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const offersData = await offersRes.json();
      const contractorsData = await contractorsRes.json();

      setOffers(offersData.offers || []);
      setContractors(contractorsData.contractors || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Fout bij ophalen data');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateContractor(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractorFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to create contractor');
      }

      const newContractor = await response.json();
      setContractors([...contractors, newContractor]);
      setOfferFormData({ ...offerFormData, contractorId: newContractor.id });
      setContractorFormData({ name: '', contactName: '', email: '', phone: '' });
      setShowNewContractorForm(false);
    } catch (error) {
      console.error('Error creating contractor:', error);
      alert('Fout bij aanmaken aannemer');
    } finally {
      setCreating(false);
    }
  }

  async function handleCreateOffer(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...offerFormData,
          sourceTotalIncl: offerFormData.sourceTotalIncl
            ? parseFloat(offerFormData.sourceTotalIncl)
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create offer');
      }

      const data = await response.json();
      setOfferFormData({
        contractorId: '',
        title: '',
        pricingModel: 'ONBEKEND',
        sourceTotalIncl: '',
      });
      setShowNewOfferForm(false);
      await fetchData();

      // Navigate to the offer to add lines
      router.push(`/projects/${projectId}/offers/${data.offer.id}/edit`);
    } catch (error) {
      console.error('Error creating offer:', error);
      alert('Fout bij aanmaken offerte. Zorg dat Supabase is geconfigureerd');
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline">
            ← Terug naar project
          </Link>
        </div>
        <div>Laden...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline">
          ← Terug naar project
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Offertes</h1>
        <button
          onClick={() => setShowNewOfferForm(!showNewOfferForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showNewOfferForm ? 'Annuleren' : '+ Nieuwe Offerte'}
        </button>
      </div>

      {showNewOfferForm && (
        <div className="mb-8 p-6 border border-gray-300 rounded bg-gray-50">
          <h2 className="text-xl font-bold mb-4">Nieuwe Offerte</h2>
          <form onSubmit={handleCreateOffer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Aannemer *
              </label>
              <div className="flex gap-2">
                <select
                  value={offerFormData.contractorId}
                  onChange={(e) =>
                    setOfferFormData({ ...offerFormData, contractorId: e.target.value })
                  }
                  required
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">-- Selecteer aannemer --</option>
                  {contractors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewContractorForm(true)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  + Nieuwe Aannemer
                </button>
              </div>
            </div>

            {showNewContractorForm && (
              <div className="p-4 border border-blue-300 rounded bg-blue-50">
                <h3 className="font-bold mb-3">Nieuwe Aannemer</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Bedrijfsnaam *</label>
                    <input
                      type="text"
                      value={contractorFormData.name}
                      onChange={(e) =>
                        setContractorFormData({ ...contractorFormData, name: e.target.value })
                      }
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contactpersoon</label>
                    <input
                      type="text"
                      value={contractorFormData.contactName}
                      onChange={(e) =>
                        setContractorFormData({
                          ...contractorFormData,
                          contactName: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={contractorFormData.email}
                      onChange={(e) =>
                        setContractorFormData({ ...contractorFormData, email: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Telefoon</label>
                    <input
                      type="tel"
                      value={contractorFormData.phone}
                      onChange={(e) =>
                        setContractorFormData({ ...contractorFormData, phone: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateContractor}
                      disabled={creating || !contractorFormData.name}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {creating ? 'Aanmaken...' : 'Aannemer Toevoegen'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewContractorForm(false);
                        setContractorFormData({ name: '', contactName: '', email: '', phone: '' });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Offerte Titel *
              </label>
              <input
                type="text"
                value={offerFormData.title}
                onChange={(e) =>
                  setOfferFormData({ ...offerFormData, title: e.target.value })
                }
                required
                placeholder="bijv. Offerte Ruwbouw - 15 jan 2024"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Prijsmodel
              </label>
              <select
                value={offerFormData.pricingModel}
                onChange={(e) =>
                  setOfferFormData({
                    ...offerFormData,
                    pricingModel: e.target.value as any,
                  })
                }
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="ONBEKEND">Onbekend</option>
                <option value="EXCL_OPSLAGEN">Excl. opslagen</option>
                <option value="INCL_OPSLAGEN">Incl. opslagen</option>
                <option value="MIXED">Gemengd</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Totaal Bedrag (incl. BTW)
              </label>
              <input
                type="number"
                step="0.01"
                value={offerFormData.sourceTotalIncl}
                onChange={(e) =>
                  setOfferFormData({ ...offerFormData, sourceTotalIncl: e.target.value })
                }
                placeholder="optioneel - totaalbedrag uit offerte"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? 'Aanmaken...' : 'Offerte Aanmaken'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewOfferForm(false);
                  setOfferFormData({
                    contractorId: '',
                    title: '',
                    pricingModel: 'ONBEKEND',
                    sourceTotalIncl: '',
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}

      {offers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">Nog geen offertes.</p>
          <p>Klik op &quot;Nieuwe Offerte&quot; om de eerste offerte toe te voegen.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="border border-gray-300 rounded p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{offer.title}</h3>
                  <p className="text-gray-600">{offer.contractorName}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <span>Prijsmodel: {offer.pricingModel}</span>
                    {offer.sourceTotalIncl && (
                      <span className="ml-4">
                        Totaal: € {offer.sourceTotalIncl.toLocaleString('nl-NL')}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-400">
                    {offer.lineCount} regels
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/projects/${projectId}/offers/${offer.id}/edit`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Regels Toevoegen
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
