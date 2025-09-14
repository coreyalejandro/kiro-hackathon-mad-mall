import { APIGatewayProxyEvent } from 'aws-lambda';

/**
 * Extract or create a correlation ID for request tracing
 */
export function getCorrelationId(event: APIGatewayProxyEvent): string {
  const headerId = event.headers['X-Correlation-Id'] || event.headers['x-correlation-id'];
  const requestId = (event.requestContext as any)?.requestId;
  return (headerId as string) || requestId || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Create structured log entry
 */
export function logInfo(message: string, details: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ level: 'INFO', message, ...details }));
}

export function logError(message: string, details: Record<string, unknown> = {}): void {
  console.error(JSON.stringify({ level: 'ERROR', message, ...details }));
}
/**
 * Helper utilities for API Gateway
 */

import { HTTP_STATUS_CODES, ERROR_CODES } from './constants';

/**
 * Standard API error structure
 */
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
  path?: string;
}

/**
 * Creates a standardized API error response
 */
export function createAPIError(
  code: string,
  message: string,
  details?: Record<string, any>,
  requestId?: string,
  path?: string
): APIError {
  return {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
    requestId,
    path
  };
}

/**
 * Creates a validation error
 */
export function createValidationError(
  message: string,
  fieldErrors?: Record<string, string>,
  requestId?: string,
  path?: string
): APIError {
  return createAPIError(
    ERROR_CODES.VALIDATION_ERROR,
    message,
    { fieldErrors },
    requestId,
    path
  );
}

/**
 * Creates a not found error
 */
export function createNotFoundError(
  resourceType: string,
  resourceId: string,
  requestId?: string,
  path?: string
): APIError {
  return createAPIError(
    ERROR_CODES.NOT_FOUND,
    `${resourceType} with ID '${resourceId}' not found`,
    { resourceType, resourceId },
    requestId,
    path
  );
}

/**
 * Creates an unauthorized error
 */
export function createUnauthorizedError(
  message: string = 'Authentication required',
  requestId?: string,
  path?: string
): APIError {
  return createAPIError(
    ERROR_CODES.UNAUTHORIZED,
    message,
    undefined,
    requestId,
    path
  );
}

/**
 * Creates a forbidden error
 */
export function createForbiddenError(
  message: string = 'Access forbidden',
  requestId?: string,
  path?: string
): APIError {
  return createAPIError(
    ERROR_CODES.FORBIDDEN,
    message,
    undefined,
    requestId,
    path
  );
}

/**
 * Creates a conflict error
 */
export function createConflictError(
  message: string,
  conflictType?: string,
  requestId?: string,
  path?: string
): APIError {
  return createAPIError(
    ERROR_CODES.CONFLICT,
    message,
    { conflictType },
    requestId,
    path
  );
}

/**
 * Creates a rate limit error
 */
export function createRateLimitError(
  retryAfter: number,
  requestId?: string,
  path?: string
): APIError {
  return createAPIError(
    ERROR_CODES.RATE_LIMIT_EXCEEDED,
    'Rate limit exceeded',
    { retryAfter },
    requestId,
    path
  );
}

/**
 * Creates an internal server error
 */
export function createInternalServerError(
  message: string = 'Internal server error',
  requestId?: string,
  path?: string
): APIError {
  return createAPIError(
    ERROR_CODES.INTERNAL_ERROR,
    message,
    undefined,
    requestId,
    path
  );
}

/**
 * Maps error codes to HTTP status codes
 */
export function getHTTPStatusForErrorCode(errorCode: string): number {
  switch (errorCode) {
    case ERROR_CODES.VALIDATION_ERROR:
      return HTTP_STATUS_CODES.BAD_REQUEST;
    case ERROR_CODES.UNAUTHORIZED:
      return HTTP_STATUS_CODES.UNAUTHORIZED;
    case ERROR_CODES.FORBIDDEN:
      return HTTP_STATUS_CODES.FORBIDDEN;
    case ERROR_CODES.NOT_FOUND:
      return HTTP_STATUS_CODES.NOT_FOUND;
    case ERROR_CODES.CONFLICT:
      return HTTP_STATUS_CODES.CONFLICT;
    case ERROR_CODES.RATE_LIMIT_EXCEEDED:
      return HTTP_STATUS_CODES.TOO_MANY_REQUESTS;
    case ERROR_CODES.INTERNAL_ERROR:
    default:
      return HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;
  }
}

/**
 * Generates a unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formats a timestamp for API responses
 */
export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Sanitizes user input by removing potentially harmful characters
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Creates a success response wrapper
 */
export function createSuccessResponse<T>(
  data: T,
  message: string = 'Success'
): {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
} {
  return {
    success: true,
    message,
    data,
    timestamp: formatTimestamp()
  };
}

/**
 * Calculates pagination metadata
 */
export function calculatePaginationMetadata(
  totalCount: number,
  limit: number,
  offset: number
): {
  totalCount: number;
  itemCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  totalPages: number;
  currentPage: number;
} {
  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = Math.floor(offset / limit) + 1;
  const itemCount = Math.min(limit, totalCount - offset);

  return {
    totalCount,
    itemCount,
    hasNext: offset + limit < totalCount,
    hasPrevious: offset > 0,
    totalPages,
    currentPage
  };
}