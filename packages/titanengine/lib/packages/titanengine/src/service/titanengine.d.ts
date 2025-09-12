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
    listPending(limit?: number): Promise<import("@madmall/shared-types/database").DynamoDBImageAsset[]>;
    selectByContext(context: string, limit?: number): Promise<import("@madmall/shared-types/database").DynamoDBImageAsset[]>;
}
