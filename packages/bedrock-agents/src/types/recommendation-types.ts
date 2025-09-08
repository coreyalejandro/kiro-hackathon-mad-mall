import { z } from 'zod';

// User profile for recommendations
export const UserProfileSchema = z.object({
  userId: z.string(),
  demographics: z.object({
    ageRange: z.string(),
    location: z.string().optional(),
    culturalBackground: z.array(z.string()),
  }),
  healthProfile: z.object({
    diagnosisStage: z.enum(['newly_diagnosed', 'in_treatment', 'survivor', 'caregiver', 'supporter']),
    supportNeeds: z.array(z.string()),
    interests: z.array(z.string()),
    communicationStyle: z.enum(['direct', 'supportive', 'informational', 'emotional']),
  }),
  preferences: z.object({
    contentTypes: z.array(z.string()),
    interactionFrequency: z.enum(['low', 'medium', 'high']),
    privacyLevel: z.enum(['public', 'friends', 'private']),
  }),
  activityHistory: z.object({
    joinedCircles: z.array(z.string()),
    sharedStories: z.number().default(0),
    engagementScore: z.number().min(0).max(1),
    lastActiveDate: z.date(),
  }),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// Recommendation request
export const RecommendationRequestSchema = z.object({
  userId: z.string(),
  recommendationType: z.enum(['circles', 'content', 'connections', 'resources', 'activities']),
  context: z.object({
    currentPage: z.string().optional(),
    recentActivity: z.array(z.string()).optional(),
    timeOfDay: z.string().optional(),
    sessionDuration: z.number().optional(),
  }).optional(),
  filters: z.object({
    excludeIds: z.array(z.string()).default([]),
    maxResults: z.number().positive().default(10),
    minRelevanceScore: z.number().min(0).max(1).default(0.5),
  }).optional(),
});

export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>;

// Recommendation item
export const RecommendationItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  relevanceScore: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).default([]),
});

export type RecommendationItem = z.infer<typeof RecommendationItemSchema>;

// Recommendation result
export const RecommendationResultSchema = z.object({
  recommendations: z.array(RecommendationItemSchema),
  totalCount: z.number(),
  algorithmUsed: z.string(),
  personalizationScore: z.number().min(0).max(1),
  diversityScore: z.number().min(0).max(1),
  explanations: z.array(z.object({
    reason: z.string(),
    weight: z.number().min(0).max(1),
  })),
});

export type RecommendationResult = z.infer<typeof RecommendationResultSchema>;

// Connection recommendation
export const ConnectionRecommendationSchema = z.object({
  userId: z.string(),
  recommendedUserId: z.string(),
  connectionType: z.enum(['peer_support', 'mentor', 'mentee', 'similar_journey', 'complementary_skills']),
  matchScore: z.number().min(0).max(1),
  commonInterests: z.array(z.string()),
  sharedExperiences: z.array(z.string()),
  potentialBenefits: z.array(z.string()),
  iceBreakers: z.array(z.string()),
});

export type ConnectionRecommendation = z.infer<typeof ConnectionRecommendationSchema>;