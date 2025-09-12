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
export declare class PlaceholderProvider {
    generate(params: PlaceholderParams): Promise<ImportedImage[]>;
}
