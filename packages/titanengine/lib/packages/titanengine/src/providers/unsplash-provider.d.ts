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
export declare class UnsplashProvider {
    private accessKey;
    constructor(accessKey?: string);
    search(params: UnsplashImportParams): Promise<ImportedImage[]>;
}
