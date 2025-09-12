import { CareRecommendation } from './dspy-bridge';
export interface TitanEngineConfig {
    region?: string;
    tableName?: string;
    endpoint?: string;
}
export declare class TitanEngine {
    private readonly dynamo;
    private readonly images;
    private readonly pexels;
    private readonly unsplash;
    private readonly placeholder;
    private readonly a1111;
    private readonly culturalAgent;
    private readonly dspy;
    private readonly kcache;
    constructor(config: TitanEngineConfig);
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
    validateImageContent(image: {
        url: string;
        altText: string;
        category: string;
    }): Promise<{
        cultural: any;
        sensitivity: any;
        inclusivity: any;
        issues: any;
    }>;
    generateCareModel(input: {
        userId: string;
        age: number;
        diagnosisStage: string;
        supportNeeds: string[];
        culturalContext: {
            primaryCulture: string;
            secondaryCultures?: string[];
            region?: string;
            language?: string;
            religiousConsiderations?: string[];
            sensitiveTopics?: string[];
        };
        history?: any[];
    }, options?: {
        bypassCache?: boolean;
    }): Promise<{
        recommendation: CareRecommendation;
        cached: boolean;
        cacheStats: any;
    }>;
    listPending(limit?: number): Promise<import("@madmall/shared-types/database").DynamoDBImageAsset[]>;
    selectByContext(context: string, limit?: number): Promise<import("@madmall/shared-types/database").DynamoDBImageAsset[]>;
}
