'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Offer } from '@/domain/types';

export default function UploadOfferPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const offerId = params.offerId as string;

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    linesCreated?: number;
    warnings?: string[];
    error?: string;
  } | null>(null);

  useEffect(() => {
    async function loadOffer() {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${projectId}/offers`);
        if (!res.ok) throw new Error('Failed to fetch offers');

        const data = await res.json();
        const currentOffer = data.offers?.find((o: any) => o.id === offerId);

        if (!currentOffer) {
          throw new Error('Offer not found');
        }

        setOffer(currentOffer);
      } catch (error) {
        console.error('Error loading offer:', error);
        alert('Fout bij laden offerte');
      } finally {
        setLoading(false);
      }
    }

    loadOffer();
  }, [projectId, offerId]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setUploadResult(null);
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      alert('Selecteer eerst een bestand');
      return;
    }

    setUploading(true);
    setUploadProgress('Bestand uploaden...');
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      setUploadProgress('AI analyseert offerte...');

      const response = await fetch(`/api/offers/${offerId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      setUploadResult({
        success: true,
        linesCreated: result.linesCreated,
        warnings: result.warnings,
      });

      setUploadProgress('');
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      });
      setUploadProgress('');
    } finally {
      setUploading(false);
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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/projects/${projectId}/offers`}
          className="text-blue-600 hover:underline"
        >
          ← Terug naar offertes
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Offerte Uploaden</h1>
        <p className="text-gray-600">
          Offerte: <span className="font-semibold">{offer.title}</span>
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Upload een offertebestand (PDF, Word, of Excel). AI zal automatisch alle regels extraheren.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="font-semibold text-blue-900 mb-2">📋 Hoe werkt het?</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Selecteer een offertebestand (PDF, DOCX, of XLSX)</li>
          <li>Klik op &quot;Analyseren & Uploaden&quot;</li>
          <li>AI extraheert automatisch alle posten, stelposten, en bedragen</li>
          <li>Ga daarna naar de &quot;Onverdeeld&quot; tab om regels te mappen</li>
        </ol>
      </div>

      <div className="border border-gray-300 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Bestand Selecteren</h2>

        <div className="mb-4">
          <label
            htmlFor="file-input"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Offertebestand
          </label>
          <input
            id="file-input"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileSelect}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            Ondersteunde formaten: PDF, Word (.docx), Excel (.xlsx)
          </p>
        </div>

        {selectedFile && (
          <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm">
              <span className="font-medium">Geselecteerd bestand:</span>{' '}
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Grootte: {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        )}

        {uploadProgress && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
              <p className="text-sm text-yellow-800">{uploadProgress}</p>
            </div>
          </div>
        )}

        {uploadResult && (
          <div
            className={`mb-4 p-4 rounded border ${
              uploadResult.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            {uploadResult.success ? (
              <>
                <p className="font-semibold text-green-900 mb-2">
                  ✓ Upload geslaagd!
                </p>
                <p className="text-sm text-green-800">
                  <span className="font-medium">{uploadResult.linesCreated}</span> regels
                  automatisch toegevoegd.
                </p>
                {uploadResult.warnings && uploadResult.warnings.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs font-medium text-yellow-900 mb-1">Waarschuwingen:</p>
                    <ul className="list-disc list-inside text-xs text-yellow-800">
                      {uploadResult.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/projects/${projectId}/onverdeeld`}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    → Naar Onverdeeld (Regels Mappen)
                  </Link>
                  <button
                    onClick={() => setUploadResult(null)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    Nog een bestand uploaden
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="font-semibold text-red-900 mb-2">✗ Upload mislukt</p>
                <p className="text-sm text-red-800">{uploadResult.error}</p>
                <button
                  onClick={() => setUploadResult(null)}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Opnieuw proberen
                </button>
              </>
            )}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {uploading ? 'Bezig met analyseren...' : '🔍 Analyseren & Uploaden'}
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">💡 Tips voor beste resultaten:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>Gebruik bij voorkeur het originele offertebestand van de aannemer</li>
          <li>PDF-bestanden met duidelijke tabellen werken het beste</li>
          <li>Excel-bestanden met één offerte per sheet</li>
          <li>Word-documenten met gestructureerde posten</li>
          <li>AI herkent automatisch stelposten en indicaties</li>
        </ul>
      </div>
    </div>
  );
}
