import fetch from 'cross-fetch';

export interface UnsplashImportParams {
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

export class UnsplashProvider {
  private accessKey: string | undefined;

  constructor(accessKey?: string) {
    this.accessKey = accessKey || process.env.UNSPLASH_ACCESS_KEY;
  }

  async search(params: UnsplashImportParams): Promise<ImportedImage[]> {
    if (!this.accessKey) {
      return [];
    }

    const perPage = Math.min(params.count || 10, 30);
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(params.query)}&per_page=${perPage}&client_id=${this.accessKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    const results = Array.isArray(json.results) ? json.results : [];

    return results.map((p: any) => ({
      url: p.urls?.raw || p.urls?.full || p.links?.html,
      thumbnailUrl: p.urls?.small || p.urls?.thumb,
      altText: p.alt_description || params.query,
      category: params.category,
      source: 'stock',
      sourceInfo: {
        provider: 'Unsplash',
        user: p.user?.username,
        name: p.user?.name,
        id: p.id,
      },
      tags: [params.query, params.category].filter(Boolean),
    }));
  }
}

