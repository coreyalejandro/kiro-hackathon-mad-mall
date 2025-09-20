import fetch from 'cross-fetch';

export interface PexelsImportParams {
  query: string;
  category: string;
  count?: number;
}

export interface ImportedImage {
  url: string;
  altText: string;
  category: string;
  source: string;
  sourceInfo?: Record<string, any>;
  tags?: string[];
  thumbnailUrl?: string;
}

export class PexelsProvider {
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PEXELS_API_KEY;
  }

  async search(params: PexelsImportParams): Promise<ImportedImage[]> {
    if (!this.apiKey) {
      return [];
    }

    const perPage = Math.min(params.count || 10, 80);
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(params.query)}&per_page=${perPage}`;

    const res = await fetch(url, {
      headers: {
        Authorization: this.apiKey,
      },
    });

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    const photos = Array.isArray(json.photos) ? json.photos : [];

    return photos.map((p: any) => ({
      url: p.src?.original || p.url,
      thumbnailUrl: p.src?.medium || p.src?.small,
      altText: p.alt || params.query,
      category: params.category,
      source: 'stock',
      sourceInfo: {
        provider: 'Pexels',
        photographer: p.photographer,
        photographer_url: p.photographer_url,
        id: p.id,
      },
      tags: [params.query, params.category].filter(Boolean),
    }));
  }
}

