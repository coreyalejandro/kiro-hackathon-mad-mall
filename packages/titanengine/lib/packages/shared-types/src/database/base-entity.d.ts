/**
 * Base Entity Types for DynamoDB Single-Table Design
 */
export interface BaseEntity {
    PK: string;
    SK: string;
    GSI1PK?: string;
    GSI1SK?: string;
    GSI2PK?: string;
    GSI2SK?: string;
    GSI3PK?: string;
    GSI3SK?: string;
    GSI4PK?: string;
    GSI4SK?: string;
    entityType: string;
    version: number;
    createdAt: string;
    updatedAt: string;
    ttl?: number;
}
export interface EntityMetadata {
    entityType: string;
    version: number;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
    tenantId?: string;
}
export interface DynamoDBUser extends BaseEntity {
    userId: string;
    email: string;
    profile: {
        firstName: string;
        lastName: string;
        bio?: string;
        culturalBackground: string[];
        communicationStyle: string;
        diagnosisStage: string;
        supportNeeds: string[];
        location?: {
            city?: string;
            state?: string;
            country?: string;
        };
        joinDate: string;
        lastActive: string;
    };
    preferences: {
        profileVisibility: string;
        showRealName: boolean;
        allowDirectMessages: boolean;
        shareHealthJourney: boolean;
        emailNotifications: boolean;
        pushNotifications: boolean;
        weeklyDigest: boolean;
        circleNotifications: boolean;
        contentPreferences: string[];
        circleInterests: string[];
    };
    settings: {
        theme: string;
        language: string;
        timezone: string;
        accessibility: {
            highContrast: boolean;
            largeText: boolean;
            screenReader: boolean;
            reducedMotion: boolean;
        };
    };
    primaryGoals: string[];
    isVerified: boolean;
    isActive: boolean;
    stats?: {
        storiesShared: number;
        circlesJoined: number;
        commentsPosted: number;
        helpfulVotes: number;
        daysActive: number;
        streakDays: number;
    };
}
export interface DynamoDBCircle extends BaseEntity {
    circleId: string;
    name: string;
    description: string;
    type: string;
    privacyLevel: string;
    settings: {
        isPrivate: boolean;
        requireApproval: boolean;
        maxMembers?: number;
        culturalFocus?: string[];
        allowGuestPosts: boolean;
        moderationLevel: string;
        contentGuidelines?: string;
        meetingSchedule?: {
            frequency: string;
            dayOfWeek?: number;
            time?: string;
            timezone?: string;
        };
    };
    moderators: string[];
    tags: string[];
    coverImage?: string;
    stats: {
        memberCount: number;
        activeMembers: number;
        postsThisWeek: number;
        postsThisMonth: number;
        engagementRate: number;
        averageResponseTime: number;
    };
    createdBy: string;
    isActive: boolean;
    status: string;
}
export interface DynamoDBCircleMember extends BaseEntity {
    circleId: string;
    userId: string;
    role: string;
    status: string;
    joinedAt: string;
    lastActive: string;
    contributionScore: number;
    badges: string[];
    notes?: string;
}
export interface DynamoDBStory extends BaseEntity {
    storyId: string;
    title: string;
    content: string;
    excerpt?: string;
    author: {
        id: string;
        displayName: string;
        avatar?: string;
        isVerified: boolean;
    };
    type: string;
    status: string;
    themes: string[];
    tags: string[];
    circleId?: string;
    engagement: {
        likes: number;
        comments: number;
        shares: number;
        saves: number;
        views: number;
        helpfulVotes: number;
    };
    metadata: {
        readTime: number;
        wordCount: number;
        culturalElements: string[];
        therapeuticValue: string[];
        triggerWarnings?: string[];
        ageAppropriate: boolean;
    };
    moderationStatus: string;
    moderationNotes?: string;
    featuredAt?: string;
    publishedAt?: string;
}
export interface DynamoDBBusiness extends BaseEntity {
    businessId: string;
    profile: {
        name: string;
        description: string;
        mission?: string;
        foundedYear?: number;
        founderStory?: string;
        website?: string;
        socialMedia: Record<string, string>;
        contact: {
            email: string;
            phone?: string;
            address?: {
                street: string;
                city: string;
                state: string;
                zipCode: string;
                country: string;
            };
        };
        logo?: string;
        coverImage?: string;
        gallery: string[];
    };
    type: string;
    status: string;
    certifications: string[];
    specialties: string[];
    servicesOffered: string[];
    targetAudience: string[];
    culturalCompetencies: string[];
    metrics: {
        rating: number;
        reviewCount: number;
        trustScore: number;
        responseRate: number;
        averageResponseTime: number;
        repeatCustomerRate: number;
    };
    ownerId: string;
    verifiedAt?: string;
    featuredUntil?: string;
}
export interface DynamoDBResource extends BaseEntity {
    resourceId: string;
    title: string;
    description: string;
    content?: string;
    summary: string;
    type: string;
    category: string;
    subcategories: string[];
    status: string;
    author: {
        id: string;
        name: string;
        credentials?: string[];
        bio?: string;
        avatar?: string;
        isVerified: boolean;
        specialties: string[];
    };
    contributors?: Array<{
        id: string;
        name: string;
        credentials?: string[];
        bio?: string;
        avatar?: string;
        isVerified: boolean;
        specialties: string[];
    }>;
    metadata: {
        readTime?: number;
        watchTime?: number;
        listenTime?: number;
        difficulty: string;
        prerequisites?: string[];
        learningObjectives: string[];
        culturalConsiderations: string[];
        therapeuticValue: string[];
        evidenceBased: boolean;
        lastReviewed?: string;
        reviewedBy?: string;
    };
    engagement: {
        views: number;
        likes: number;
        saves: number;
        shares: number;
        helpfulVotes: number;
        completions?: number;
        averageRating: number;
        ratingCount: number;
    };
    tags: string[];
    relatedResources: string[];
    externalUrl?: string;
    downloadUrl?: string;
    thumbnailUrl?: string;
    attachments?: Array<{
        id: string;
        name: string;
        url: string;
        type: string;
        size: number;
    }>;
    isPublic: boolean;
    isPremium: boolean;
    price?: {
        amount: number;
        currency: string;
    };
    publishedAt?: string;
}
/**
 * Image and Cultural Systems Entities (Feedback, Incidents, Advisory, Premium Sources, Personalization)
 */
