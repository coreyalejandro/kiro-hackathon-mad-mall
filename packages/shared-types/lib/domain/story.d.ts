/**
 * Story Domain Models
 * User story and content sharing types
 */
export type StoryType = 'personal_experience' | 'milestone_celebration' | 'challenge_overcome' | 'advice_sharing' | 'gratitude_expression' | 'awareness_raising';
export type StoryStatus = 'draft' | 'published' | 'archived' | 'flagged' | 'removed';
export type ContentModerationStatus = 'pending' | 'approved' | 'rejected' | 'needs_review';
export interface StoryTheme {
    id: string;
    name: string;
    description: string;
    color: string;
    icon?: string;
}
export interface StoryEngagement {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    views: number;
    helpfulVotes: number;
}
export interface StoryMetadata {
    readTime: number;
    wordCount: number;
    culturalElements: string[];
    therapeuticValue: string[];
    triggerWarnings?: string[];
    ageAppropriate: boolean;
}
export interface Story {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    author: {
        id: string;
        displayName: string;
        avatar?: string;
        isVerified: boolean;
    };
    type: StoryType;
    status: StoryStatus;
    themes: string[];
    tags: string[];
    circleId?: string;
    engagement: StoryEngagement;
    metadata: StoryMetadata;
    moderationStatus: ContentModerationStatus;
    moderationNotes?: string;
    featuredAt?: Date;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface StoryComment {
    id: string;
    storyId: string;
    author: {
        id: string;
        displayName: string;
        avatar?: string;
    };
    content: string;
    parentCommentId?: string;
    likes: number;
    replies: StoryComment[];
    isEdited: boolean;
    moderationStatus: ContentModerationStatus;
    createdAt: Date;
    updatedAt: Date;
}
export interface StoryDraft {
    id: string;
    userId: string;
    title: string;
    content: string;
    type?: StoryType;
    themes: string[];
    tags: string[];
    circleId?: string;
    autoSaveAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=story.d.ts.map