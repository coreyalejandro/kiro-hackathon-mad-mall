import { AgentExecutionResult, AgentResponse } from '../types/agent-types';
export declare class BedrockAgentError extends Error {
    readonly agentId: string;
    readonly code: string;
    readonly details?: Record<string, any> | undefined;
    constructor(message: string, agentId: string, code?: string, details?: Record<string, any> | undefined);
}
export declare class ValidationError extends BedrockAgentError {
    constructor(message: string, agentId: string, details?: Record<string, any>);
}
export declare class ModelInvocationError extends BedrockAgentError {
    constructor(message: string, agentId: string, details?: Record<string, any>);
}
export declare class WorkflowExecutionError extends Error {
    readonly workflowId: string;
    readonly executionId: string;
    readonly failedStep?: string | undefined;
    readonly details?: Record<string, any> | undefined;
    constructor(message: string, workflowId: string, executionId: string, failedStep?: string | undefined, details?: Record<string, any> | undefined);
}
export declare class ErrorHandler {
    static createErrorResponse(error: Error, agentId?: string): AgentResponse;
    static handleError(error: Error, context: {
        agentId?: string;
        operation?: string;
    }): void;
    private static recordErrorMetrics;
    static withRetry<T>(operation: () => Promise<T>, options?: {
        maxRetries?: number;
        initialDelay?: number;
        backoffMultiplier?: number;
        shouldRetry?: (error: Error) => boolean;
    }): Promise<T>;
    static createCircuitBreaker<T extends any[], R>(fn: (...args: T) => Promise<R>, options?: {
        failureThreshold?: number;
        resetTimeout?: number;
        monitoringPeriod?: number;
    }): (...args: T) => Promise<R>;
    private static sleep;
    static sanitizeErrorMessage(error: Error): string;
    static validateExecutionResult(result: AgentExecutionResult): void;
}
//# sourceMappingURL=error-handling.d.ts.map