export interface DynamoDBImageAsset extends BaseEntity {
    imageId: string;
    url: string;
    thumbnailUrl?: string;
    altText: string;
    category: string;
    tags: string[];
    source: 'generated' | 'premium' | 'user_upload' | 'stock';
    sourceInfo?: {
        provider?: string;
        licenseType?: string;
        licenseId?: string;
        attribution?: string;
        expiresAt?: string;
        originalUrl?: string;
    };
    status: 'active' | 'archived' | 'flagged' | 'removed' | 'pending_review';
    validation?: {
        culturalScore: number;
        sensitivityScore: number;
        inclusivityScore: number;
        lastValidatedAt?: string;
        validator?: string;
        issues?: string[];
    };
    usage?: {
        contexts: string[];
        lastUsedAt?: string;
        totalImpressions?: number;
        totalClicks?: number;
    };
}
export interface DynamoDBFeedback extends BaseEntity {
    feedbackId: string;
    imageId: string;
    userId: string;
    rating: number;
    comment?: string;
    categories: Array<'representation' | 'appropriateness' | 'stereotype' | 'context_mismatch' | 'other'>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    isReport: boolean;
    status: 'new' | 'acknowledged' | 'in_review' | 'resolved' | 'dismissed';
    resolution?: {
        resolvedBy?: string;
        resolvedAt?: string;
        action?: 'removed' | 'replaced' | 'edited' | 'no_action';
        notes?: string;
    };
    metadata?: Record<string, any>;
}
export interface DynamoDBIncident extends BaseEntity {
    incidentId: string;
    relatedImageId?: string;
    triggeredBy: 'community_report' | 'automated_detection' | 'staff' | 'advisory_board';
    status: 'open' | 'investigating' | 'mitigated' | 'closed';
    priority: 'p1' | 'p2' | 'p3';
    summary: string;
    details?: string;
    escalation?: {
        level: 0 | 1 | 2 | 3;
        onCallNotifiedAt?: string;
        advisoryBoardNotifiedAt?: string;
        commsSentAt?: string;
    };
    alerts?: Array<{
        type: string;
        sentAt: string;
        channel: 'email' | 'slack' | 'sms' | 'webhook';
    }>;
}
export interface DynamoDBAdvisoryReview extends BaseEntity {
    reviewId: string;
    targetType: 'image' | 'resource' | 'story';
    targetId: string;
    submittedBy: string;
    assignedTo?: string;
    status: 'queued' | 'in_review' | 'approved' | 'changes_requested' | 'rejected';
    notes?: string;
    decisions?: Array<{
        reviewerId: string;
        decision: 'approve' | 'request_changes' | 'reject';
        rationale: string;
        decidedAt: string;
    }>;
    consensus?: {
        score: number;
        requiredVotes: number;
        receivedVotes: number;
    };
}
export interface DynamoDBPremiumSource extends BaseEntity {
    sourceId: string;
    provider: 'createher' | 'nappy' | 'other';
    displayName: string;
    apiBaseUrl?: string;
    apiKeyArn?: string;
    licenseDefaults: {
        licenseType: string;
        attributionTemplate?: string;
        usageRestrictions?: string[];
    };
    status: 'active' | 'inactive';
    qualityThreshold?: number;
}
export interface DynamoDBPersonalizationProfile extends BaseEntity {
    userId: string;
    preferences: {
        imageStyles?: string[];
        avoidTags?: string[];
        preferredContexts?: string[];
    };
    engagement: {
        impressions: number;
        clicks: number;
        dwellTimeMs?: number;
        lastInteractionAt?: string;
    };
    abTests?: Array<{
        experimentId: string;
        variant: 'A' | 'B' | 'C';
        startedAt: string;
        endedAt?: string;
        metrics?: Record<string, number>;
    }>;
    cohorts?: string[];
}
export declare const KeyPatterns: {
    readonly USER_PROFILE: (userId: string) => {
        PK: string;
        SK: string;
    };
    readonly USER_BY_EMAIL: (email: string, userId: string) => {
        GSI1PK: string;
        GSI1SK: string;
    };
    readonly USER_CIRCLES: (userId: string) => {
        PK: string;
        SK: {
            beginsWith: string;
        };
    };
    readonly CIRCLE_METADATA: (circleId: string) => {
        PK: string;
        SK: string;
    };
    readonly CIRCLE_MEMBER: (circleId: string, userId: string) => {
        PK: string;
        SK: string;
    };
    readonly CIRCLES_BY_TYPE: (type: string) => {
        GSI1PK: string;
    };
    readonly STORY_METADATA: (storyId: string) => {
        PK: string;
        SK: string;
    };
    readonly STORY_COMMENT: (storyId: string, commentId: string) => {
        PK: string;
        SK: string;
    };
    readonly STORY_FEED: () => {
        GSI2PK: string;
    };
    readonly BUSINESS_METADATA: (businessId: string) => {
        PK: string;
        SK: string;
    };
    readonly BUSINESSES_BY_CATEGORY: (category: string) => {
        GSI1PK: string;
    };
    readonly RESOURCE_METADATA: (resourceId: string) => {
        PK: string;
        SK: string;
    };
    readonly RESOURCES_BY_TYPE: (type: string) => {
        GSI1PK: string;
    };
    readonly RESOURCES_BY_CATEGORY: (category: string) => {
        GSI2PK: string;
    };
    readonly TENANT_USERS: (tenantId: string) => {
        GSI4PK: string;
    };
    readonly TENANT_CIRCLES: (tenantId: string) => {
        GSI4PK: string;
    };
    readonly TENANT_RESOURCES: (tenantId: string) => {
        GSI4PK: string;
    };
    readonly IMAGE_METADATA: (imageId: string) => {
        PK: string;
        SK: string;
    };
    readonly IMAGES_BY_CATEGORY: (category: string) => {
        GSI1PK: string;
    };
    readonly IMAGE_STATUS: (status: string) => {
        GSI3PK: string;
    };
    readonly FEEDBACK_FOR_IMAGE: (imageId: string, userId: string, timestampIso: string) => {
        PK: string;
        SK: string;
        GSI1PK: string;
        GSI1SK: string;
    };
    readonly FEEDBACK_BY_SEVERITY: (severity: string) => {
        GSI3PK: string;
    };
    readonly INCIDENT_METADATA: (incidentId: string) => {
        PK: string;
        SK: string;
    };
    readonly INCIDENT_STATUS: (status: string) => {
        GSI3PK: string;
    };
    readonly ADVISORY_QUEUE: (reviewId: string) => {
        PK: string;
        SK: string;
    };
    readonly ADVISORY_BY_TARGET: (targetType: string, targetId: string) => {
        GSI1PK: string;
    };
    readonly ADVISORY_BY_STATUS: (status: string) => {
        GSI3PK: string;
    };
    readonly PREMIUM_SOURCE_METADATA: (sourceId: string) => {
        PK: string;
        SK: string;
    };
    readonly PREMIUM_BY_PROVIDER: (provider: string) => {
        GSI1PK: string;
    };
    readonly PERSONALIZATION_PROFILE: (userId: string) => {
        PK: string;
        SK: string;
    };
    readonly PERSONALIZATION_BY_COHORT: (cohortId: string) => {
        GSI1PK: string;
    };
};
