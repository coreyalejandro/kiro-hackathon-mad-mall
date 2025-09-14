"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.WorkflowExecutionError = exports.ModelInvocationError = exports.ValidationError = exports.BedrockAgentError = void 0;
// Custom error classes for better error handling
class BedrockAgentError extends Error {
    constructor(message, agentId, code = 'AGENT_ERROR', details) {
        super(message);
        this.agentId = agentId;
        this.code = code;
        this.details = details;
        this.name = 'BedrockAgentError';
    }
}
exports.BedrockAgentError = BedrockAgentError;
class ValidationError extends BedrockAgentError {
    constructor(message, agentId, details) {
        super(message, agentId, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class ModelInvocationError extends BedrockAgentError {
    constructor(message, agentId, details) {
        super(message, agentId, 'MODEL_INVOCATION_ERROR', details);
        this.name = 'ModelInvocationError';
    }
}
exports.ModelInvocationError = ModelInvocationError;
class WorkflowExecutionError extends Error {
    constructor(message, workflowId, executionId, failedStep, details) {
        super(message);
        this.workflowId = workflowId;
        this.executionId = executionId;
        this.failedStep = failedStep;
        this.details = details;
        this.name = 'WorkflowExecutionError';
    }
}
exports.WorkflowExecutionError = WorkflowExecutionError;
// Error handling utilities
class ErrorHandler {
    // Create a standardized error response
    static createErrorResponse(error, agentId) {
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
    static handleError(error, context) {
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
    static recordErrorMetrics(_errorInfo) {
        // In production, integrate with CloudWatch or other metrics systems
        // Example: CloudWatch.putMetricData(...)
    }
    // Retry logic with exponential backoff
    static async withRetry(operation, options = {}) {
        const { maxRetries = 3, initialDelay = 1000, backoffMultiplier = 2, shouldRetry = () => true, } = options;
        let lastError;
        let delay = initialDelay;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                if (attempt === maxRetries || !shouldRetry(lastError)) {
                    throw lastError;
                }
                await this.sleep(delay);
                delay *= backoffMultiplier;
            }
        }
        throw lastError;
    }
    // Circuit breaker pattern implementation
    static createCircuitBreaker(fn, options = {}) {
        const { failureThreshold = 5, resetTimeout = 60000, // 1 minute
        monitoringPeriod = 10000, // 10 seconds
         } = options;
        let state = 'CLOSED';
        let failureCount = 0;
        let lastFailureTime = 0;
        let successCount = 0;
        return async (...args) => {
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
                }
                else {
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
            }
            catch (error) {
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
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Sanitize error messages for user display
    static sanitizeErrorMessage(error) {
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
    static validateExecutionResult(result) {
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
exports.ErrorHandler = ErrorHandler;
