/**
 * Constants for the MADMall API Gateway
 */

export const API_VERSION = '1.0.0';

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

export const CONTENT_TYPES = {
  STORY: 'story',
  DISCUSSION: 'discussion',
  RESOURCE: 'resource',
  PRODUCT: 'product',
  BUSINESS: 'business',
  COMEDY: 'comedy',
  USER: 'user',
  CIRCLE: 'circle'
} as const;

export const INTERACTION_TYPES = {
  LIKE: 'like',
  UNLIKE: 'unlike',
  SAVE: 'save',
  UNSAVE: 'unsave',
  SHARE: 'share',
  REPORT: 'report',
  HELPFUL: 'helpful',
  NOT_HELPFUL: 'not_helpful'
} as const;

export const PAGINATION_DEFAULTS = {
  LIMIT: 10,
  MAX_LIMIT: 100,
  OFFSET: 0
} as const;

export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
  ID: /^[a-zA-Z0-9_-]+$/,
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
} as const;