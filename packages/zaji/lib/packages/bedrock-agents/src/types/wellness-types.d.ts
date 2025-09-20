import { z } from 'zod';
export declare const WellnessAssessmentInputSchema: z.ZodObject<{
    userId: z.ZodString;
    assessmentType: z.ZodEnum<["mood", "stress", "energy", "social", "physical", "comprehensive"]>;
    responses: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean]>>;
    context: z.ZodOptional<z.ZodObject<{
        timeOfDay: z.ZodOptional<z.ZodString>;
        recentEvents: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        currentTreatment: z.ZodOptional<z.ZodString>;
        supportSystemActive: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        timeOfDay?: string | undefined;
        recentEvents?: string[] | undefined;
        currentTreatment?: string | undefined;
        supportSystemActive?: boolean | undefined;
    }, {
        timeOfDay?: string | undefined;
        recentEvents?: string[] | undefined;
        currentTreatment?: string | undefined;
        supportSystemActive?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    assessmentType: "mood" | "stress" | "energy" | "social" | "physical" | "comprehensive";
    responses: Record<string, string | number | boolean>;
    context?: {
        timeOfDay?: string | undefined;
        recentEvents?: string[] | undefined;
        currentTreatment?: string | undefined;
        supportSystemActive?: boolean | undefined;
    } | undefined;
}, {
    userId: string;
    assessmentType: "mood" | "stress" | "energy" | "social" | "physical" | "comprehensive";
    responses: Record<string, string | number | boolean>;
    context?: {
        timeOfDay?: string | undefined;
        recentEvents?: string[] | undefined;
        currentTreatment?: string | undefined;
        supportSystemActive?: boolean | undefined;
    } | undefined;
}>;
export type WellnessAssessmentInput = z.infer<typeof WellnessAssessmentInputSchema>;
export declare const WellnessMetricsSchema: z.ZodObject<{
    moodScore: z.ZodNumber;
    stressLevel: z.ZodNumber;
    energyLevel: z.ZodNumber;
    socialConnection: z.ZodNumber;
    physicalWellbeing: z.ZodNumber;
    overallWellness: z.ZodNumber;
    confidence: z.ZodNumber;
    trend: z.ZodEnum<["improving", "stable", "declining", "unknown"]>;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    moodScore: number;
    stressLevel: number;
    energyLevel: number;
    socialConnection: number;
    physicalWellbeing: number;
    overallWellness: number;
    trend: "unknown" | "improving" | "stable" | "declining";
}, {
    confidence: number;
    moodScore: number;
    stressLevel: number;
    energyLevel: number;
    socialConnection: number;
    physicalWellbeing: number;
    overallWellness: number;
    trend: "unknown" | "improving" | "stable" | "declining";
}>;
export type WellnessMetrics = z.infer<typeof WellnessMetricsSchema>;
export declare const WellnessRecommendationSchema: z.ZodObject<{
    type: z.ZodEnum<["mindfulness_exercise", "physical_activity", "social_connection", "professional_support", "self_care_activity", "educational_resource", "community_engagement"]>;
    title: z.ZodString;
    description: z.ZodString;
    instructions: z.ZodArray<z.ZodString, "many">;
    duration: z.ZodString;
    difficulty: z.ZodEnum<["easy", "moderate", "challenging"]>;
    benefits: z.ZodArray<z.ZodString, "many">;
    contraindications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    resources: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["article", "video", "audio", "app", "website"]>;
        title: z.ZodString;
        url: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        type: "website" | "article" | "video" | "audio" | "app";
        title: string;
        description?: string | undefined;
    }, {
        url: string;
        type: "website" | "article" | "video" | "audio" | "app";
        title: string;
        description?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    description: string;
    type: "mindfulness_exercise" | "physical_activity" | "social_connection" | "professional_support" | "self_care_activity" | "educational_resource" | "community_engagement";
    title: string;
    instructions: string[];
    duration: string;
    difficulty: "moderate" | "easy" | "challenging";
    benefits: string[];
    resources?: {
        url: string;
        type: "website" | "article" | "video" | "audio" | "app";
        title: string;
        description?: string | undefined;
    }[] | undefined;
    contraindications?: string[] | undefined;
}, {
    description: string;
    type: "mindfulness_exercise" | "physical_activity" | "social_connection" | "professional_support" | "self_care_activity" | "educational_resource" | "community_engagement";
    title: string;
    instructions: string[];
    duration: string;
    difficulty: "moderate" | "easy" | "challenging";
    benefits: string[];
    resources?: {
        url: string;
        type: "website" | "article" | "video" | "audio" | "app";
        title: string;
        description?: string | undefined;
    }[] | undefined;
    contraindications?: string[] | undefined;
}>;
export type WellnessRecommendation = z.infer<typeof WellnessRecommendationSchema>;
export declare const WellnessCoachingInputSchema: z.ZodObject<{
    userId: z.ZodString;
    sessionType: z.ZodEnum<["check_in", "goal_setting", "crisis_support", "progress_review", "general_guidance"]>;
    userMessage: z.ZodString;
    currentGoals: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        description: z.ZodString;
        progress: z.ZodNumber;
        targetDate: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        progress: number;
        targetDate?: Date | undefined;
    }, {
        id: string;
        description: string;
        progress: number;
        targetDate?: Date | undefined;
    }>, "many">>;
    recentMetrics: z.ZodOptional<z.ZodObject<{
        moodScore: z.ZodNumber;
        stressLevel: z.ZodNumber;
        energyLevel: z.ZodNumber;
        socialConnection: z.ZodNumber;
        physicalWellbeing: z.ZodNumber;
        overallWellness: z.ZodNumber;
        confidence: z.ZodNumber;
        trend: z.ZodEnum<["improving", "stable", "declining", "unknown"]>;
    }, "strip", z.ZodTypeAny, {
        confidence: number;
        moodScore: number;
        stressLevel: number;
        energyLevel: number;
        socialConnection: number;
        physicalWellbeing: number;
        overallWellness: number;
        trend: "unknown" | "improving" | "stable" | "declining";
    }, {
        confidence: number;
        moodScore: number;
        stressLevel: number;
        energyLevel: number;
        socialConnection: number;
        physicalWellbeing: number;
        overallWellness: number;
        trend: "unknown" | "improving" | "stable" | "declining";
    }>>;
    urgencyLevel: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "crisis"]>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    sessionType: "check_in" | "goal_setting" | "crisis_support" | "progress_review" | "general_guidance";
    userMessage: string;
    urgencyLevel: "low" | "medium" | "high" | "crisis";
    currentGoals?: {
        id: string;
        description: string;
        progress: number;
        targetDate?: Date | undefined;
    }[] | undefined;
    recentMetrics?: {
        confidence: number;
        moodScore: number;
        stressLevel: number;
        energyLevel: number;
        socialConnection: number;
        physicalWellbeing: number;
        overallWellness: number;
        trend: "unknown" | "improving" | "stable" | "declining";
    } | undefined;
}, {
    userId: string;
    sessionType: "check_in" | "goal_setting" | "crisis_support" | "progress_review" | "general_guidance";
    userMessage: string;
    currentGoals?: {
        id: string;
        description: string;
        progress: number;
        targetDate?: Date | undefined;
    }[] | undefined;
    recentMetrics?: {
        confidence: number;
        moodScore: number;
        stressLevel: number;
        energyLevel: number;
        socialConnection: number;
        physicalWellbeing: number;
        overallWellness: number;
        trend: "unknown" | "improving" | "stable" | "declining";
    } | undefined;
    urgencyLevel?: "low" | "medium" | "high" | "crisis" | undefined;
}>;
export type WellnessCoachingInput = z.infer<typeof WellnessCoachingInputSchema>;
export declare const WellnessCoachingResponseSchema: z.ZodObject<{
    message: z.ZodString;
    tone: z.ZodEnum<["supportive", "encouraging", "informational", "empathetic", "motivational"]>;
    recommendations: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["mindfulness_exercise", "physical_activity", "social_connection", "professional_support", "self_care_activity", "educational_resource", "community_engagement"]>;
        title: z.ZodString;
        description: z.ZodString;
        instructions: z.ZodArray<z.ZodString, "many">;
        duration: z.ZodString;
        difficulty: z.ZodEnum<["easy", "moderate", "challenging"]>;
        benefits: z.ZodArray<z.ZodString, "many">;
        contraindications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        resources: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["article", "video", "audio", "app", "website"]>;
            title: z.ZodString;
            url: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            url: string;
            type: "website" | "article" | "video" | "audio" | "app";
            title: string;
            description?: string | undefined;
        }, {
            url: string;
            type: "website" | "article" | "video" | "audio" | "app";
            title: string;
            description?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        type: "mindfulness_exercise" | "physical_activity" | "social_connection" | "professional_support" | "self_care_activity" | "educational_resource" | "community_engagement";
        title: string;
        instructions: string[];
        duration: string;
        difficulty: "moderate" | "easy" | "challenging";
        benefits: string[];
        resources?: {
            url: string;
            type: "website" | "article" | "video" | "audio" | "app";
            title: string;
            description?: string | undefined;
        }[] | undefined;
        contraindications?: string[] | undefined;
    }, {
        description: string;
        type: "mindfulness_exercise" | "physical_activity" | "social_connection" | "professional_support" | "self_care_activity" | "educational_resource" | "community_engagement";
        title: string;
        instructions: string[];
        duration: string;
        difficulty: "moderate" | "easy" | "challenging";
        benefits: string[];
        resources?: {
            url: string;
            type: "website" | "article" | "video" | "audio" | "app";
            title: string;
            description?: string | undefined;
        }[] | undefined;
        contraindications?: string[] | undefined;
    }>, "many">;
    followUpQuestions: z.ZodArray<z.ZodString, "many">;
    actionItems: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        priority: z.ZodEnum<["low", "medium", "high"]>;
        timeframe: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        priority: "low" | "medium" | "high";
        timeframe: string;
    }, {
        description: string;
        priority: "low" | "medium" | "high";
        timeframe: string;
    }>, "many">;
    resources: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        type: string;
        title: string;
        url?: string | undefined;
    }, {
        description: string;
        type: string;
        title: string;
        url?: string | undefined;
    }>, "many">;
    escalationNeeded: z.ZodBoolean;
    escalationReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    recommendations: {
        description: string;
        type: "mindfulness_exercise" | "physical_activity" | "social_connection" | "professional_support" | "self_care_activity" | "educational_resource" | "community_engagement";
        title: string;
        instructions: string[];
        duration: string;
        difficulty: "moderate" | "easy" | "challenging";
        benefits: string[];
        resources?: {
            url: string;
            type: "website" | "article" | "video" | "audio" | "app";
            title: string;
            description?: string | undefined;
        }[] | undefined;
        contraindications?: string[] | undefined;
    }[];
    resources: {
        description: string;
        type: string;
        title: string;
        url?: string | undefined;
    }[];
    message: string;
    tone: "supportive" | "informational" | "encouraging" | "empathetic" | "motivational";
    followUpQuestions: string[];
    actionItems: {
        description: string;
        priority: "low" | "medium" | "high";
        timeframe: string;
    }[];
    escalationNeeded: boolean;
    escalationReason?: string | undefined;
}, {
    recommendations: {
        description: string;
        type: "mindfulness_exercise" | "physical_activity" | "social_connection" | "professional_support" | "self_care_activity" | "educational_resource" | "community_engagement";
        title: string;
        instructions: string[];
        duration: string;
        difficulty: "moderate" | "easy" | "challenging";
        benefits: string[];
        resources?: {
            url: string;
            type: "website" | "article" | "video" | "audio" | "app";
            title: string;
            description?: string | undefined;
        }[] | undefined;
        contraindications?: string[] | undefined;
    }[];
    resources: {
        description: string;
        type: string;
        title: string;
        url?: string | undefined;
    }[];
    message: string;
    tone: "supportive" | "informational" | "encouraging" | "empathetic" | "motivational";
    followUpQuestions: string[];
    actionItems: {
        description: string;
        priority: "low" | "medium" | "high";
        timeframe: string;
    }[];
    escalationNeeded: boolean;
    escalationReason?: string | undefined;
}>;
export type WellnessCoachingResponse = z.infer<typeof WellnessCoachingResponseSchema>;
export declare const CrisisIndicatorsSchema: z.ZodObject<{
    riskLevel: z.ZodEnum<["none", "low", "medium", "high", "critical"]>;
    indicators: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["language_pattern", "mood_decline", "isolation", "hopelessness", "self_harm_mention"]>;
        severity: z.ZodNumber;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        type: "language_pattern" | "mood_decline" | "isolation" | "hopelessness" | "self_harm_mention";
        severity: number;
    }, {
        description: string;
        type: "language_pattern" | "mood_decline" | "isolation" | "hopelessness" | "self_harm_mention";
        severity: number;
    }>, "many">;
    immediateAction: z.ZodBoolean;
    recommendedResponse: z.ZodString;
    professionalReferral: z.ZodBoolean;
    emergencyContacts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        phone: z.ZodString;
        type: z.ZodEnum<["crisis_hotline", "therapist", "emergency", "trusted_contact"]>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        type: "crisis_hotline" | "therapist" | "emergency" | "trusted_contact";
        phone: string;
    }, {
        name: string;
        type: "crisis_hotline" | "therapist" | "emergency" | "trusted_contact";
        phone: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    riskLevel: "none" | "low" | "medium" | "high" | "critical";
    indicators: {
        description: string;
        type: "language_pattern" | "mood_decline" | "isolation" | "hopelessness" | "self_harm_mention";
        severity: number;
    }[];
    immediateAction: boolean;
    recommendedResponse: string;
    professionalReferral: boolean;
    emergencyContacts?: {
        name: string;
        type: "crisis_hotline" | "therapist" | "emergency" | "trusted_contact";
        phone: string;
    }[] | undefined;
}, {
    riskLevel: "none" | "low" | "medium" | "high" | "critical";
    indicators: {
        description: string;
        type: "language_pattern" | "mood_decline" | "isolation" | "hopelessness" | "self_harm_mention";
        severity: number;
    }[];
    immediateAction: boolean;
    recommendedResponse: string;
    professionalReferral: boolean;
    emergencyContacts?: {
        name: string;
        type: "crisis_hotline" | "therapist" | "emergency" | "trusted_contact";
        phone: string;
    }[] | undefined;
}>;
export type CrisisIndicators = z.infer<typeof CrisisIndicatorsSchema>;
