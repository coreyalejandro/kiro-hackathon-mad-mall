"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrisisIndicatorsSchema = exports.WellnessCoachingResponseSchema = exports.WellnessCoachingInputSchema = exports.WellnessRecommendationSchema = exports.WellnessMetricsSchema = exports.WellnessAssessmentInputSchema = void 0;
const zod_1 = require("zod");
// Wellness assessment input
exports.WellnessAssessmentInputSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    assessmentType: zod_1.z.enum(['mood', 'stress', 'energy', 'social', 'physical', 'comprehensive']),
    responses: zod_1.z.record(zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean()])),
    context: zod_1.z.object({
        timeOfDay: zod_1.z.string().optional(),
        recentEvents: zod_1.z.array(zod_1.z.string()).optional(),
        currentTreatment: zod_1.z.string().optional(),
        supportSystemActive: zod_1.z.boolean().optional(),
    }).optional(),
});
// Wellness metrics
exports.WellnessMetricsSchema = zod_1.z.object({
    moodScore: zod_1.z.number().min(0).max(10),
    stressLevel: zod_1.z.number().min(0).max(10),
    energyLevel: zod_1.z.number().min(0).max(10),
    socialConnection: zod_1.z.number().min(0).max(10),
    physicalWellbeing: zod_1.z.number().min(0).max(10),
    overallWellness: zod_1.z.number().min(0).max(10),
    confidence: zod_1.z.number().min(0).max(1),
    trend: zod_1.z.enum(['improving', 'stable', 'declining', 'unknown']),
});
// Wellness recommendation
exports.WellnessRecommendationSchema = zod_1.z.object({
    type: zod_1.z.enum([
        'mindfulness_exercise',
        'physical_activity',
        'social_connection',
        'professional_support',
        'self_care_activity',
        'educational_resource',
        'community_engagement',
    ]),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    instructions: zod_1.z.array(zod_1.z.string()),
    duration: zod_1.z.string(),
    difficulty: zod_1.z.enum(['easy', 'moderate', 'challenging']),
    benefits: zod_1.z.array(zod_1.z.string()),
    contraindications: zod_1.z.array(zod_1.z.string()).optional(),
    resources: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['article', 'video', 'audio', 'app', 'website']),
        title: zod_1.z.string(),
        url: zod_1.z.string(),
        description: zod_1.z.string().optional(),
    })).optional(),
});
// Wellness coaching session
exports.WellnessCoachingInputSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    sessionType: zod_1.z.enum(['check_in', 'goal_setting', 'crisis_support', 'progress_review', 'general_guidance']),
    userMessage: zod_1.z.string(),
    currentGoals: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        description: zod_1.z.string(),
        progress: zod_1.z.number().min(0).max(1),
        targetDate: zod_1.z.date().optional(),
    })).optional(),
    recentMetrics: exports.WellnessMetricsSchema.optional(),
    urgencyLevel: zod_1.z.enum(['low', 'medium', 'high', 'crisis']).default('medium'),
});
// Wellness coaching response
exports.WellnessCoachingResponseSchema = zod_1.z.object({
    message: zod_1.z.string(),
    tone: zod_1.z.enum(['supportive', 'encouraging', 'informational', 'empathetic', 'motivational']),
    recommendations: zod_1.z.array(exports.WellnessRecommendationSchema),
    followUpQuestions: zod_1.z.array(zod_1.z.string()),
    actionItems: zod_1.z.array(zod_1.z.object({
        description: zod_1.z.string(),
        priority: zod_1.z.enum(['low', 'medium', 'high']),
        timeframe: zod_1.z.string(),
    })),
    resources: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.string(),
        title: zod_1.z.string(),
        description: zod_1.z.string(),
        url: zod_1.z.string().optional(),
    })),
    escalationNeeded: zod_1.z.boolean(),
    escalationReason: zod_1.z.string().optional(),
});
// Crisis detection
exports.CrisisIndicatorsSchema = zod_1.z.object({
    riskLevel: zod_1.z.enum(['none', 'low', 'medium', 'high', 'critical']),
    indicators: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['language_pattern', 'mood_decline', 'isolation', 'hopelessness', 'self_harm_mention']),
        severity: zod_1.z.number().min(0).max(1),
        description: zod_1.z.string(),
    })),
    immediateAction: zod_1.z.boolean(),
    recommendedResponse: zod_1.z.string(),
    professionalReferral: zod_1.z.boolean(),
    emergencyContacts: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        phone: zod_1.z.string(),
        type: zod_1.z.enum(['crisis_hotline', 'therapist', 'emergency', 'trusted_contact']),
    })).optional(),
});
