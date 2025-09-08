import { z } from 'zod';
export declare const CulturalContextSchema: z.ZodObject<{
    primaryCulture: z.ZodString;
    secondaryCultures: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    region: z.ZodString;
    language: z.ZodString;
    religiousConsiderations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    sensitiveTopics: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    primaryCulture: string;
    secondaryCultures: string[];
    region: string;
    language: string;
    religiousConsiderations: string[];
    sensitiveTopics: string[];
}, {
    primaryCulture: string;
    region: string;
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
        primaryCulture: string;
        secondaryCultures: string[];
        region: string;
        language: string;
        religiousConsiderations: string[];
        sensitiveTopics: string[];
    }, {
        primaryCulture: string;
        region: string;
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
        ageRange: {
            min: number;
            max: number;
        };
        diagnosisStage: "newly_diagnosed" | "in_treatment" | "survivor" | "caregiver" | "supporter";
        supportNeeds: string[];
    }, {
        ageRange: {
            min: number;
            max: number;
        };
        diagnosisStage: "newly_diagnosed" | "in_treatment" | "survivor" | "caregiver" | "supporter";
        supportNeeds: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    content: string;
    contentType: "text" | "image_url" | "video_url" | "audio_url";
    culturalContext: {
        primaryCulture: string;
        secondaryCultures: string[];
        region: string;
        language: string;
        religiousConsiderations: string[];
        sensitiveTopics: string[];
    };
    targetAudience: {
        ageRange: {
            min: number;
            max: number;
        };
        diagnosisStage: "newly_diagnosed" | "in_treatment" | "survivor" | "caregiver" | "supporter";
        supportNeeds: string[];
    };
}, {
    content: string;
    contentType: "text" | "image_url" | "video_url" | "audio_url";
    culturalContext: {
        primaryCulture: string;
        region: string;
        language: string;
        secondaryCultures?: string[] | undefined;
        religiousConsiderations?: string[] | undefined;
        sensitiveTopics?: string[] | undefined;
    };
    targetAudience: {
        ageRange: {
            min: number;
            max: number;
        };
        diagnosisStage: "newly_diagnosed" | "in_treatment" | "survivor" | "caregiver" | "supporter";
        supportNeeds: string[];
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
    confidence: number;
    severity: ValidationSeverity;
    suggestion?: string | undefined;
    location?: {
        start?: number | undefined;
        end?: number | undefined;
        context?: string | undefined;
    } | undefined;
}, {
    description: string;
    type: "cultural_insensitivity" | "inappropriate_language" | "medical_misinformation" | "triggering_content" | "age_inappropriate" | "religious_insensitivity" | "gender_bias" | "racial_bias" | "accessibility_issue";
    confidence: number;
    severity: ValidationSeverity;
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
        confidence: number;
        severity: ValidationSeverity;
        suggestion?: string | undefined;
        location?: {
            start?: number | undefined;
            end?: number | undefined;
            context?: string | undefined;
        } | undefined;
    }, {
        description: string;
        type: "cultural_insensitivity" | "inappropriate_language" | "medical_misinformation" | "triggering_content" | "age_inappropriate" | "religious_insensitivity" | "gender_bias" | "racial_bias" | "accessibility_issue";
        confidence: number;
        severity: ValidationSeverity;
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
    issues: {
        description: string;
        type: "cultural_insensitivity" | "inappropriate_language" | "medical_misinformation" | "triggering_content" | "age_inappropriate" | "religious_insensitivity" | "gender_bias" | "racial_bias" | "accessibility_issue";
        confidence: number;
        severity: ValidationSeverity;
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
    sensitivityScore: number;
    inclusivityScore: number;
}, {
    issues: {
        description: string;
        type: "cultural_insensitivity" | "inappropriate_language" | "medical_misinformation" | "triggering_content" | "age_inappropriate" | "religious_insensitivity" | "gender_bias" | "racial_bias" | "accessibility_issue";
        confidence: number;
        severity: ValidationSeverity;
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
    sensitivityScore: number;
    inclusivityScore: number;
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
        action: "flag" | "block" | "warn";
        reason: string;
    }, {
        pattern: string;
        action: "flag" | "block" | "warn";
        reason: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    content: string;
    contentType: "text" | "image_url" | "video_url" | "audio_url";
    moderationLevel: "strict" | "moderate" | "lenient";
    customRules: {
        pattern: string;
        action: "flag" | "block" | "warn";
        reason: string;
    }[];
}, {
    content: string;
    contentType: "text" | "image_url" | "video_url" | "audio_url";
    moderationLevel?: "strict" | "moderate" | "lenient" | undefined;
    customRules?: {
        pattern: string;
        action: "flag" | "block" | "warn";
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
        confidence: number;
        severity: ValidationSeverity;
        category: "hate_speech" | "harassment" | "violence" | "self_harm" | "sexual_content" | "spam" | "misinformation" | "privacy_violation" | "copyright_violation";
    }, {
        confidence: number;
        severity: ValidationSeverity;
        category: "hate_speech" | "harassment" | "violence" | "self_harm" | "sexual_content" | "spam" | "misinformation" | "privacy_violation" | "copyright_violation";
    }>, "many">;
    action: z.ZodEnum<["allow", "flag", "block", "review"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: "flag" | "block" | "allow" | "review";
    isAllowed: boolean;
    riskScore: number;
    categories: {
        confidence: number;
        severity: ValidationSeverity;
        category: "hate_speech" | "harassment" | "violence" | "self_harm" | "sexual_content" | "spam" | "misinformation" | "privacy_violation" | "copyright_violation";
    }[];
    reason?: string | undefined;
}, {
    action: "flag" | "block" | "allow" | "review";
    isAllowed: boolean;
    riskScore: number;
    categories: {
        confidence: number;
        severity: ValidationSeverity;
        category: "hate_speech" | "harassment" | "violence" | "self_harm" | "sexual_content" | "spam" | "misinformation" | "privacy_violation" | "copyright_violation";
    }[];
    reason?: string | undefined;
}>;
export type ContentModerationResult = z.infer<typeof ContentModerationResultSchema>;
//# sourceMappingURL=validation-types.d.ts.map