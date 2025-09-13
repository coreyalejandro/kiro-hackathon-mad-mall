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
    return Array.from({ length: n }).map((_, idx) => {
      const seed = `${encodeURIComponent(params.category)}-${idx}`;
      return {
        url: `https://placehold.co/1200x800/000000/FFFFFF.png?text=Black+Woman+${idx + 1}`,
        altText: `Culturally appropriate placeholder for ${params.category}`,
        category: params.category,
        source: 'placeholder',
        sourceInfo: { provider: 'placeholder', seed },
        tags: [params.category, 'black_woman', 'placeholder'],
        thumbnailUrl: `https://placehold.co/600x400/000000/FFFFFF.png?text=Black+Woman+${idx + 1}`,
      };
    });
  }
}

