/**
 * Resource Domain Events
 * Events related to educational resources and learning content
 */
import { DomainEvent, IntegrationEvent } from './base';
import { ResourceType, ResourceCategory, ResourceStatus } from '../domain/resource';
export interface ResourceCreatedData {
    resourceId: string;
    authorId: string;
    title: string;
    type: ResourceType;
    category: ResourceCategory;
    difficulty: string;
    culturalConsiderations: string[];
    therapeuticValue: string[];
    evidenceBased: boolean;
}
export interface ResourceCreatedEvent extends DomainEvent<ResourceCreatedData> {
    type: 'resource.created';
    aggregateType: 'Resource';
}
export interface ResourcePublishedData {
    resourceId: string;
    authorId: string;
    title: string;
    type: ResourceType;
    category: ResourceCategory;
    isPublic: boolean;
    isPremium: boolean;
    publishedAt: string;
}
export interface ResourcePublishedEvent extends DomainEvent<ResourcePublishedData> {
    type: 'resource.published';
    aggregateType: 'Resource';
}
export interface ResourceUpdatedData {
    resourceId: string;
    authorId: string;
    changes: {
        title?: string;
        content?: boolean;
        category?: ResourceCategory;
        status?: ResourceStatus;
        isPublic?: boolean;
        tags?: string[];
    };
}
export interface ResourceUpdatedEvent extends DomainEvent<ResourceUpdatedData> {
    type: 'resource.updated';
    aggregateType: 'Resource';
}
export interface ResourceDeletedData {
    resourceId: string;
    authorId: string;
    title: string;
    deletedBy: string;
    reason?: string;
}
export interface ResourceDeletedEvent extends DomainEvent<ResourceDeletedData> {
    type: 'resource.deleted';
    aggregateType: 'Resource';
}
export interface ResourceViewedData {
    resourceId: string;
    authorId: string;
    viewerId: string;
    viewDuration?: number;
    deviceType?: string;
    referrer?: string;
    progressPercentage?: number;
}
export interface ResourceViewedEvent extends IntegrationEvent<ResourceViewedData> {
    type: 'resource.viewed';
}
export interface ResourceLikedData {
    resourceId: string;
    authorId: string;
    likedBy: string;
    totalLikes: number;
}
export interface ResourceLikedEvent extends DomainEvent<ResourceLikedData> {
    type: 'resource.liked';
    aggregateType: 'Resource';
}
export interface ResourceSavedData {
    resourceId: string;
    authorId: string;
    savedBy: string;
    totalSaves: number;
}
export interface ResourceSavedEvent extends DomainEvent<ResourceSavedData> {
    type: 'resource.saved';
    aggregateType: 'Resource';
}
export interface ResourceSharedData {
    resourceId: string;
    authorId: string;
    sharedBy: string;
    platform: string;
    totalShares: number;
}
export interface ResourceSharedEvent extends DomainEvent<ResourceSharedData> {
    type: 'resource.shared';
    aggregateType: 'Resource';
}
export interface ResourceRatedData {
    resourceId: string;
    authorId: string;
    ratedBy: string;
    rating: number;
    previousRating?: number;
    newAverageRating: number;
    totalRatings: number;
}
export interface ResourceRatedEvent extends DomainEvent<ResourceRatedData> {
    type: 'resource.rated';
    aggregateType: 'Resource';
}
export interface ResourceStartedData {
    resourceId: string;
    authorId: string;
    userId: string;
    startedAt: string;
    estimatedDuration?: number;
}
export interface ResourceStartedEvent extends IntegrationEvent<ResourceStartedData> {
    type: 'resource.started';
}
export interface ResourceProgressUpdatedData {
    resourceId: string;
    authorId: string;
    userId: string;
    previousProgress: number;
    currentProgress: number;
    timeSpent: number;
}
export interface ResourceProgressUpdatedEvent extends IntegrationEvent<ResourceProgressUpdatedData> {
    type: 'resource.progress_updated';
}
export interface ResourceCompletedData {
    resourceId: string;
    authorId: string;
    userId: string;
    completedAt: string;
    totalTimeSpent: number;
    finalRating?: number;
}
export interface ResourceCompletedEvent extends DomainEvent<ResourceCompletedData> {
    type: 'resource.completed';
    aggregateType: 'Resource';
}
export interface ResourceCollectionCreatedData {
    collectionId: string;
    curatorId: string;
    name: string;
    resourceIds: string[];
    isPublic: boolean;
}
export interface ResourceCollectionCreatedEvent extends DomainEvent<ResourceCollectionCreatedData> {
    type: 'resource.collection_created';
    aggregateType: 'ResourceCollection';
}
export interface ResourceAddedToCollectionData {
    collectionId: string;
    resourceId: string;
    curatorId: string;
    resourceAuthorId: string;
}
export interface ResourceAddedToCollectionEvent extends DomainEvent<ResourceAddedToCollectionData> {
    type: 'resource.added_to_collection';
    aggregateType: 'ResourceCollection';
}
export interface ResourceCommentedData {
    resourceId: string;
    commentId: string;
    authorId: string;
    commenterId: string;
    parentCommentId?: string;
    rating?: number;
}
export interface ResourceCommentedEvent extends DomainEvent<ResourceCommentedData> {
    type: 'resource.commented';
    aggregateType: 'Resource';
}
export interface ResourceFlaggedData {
    resourceId: string;
    authorId: string;
    flaggedBy: string;
    reason: string;
    details?: string;
}
export interface ResourceFlaggedEvent extends DomainEvent<ResourceFlaggedData> {
    type: 'resource.flagged';
    aggregateType: 'Resource';
}
export interface ResourceModeratedData {
    resourceId: string;
    authorId: string;
    moderatedBy: string;
    action: 'approved' | 'rejected' | 'removed';
    reason?: string;
    notes?: string;
}
export interface ResourceModeratedEvent extends DomainEvent<ResourceModeratedData> {
    type: 'resource.moderated';
    aggregateType: 'Resource';
}
export interface ResourceFeaturedData {
    resourceId: string;
    authorId: string;
    featuredBy: string;
    featuredUntil?: string;
}
export interface ResourceFeaturedEvent extends DomainEvent<ResourceFeaturedData> {
    type: 'resource.featured';
    aggregateType: 'Resource';
}
export interface ResourceRecommendedData {
    resourceId: string;
    authorId: string;
    recommendedTo: string;
    algorithm: string;
    score: number;
    factors: string[];
    category: ResourceCategory;
}
export interface ResourceRecommendedEvent extends IntegrationEvent<ResourceRecommendedData> {
    type: 'resource.recommended';
}
export type ResourceDomainEvent = ResourceCreatedEvent | ResourcePublishedEvent | ResourceUpdatedEvent | ResourceDeletedEvent | ResourceLikedEvent | ResourceSavedEvent | ResourceSharedEvent | ResourceRatedEvent | ResourceCompletedEvent | ResourceCollectionCreatedEvent | ResourceAddedToCollectionEvent | ResourceCommentedEvent | ResourceFlaggedEvent | ResourceModeratedEvent | ResourceFeaturedEvent;
export type ResourceIntegrationEvent = ResourceViewedEvent | ResourceStartedEvent | ResourceProgressUpdatedEvent | ResourceRecommendedEvent;
export type ResourceEvent = ResourceDomainEvent | ResourceIntegrationEvent;
//# sourceMappingURL=resource-events.d.ts.map