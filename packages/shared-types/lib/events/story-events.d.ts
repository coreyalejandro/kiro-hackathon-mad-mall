/**
 * Story Domain Events
 * Events related to story lifecycle and interactions
 */
import { DomainEvent, IntegrationEvent } from './base';
import { StoryType, StoryStatus } from '../domain/story';
export interface StoryCreatedData {
    storyId: string;
    authorId: string;
    title: string;
    type: StoryType;
    circleId?: string;
    themes: string[];
    tags: string[];
    culturalElements: string[];
    therapeuticValue: string[];
}
export interface StoryCreatedEvent extends DomainEvent<StoryCreatedData> {
    type: 'story.created';
    aggregateType: 'Story';
}
export interface StoryPublishedData {
    storyId: string;
    authorId: string;
    title: string;
    circleId?: string;
    publishedAt: string;
}
export interface StoryPublishedEvent extends DomainEvent<StoryPublishedData> {
    type: 'story.published';
    aggregateType: 'Story';
}
export interface StoryUpdatedData {
    storyId: string;
    authorId: string;
    changes: {
        title?: string;
        content?: boolean;
        themes?: string[];
        tags?: string[];
        status?: StoryStatus;
    };
}
export interface StoryUpdatedEvent extends DomainEvent<StoryUpdatedData> {
    type: 'story.updated';
    aggregateType: 'Story';
}
export interface StoryDeletedData {
    storyId: string;
    authorId: string;
    title: string;
    deletedBy: string;
    reason?: string;
}
export interface StoryDeletedEvent extends DomainEvent<StoryDeletedData> {
    type: 'story.deleted';
    aggregateType: 'Story';
}
export interface StoryLikedData {
    storyId: string;
    authorId: string;
    likedBy: string;
    totalLikes: number;
}
export interface StoryLikedEvent extends DomainEvent<StoryLikedData> {
    type: 'story.liked';
    aggregateType: 'Story';
}
export interface StoryUnlikedData {
    storyId: string;
    authorId: string;
    unlikedBy: string;
    totalLikes: number;
}
export interface StoryUnlikedEvent extends DomainEvent<StoryUnlikedData> {
    type: 'story.unliked';
    aggregateType: 'Story';
}
export interface StoryCommentedData {
    storyId: string;
    commentId: string;
    authorId: string;
    commenterId: string;
    parentCommentId?: string;
    totalComments: number;
}
export interface StoryCommentedEvent extends DomainEvent<StoryCommentedData> {
    type: 'story.commented';
    aggregateType: 'Story';
}
export interface StorySavedData {
    storyId: string;
    authorId: string;
    savedBy: string;
    totalSaves: number;
}
export interface StorySavedEvent extends DomainEvent<StorySavedData> {
    type: 'story.saved';
    aggregateType: 'Story';
}
export interface StorySharedData {
    storyId: string;
    authorId: string;
    sharedBy: string;
    platform: string;
    totalShares: number;
}
export interface StorySharedEvent extends DomainEvent<StorySharedData> {
    type: 'story.shared';
    aggregateType: 'Story';
}
export interface StoryFlaggedData {
    storyId: string;
    authorId: string;
    flaggedBy: string;
    reason: string;
    details?: string;
}
export interface StoryFlaggedEvent extends DomainEvent<StoryFlaggedData> {
    type: 'story.flagged';
    aggregateType: 'Story';
}
export interface StoryModeratedData {
    storyId: string;
    authorId: string;
    moderatedBy: string;
    action: 'approved' | 'rejected' | 'removed';
    reason?: string;
    notes?: string;
}
export interface StoryModeratedEvent extends DomainEvent<StoryModeratedData> {
    type: 'story.moderated';
    aggregateType: 'Story';
}
export interface StoryFeaturedData {
    storyId: string;
    authorId: string;
    featuredBy: string;
    featuredUntil?: string;
}
export interface StoryFeaturedEvent extends DomainEvent<StoryFeaturedData> {
    type: 'story.featured';
    aggregateType: 'Story';
}
export interface StoryViewedData {
    storyId: string;
    authorId: string;
    viewerId: string;
    viewDuration?: number;
    deviceType?: string;
    referrer?: string;
}
export interface StoryViewedEvent extends IntegrationEvent<StoryViewedData> {
    type: 'story.viewed';
}
export interface StoryEngagementData {
    storyId: string;
    authorId: string;
    engagementType: 'like' | 'comment' | 'save' | 'share';
    userId: string;
    timestamp: string;
}
export interface StoryEngagementEvent extends IntegrationEvent<StoryEngagementData> {
    type: 'story.engagement';
}
export interface StoryRecommendedData {
    storyId: string;
    authorId: string;
    recommendedTo: string;
    algorithm: string;
    score: number;
    factors: string[];
}
export interface StoryRecommendedEvent extends IntegrationEvent<StoryRecommendedData> {
    type: 'story.recommended';
}
export type StoryDomainEvent = StoryCreatedEvent | StoryPublishedEvent | StoryUpdatedEvent | StoryDeletedEvent | StoryLikedEvent | StoryUnlikedEvent | StoryCommentedEvent | StorySavedEvent | StorySharedEvent | StoryFlaggedEvent | StoryModeratedEvent | StoryFeaturedEvent;
export type StoryIntegrationEvent = StoryViewedEvent | StoryEngagementEvent | StoryRecommendedEvent;
export type StoryEvent = StoryDomainEvent | StoryIntegrationEvent;
//# sourceMappingURL=story-events.d.ts.map