/**
 * Sierra-Inspired AI Agent Benchmarking with Cultural Competency Extensions
 *
 * Based on Sierra's benchmarking methodology: https://sierra.ai/blog/benchmarking-ai-agents
 * Extended to include cultural competency evaluation for healthcare AI agents
 */
import { z } from 'zod';
import { AgentContext, BaseAgent } from '../types/agent-types';
export declare const BenchmarkTaskSchema: z.ZodObject<{
    taskId: z.ZodString;
    category: z.ZodEnum<["accuracy", "safety", "cultural_competency", "collaboration", "efficiency"]>;
    description: z.ZodString;
    input: z.ZodAny;
    expectedOutput: z.ZodAny;
    evaluationCriteria: z.ZodArray<z.ZodObject<{
        criterion: z.ZodString;
        weight: z.ZodNumber;
        evaluationType: z.ZodEnum<["exact_match", "semantic_similarity", "cultural_appropriateness", "safety_score"]>;
    }, "strip", z.ZodTypeAny, {
        weight: number;
        criterion: string;
        evaluationType: "exact_match" | "semantic_similarity" | "cultural_appropriateness" | "safety_score";
    }, {
        weight: number;
        criterion: string;
        evaluationType: "exact_match" | "semantic_similarity" | "cultural_appropriateness" | "safety_score";
    }>, "many">;
    culturalContext: z.ZodOptional<z.ZodObject<{
        primaryCulture: z.ZodString;
        sensitiveTopics: z.ZodArray<z.ZodString, "many">;
        culturalNuances: z.ZodArray<z.ZodString, "many">;
        expectedCulturalAdaptations: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        primaryCulture: string;
        sensitiveTopics: string[];
        culturalNuances: string[];
        expectedCulturalAdaptations: string[];
    }, {
        primaryCulture: string;
        sensitiveTopics: string[];
        culturalNuances: string[];
        expectedCulturalAdaptations: string[];
    }>>;
    difficulty: z.ZodEnum<["basic", "intermediate", "advanced", "expert"]>;
    timeLimit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    description: string;
    category: "accuracy" | "safety" | "cultural_competency" | "collaboration" | "efficiency";
    difficulty: "basic" | "intermediate" | "advanced" | "expert";
    taskId: string;
    evaluationCriteria: {
        weight: number;
        criterion: string;
        evaluationType: "exact_match" | "semantic_similarity" | "cultural_appropriateness" | "safety_score";
    }[];
    input?: any;
    culturalContext?: {
        primaryCulture: string;
        sensitiveTopics: string[];
        culturalNuances: string[];
        expectedCulturalAdaptations: string[];
    } | undefined;
    expectedOutput?: any;
    timeLimit?: number | undefined;
}, {
    description: string;
    category: "accuracy" | "safety" | "cultural_competency" | "collaboration" | "efficiency";
    difficulty: "basic" | "intermediate" | "advanced" | "expert";
    taskId: string;
    evaluationCriteria: {
        weight: number;
        criterion: string;
        evaluationType: "exact_match" | "semantic_similarity" | "cultural_appropriateness" | "safety_score";
    }[];
    input?: any;
    culturalContext?: {
        primaryCulture: string;
        sensitiveTopics: string[];
        culturalNuances: string[];
        expectedCulturalAdaptations: string[];
    } | undefined;
    expectedOutput?: any;
    timeLimit?: number | undefined;
}>;
export type BenchmarkTask = z.infer<typeof BenchmarkTaskSchema>;
export declare const BenchmarkResultSchema: z.ZodObject<{
    taskId: z.ZodString;
    agentId: z.ZodString;
    executionTime: z.ZodNumber;
    success: z.ZodBoolean;
    scores: z.ZodObject<{
        accuracy: z.ZodNumber;
        safety: z.ZodNumber;
        culturalCompetency: z.ZodNumber;
        efficiency: z.ZodNumber;
        collaboration: z.ZodOptional<z.ZodNumber>;
        overall: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        accuracy: number;
        safety: number;
        efficiency: number;
        culturalCompetency: number;
        overall: number;
        collaboration?: number | undefined;
    }, {
        accuracy: number;
        safety: number;
        efficiency: number;
        culturalCompetency: number;
        overall: number;
        collaboration?: number | undefined;
    }>;
    culturalEvaluation: z.ZodOptional<z.ZodObject<{
        appropriateness: z.ZodNumber;
        sensitivity: z.ZodNumber;
        inclusivity: z.ZodNumber;
        authenticity: z.ZodNumber;
        harmPrevention: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        appropriateness: number;
        sensitivity: number;
        inclusivity: number;
        authenticity: number;
        harmPrevention: number;
    }, {
        appropriateness: number;
        sensitivity: number;
        inclusivity: number;
        authenticity: number;
        harmPrevention: number;
    }>>;
    feedback: z.ZodArray<z.ZodString, "many">;
    errors: z.ZodArray<z.ZodString, "many">;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    agentId: string;
    success: boolean;
    executionTime: number;
    taskId: string;
    scores: {
        accuracy: number;
        safety: number;
        efficiency: number;
        culturalCompetency: number;
        overall: number;
        collaboration?: number | undefined;
    };
    feedback: string[];
    errors: string[];
    metadata?: Record<string, any> | undefined;
    culturalEvaluation?: {
        appropriateness: number;
        sensitivity: number;
        inclusivity: number;
        authenticity: number;
        harmPrevention: number;
    } | undefined;
}, {
    agentId: string;
    success: boolean;
    executionTime: number;
    taskId: string;
    scores: {
        accuracy: number;
        safety: number;
        efficiency: number;
        culturalCompetency: number;
        overall: number;
        collaboration?: number | undefined;
    };
    feedback: string[];
    errors: string[];
    metadata?: Record<string, any> | undefined;
    culturalEvaluation?: {
        appropriateness: number;
        sensitivity: number;
        inclusivity: number;
        authenticity: number;
        harmPrevention: number;
    } | undefined;
}>;
export type BenchmarkResult = z.infer<typeof BenchmarkResultSchema>;
export declare class CulturalCompetencyBenchmarks {
    static getBasicCulturalTasks(): BenchmarkTask[];
    static getIntersectionalTasks(): BenchmarkTask[];
    static getTraumaInformedTasks(): BenchmarkTask[];
}
export declare class SierraCulturalBenchmarkEngine {
    private agents;
    private benchmarkSuites;
    constructor();
    private initializeBenchmarkSuites;
    registerAgent(agentId: string, agent: BaseAgent): void;
    runBenchmarkSuite(agentId: string, suiteId: string, context: AgentContext): Promise<BenchmarkResult[]>;
    private runSingleBenchmark;
    private evaluateAgentResponse;
    private evaluateCulturalCompetency;
    private evaluateAccuracy;
    private evaluateSafety;
    private evaluateCulturalResponse;
    private evaluateEfficiency;
    private evaluateCulturalAppropriateness;
    private evaluateCulturalSensitivity;
    private evaluateInclusivity;
    private evaluateAuthenticity;
    private evaluateHarmPrevention;
    private generateFeedback;
    private createErrorResult;
    private transformInputForAgent;
    generateBenchmarkReport(agentId: string, results: BenchmarkResult[]): Promise<{
        agentId: string;
        overallScore: number;
        categoryScores: Record<string, number>;
        culturalCompetencyBreakdown: Record<string, number>;
        recommendations: string[];
        strengths: string[];
        improvementAreas: string[];
    }>;
}
