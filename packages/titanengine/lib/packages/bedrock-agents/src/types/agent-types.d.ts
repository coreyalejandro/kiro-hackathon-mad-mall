import { z } from 'zod';
export declare const AgentConfigSchema: z.ZodObject<{
    agentId: z.ZodString;
    agentName: z.ZodString;
    description: z.ZodString;
    modelId: z.ZodString;
    temperature: z.ZodDefault<z.ZodNumber>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
    topP: z.ZodDefault<z.ZodNumber>;
    stopSequences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    description: string;
    agentId: string;
    agentName: string;
    modelId: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    stopSequences?: string[] | undefined;
}, {
    description: string;
    agentId: string;
    agentName: string;
    modelId: string;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    topP?: number | undefined;
    stopSequences?: string[] | undefined;
}>;
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export declare const AgentContextSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodString;
    correlationId: z.ZodString;
    timestamp: z.ZodDate;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
    correlationId: string;
    timestamp: Date;
    userId?: string | undefined;
    tenantId?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    sessionId: string;
    correlationId: string;
    timestamp: Date;
    userId?: string | undefined;
    tenantId?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export type AgentContext = z.infer<typeof AgentContextSchema>;
export declare const AgentResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
    confidence: z.ZodOptional<z.ZodNumber>;
    reasoning: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    error?: string | undefined;
    metadata?: Record<string, any> | undefined;
    data?: any;
    confidence?: number | undefined;
    reasoning?: string | undefined;
}, {
    success: boolean;
    error?: string | undefined;
    metadata?: Record<string, any> | undefined;
    data?: any;
    confidence?: number | undefined;
    reasoning?: string | undefined;
}>;
export type AgentResponse<T = any> = z.infer<typeof AgentResponseSchema> & {
    data?: T;
};
export interface AgentExecutionResult<T = any> {
    agentId: string;
    context: AgentContext;
    response: AgentResponse<T>;
    executionTime: number;
    tokensUsed: number;
}
export interface BaseAgent<TInput = any, TOutput = any> {
    readonly config: AgentConfig;
    execute(input: TInput, context: AgentContext): Promise<AgentExecutionResult<TOutput>>;
    validateInput(input: unknown): TInput;
}
