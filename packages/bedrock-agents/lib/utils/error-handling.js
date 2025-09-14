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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3ItaGFuZGxpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvZXJyb3ItaGFuZGxpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsaURBQWlEO0FBQ2pELE1BQWEsaUJBQWtCLFNBQVEsS0FBSztJQUMxQyxZQUNFLE9BQWUsRUFDQyxPQUFlLEVBQ2YsT0FBZSxhQUFhLEVBQzVCLE9BQTZCO1FBRTdDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUpDLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZixTQUFJLEdBQUosSUFBSSxDQUF3QjtRQUM1QixZQUFPLEdBQVAsT0FBTyxDQUFzQjtRQUc3QyxJQUFJLENBQUMsSUFBSSxHQUFHLG1CQUFtQixDQUFDO0lBQ2xDLENBQUM7Q0FDRjtBQVZELDhDQVVDO0FBRUQsTUFBYSxlQUFnQixTQUFRLGlCQUFpQjtJQUNwRCxZQUFZLE9BQWUsRUFBRSxPQUFlLEVBQUUsT0FBNkI7UUFDekUsS0FBSyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLElBQUksR0FBRyxpQkFBaUIsQ0FBQztJQUNoQyxDQUFDO0NBQ0Y7QUFMRCwwQ0FLQztBQUVELE1BQWEsb0JBQXFCLFNBQVEsaUJBQWlCO0lBQ3pELFlBQVksT0FBZSxFQUFFLE9BQWUsRUFBRSxPQUE2QjtRQUN6RSxLQUFLLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsSUFBSSxHQUFHLHNCQUFzQixDQUFDO0lBQ3JDLENBQUM7Q0FDRjtBQUxELG9EQUtDO0FBRUQsTUFBYSxzQkFBdUIsU0FBUSxLQUFLO0lBQy9DLFlBQ0UsT0FBZSxFQUNDLFVBQWtCLEVBQ2xCLFdBQW1CLEVBQ25CLFVBQW1CLEVBQ25CLE9BQTZCO1FBRTdDLEtBQUssQ0FBQyxPQUFPLENBQUMs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QUksTUFBTSxDQUFDLFVBQVUsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNuRSxNQUFNLElBQUksZUFBZSxDQUFDLHFDQUFxQyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuRixDQUFDO0lBQ0gsQ0FBQztDQUNGO0FBbE5ELG9DQWtOQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFnZW50RXhlY3V0aW9uUmVzdWx0LCBBZ2VudFJlc3BvbnNlIH0gZnJvbSAnLi4vdHlwZXMvYWdlbnQtdHlwZXMnO1xuXG4vLyBDdXN0b20gZXJyb3IgY2xhc3NlcyBmb3IgYmV0dGVyIGVycm9yIGhhbmRsaW5nXG5leHBvcnQgY2xhc3MgQmVkcm9ja0FnZW50RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgYWdlbnRJZDogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSBjb2RlOiBzdHJpbmcgPSAnQUdFTlRfRVJST1InLFxuICAgIHB1YmxpYyByZWFkb25seSBkZXRhaWxzPzogUmVjb3JkPHN0cmluZywgYW55PlxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSAnQmVkcm9ja0FnZW50RXJyb3InO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBWYWxpZGF0aW9uRXJyb3IgZXh0ZW5kcyBCZWRyb2NrQWdlbnRFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZywgYWdlbnRJZDogc3RyaW5nLCBkZXRhaWxzPzogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgIHN1cGVyKG1lc3NhZ2UsIGFnZW50SWQsICdWQUxJREFUSU9OX0VSUk9SJywgZGV0YWlscyk7XG4gICAgdGhpcy5uYW1lID0gJ1ZhbGlkYXRpb25FcnJvcic7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1vZGVsSW52b2NhdGlvbkVycm9yIGV4dGVuZHMgQmVkcm9ja0FnZW50RXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIGFnZW50SWQ6IHN0cmluZywgZGV0YWlscz86IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcbiAgICBzdXBlcihtZXNzYWdlLCBhZ2VudElkLCAnTU9ERUxfSU5WT0NBVElPTl9FUlJPUicsIGRldGFpbHMpO1xuICAgIHRoaXMubmFtZSA9ICdNb2RlbEludm9jYXRpb25FcnJvcic7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFdvcmtmbG93RXhlY3V0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgd29ya2Zsb3dJZDogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSBleGVjdXRpb25JZDogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSBmYWlsZWRTdGVwPzogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSBkZXRhaWxzPzogUmVjb3JkPHN0cmluZywgYW55PlxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm5hbWUgPSAnV29ya2Zsb3dFeGVjdXRpb25FcnJvcic7XG4gIH1cbn1cblxuLy8gRXJyb3IgaGFuZGxpbmcgdXRpbGl0aWVzXG5leHBvcnQgY2xhc3MgRXJyb3JIYW5kbGVyIHtcbiAgLy8gQ3JlYXRlIGEgc3RhbmRhcmRpemVkIGVycm9yIHJlc3BvbnNlXG4gIHN0YXRpYyBjcmVhdGVFcnJvclJlc3BvbnNlKGVycm9yOiBFcnJvciwgYWdlbnRJZD86IHN0cmluZyk6IEFnZW50UmVzcG9uc2Uge1xuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlLFxuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgZXJyb3JUeXBlOiBlcnJvci5jb25zdHJ1Y3Rvci5uYW1lLFxuICAgICAgICBhZ2VudElkLFxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgLi4uKGVycm9yIGluc3RhbmNlb2YgQmVkcm9ja0FnZW50RXJyb3IgJiYgZXJyb3IuZGV0YWlscyA/IHsgZGV0YWlsczogZXJyb3IuZGV0YWlscyB9IDoge30pLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgLy8gSGFuZGxlIGFuZCBsb2cgZXJyb3JzIGNvbnNpc3RlbnRseVxuICBzdGF0aWMgaGFuZGxlRXJyb3IoZXJyb3I6IEVycm9yLCBjb250ZXh0OiB7IGFnZW50SWQ/OiBzdHJpbmc7IG9wZXJhdGlvbj86IHN0cmluZyB9KTogdm9pZCB7XG4gICAgY29uc3QgZXJyb3JJbmZvID0ge1xuICAgICAgbWVzc2FnZTogZXJyb3IubWVzc2FnZSxcbiAgICAgIHR5cGU6IGVycm9yLmNvbnN0cnVjdG9yLm5hbWUsXG4gICAgICBhZ2VudElkOiBjb250ZXh0LmFnZW50SWQsXG4gICAgICBvcGVyYXRpb246IGNvbnRleHQub3BlcmF0aW9uLFxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICBzdGFjazogZXJyb3Iuc3RhY2ssXG4gICAgfTtcblxuICAgIC8vIEluIHByb2R1Y3Rpb24sIHRoaXMgd291bGQgaW50ZWdyYXRlIHdpdGggeW91ciBsb2dnaW5nIHN5c3RlbVxuICAgIGNvbnNvbGUuZXJyb3IoJ0JlZHJvY2sgQWdlbnQgRXJyb3I6JywgZXJyb3JJbmZvKTtcblxuICAgIC8vIEFkZGl0aW9uYWwgZXJyb3IgaGFuZGxpbmcgbG9naWMgKG1ldHJpY3MsIGFsZXJ0cywgZXRjLilcbiAgICB0aGlzLnJlY29yZEVycm9yTWV0cmljcyhlcnJvckluZm8pO1xuICB9XG5cbiAgLy8gUmVjb3JkIGVycm9yIG1ldHJpY3MgKHBsYWNlaG9sZGVyIGZvciBhY3R1YWwgbWV0cmljcyBpbXBsZW1lbnRhdGlvbilcbiAgcHJpdmF0ZSBzdGF0aWMgcmVjb3JkRXJyb3JNZXRyaWNzKF9lcnJvckluZm86IGFueSk6IHZvaWQge1xuICAgIC8vIEluIHByb2R1Y3Rpb24sIGludGVncmF0ZSB3aXRoIENsb3VkV2F0Y2ggb3Igb3RoZXIgbWV0cmljcyBzeXN0ZW1zXG4gICAgLy8gRXhhbXBsZTogQ2xvdWRXYXRjaC5wdXRNZXRyaWNEYXRhKC4uLilcbiAgfVxuXG4gIC8vIFJldHJ5IGxvZ2ljIHdpdGggZXhwb25lbnRpYWwgYmFja29mZlxuICBzdGF0aWMgYXN5bmMgd2l0aFJldHJ5PFQ+KFxuICAgIG9wZXJhdGlvbjogKCkgPT4gUHJvbWlzZTxUPixcbiAgICBvcHRpb25zOiB7XG4gICAgICBtYXhSZXRyaWVzPzogbnVtYmVyO1xuICAgICAgaW5pdGlhbERlbGF5PzogbnVtYmVyO1xuICAgICAgYmFja29mZk11bHRpcGxpZXI/OiBudW1iZXI7XG4gICAgICBzaG91bGRSZXRyeT86IChlcnJvcjogRXJyb3IpID0+IGJvb2xlYW47XG4gICAgfSA9IHt9XG4gICk6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IHtcbiAgICAgIG1heFJldHJpZXMgPSAzLFxuICAgICAgaW5pdGlhbERlbGF5ID0gMTAwMCxcbiAgICAgIGJhY2tvZmZNdWx0aXBsaWVyID0gMixcbiAgICAgIHNob3VsZFJldHJ5ID0gKCkgPT4gdHJ1ZSxcbiAgICB9ID0gb3B0aW9ucztcblxuICAgIGxldCBsYXN0RXJyb3I6IEVycm9yO1xuICAgIGxldCBkZWxheSA9IGluaXRpYWxEZWxheTtcblxuICAgIGZvciAobGV0IGF0dGVtcHQgPSAwOyBhdHRlbXB0IDw9IG1heFJldHJpZXM7IGF0dGVtcHQrKykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IG9wZXJhdGlvbigpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgbGFzdEVycm9yID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yIDogbmV3IEVycm9yKCdVbmtub3duIGVycm9yJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoYXR0ZW1wdCA9PT0gbWF4UmV0cmllcyB8fCAhc2hvdWxkUmV0cnkobGFzdEVycm9yKSkge1xuICAgICAgICAgIHRocm93IGxhc3RFcnJvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHRoaXMuc2xlZXAoZGVsYXkpO1xuICAgICAgICBkZWxheSAqPSBiYWNrb2ZmTXVsdGlwbGllcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvdyBsYXN0RXJyb3IhO1xuICB9XG5cbiAgLy8gQ2lyY3VpdCBicmVha2VyIHBhdHRlcm4gaW1wbGVtZW50YXRpb25cbiAgc3RhdGljIGNyZWF0ZUNpcmN1aXRCcmVha2VyPFQgZXh0ZW5kcyBhbnlbXSwgUj4oXG4gICAgZm46ICguLi5hcmdzOiBUKSA9PiBQcm9taXNlPFI+LFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIGZhaWx1cmVUaHJlc2hvbGQ/OiBudW1iZXI7XG4gICAgICByZXNldFRpbWVvdXQ/OiBudW1iZXI7XG4gICAgICBtb25pdG9yaW5nUGVyaW9kPzogbnVtYmVyO1xuICAgIH0gPSB7fVxuICApIHtcbiAgICBjb25zdCB7XG4gICAgICBmYWlsdXJlVGhyZXNob2xkID0gNSxcbiAgICAgIHJlc2V0VGltZW91dCA9IDYwMDAwLCAvLyAxIG1pbnV0ZVxuICAgICAgbW9uaXRvcmluZ1BlcmlvZCA9IDEwMDAwLCAvLyAxMCBzZWNvbmRzXG4gICAgfSA9IG9wdGlvbnM7XG5cbiAgICBsZXQgc3RhdGU6ICdDTE9TRUQnIHwgJ09QRU4nIHwgJ0hBTEZfT1BFTicgPSAnQ0xPU0VEJztcbiAgICBsZXQgZmFpbHVyZUNvdW50ID0gMDtcbiAgICBsZXQgbGFzdEZhaWx1cmVUaW1lID0gMDtcbiAgICBsZXQgc3VjY2Vzc0NvdW50ID0gMDtcblxuICAgIHJldHVybiBhc3luYyAoLi4uYXJnczogVCk6IFByb21pc2U8Uj4gPT4ge1xuICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcblxuICAgICAgLy8gUmVzZXQgZmFpbHVyZSBjb3VudCBpZiBtb25pdG9yaW5nIHBlcmlvZCBoYXMgcGFzc2VkXG4gICAgICBpZiAobm93IC0gbGFzdEZhaWx1cmVUaW1lID4gbW9uaXRvcmluZ1BlcmlvZCkge1xuICAgICAgICBmYWlsdXJlQ291bnQgPSAwO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBjaXJjdWl0IGJyZWFrZXIgc3RhdGVcbiAgICAgIGlmIChzdGF0ZSA9PT0gJ09QRU4nKSB7XG4gICAgICAgIGlmIChub3cgLSBsYXN0RmFpbHVyZVRpbWUgPiByZXNldFRpbWVvdXQpIHtcbiAgICAgICAgICBzdGF0ZSA9ICdIQUxGX09QRU4nO1xuICAgICAgICAgIHN1Y2Nlc3NDb3VudCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDaXJjdWl0IGJyZWFrZXIgaXMgT1BFTiAtIHNlcnZpY2UgdGVtcG9yYXJpbHkgdW5hdmFpbGFibGUnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBmbiguLi5hcmdzKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFN1Y2Nlc3MgLSByZXNldCBmYWlsdXJlIGNvdW50IGFuZCBjbG9zZSBjaXJjdWl0IGlmIGhhbGYtb3BlblxuICAgICAgICBpZiAoc3RhdGUgPT09ICdIQUxGX09QRU4nKSB7XG4gICAgICAgICAgc3VjY2Vzc0NvdW50Kys7XG4gICAgICAgICAgaWYgKHN1Y2Nlc3NDb3VudCA+PSAzKSB7IC8vIFJlcXVpcmUgMyBzdWNjZXNzZXMgdG8gY2xvc2VcbiAgICAgICAgICAgIHN0YXRlID0gJ0NMT1NFRCc7XG4gICAgICAgICAgICBmYWlsdXJlQ291bnQgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGZhaWx1cmVDb3VudCsrO1xuICAgICAgICBsYXN0RmFpbHVyZVRpbWUgPSBub3c7XG5cbiAgICAgICAgLy8gT3BlbiBjaXJjdWl0IGlmIGZhaWx1cmUgdGhyZXNob2xkIHJlYWNoZWRcbiAgICAgICAgaWYgKGZhaWx1cmVDb3VudCA+PSBmYWlsdXJlVGhyZXNob2xkKSB7XG4gICAgICAgICAgc3RhdGUgPSAnT1BFTic7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gVXRpbGl0eSBtZXRob2QgZm9yIGRlbGF5c1xuICBwcml2YXRlIHN0YXRpYyBzbGVlcChtczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xuICB9XG5cbiAgLy8gU2FuaXRpemUgZXJyb3IgbWVzc2FnZXMgZm9yIHVzZXIgZGlzcGxheVxuICBzdGF0aWMgc2FuaXRpemVFcnJvck1lc3NhZ2UoZXJyb3I6IEVycm9yKTogc3RyaW5nIHtcbiAgICAvLyBSZW1vdmUgc2Vuc2l0aXZlIGluZm9ybWF0aW9uIGFuZCBwcm92aWRlIHVzZXItZnJpZW5kbHkgbWVzc2FnZXNcbiAgICBjb25zdCBzZW5zaXRpdmVQYXR0ZXJucyA9IFtcbiAgICAgIC9hcGlbXy1dP2tleS9pLFxuICAgICAgL3NlY3JldC9pLFxuICAgICAgL3Rva2VuL2ksXG4gICAgICAvcGFzc3dvcmQvaSxcbiAgICAgIC9jcmVkZW50aWFsL2ksXG4gICAgXTtcblxuICAgIGxldCBtZXNzYWdlID0gZXJyb3IubWVzc2FnZTtcblxuICAgIC8vIENoZWNrIGZvciBzZW5zaXRpdmUgaW5mb3JtYXRpb25cbiAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2Ygc2Vuc2l0aXZlUGF0dGVybnMpIHtcbiAgICAgIGlmIChwYXR0ZXJuLnRlc3QobWVzc2FnZSkpIHtcbiAgICAgICAgcmV0dXJuICdBbiBpbnRlcm5hbCBlcnJvciBvY2N1cnJlZC4gUGxlYXNlIHRyeSBhZ2FpbiBsYXRlci4nO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFByb3ZpZGUgdXNlci1mcmllbmRseSBtZXNzYWdlcyBmb3IgY29tbW9uIGVycm9yc1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFZhbGlkYXRpb25FcnJvcikge1xuICAgICAgcmV0dXJuICdUaGUgcHJvdmlkZWQgaW5wdXQgaXMgaW52YWxpZC4gUGxlYXNlIGNoZWNrIHlvdXIgZGF0YSBhbmQgdHJ5IGFnYWluLic7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgTW9kZWxJbnZvY2F0aW9uRXJyb3IpIHtcbiAgICAgIHJldHVybiAnVGhlIEFJIHNlcnZpY2UgaXMgdGVtcG9yYXJpbHkgdW5hdmFpbGFibGUuIFBsZWFzZSB0cnkgYWdhaW4gaW4gYSBmZXcgbW9tZW50cy4nO1xuICAgIH1cblxuICAgIGlmIChtZXNzYWdlLmluY2x1ZGVzKCd0aW1lb3V0JykpIHtcbiAgICAgIHJldHVybiAnVGhlIHJlcXVlc3QgdG9vayB0b28gbG9uZyB0byBwcm9jZXNzLiBQbGVhc2UgdHJ5IGFnYWluLic7XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2UuaW5jbHVkZXMoJ3JhdGUgbGltaXQnKSkge1xuICAgICAgcmV0dXJuICdUb28gbWFueSByZXF1ZXN0cy4gUGxlYXNlIHdhaXQgYSBtb21lbnQgYmVmb3JlIHRyeWluZyBhZ2Fpbi4nO1xuICAgIH1cblxuICAgIC8vIFJldHVybiBvcmlnaW5hbCBtZXNzYWdlIGlmIG5vIHNlbnNpdGl2ZSBjb250ZW50IGRldGVjdGVkXG4gICAgcmV0dXJuIG1lc3NhZ2U7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSBhZ2VudCBleGVjdXRpb24gcmVzdWx0XG4gIHN0YXRpYyB2YWxpZGF0ZUV4ZWN1dGlvblJlc3VsdChyZXN1bHQ6IEFnZW50RXhlY3V0aW9uUmVzdWx0KTogdm9pZCB7XG4gICAgaWYgKCFyZXN1bHQuYWdlbnRJZCkge1xuICAgICAgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvcignQWdlbnQgSUQgaXMgcmVxdWlyZWQgaW4gZXhlY3V0aW9uIHJlc3VsdCcsICd1bmtub3duJyk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXN1bHQuY29udGV4dCkge1xuICAgICAgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvcignQWdlbnQgY29udGV4dCBpcyByZXF1aXJlZCBpbiBleGVjdXRpb24gcmVzdWx0JywgcmVzdWx0LmFnZW50SWQpO1xuICAgIH1cblxuICAgIGlmICghcmVzdWx0LnJlc3BvbnNlKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsaWRhdGlvbkVycm9yKCdBZ2VudCByZXNwb25zZSBpcyByZXF1aXJlZCBpbiBleGVjdXRpb24gcmVzdWx0JywgcmVzdWx0LmFnZW50SWQpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcmVzdWx0LmV4ZWN1dGlvblRpbWUgIT09ICdudW1iZXInIHx8IHJlc3VsdC5leGVjdXRpb25UaW1lIDwgMCkge1xuICAgICAgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvcignVmFsaWQgZXhlY3V0aW9uIHRpbWUgaXMgcmVxdWlyZWQnLCByZXN1bHQuYWdlbnRJZCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiByZXN1bHQudG9rZW5zVXNlZCAhPT0gJ251bWJlcicgfHwgcmVzdWx0LnRva2Vuc1VzZWQgPCAwKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsaWRhdGlvbkVycm9yKCdWYWxpZCB0b2tlbiB1c2FnZSBjb3VudCBpcyByZXF1aXJlZCcsIHJlc3VsdC5hZ2VudElkKTtcbiAgICB9XG4gIH1cbn0iXX0=