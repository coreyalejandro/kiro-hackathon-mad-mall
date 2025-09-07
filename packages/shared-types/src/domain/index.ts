/**
 * Domain Models Index
 * Exports all domain types and interfaces
 */

// User domain exports
export * from './user';

// Circle domain exports
export * from './circle';

// Story domain exports
export * from './story';

// Business domain exports (excluding ContentModerationStatus to avoid conflict)
export type {
  BusinessType,
  BusinessStatus,
  CertificationType,
  BusinessProfile,
  BusinessMetrics,
  Business,
  Product,
  ProductReview,
  BusinessReview,
} from './business';

// Resource domain exports (excluding ContentModerationStatus to avoid conflict)
export type {
  ResourceType,
  ResourceCategory,
  ResourceDifficulty,
  ResourceStatus,
  ResourceAuthor,
  ResourceMetadata,
  ResourceEngagement,
  Resource,
  ResourceComment,
  ResourceCollection,
  ResourceProgress,
} from './resource';

// Comedy domain exports (excluding ContentModerationStatus to avoid conflict)
export type * from './comedy';

// Discussion domain exports (excluding ContentModerationStatus to avoid conflict)  
export type * from './discussion';

// Common types used across domains
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimestampedEntity extends BaseEntity {
  version: number;
}

export interface SoftDeletableEntity extends TimestampedEntity {
  deletedAt?: Date;
  isDeleted: boolean;
}

export interface AuditableEntity extends TimestampedEntity {
  createdBy: string;
  updatedBy: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search and filter types
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  tags?: string[];
  categories?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchResult<T> {
  item: T;
  score: number;
  highlights?: Record<string, string[]>;
}

// Content moderation types
export type ModerationAction = 
  | 'approve'
  | 'reject'
  | 'flag'
  | 'remove'
  | 'warn'
  | 'suspend';

export interface ModerationLog {
  id: string;
  entityId: string;
  entityType: string;
  action: ModerationAction;
  reason: string;
  moderatorId: string;
  notes?: string;
  createdAt: Date;
}

// Notification types
export type NotificationType = 
  | 'circle_invitation'
  | 'circle_join_request'
  | 'story_comment'
  | 'discussion_response'
  | 'mention'
  | 'like'
  | 'follow'
  | 'system_announcement'
  | 'wellness_reminder';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

// Analytics and metrics types
export interface EngagementMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clickThroughs: number;
  timeSpent: number;
}

export interface UserEngagementSummary {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  storiesRead: number;
  commentsPosted: number;
  circlesActive: number;
  resourcesAccessed: number;
  comedyWatched: number;
  totalTimeSpent: number;
  date: Date;
}