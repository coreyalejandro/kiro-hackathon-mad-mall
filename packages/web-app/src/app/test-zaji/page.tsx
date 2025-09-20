'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function TestZajiPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: 'culturally-sensitive'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImage(data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'A diverse group of people meditating in a peaceful garden',
    'African American woman practicing yoga at sunrise',
    'Community wellness center with people of different backgrounds',
    'Therapeutic art session with multicultural participants',
    'Peaceful meditation space with cultural elements'
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="text-purple-600" />
          TitanEngine Image Generation Test
        </h1>
        <p className="text-gray-600">
          Test the AI-powered, culturally-sensitive image generation
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Generate Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              Image Prompt
            </label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Sample Prompts:</p>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(sample)}
                  disabled={loading}
                  className="text-xs"
                >
                  {sample.substring(0, 30)}...
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={generateImage}
            disabled={loading || !prompt.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Image...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-800">
              <h3 className="font-semibold mb-2">Error</h3>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedImage && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <img
                src={generatedImage.url}
                alt={generatedImage.altText}
                className="w-full h-auto"
              />
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <strong>Alt Text:</strong> {generatedImage.altText}
              </div>
              <div>
                <strong>Original Prompt:</strong> {generatedImage.metadata.originalPrompt}
              </div>
              <div>
                <strong>Enhanced Prompt:</strong> {generatedImage.metadata.prompt}
              </div>
              <div>
                <strong>Style:</strong> {generatedImage.metadata.style}
              </div>
              <div>
                <strong>Generator:</strong> {generatedImage.metadata.generator}
              </div>
              <div>
                <strong>Model:</strong> {generatedImage.metadata.modelId}
              </div>
              <div>
                <strong>Generated At:</strong> {new Date(generatedImage.metadata.generatedAt).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}