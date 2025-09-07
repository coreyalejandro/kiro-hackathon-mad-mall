/**
 * Story API Contract Types
 * Types for story-related API operations following Smithy patterns
 */
import { Story, StoryType, StoryStatus, StoryComment, StoryDraft } from '../domain/story';
import { ApiResponse, PaginationRequest, ListResponse, SearchRequest, SearchResponse } from './common';
export interface CreateStoryRequest {
    title: string;
    content: string;
    excerpt?: string;
    type: StoryType;
    themes: string[];
    tags: string[];
    circleId?: string;
}
export interface CreateStoryResponse extends ApiResponse<Story> {
}
export interface GetStoryRequest {
    id: string;
    includeComments?: boolean;
    includeEngagement?: boolean;
}
export interface GetStoryResponse extends ApiResponse<Story> {
}
export interface UpdateStoryRequest {
    id: string;
    title?: string;
    content?: string;
    excerpt?: string;
    type?: StoryType;
    themes?: string[];
    tags?: string[];
    status?: StoryStatus;
}
export interface UpdateStoryResponse extends ApiResponse<Story> {
}
export interface DeleteStoryRequest {
    id: string;
}
export interface DeleteStoryResponse extends ApiResponse<void> {
}
export interface ListStoriesRequest extends PaginationRequest {
    circleId?: string;
    authorId?: string;
    type?: StoryType;
    status?: StoryStatus;
    themes?: string[];
    tags?: string[];
    featured?: boolean;
}
export interface ListStoriesResponse extends ApiResponse<ListResponse<Story>> {
}
export interface SearchStoriesRequest extends SearchRequest {
    types?: StoryType[];
    themes?: string[];
    tags?: string[];
    authorId?: string;
    circleId?: string;
    dateRange?: {
        start?: string;
        end?: string;
    };
}
export interface SearchStoriesResponse extends ApiResponse<SearchResponse<Story>> {
}
export interface CreateCommentRequest {
    storyId: string;
    content: string;
    parentCommentId?: string;
}
export interface CreateCommentResponse extends ApiResponse<StoryComment> {
}
export interface GetCommentsRequest {
    storyId: string;
    parentCommentId?: string;
    page?: number;
    limit?: number;
}
export interface GetCommentsResponse extends ApiResponse<ListResponse<StoryComment>> {
}
export interface LikeStoryRequest {
    storyId: string;
}
export interface LikeStoryResponse extends ApiResponse<{
    liked: boolean;
    totalLikes: number;
}> {
}
export interface SaveStoryRequest {
    storyId: string;
}
export interface SaveStoryResponse extends ApiResponse<{
    saved: boolean;
}> {
}
export interface CreateDraftRequest {
    title: string;
    content: string;
    type?: StoryType;
    themes?: string[];
    tags?: string[];
    circleId?: string;
}
export interface CreateDraftResponse extends ApiResponse<StoryDraft> {
}
export interface GetDraftsRequest extends PaginationRequest {
}
export interface GetDraftsResponse extends ApiResponse<ListResponse<StoryDraft>> {
}
export interface ModerateStoryRequest {
    storyId: string;
    action: 'approve' | 'reject' | 'flag';
    notes?: string;
}
export interface ModerateStoryResponse extends ApiResponse<Story> {
}
export interface GetStoryAnalyticsRequest {
    storyId: string;
    timeRange?: 'day' | 'week' | 'month' | 'year';
}
export interface StoryAnalytics {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    engagement_rate: number;
    view_duration: number;
    demographics: {
        age_groups: Record<string, number>;
        locations: Record<string, number>;
    };
    timeline: {
        date: string;
        views: number;
        engagement: number;
    }[];
}
export interface GetStoryAnalyticsResponse extends ApiResponse<StoryAnalytics> {
}
//# sourceMappingURL=stories.d.ts.map