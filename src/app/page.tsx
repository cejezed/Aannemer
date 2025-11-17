'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { Project } from '@/domain/types';

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const data = await response.json();
      setFormData({ name: '', location: '' });
      setShowNewProjectForm(false);
      await fetchProjects();

      // Navigate to the new project
      router.push(`/projects/${data.project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Fout bij aanmaken project. Zorg dat Supabase is geconfigureerd');
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Offerte Vergelijking</h1>
            <p className="mt-2 text-lg text-gray-600">
              Aannemersoffertes structureren en eerlijk vergelijken
            </p>
          </div>
          <button
            onClick={() => setShowNewProjectForm(!showNewProjectForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
          >
            {showNewProjectForm ? 'Annuleren' : '+ Nieuw Project'}
          </button>
        </div>

        {showNewProjectForm && (
          <div className="mb-8 p-6 border border-gray-300 rounded bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-4">Nieuw Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Projectnaam *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="bijv. Nieuwbouw Villa Amstelveen"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Locatie
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="bijv. Amstelveen"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? 'Aanmaken...' : 'Project Aanmaken'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewProjectForm(false);
                    setFormData({ name: '', location: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Annuleren
                </button>
              </div>
            </form>
          </div>
        )}


        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Projecten laden...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {projects.map(project => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.location && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Locatie:</span> {project.location}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Aangemaakt: {new Date(project.createdAt).toLocaleDateString('nl-NL')}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-gray-500">Geen projecten gevonden</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
