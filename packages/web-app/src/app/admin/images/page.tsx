'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminImagesPage() {
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const generateSiteImages = async () => {
    setGenerating(true);
    try {
      // Generate images for all sections
      const sections = ['concourse', 'circles', 'comedy', 'stories', 'marketplace'];

      for (const section of sections) {
        const response = await fetch('/api/images/generate-for-site', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section, count: 2 })
        });

        const data = await response.json();
        console.log(`Generated images for ${section}:`, data);
      }

      // Get all approved images
      const approvedResponse = await fetch('/api/images/approve');
      const approvedData = await approvedResponse.json();
      setResults(approvedData);

    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Site Image Management</h1>

      <div className="space-y-6">
        <Button
          onClick={generateSiteImages}
          disabled={generating}
          className="w-full h-12 text-lg"
        >
          {generating ? 'Generating Site Images...' : 'Generate Images for All Site Sections'}
        </Button>

        {results && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Approved Images ({results.total})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.approvedImages.map((img: any) => (
                <div key={img.id} className="border rounded-lg p-4">
                  <img src={img.url} alt={img.altText} className="w-full h-48 object-cover rounded mb-2" />
                  <p className="font-semibold">{img.category}</p>
                  <p className="text-sm text-gray-600">{img.altText}</p>
                  <p className="text-xs text-green-600">Approved: {new Date(img.approvedAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}