/**
 * Resource API Contract Types
 * Types for resource-related API operations following Smithy patterns
 */
import { Resource, ResourceType, ResourceCategory, ResourceStatus, ResourceComment, ResourceCollection, ResourceProgress } from '../domain/resource';
import { ApiResponse, PaginationRequest, ListResponse, SearchRequest, SearchResponse } from './common';
export interface CreateResourceRequest {
    title: string;
    description: string;
    content?: string;
    summary: string;
    type: ResourceType;
    category: ResourceCategory;
    subcategories: string[];
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    prerequisites?: string[];
    learningObjectives: string[];
    culturalConsiderations: string[];
    therapeuticValue: string[];
    evidenceBased: boolean;
    externalUrl?: string;
    thumbnailUrl?: string;
    isPublic: boolean;
    isPremium: boolean;
    price?: {
        amount: number;
        currency: string;
    };
}
export interface CreateResourceResponse extends ApiResponse<Resource> {
}
export interface GetResourceRequest {
    id: string;
    includeComments?: boolean;
    includeProgress?: boolean;
}
export interface GetResourceResponse extends ApiResponse<Resource> {
}
export interface UpdateResourceRequest {
    id: string;
    title?: string;
    description?: string;
    content?: string;
    summary?: string;
    subcategories?: string[];
    tags?: string[];
    status?: ResourceStatus;
    isPublic?: boolean;
}
export interface UpdateResourceResponse extends ApiResponse<Resource> {
}
export interface ListResourcesRequest extends PaginationRequest {
    type?: ResourceType;
    category?: ResourceCategory;
    status?: ResourceStatus;
    difficulty?: string[];
    tags?: string[];
    authorId?: string;
    isPublic?: boolean;
    isPremium?: boolean;
}
export interface ListResourcesResponse extends ApiResponse<ListResponse<Resource>> {
}
export interface SearchResourcesRequest extends SearchRequest {
    types?: ResourceType[];
    categories?: ResourceCategory[];
    difficulty?: string[];
    tags?: string[];
    authorId?: string;
    evidenceBased?: boolean;
    culturalConsiderations?: string[];
    therapeuticValue?: string[];
}
export interface SearchResourcesResponse extends ApiResponse<SearchResponse<Resource>> {
}
export interface CreateResourceCommentRequest {
    resourceId: string;
    content: string;
    rating?: number;
    parentCommentId?: string;
}
export interface CreateResourceCommentResponse extends ApiResponse<ResourceComment> {
}
export interface GetResourceCommentsRequest {
    resourceId: string;
    parentCommentId?: string;
    page?: number;
    limit?: number;
}
export interface GetResourceCommentsResponse extends ApiResponse<ListResponse<ResourceComment>> {
}
export interface CreateCollectionRequest {
    name: string;
    description: string;
    resourceIds: string[];
    tags: string[];
    isPublic: boolean;
    coverImage?: string;
}
export interface CreateCollectionResponse extends ApiResponse<ResourceCollection> {
}
export interface GetCollectionRequest {
    id: string;
    includeResources?: boolean;
}
export interface GetCollectionResponse extends ApiResponse<ResourceCollection> {
}
export interface ListCollectionsRequest extends PaginationRequest {
    curatorId?: string;
    tags?: string[];
    isPublic?: boolean;
}
export interface ListCollectionsResponse extends ApiResponse<ListResponse<ResourceCollection>> {
}
export interface UpdateProgressRequest {
    resourceId: string;
    progress: number;
    completed?: boolean;
    timeSpent: number;
    notes?: string;
}
export interface UpdateProgressResponse extends ApiResponse<ResourceProgress> {
}
export interface GetProgressRequest {
    userId?: string;
    resourceId?: string;
    completed?: boolean;
}
export interface GetProgressResponse extends ApiResponse<ListResponse<ResourceProgress>> {
}
export interface LikeResourceRequest {
    resourceId: string;
}
export interface LikeResourceResponse extends ApiResponse<{
    liked: boolean;
    totalLikes: number;
}> {
}
export interface SaveResourceRequest {
    resourceId: string;
}
export interface SaveResourceResponse extends ApiResponse<{
    saved: boolean;
}> {
}
export interface RateResourceRequest {
    resourceId: string;
    rating: number;
    review?: string;
}
export interface RateResourceResponse extends ApiResponse<{
    averageRating: number;
    ratingCount: number;
}> {
}
export interface GetRecommendationsRequest {
    userId?: string;
    resourceId?: string;
    category?: ResourceCategory;
    limit?: number;
}
export interface GetRecommendationsResponse extends ApiResponse<Resource[]> {
}
export interface GetResourceAnalyticsRequest {
    resourceId: string;
    timeRange?: 'day' | 'week' | 'month' | 'year';
}
export interface ResourceAnalytics {
    views: number;
    likes: number;
    saves: number;
    shares: number;
    completions: number;
    average_rating: number;
    rating_count: number;
    average_time_spent: number;
    completion_rate: number;
    demographics: {
        age_groups: Record<string, number>;
        experience_levels: Record<string, number>;
    };
    timeline: {
        date: string;
        views: number;
        completions: number;
    }[];
}
export interface GetResourceAnalyticsResponse extends ApiResponse<ResourceAnalytics> {
}
