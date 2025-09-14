import { AgentExecutionResult, AgentResponse } from '../types/agent-types';

// Custom error classes for better error handling
export class BedrockAgentError extends Error {
  constructor(
    message: string,
    public readonly agentId: string,
    public readonly code: string = 'AGENT_ERROR',
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'BedrockAgentError';
  }
}

export class ValidationError extends BedrockAgentError {
  constructor(message: string, agentId: string, details?: Record<string, any>) {
    super(message, agentId, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class ModelInvocationError extends BedrockAgentError {
  constructor(message: string, agentId: string, details?: Record<string, any>) {
    super(message, agentId, 'MODEL_INVOCATION_ERROR', details);
    this.name = 'ModelInvocationError';
  }
}

export class WorkflowExecutionError extends Error {
  constructor(
    message: string,
    public readonly workflowId: string,
    public readonly executionId: string,
    public readonly failedStep?: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'WorkflowExecutionError';
  }
}

// Error handling utilities
export class ErrorHandler {
  // Create a standardized error response
  static createErrorResponse(error: Error, agentId?: string): AgentResponse {
    return {
      success: false,
      error: error.message,
      metadata: {
        errorType: error.constructor.name,
        agentId,
        timestamp: new Date().toISOString(),
        ...(error instanceof BedrockAgentError && error.details ? { details: error.details } : {}),
      },
    };
  }

  // Handle and log errors consistently
  static handleError(error: Error, context: { agentId?: string; operation?: string }): void {
    const errorInfo = {
      message: error.message,
      type: error.constructor.name,
      agentId: context.agentId,
      operation: context.operation,
      timestamp: new Date().toISOString(),
      stack: error.stack,
    };

    // In production, this would integrate with your logging system
    console.error('Bedrock Agent Error:', errorInfo);

    // Additional error handling logic (metrics, alerts, etc.)
    this.recordErrorMetrics(errorInfo);
  }

  // Record error metrics (placeholder for actual metrics implementation)
  private static recordErrorMetrics(_errorInfo: any): void {
    // In production, integrate with CloudWatch or other metrics systems
    // Example: CloudWatch.putMetricData(...)
  }

  // Retry logic with exponential backoff
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      initialDelay?: number;
      backoffMultiplier?: number;
      shouldRetry?: (error: Error) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      initialDelay = 1000,
      backoffMultiplier = 2,
      shouldRetry = () => true,
    } = options;

    let lastError: Error;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === maxRetries || !shouldRetry(lastError)) {
          throw lastError;
        }

        await this.sleep(delay);
        delay *= backoffMultiplier;
      }
    }

    throw lastError!;
  }

  // Circuit breaker pattern implementation
  static createCircuitBreaker<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options: {
      failureThreshold?: number;
      resetTimeout?: number;
      monitoringPeriod?: number;
    } = {}
  ) {
    const {
      failureThreshold = 5,
      resetTimeout = 60000, // 1 minute
      monitoringPeriod = 10000, // 10 seconds
    } = options;

    let state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    let failureCount = 0;
    let lastFailureTime = 0;
    let successCount = 0;

    return async (...args: T): Promise<R> => {
      const now = Date.now();

      // Reset failure count if monitoring period has passed
      if (now - lastFailureTime > monitoringPeriod) {
        failureCount = 0;
      }

      // Check circuit breaker state
      if (state === 'OPEN') {
        if (now - lastFailureTime > resetTimeout) {
          state = 'HALF_OPEN';
          successCount = 0;
        } else {
          throw new Error('Circuit breaker is OPEN - service temporarily unavailable');
        }
      }

      try {
        const result = await fn(...args);
        
        // Success - reset failure count and close circuit if half-open
        if (state === 'HALF_OPEN') {
          successCount++;
          if (successCount >= 3) { // Require 3 successes to close
            state = 'CLOSED';
            failureCount = 0;
          }
        }
        
        return result;
      } catch (error) {
        failureCount++;
        lastFailureTime = now;

        // Open circuit if failure threshold reached
        if (failureCount >= failureThreshold) {
          state = 'OPEN';
        }

        throw error;
      }
    };
  }

  // Utility method for delays
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Sanitize error messages for user display
  static sanitizeErrorMessage(error: Error): string {
    // Remove sensitive information and provide user-friendly messages
    const sensitivePatterns = [
      /api[_-]?key/i,
      /secret/i,
      /token/i,
      /password/i,
      /credential/i,
    ];

    let message = error.message;

    // Check for sensitive information
    for (const pattern of sensitivePatterns) {
      if (pattern.test(message)) {
        return 'An internal error occurred. Please try again later.';
      }
    }

    // Provide user-friendly messages for common errors
    if (error instanceof ValidationError) {
      return 'The provided input is invalid. Please check your data and try again.';
    }

    if (error instanceof ModelInvocationError) {
      return 'The AI service is temporarily unavailable. Please try again in a few moments.';
    }

    if (message.includes('timeout')) {
      return 'The request took too long to process. Please try again.';
    }

    if (message.includes('rate limit')) {
      return 'Too many requests. Please wait a moment before trying again.';
    }

    // Return original message if no sensitive content detected
    return message;
  }

  // Validate agent execution result
  static validateExecutionResult(result: AgentExecutionResult): void {
    if (!result.agentId) {
      throw new ValidationError('Agent ID is required in execution result', 'unknown');
    }

    if (!result.context) {
      throw new ValidationError('Agent context is required in execution result', result.agentId);
    }

    if (!result.response) {
      throw new ValidationError('Agent response is required in execution result', result.agentId);
    }

    if (typeof result.executionTime !== 'number' || result.executionTime < 0) {
      throw new ValidationError('Valid execution time is required', result.agentId);
    }

    if (typeof result.tokensUsed !== 'number' || result.tokensUsed < 0) {
      throw new ValidationError('Valid token usage count is required', result.agentId);
    }
  }
}