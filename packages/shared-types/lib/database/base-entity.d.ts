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
};
//# sourceMappingURL=base-entity.d.ts.map