import { z } from 'zod';

// Wellness assessment input
export const WellnessAssessmentInputSchema = z.object({
  userId: z.string(),
  assessmentType: z.enum(['mood', 'stress', 'energy', 'social', 'physical', 'comprehensive']),
  responses: z.record(z.union([z.string(), z.number(), z.boolean()])),
  context: z.object({
    timeOfDay: z.string().optional(),
    recentEvents: z.array(z.string()).optional(),
    currentTreatment: z.string().optional(),
    supportSystemActive: z.boolean().optional(),
  }).optional(),
});

export type WellnessAssessmentInput = z.infer<typeof WellnessAssessmentInputSchema>;

// Wellness metrics
export const WellnessMetricsSchema = z.object({
  moodScore: z.number().min(0).max(10),
  stressLevel: z.number().min(0).max(10),
  energyLevel: z.number().min(0).max(10),
  socialConnection: z.number().min(0).max(10),
  physicalWellbeing: z.number().min(0).max(10),
  overallWellness: z.number().min(0).max(10),
  confidence: z.number().min(0).max(1),
  trend: z.enum(['improving', 'stable', 'declining', 'unknown']),
});

export type WellnessMetrics = z.infer<typeof WellnessMetricsSchema>;

// Wellness recommendation
export const WellnessRecommendationSchema = z.object({
  type: z.enum([
    'mindfulness_exercise',
    'physical_activity',
    'social_connection',
    'professional_support',
    'self_care_activity',
    'educational_resource',
    'community_engagement',
  ]),
  title: z.string(),
  description: z.string(),
  instructions: z.array(z.string()),
  duration: z.string(),
  difficulty: z.enum(['easy', 'moderate', 'challenging']),
  benefits: z.array(z.string()),
  contraindications: z.array(z.string()).optional(),
  resources: z.array(z.object({
    type: z.enum(['article', 'video', 'audio', 'app', 'website']),
    title: z.string(),
    url: z.string(),
    description: z.string().optional(),
  })).optional(),
});

export type WellnessRecommendation = z.infer<typeof WellnessRecommendationSchema>;

// Wellness coaching session
export const WellnessCoachingInputSchema = z.object({
  userId: z.string(),
  sessionType: z.enum(['check_in', 'goal_setting', 'crisis_support', 'progress_review', 'general_guidance']),
  userMessage: z.string(),
  currentGoals: z.array(z.object({
    id: z.string(),
    description: z.string(),
    progress: z.number().min(0).max(1),
    targetDate: z.date().optional(),
  })).optional(),
  recentMetrics: WellnessMetricsSchema.optional(),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'crisis']).default('medium'),
});

export type WellnessCoachingInput = z.infer<typeof WellnessCoachingInputSchema>;

// Wellness coaching response
export const WellnessCoachingResponseSchema = z.object({
  message: z.string(),
  tone: z.enum(['supportive', 'encouraging', 'informational', 'empathetic', 'motivational']),
  recommendations: z.array(WellnessRecommendationSchema),
  followUpQuestions: z.array(z.string()),
  actionItems: z.array(z.object({
    description: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    timeframe: z.string(),
  })),
  resources: z.array(z.object({
    type: z.string(),
    title: z.string(),
    description: z.string(),
    url: z.string().optional(),
  })),
  escalationNeeded: z.boolean(),
  escalationReason: z.string().optional(),
});

export type WellnessCoachingResponse = z.infer<typeof WellnessCoachingResponseSchema>;

// Crisis detection
export const CrisisIndicatorsSchema = z.object({
  riskLevel: z.enum(['none', 'low', 'medium', 'high', 'critical']),
  indicators: z.array(z.object({
    type: z.enum(['language_pattern', 'mood_decline', 'isolation', 'hopelessness', 'self_harm_mention']),
    severity: z.number().min(0).max(1),
    description: z.string(),
  })),
  immediateAction: z.boolean(),
  recommendedResponse: z.string(),
  professionalReferral: z.boolean(),
  emergencyContacts: z.array(z.object({
    name: z.string(),
    phone: z.string(),
    type: z.enum(['crisis_hotline', 'therapist', 'emergency', 'trusted_contact']),
  })).optional(),
});

export type CrisisIndicators = z.infer<typeof CrisisIndicatorsSchema>;