import { z } from 'zod';
declare const CareInputSchema: z.ZodObject<{
    userId: z.ZodString;
    age: z.ZodNumber;
    diagnosisStage: z.ZodString;
    supportNeeds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    culturalContext: z.ZodObject<{
        primaryCulture: z.ZodString;
        secondaryCultures: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        region: z.ZodDefault<z.ZodString>;
        language: z.ZodDefault<z.ZodString>;
        religiousConsiderations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        sensitiveTopics: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        region: string;
        primaryCulture: string;
        secondaryCultures: string[];
        language: string;
        religiousConsiderations: string[];
        sensitiveTopics: string[];
    }, {
        primaryCulture: string;
        region?: string | undefined;
        secondaryCultures?: string[] | undefined;
        language?: string | undefined;
        religiousConsiderations?: string[] | undefined;
        sensitiveTopics?: string[] | undefined;
    }>;
    history: z.ZodDefault<z.ZodArray<z.ZodAny, "many">>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    diagnosisStage: string;
    age: number;
    supportNeeds: string[];
    culturalContext: {
        region: string;
        primaryCulture: string;
        secondaryCultures: string[];
        language: string;
        religiousConsiderations: string[];
        sensitiveTopics: string[];
    };
    history: any[];
}, {
    userId: string;
    diagnosisStage: string;
    age: number;
    culturalContext: {
        primaryCulture: string;
        region?: string | undefined;
        secondaryCultures?: string[] | undefined;
        language?: string | undefined;
        religiousConsiderations?: string[] | undefined;
        sensitiveTopics?: string[] | undefined;
    };
    supportNeeds?: string[] | undefined;
    history?: any[] | undefined;
}>;
export type CareInput = z.infer<typeof CareInputSchema>;
export interface CareItem {
    id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    url?: string;
    confidence: number;
}
export interface CareRecommendation {
    userId: string;
    items: CareItem[];
    strategy: string;
    runtimeMs: number;
    meta: Record<string, unknown>;
}
export declare class DspyBridge {
    private readonly baseUrl;
    constructor(baseUrl?: string);
    recommendCare(input: CareInput): Promise<CareRecommendation>;
}
export {};
