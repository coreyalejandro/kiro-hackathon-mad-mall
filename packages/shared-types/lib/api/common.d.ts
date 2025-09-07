/**
 * Common API Types
 * Shared types for API requests and responses
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    metadata?: ResponseMetadata;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
    path: string;
    statusCode: number;
}
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
export interface PaginationRequest {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    cursor?: string;
}
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
export interface ListResponse<T> {
    items: T[];
    pagination: PaginationResponse;
}
export interface SearchRequest extends PaginationRequest {
    query: string;
    filters?: Record<string, any>;
    facets?: string[];
    highlight?: boolean;
}
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
export interface SortOption {
    field: string;
    order: 'asc' | 'desc';
    label: string;
}
export interface ValidationError {
    field: string;
    code: string;
    message: string;
    value?: any;
}
export interface BatchRequest<T> {
    items: T[];
    options?: {
        continueOnError?: boolean;
        validateOnly?: boolean;
    };
}
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
//# sourceMappingURL=common.d.ts.map