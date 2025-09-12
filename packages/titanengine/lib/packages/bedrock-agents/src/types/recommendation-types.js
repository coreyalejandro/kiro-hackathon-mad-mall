"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionRecommendationSchema = exports.RecommendationResultSchema = exports.RecommendationItemSchema = exports.RecommendationRequestSchema = exports.UserProfileSchema = void 0;
const zod_1 = require("zod");
// User profile for recommendations
exports.UserProfileSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    demographics: zod_1.z.object({
        ageRange: zod_1.z.string(),
        location: zod_1.z.string().optional(),
        culturalBackground: zod_1.z.array(zod_1.z.string()),
    }),
    healthProfile: zod_1.z.object({
        diagnosisStage: zod_1.z.enum(['newly_diagnosed', 'in_treatment', 'survivor', 'caregiver', 'supporter']),
        supportNeeds: zod_1.z.array(zod_1.z.string()),
        interests: zod_1.z.array(zod_1.z.string()),
        communicationStyle: zod_1.z.enum(['direct', 'supportive', 'informational', 'emotional']),
    }),
    preferences: zod_1.z.object({
        contentTypes: zod_1.z.array(zod_1.z.string()),
        interactionFrequency: zod_1.z.enum(['low', 'medium', 'high']),
        privacyLevel: zod_1.z.enum(['public', 'friends', 'private']),
    }),
    activityHistory: zod_1.z.object({
        joinedCircles: zod_1.z.array(zod_1.z.string()),
        sharedStories: zod_1.z.number().default(0),
        engagementScore: zod_1.z.number().min(0).max(1),
        lastActiveDate: zod_1.z.date(),
    }),
});
// Recommendation request
exports.RecommendationRequestSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    recommendationType: zod_1.z.enum(['circles', 'content', 'connections', 'resources', 'activities']),
    context: zod_1.z.object({
        currentPage: zod_1.z.string().optional(),
        recentActivity: zod_1.z.array(zod_1.z.string()).optional(),
        timeOfDay: zod_1.z.string().optional(),
        sessionDuration: zod_1.z.number().optional(),
    }).optional(),
    filters: zod_1.z.object({
        excludeIds: zod_1.z.array(zod_1.z.string()).default([]),
        maxResults: zod_1.z.number().positive().default(10),
        minRelevanceScore: zod_1.z.number().min(0).max(1).default(0.5),
    }).optional(),
});
// Recommendation item
exports.RecommendationItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    relevanceScore: zod_1.z.number().min(0).max(1),
    confidence: zod_1.z.number().min(0).max(1),
    reasoning: zod_1.z.string(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
});
// Recommendation result
exports.RecommendationResultSchema = zod_1.z.object({
    recommendations: zod_1.z.array(exports.RecommendationItemSchema),
    totalCount: zod_1.z.number(),
    algorithmUsed: zod_1.z.string(),
    personalizationScore: zod_1.z.number().min(0).max(1),
    diversityScore: zod_1.z.number().min(0).max(1),
    explanations: zod_1.z.array(zod_1.z.object({
        reason: zod_1.z.string(),
        weight: zod_1.z.number().min(0).max(1),
    })),
});
// Connection recommendation
exports.ConnectionRecommendationSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    recommendedUserId: zod_1.z.string(),
    connectionType: zod_1.z.enum(['peer_support', 'mentor', 'mentee', 'similar_journey', 'complementary_skills']),
    matchScore: zod_1.z.number().min(0).max(1),
    commonInterests: zod_1.z.array(zod_1.z.string()),
    sharedExperiences: zod_1.z.array(zod_1.z.string()),
    potentialBenefits: zod_1.z.array(zod_1.z.string()),
    iceBreakers: zod_1.z.array(zod_1.z.string()),
});
//# sourceMappingURL=recommendation-types.js.map