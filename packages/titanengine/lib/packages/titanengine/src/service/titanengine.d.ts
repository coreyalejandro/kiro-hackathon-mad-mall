import { TitanEvent } from './services';
interface TitanEngineConfig {
    region?: string;
    tableName?: string;
    endpoint?: string;
}
export declare class TitanEngine {
    private dynamo;
    private images;
    private pexels;
    private unsplash;
    private placeholder;
    private a1111;
    private bedrock;
    private culturalAgent;
    private dspy;
    private kcache;
    private eventCache;
    private analytics;
    constructor(config: TitanEngineConfig);
    private initializeDynamoDBService;
    static createDefault(): TitanEngine;
    importFromPexels(params: {
        query: string;
        category: string;
        count?: number;
    }): Promise<any[]>;
    importFromUnsplash(params: {
        query: string;
        category: string;
        count?: number;
    }): Promise<any[]>;
    importPlaceholder(params: {
        category: string;
        count?: number;
    }): Promise<any[]>;
    private importImages;
    private createImagesFromResults;
    validateImageContent(image: {
        url: string;
        altText: string;
        category: string;
        imageId?: string;
    }): Promise<{
        isAppropriate: any;
        cultural: any;
        sensitivity: any;
        inclusivity: any;
        issues: any;
        validator: string;
    }>;
    recordEvent(event: TitanEvent): Promise<void>;
    getEvents(userId: string): Promise<TitanEvent[]>;
    auditImageAssets(limit?: number): Promise<void>;
}
export {};
