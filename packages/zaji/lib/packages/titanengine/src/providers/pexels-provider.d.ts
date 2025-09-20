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
export declare class PexelsProvider {
    private apiKey;
    constructor(apiKey?: string);
    search(params: PexelsImportParams): Promise<ImportedImage[]>;
}
