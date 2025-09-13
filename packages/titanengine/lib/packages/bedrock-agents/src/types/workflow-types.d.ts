import { z } from 'zod';
import { AgentContext, AgentExecutionResult } from './agent-types';
export declare const WorkflowStepSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    agentId: z.ZodString;
    inputMapping: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    outputMapping: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    condition: z.ZodOptional<z.ZodString>;
    retryPolicy: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodDefault<z.ZodNumber>;
        backoffMultiplier: z.ZodDefault<z.ZodNumber>;
        initialDelay: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxRetries: number;
        backoffMultiplier: number;
        initialDelay: number;
    }, {
        maxRetries?: number | undefined;
        backoffMultiplier?: number | undefined;
        initialDelay?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    agentId: string;
    inputMapping?: Record<string, string> | undefined;
    outputMapping?: Record<string, string> | undefined;
    condition?: string | undefined;
    retryPolicy?: {
        maxRetries: number;
        backoffMultiplier: number;
        initialDelay: number;
    } | undefined;
}, {
    name: string;
    id: string;
    agentId: string;
    inputMapping?: Record<string, string> | undefined;
    outputMapping?: Record<string, string> | undefined;
    condition?: string | undefined;
    retryPolicy?: {
        maxRetries?: number | undefined;
        backoffMultiplier?: number | undefined;
        initialDelay?: number | undefined;
    } | undefined;
}>;
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export declare const WorkflowDefinitionSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    version: z.ZodString;
    steps: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        agentId: z.ZodString;
        inputMapping: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        outputMapping: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        condition: z.ZodOptional<z.ZodString>;
        retryPolicy: z.ZodOptional<z.ZodObject<{
            maxRetries: z.ZodDefault<z.ZodNumber>;
            backoffMultiplier: z.ZodDefault<z.ZodNumber>;
            initialDelay: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            maxRetries: number;
            backoffMultiplier: number;
            initialDelay: number;
        }, {
            maxRetries?: number | undefined;
            backoffMultiplier?: number | undefined;
            initialDelay?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        agentId: string;
        inputMapping?: Record<string, string> | undefined;
        outputMapping?: Record<string, string> | undefined;
        condition?: string | undefined;
        retryPolicy?: {
            maxRetries: number;
            backoffMultiplier: number;
            initialDelay: number;
        } | undefined;
    }, {
        name: string;
        id: string;
        agentId: string;
        inputMapping?: Record<string, string> | undefined;
        outputMapping?: Record<string, string> | undefined;
        condition?: string | undefined;
        retryPolicy?: {
            maxRetries?: number | undefined;
            backoffMultiplier?: number | undefined;
            initialDelay?: number | undefined;
        } | undefined;
    }>, "many">;
    errorHandling: z.ZodOptional<z.ZodObject<{
        onError: z.ZodEnum<["stop", "continue", "retry", "fallback"]>;
        fallbackSteps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        maxExecutionTime: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        onError: "stop" | "continue" | "retry" | "fallback";
        maxExecutionTime: number;
        fallbackSteps?: string[] | undefined;
    }, {
        onError: "stop" | "continue" | "retry" | "fallback";
        fallbackSteps?: string[] | undefined;
        maxExecutionTime?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    version: string;
    id: string;
    steps: {
        name: string;
        id: string;
        agentId: string;
        inputMapping?: Record<string, string> | undefined;
        outputMapping?: Record<string, string> | undefined;
        condition?: string | undefined;
        retryPolicy?: {
            maxRetries: number;
            backoffMultiplier: number;
            initialDelay: number;
        } | undefined;
    }[];
    errorHandling?: {
        onError: "stop" | "continue" | "retry" | "fallback";
        maxExecutionTime: number;
        fallbackSteps?: string[] | undefined;
    } | undefined;
}, {
    name: string;
    description: string;
    version: string;
    id: string;
    steps: {
        name: string;
        id: string;
        agentId: string;
        inputMapping?: Record<string, string> | undefined;
        outputMapping?: Record<string, string> | undefined;
        condition?: string | undefined;
        retryPolicy?: {
            maxRetries?: number | undefined;
            backoffMultiplier?: number | undefined;
            initialDelay?: number | undefined;
        } | undefined;
    }[];
    errorHandling?: {
        onError: "stop" | "continue" | "retry" | "fallback";
        fallbackSteps?: string[] | undefined;
        maxExecutionTime?: number | undefined;
    } | undefined;
}>;
export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;
export declare const WorkflowExecutionContextSchema: z.ZodObject<{
    workflowId: z.ZodString;
    executionId: z.ZodString;
    agentContext: z.ZodAny;
    input: z.ZodRecord<z.ZodString, z.ZodAny>;
    variables: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    stepResults: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    startTime: z.ZodDate;
    currentStep: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    workflowId: string;
    executionId: string;
    input: Record<string, any>;
    variables: Record<string, any>;
    stepResults: Record<string, any>;
    startTime: Date;
    agentContext?: any;
    currentStep?: string | undefined;
}, {
    workflowId: string;
    executionId: string;
    input: Record<string, any>;
    startTime: Date;
    agentContext?: any;
    variables?: Record<string, any> | undefined;
    stepResults?: Record<string, any> | undefined;
    currentStep?: string | undefined;
}>;
export type WorkflowExecutionContext = z.infer<typeof WorkflowExecutionContextSchema> & {
    agentContext: AgentContext;
    stepResults: Record<string, AgentExecutionResult>;
};
export interface WorkflowExecutionResult {
    workflowId: string;
    executionId: string;
    success: boolean;
    output: Record<string, any>;
    error?: string;
    executionTime: number;
    stepResults: Record<string, AgentExecutionResult>;
    completedSteps: string[];
    failedStep?: string;
}
export interface WorkflowOrchestrator {
    registerWorkflow(definition: WorkflowDefinition): void;
    executeWorkflow(workflowId: string, input: Record<string, any>, context: AgentContext): Promise<WorkflowExecutionResult>;
    getWorkflowStatus(executionId: string): Promise<WorkflowExecutionResult | null>;
    cancelWorkflow(executionId: string): Promise<boolean>;
}
