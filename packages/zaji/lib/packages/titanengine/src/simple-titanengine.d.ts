/**
 * Simplified TitanEngine for immediate integration
 * Provides core functionality without complex dependencies
 */
interface ValidationResult {
    cultural: number;
    sensitivity: number;
    inclusivity: number;
    issues: string[];
    validator: string;
    isAppropriate: boolean;
}
interface CareRecommendation {
    id: string;
    userId: string;
    recommendations: string[];
    confidence: number;
    timestamp: Date;
}
interface TitanEvent {
    userId: string;
    eventType: 'page' | 'interaction';
    name: string;
    timestamp?: number;
    data?: Record<string, unknown>;
}
export declare class TitanEngine {
    static createDefault(): TitanEngine;
    constructor();
    validateImageContent(image: {
        url: string;
        altText: string;
        category: string;
        imageId?: string;
    }): Promise<ValidationResult>;
    generateCareModel(params: {
        userId: string;
        culturalBackground: string[];
        supportNeeds: string[];
        context: string;
    }): Promise<CareRecommendation>;
    recordEvent(event: TitanEvent): Promise<void>;
    getEvents(userId: string): Promise<TitanEvent[]>;
    generateImage(prompt: string, style?: string): Promise<{
        url: string;
        altText: string;
        metadata: Record<string, any>;
    }>;
    private calculateCulturalScore;
    private calculateSensitivityScore;
    private calculateInclusivityScore;
    private generateRecommendations;
    private enhancePromptForCulturalSensitivity;
}
export {};
