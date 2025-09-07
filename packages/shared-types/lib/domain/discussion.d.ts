/**
 * Discussion Domain Models
 * Peer circle discussions and community conversations
 */
import { ContentModerationStatus } from './story';
export type DiscussionType = 'question' | 'advice_seeking' | 'experience_sharing' | 'resource_sharing' | 'support_request' | 'celebration' | 'poll' | 'announcement';
export type DiscussionStatus = 'active' | 'resolved' | 'closed' | 'pinned' | 'archived' | 'flagged';
export type DiscussionPriority = 'low' | 'normal' | 'high' | 'urgent';
export interface DiscussionMetadata {
    isAnonymous: boolean;
    allowsAnonymousReplies: boolean;
    requiresModeration: boolean;
    culturalSensitivity: string[];
    triggerWarnings?: string[];
    therapeuticTags: string[];
    expertiseNeeded?: string[];
}
export interface DiscussionEngagement {
    views: number;
    responses: number;
    likes: number;
    saves: number;
    shares: number;
    helpfulVotes: number;
    lastActivity: Date;
}
export interface DiscussionPoll {
    question: string;
    options: {
        id: string;
        text: string;
        votes: number;
        voters: string[];
    }[];
    allowMultipleChoices: boolean;
    allowAddOptions: boolean;
    expiresAt?: Date;
    isAnonymous: boolean;
}
export interface Discussion {
    id: string;
    title: string;
    content: string;
    type: DiscussionType;
    status: DiscussionStatus;
    priority: DiscussionPriority;
    author: {
        id: string;
        displayName: string;
        avatar?: string;
        isAnonymous: boolean;
    };
    circleId: string;
    category?: string;
    metadata: DiscussionMetadata;
    engagement: DiscussionEngagement;
    tags: string[];
    poll?: DiscussionPoll;
    attachments?: {
        id: string;
        name: string;
        url: string;
        type: string;
        size: number;
    }[];
    moderationStatus: ContentModerationStatus;
    moderationNotes?: string;
    resolvedAt?: Date;
    resolvedBy?: string;
    pinnedAt?: Date;
    pinnedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface DiscussionResponse {
    id: string;
    discussionId: string;
    author: {
        id: string;
        displayName: string;
        avatar?: string;
        isAnonymous: boolean;
        badges?: string[];
    };
    content: string;
    parentResponseId?: string;
    likes: number;
    helpfulVotes: number;
    replies: DiscussionResponse[];
    isEdited: boolean;
    isExpertResponse: boolean;
    isBestAnswer: boolean;
    markedBestBy?: string;
    markedBestAt?: Date;
    attachments?: {
        id: string;
        name: string;
        url: string;
        type: string;
        size: number;
    }[];
    moderationStatus: ContentModerationStatus;
    createdAt: Date;
    updatedAt: Date;
}
export interface DiscussionSubscription {
    id: string;
    userId: string;
    discussionId: string;
    notificationLevel: 'all' | 'mentions' | 'responses' | 'none';
    createdAt: Date;
}
export interface DiscussionReport {
    id: string;
    discussionId: string;
    responseId?: string;
    reporterId: string;
    reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';
    description?: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    reviewedBy?: string;
    reviewedAt?: Date;
    action?: 'none' | 'warning' | 'content_removed' | 'user_suspended';
    createdAt: Date;
}
export interface DiscussionBookmark {
    id: string;
    userId: string;
    discussionId: string;
    responseId?: string;
    notes?: string;
    tags?: string[];
    createdAt: Date;
}
//# sourceMappingURL=discussion.d.ts.map