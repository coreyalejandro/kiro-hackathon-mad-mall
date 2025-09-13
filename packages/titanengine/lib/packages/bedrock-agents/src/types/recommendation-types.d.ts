import { z } from 'zod';
export declare const UserProfileSchema: z.ZodObject<{
    userId: z.ZodString;
    demographics: z.ZodObject<{
        ageRange: z.ZodString;
        location: z.ZodOptional<z.ZodString>;
        culturalBackground: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        ageRange: string;
        culturalBackground: string[];
        location?: string | undefined;
    }, {
        ageRange: string;
        culturalBackground: string[];
        location?: string | undefined;
    }>;
    healthProfile: z.ZodObject<{
        diagnosisStage: z.ZodEnum<["newly_diagnosed", "in_treatment", "survivor", "caregiver", "supporter"]>;
        supportNeeds: z.ZodArray<z.ZodString, "many">;
        interests: z.ZodArray<z.ZodString, "many">;
        communicationStyle: z.ZodEnum<["direct", "supportive", "informational", "emotional"]>;
    }, "strip", z.ZodTypeAny, {
        communicationStyle: "direct" | "supportive" | "informational" | "emotional";
        diagnosisStage: "newly_diagnosed" | "in_treatment" | "survivor" | "caregiver" | "supporter";
        supportNeeds: string[];
        interests: string[];
    }, {
        communicationStyle: "direct" | "supportive" | "informational" | "emotional";
        diagnosisStage: "newly_diagnosed" | "in_treatment" | "survivor" | "caregiver" | "supporter";
        supportNeeds: string[];
        interests: string[];
    }>;
    preferences: z.ZodObject<{
        contentTypes: z.ZodArray<z.ZodString, "many">;
        interactionFrequency: z.ZodEnum<["low", "medium", "high"]>;
        privacyLevel: z.ZodEnum<["public", "friends", "private"]>;
    }, "strip", z.ZodTypeAny, {
        privacyLevel: "public" | "friends" | "private";
        contentTypes: string[];
        interactionFrequency: "low" | "medium" | "high";
    }, {
        privacyLevel: "public" | "friends" | "private";
        contentTypes: string[];
        interactionFrequency: "low" | "medium" | "high";
    }>;
    activityHistory: z.ZodObject<{
        joinedCircles: z.ZodArray<z.ZodString, "many">;
        sharedStories: z.ZodDefault<z.ZodNumber>;
        engagementScore: z.ZodNumber;
        lastActiveDate: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        joinedCircles: string[];
        sharedStories: number;
        engagementScore: number;
        lastActiveDate: Date;
    }, {
        joinedCircles: string[];
        engagementScore: number;
        lastActiveDate: Date;
        sharedStories?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    demographics: {
        ageRange: string;
        culturalBackground: string[];
        location?: string | undefined;
    };
    healthProfile: {
        communicationStyle: "direct" | "supportive" | "informational" | "emotional";
        diagnosisStage: "newly_diagnosed" | "in_treatment" | "survivor" | "caregiver" | "supporter";
        supportNeeds: string[];
        interests: string[];
    };
    preferences: {
        privacyLevel: "public" | "friends" | "private";
        contentTypes: string[];
        interactionFrequency: "low" | "medium" | "high";
    };
    activityHistory: {
        joinedCircles: string[];
        sharedStories: number;
        engagementScore: number;
        lastActiveDate: Date;
    };
}, {
    userId: string;
    demographics: {
        ageRange: string;
        culturalBackground: string[];
        location?: string | undefined;
    };
    healthProfile: {
        communicationStyle: "direct" | "supportive" | "informational" | "emotional";
        diagnosisStage: "newly_diagnosed" | "in_treatment" | "survivor" | "caregiver" | "supporter";
        supportNeeds: string[];
        interests: string[];
    };
    preferences: {
        privacyLevel: "public" | "friends" | "private";
        contentTypes: string[];
        interactionFrequency: "low" | "medium" | "high";
    };
    activityHistory: {
        joinedCircles: string[];
        engagementScore: number;
        lastActiveDate: Date;
        sharedStories?: number | undefined;
    };
}>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export declare const RecommendationRequestSchema: z.ZodObject<{
    userId: z.ZodString;
    recommendationType: z.ZodEnum<["circles", "content", "connections", "resources", "activities"]>;
    context: z.ZodOptional<z.ZodObject<{
        currentPage: z.ZodOptional<z.ZodString>;
        recentActivity: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        timeOfDay: z.ZodOptional<z.ZodString>;
        sessionDuration: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        currentPage?: string | undefined;
        recentActivity?: string[] | undefined;
        timeOfDay?: string | undefined;
        sessionDuration?: number | undefined;
    }, {
        currentPage?: string | undefined;
        recentActivity?: string[] | undefined;
        timeOfDay?: string | undefined;
        sessionDuration?: number | undefined;
    }>>;
    filters: z.ZodOptional<z.ZodObject<{
        excludeIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        maxResults: z.ZodDefault<z.ZodNumber>;
        minRelevanceScore: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        excludeIds: string[];
        maxResults: number;
        minRelevanceScore: number;
    }, {
        excludeIds?: string[] | undefined;
        maxResults?: number | undefined;
        minRelevanceScore?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    recommendationType: "circles" | "content" | "resources" | "connections" | "activities";
    context?: {
        currentPage?: string | undefined;
        recentActivity?: string[] | undefined;
        timeOfDay?: string | undefined;
        sessionDuration?: number | undefined;
    } | undefined;
    filters?: {
        excludeIds: string[];
        maxResults: number;
        minRelevanceScore: number;
    } | undefined;
}, {
    userId: string;
    recommendationType: "circles" | "content" | "resources" | "connections" | "activities";
    context?: {
        currentPage?: string | undefined;
        recentActivity?: string[] | undefined;
        timeOfDay?: string | undefined;
        sessionDuration?: number | undefined;
    } | undefined;
    filters?: {
        excludeIds?: string[] | undefined;
        maxResults?: number | undefined;
        minRelevanceScore?: number | undefined;
    } | undefined;
}>;
export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>;
export declare const RecommendationItemSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    relevanceScore: z.ZodNumber;
    confidence: z.ZodNumber;
    reasoning: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    description: string;
    type: string;
    id: string;
    tags: string[];
    title: string;
    confidence: number;
    reasoning: string;
    relevanceScore: number;
    metadata?: Record<string, any> | undefined;
}, {
    description: string;
    type: string;
    id: string;
    title: string;
    confidence: number;
    reasoning: string;
    relevanceScore: number;
    tags?: string[] | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export type RecommendationItem = z.infer<typeof RecommendationItemSchema>;
export declare const RecommendationResultSchema: z.ZodObject<{
    recommendations: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        relevanceScore: z.ZodNumber;
        confidence: z.ZodNumber;
        reasoning: z.ZodString;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        type: string;
        id: string;
        tags: string[];
        title: string;
        confidence: number;
        reasoning: string;
        relevanceScore: number;
        metadata?: Record<string, any> | undefined;
    }, {
        description: string;
        type: string;
        id: string;
        title: string;
        confidence: number;
        reasoning: string;
        relevanceScore: number;
        tags?: string[] | undefined;
        metadata?: Record<string, any> | undefined;
    }>, "many">;
    totalCount: z.ZodNumber;
    algorithmUsed: z.ZodString;
    personalizationScore: z.ZodNumber;
    diversityScore: z.ZodNumber;
    explanations: z.ZodArray<z.ZodObject<{
        reason: z.ZodString;
        weight: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        reason: string;
        weight: number;
    }, {
        reason: string;
        weight: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    recommendations: {
        description: string;
        type: string;
        id: string;
        tags: string[];
        title: string;
        confidence: number;
        reasoning: string;
        relevanceScore: number;
        metadata?: Record<string, any> | undefined;
    }[];
    totalCount: number;
    algorithmUsed: string;
    personalizationScore: number;
    diversityScore: number;
    explanations: {
        reason: string;
        weight: number;
    }[];
}, {
    recommendations: {
        description: string;
        type: string;
        id: string;
        title: string;
        confidence: number;
        reasoning: string;
        relevanceScore: number;
        tags?: string[] | undefined;
        metadata?: Record<string, any> | undefined;
    }[];
    totalCount: number;
    algorithmUsed: string;
    personalizationScore: number;
    diversityScore: number;
    explanations: {
        reason: string;
        weight: number;
    }[];
}>;
export type RecommendationResult = z.infer<typeof RecommendationResultSchema>;
export declare const ConnectionRecommendationSchema: z.ZodObject<{
    userId: z.ZodString;
    recommendedUserId: z.ZodString;
    connectionType: z.ZodEnum<["peer_support", "mentor", "mentee", "similar_journey", "complementary_skills"]>;
    matchScore: z.ZodNumber;
    commonInterests: z.ZodArray<z.ZodString, "many">;
    sharedExperiences: z.ZodArray<z.ZodString, "many">;
    potentialBenefits: z.ZodArray<z.ZodString, "many">;
    iceBreakers: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    userId: string;
    recommendedUserId: string;
    connectionType: "peer_support" | "mentor" | "mentee" | "similar_journey" | "complementary_skills";
    matchScore: number;
    commonInterests: string[];
    sharedExperiences: string[];
    potentialBenefits: string[];
    iceBreakers: string[];
}, {
    userId: string;
    recommendedUserId: string;
    connectionType: "peer_support" | "mentor" | "mentee" | "similar_journey" | "complementary_skills";
    matchScore: number;
    commonInterests: string[];
    sharedExperiences: string[];
    potentialBenefits: string[];
    iceBreakers: string[];
}>;
export type ConnectionRecommendation = z.infer<typeof ConnectionRecommendationSchema>;
