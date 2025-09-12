import { z } from 'zod';
export declare const CulturalContextSchema: z.ZodObject<{
    primaryCulture: z.ZodString;
    secondaryCultures: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    region: z.ZodString;
    language: z.ZodString;
    religiousConsiderations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    sensitiveTopics: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    region: string;
    primaryCulture: string;
    secondaryCultures: string[];
    language: string;
    religiousConsiderations: string[];
    sensitiveTopics: string[];
}, {
    region: string;
    primaryCulture: string;
    language: string;
    secondaryCultures?: string[] | undefined;
    religiousConsiderations?: string[] | undefined;
    sensitiveTopics?: string[] | undefined;
}>;
export type CulturalContext = z.infer<typeof CulturalContextSchema>;
export declare const ContentValidationInputSchema: z.ZodObject<{
    content: z.ZodString;
    contentType: z.ZodEnum<["text", "image_url", "video_url", "audio_url"]>;
    culturalContext: z.ZodObject<{
        primaryCulture: z.ZodString;
        secondaryCultures: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        region: z.ZodString;
        language: z.ZodString;
        religiousConsiderations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        sensitiveTopics: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        region: string;
        primaryCulture: string;
        secondaryCultures: string[];
        language: string;
        religiousConsiderations: string[];
        sensitiveTopics: string[];
    }, {
        region: string;
        primaryCulture: string;
        language: string;
        secondaryCultures?: string[] | undefined;
        religiousConsiderations?: string[] | undefined;
        sensitiveTopics?: string[] | undefined;
    }>;
    targetAudience: z.ZodObject<{
        ageRange: z.ZodObject<{
            min: z.ZodNumber;
            max: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
        }, {
            min: number;
            max: number;
        }>;
        diagnosisStage: z.ZodEnum<["newly_diagnosed", "in_treatment", "survivor", "caregiver", "supporter"]>;
        supportNeeds: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        diagnosisStage: "newly_diagnosed" | "in_treatment" | "survivor" | "caregiver" | "supporter";
        ageRange: {
            min: number;
            max: number;
        };
        supportNeeds: string[];
    }, {
        diagnosisStage: "newly_diagnosed" | "in_treatment" | "survivor" | "caregiver" | "supporter";
        ageRange: {
            min: number;
            max: number;
        };
        supportNeeds: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    content: string;
    targetAudience: {
        diagnosisStage: "newly_diagnosed" | "in_treatment" | "survivor" | "caregiver" | "supporter";
        ageRange: {
            min: number;
            max: number;
        };
        supportNeeds: string[];
    };
    contentType: "text" | "image_url" | "video_url" | "audio_url";
    culturalContext: {
        region: string;
        primaryCulture: string;
        secondaryCultures: string[];
        language: string;
        religiousConsiderations: string[];
        sensitiveTopics: string[];
    };
}, {
    content: string;
    targetAudience: {
        diagnosisStage: "newly_diagnosed" | "in_treatment" | "survivor" | "caregiver" | "supporter";
        ageRange: {
            min: number;
            max: number;
        };
        supportNeeds: string[];
    };
    contentType: "text" | "image_url" | "video_url" | "audio_url";
    culturalContext: {
        region: string;
        primaryCulture: string;
        language: string;
        secondaryCultures?: string[] | undefined;
        religiousConsiderations?: string[] | undefined;
        sensitiveTopics?: string[] | undefined;
    };
}>;
export type ContentValidationInput = z.infer<typeof ContentValidationInputSchema>;
export declare enum ValidationSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare const ValidationIssueSchema: z.ZodObject<{
    type: z.ZodEnum<["cultural_insensitivity", "inappropriate_language", "medical_misinformation", "triggering_content", "age_inappropriate", "religious_insensitivity", "gender_bias", "racial_bias", "accessibility_issue"]>;
    severity: z.ZodNativeEnum<typeof ValidationSeverity>;
    description: z.ZodString;
    suggestion: z.ZodOptional<z.ZodString>;
    confidence: z.ZodNumber;
    location: z.ZodOptional<z.ZodObject<{
        start: z.ZodOptional<z.ZodNumber>;
        end: z.ZodOptional<z.ZodNumber>;
        context: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        start?: number | undefined;
        end?: number | undefined;
        context?: string | undefined;
    }, {
        start?: number | undefined;
        end?: number | undefined;
        context?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    type: "cultural_insensitivity" | "inappropriate_language" | "medical_misinformation" | "triggering_content" | "age_inappropriate" | "religious_insensitivity" | "gender_bias" | "racial_bias" | "accessibility_issue";
    severity: ValidationSeverity;
    confidence: number;
    suggestion?: string | undefined;
    location?: {
        start?: number | undefined;
        end?: number | undefined;
        context?: string | undefined;
    } | undefined;
}, {
    description: string;
    type: "cultural_insensitivity" | "inappropriate_language" | "medical_misinformation" | "triggering_content" | "age_inappropriate" | "religious_insensitivity" | "gender_bias" | "racial_bias" | "accessibility_issue";
    severity: ValidationSeverity;
    confidence: number;
    suggestion?: string | undefined;
    location?: {
        start?: number | undefined;
        end?: number | undefined;
        context?: string | undefined;
    } | undefined;
}>;
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;
export declare const CulturalValidationResultSchema: z.ZodObject<{
    isAppropriate: z.ZodBoolean;
    overallScore: z.ZodNumber;
    issues: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["cultural_insensitivity", "inappropriate_language", "medical_misinformation", "triggering_content", "age_inappropriate", "religious_insensitivity", "gender_bias", "racial_bias", "accessibility_issue"]>;
        severity: z.ZodNativeEnum<typeof ValidationSeverity>;
        description: z.ZodString;
        suggestion: z.ZodOptional<z.ZodString>;
        confidence: z.ZodNumber;
        location: z.ZodOptional<z.ZodObject<{
            start: z.ZodOptional<z.ZodNumber>;
            end: z.ZodOptional<z.ZodNumber>;
            context: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            start?: number | undefined;
            end?: number | undefined;
            context?: string | undefined;
        }, {
            start?: number | undefined;
            end?: number | undefined;
            context?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        type: "cultural_insensitivity" | "inappropriate_language" | "medical_misinformation" | "triggering_content" | "age_inappropriate" | "religious_insensitivity" | "gender_bias" | "racial_bias" | "accessibility_issue";
        severity: ValidationSeverity;
        confidence: number;
        suggestion?: string | undefined;
        location?: {
            start?: number | undefined;
            end?: number | undefined;
            context?: string | undefined;
        } | undefined;
    }, {
        description: string;
        type: "cultural_insensitivity" | "inappropriate_language" | "medical_misinformation" | "triggering_content" | "age_inappropriate" | "religious_insensitivity" | "gender_bias" | "racial_bias" | "accessibility_issue";
        severity: ValidationSeverity;
        confidence: number;
        suggestion?: string | undefined;
        location?: {
            start?: number | undefined;
            end?: number | undefined;
            context?: string | undefined;
        } | undefined;
    }>, "many">;
    suggestions: z.ZodArray<z.ZodString, "many">;
    culturalRelevanceScore: z.ZodNumber;
    sensitivityScore: z.ZodNumber;
    inclusivityScore: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    sensitivityScore: number;
    inclusivityScore: number;
    issues: {
        description: string;
        type: "cultural_insensitivity" | "inappropriate_language" | "medical_misinformation" | "triggering_content" | "age_inappropriate" | "religious_insensitivity" | "gender_bias" | "racial_bias" | "accessibility_issue";
        severity: ValidationSeverity;
        confidence: number;
        suggestion?: string | undefined;
        location?: {
            start?: number | undefined;
            end?: number | undefined;
            context?: string | undefined;
        } | undefined;
    }[];
    isAppropriate: boolean;
    overallScore: number;
    suggestions: string[];
    culturalRelevanceScore: number;
}, {
    sensitivityScore: number;
    inclusivityScore: number;
    issues: {
        description: string;
        type: "cultural_insensitivity" | "inappropriate_language" | "medical_misinformation" | "triggering_content" | "age_inappropriate" | "religious_insensitivity" | "gender_bias" | "racial_bias" | "accessibility_issue";
        severity: ValidationSeverity;
        confidence: number;
        suggestion?: string | undefined;
        location?: {
            start?: number | undefined;
            end?: number | undefined;
            context?: string | undefined;
        } | undefined;
    }[];
    isAppropriate: boolean;
    overallScore: number;
    suggestions: string[];
    culturalRelevanceScore: number;
}>;
export type CulturalValidationResult = z.infer<typeof CulturalValidationResultSchema>;
export declare const ContentModerationInputSchema: z.ZodObject<{
    content: z.ZodString;
    contentType: z.ZodEnum<["text", "image_url", "video_url", "audio_url"]>;
    moderationLevel: z.ZodDefault<z.ZodEnum<["strict", "moderate", "lenient"]>>;
    customRules: z.ZodDefault<z.ZodArray<z.ZodObject<{
        pattern: z.ZodString;
        action: z.ZodEnum<["flag", "block", "warn"]>;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        pattern: string;
        action: "warn" | "flag" | "block";
        reason: string;
    }, {
        pattern: string;
        action: "warn" | "flag" | "block";
        reason: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    content: string;
    contentType: "text" | "image_url" | "video_url" | "audio_url";
    moderationLevel: "moderate" | "strict" | "lenient";
    customRules: {
        pattern: string;
        action: "warn" | "flag" | "block";
        reason: string;
    }[];
}, {
    content: string;
    contentType: "text" | "image_url" | "video_url" | "audio_url";
    moderationLevel?: "moderate" | "strict" | "lenient" | undefined;
    customRules?: {
        pattern: string;
        action: "warn" | "flag" | "block";
        reason: string;
    }[] | undefined;
}>;
export type ContentModerationInput = z.infer<typeof ContentModerationInputSchema>;
export declare const ContentModerationResultSchema: z.ZodObject<{
    isAllowed: z.ZodBoolean;
    riskScore: z.ZodNumber;
    categories: z.ZodArray<z.ZodObject<{
        category: z.ZodEnum<["hate_speech", "harassment", "violence", "self_harm", "sexual_content", "spam", "misinformation", "privacy_violation", "copyright_violation"]>;
        confidence: z.ZodNumber;
        severity: z.ZodNativeEnum<typeof ValidationSeverity>;
    }, "strip", z.ZodTypeAny, {
        category: "hate_speech" | "harassment" | "violence" | "self_harm" | "sexual_content" | "spam" | "misinformation" | "privacy_violation" | "copyright_violation";
        severity: ValidationSeverity;
        confidence: number;
    }, {
        category: "hate_speech" | "harassment" | "violence" | "self_harm" | "sexual_content" | "spam" | "misinformation" | "privacy_violation" | "copyright_violation";
        severity: ValidationSeverity;
        confidence: number;
    }>, "many">;
    action: z.ZodEnum<["allow", "flag", "block", "review"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    categories: {
        category: "hate_speech" | "harassment" | "violence" | "self_harm" | "sexual_content" | "spam" | "misinformation" | "privacy_violation" | "copyright_violation";
        severity: ValidationSeverity;
        confidence: number;
    }[];
    action: "allow" | "flag" | "block" | "review";
    isAllowed: boolean;
    riskScore: number;
    reason?: string | undefined;
}, {
    categories: {
        category: "hate_speech" | "harassment" | "violence" | "self_harm" | "sexual_content" | "spam" | "misinformation" | "privacy_violation" | "copyright_violation";
        severity: ValidationSeverity;
        confidence: number;
    }[];
    action: "allow" | "flag" | "block" | "review";
    isAllowed: boolean;
    riskScore: number;
    reason?: string | undefined;
}>;
export type ContentModerationResult = z.infer<typeof ContentModerationResultSchema>;
