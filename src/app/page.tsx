'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { Project } from '@/domain/types';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
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

    fetchProjects();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Offerte Vergelijking</h1>
          <p className="mt-2 text-lg text-gray-600">
            Aannemersoffertes structureren en eerlijk vergelijken
          </p>
        </div>

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
