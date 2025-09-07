/**
 * Common API Types
 * Shared types for API requests and responses
 */

// Standard API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

// Error response structure
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId: string;
  path: string;
  statusCode: number;
}

// Response metadata
export interface ResponseMetadata {
  requestId: string;
  timestamp: string;
  version: string;
  processingTime: number;
  rateLimit?: {
    limit: number;
    remaining: number;
    resetAt: string;
  };
}

// Standard pagination request
export interface PaginationRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  cursor?: string;
}

// Standard pagination response
export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

// Standard list response
export interface ListResponse<T> {
  items: T[];
  pagination: PaginationResponse;
}

// Standard search request
export interface SearchRequest extends PaginationRequest {
  query: string;
  filters?: Record<string, any>;
  facets?: string[];
  highlight?: boolean;
}

// Standard search response
export interface SearchResponse<T> {
  items: SearchResultItem<T>[];
  pagination: PaginationResponse;
  facets?: Record<string, FacetResult>;
  suggestions?: string[];
  totalTime: number;
}

export interface SearchResultItem<T> {
  item: T;
  score: number;
  highlights?: Record<string, string[]>;
}

export interface FacetResult {
  name: string;
  values: {
    value: string;
    count: number;
    selected: boolean;
  }[];
}

// Standard filter types
export interface DateRangeFilter {
  start?: string;
  end?: string;
}

export interface NumericRangeFilter {
  min?: number;
  max?: number;
}

export interface MultiSelectFilter {
  values: string[];
  operator?: 'and' | 'or';
}

// Standard sort options
export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
  label: string;
}

// Standard validation error
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
}

// Standard batch operation request
export interface BatchRequest<T> {
  items: T[];
  options?: {
    continueOnError?: boolean;
    validateOnly?: boolean;
  };
}

// Standard batch operation response
export interface BatchResponse<T> {
  successful: T[];
  failed: {
    item: T;
    error: ApiError;
  }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  uptime: number;
  dependencies: {
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime?: number;
    error?: string;
  }[];
}