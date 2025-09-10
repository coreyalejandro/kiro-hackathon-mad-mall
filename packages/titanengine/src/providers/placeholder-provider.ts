export interface PlaceholderParams {
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

export class PlaceholderProvider {
  async generate(params: PlaceholderParams): Promise<ImportedImage[]> {
    const n = params.count ?? 3;
    return Array.from({ length: n }).map((_, idx) => ({
      url: `https://picsum.photos/seed/${encodeURIComponent(params.category)}-${idx}/1200/800`,
      altText: `${params.category} placeholder`,
      category: params.category,
      source: 'stock',
      sourceInfo: { provider: 'placeholder' },
      tags: [params.category],
      thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(params.category)}-${idx}/600/400`,
    }));
  }
}

