"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModerationResultSchema = exports.ContentModerationInputSchema = exports.CulturalValidationResultSchema = exports.ValidationIssueSchema = exports.ValidationSeverity = exports.ContentValidationInputSchema = exports.CulturalContextSchema = void 0;
const zod_1 = require("zod");
// Cultural context for validation
exports.CulturalContextSchema = zod_1.z.object({
    primaryCulture: zod_1.z.string(),
    secondaryCultures: zod_1.z.array(zod_1.z.string()).default([]),
    region: zod_1.z.string(),
    language: zod_1.z.string(),
    religiousConsiderations: zod_1.z.array(zod_1.z.string()).default([]),
    sensitiveTopics: zod_1.z.array(zod_1.z.string()).default([]),
});
// Content validation input
exports.ContentValidationInputSchema = zod_1.z.object({
    content: zod_1.z.string(),
    contentType: zod_1.z.enum(['text', 'image_url', 'video_url', 'audio_url']),
    culturalContext: exports.CulturalContextSchema,
    targetAudience: zod_1.z.object({
        ageRange: zod_1.z.object({
            min: zod_1.z.number().min(0),
            max: zod_1.z.number().max(120),
        }),
        diagnosisStage: zod_1.z.enum(['newly_diagnosed', 'in_treatment', 'survivor', 'caregiver', 'supporter']),
        supportNeeds: zod_1.z.array(zod_1.z.string()),
    }),
});
// Validation issue severity
var ValidationSeverity;
(function (ValidationSeverity) {
    ValidationSeverity["LOW"] = "low";
    ValidationSeverity["MEDIUM"] = "medium";
    ValidationSeverity["HIGH"] = "high";
    ValidationSeverity["CRITICAL"] = "critical";
})(ValidationSeverity || (exports.ValidationSeverity = ValidationSeverity = {}));
// Validation issue
exports.ValidationIssueSchema = zod_1.z.object({
    type: zod_1.z.enum([
        'cultural_insensitivity',
        'inappropriate_language',
        'medical_misinformation',
        'triggering_content',
        'age_inappropriate',
        'religious_insensitivity',
        'gender_bias',
        'racial_bias',
        'accessibility_issue',
    ]),
    severity: zod_1.z.nativeEnum(ValidationSeverity),
    description: zod_1.z.string(),
    suggestion: zod_1.z.string().optional(),
    confidence: zod_1.z.number().min(0).max(1),
    location: zod_1.z.object({
        start: zod_1.z.number().optional(),
        end: zod_1.z.number().optional(),
        context: zod_1.z.string().optional(),
    }).optional(),
});
// Cultural validation result
exports.CulturalValidationResultSchema = zod_1.z.object({
    isAppropriate: zod_1.z.boolean(),
    overallScore: zod_1.z.number().min(0).max(1),
    issues: zod_1.z.array(exports.ValidationIssueSchema),
    suggestions: zod_1.z.array(zod_1.z.string()),
    culturalRelevanceScore: zod_1.z.number().min(0).max(1),
    sensitivityScore: zod_1.z.number().min(0).max(1),
    inclusivityScore: zod_1.z.number().min(0).max(1),
});
// Content moderation input
exports.ContentModerationInputSchema = zod_1.z.object({
    content: zod_1.z.string(),
    contentType: zod_1.z.enum(['text', 'image_url', 'video_url', 'audio_url']),
    moderationLevel: zod_1.z.enum(['strict', 'moderate', 'lenient']).default('moderate'),
    customRules: zod_1.z.array(zod_1.z.object({
        pattern: zod_1.z.string(),
        action: zod_1.z.enum(['flag', 'block', 'warn']),
        reason: zod_1.z.string(),
    })).default([]),
});
// Content moderation result
exports.ContentModerationResultSchema = zod_1.z.object({
    isAllowed: zod_1.z.boolean(),
    riskScore: zod_1.z.number().min(0).max(1),
    categories: zod_1.z.array(zod_1.z.object({
        category: zod_1.z.enum([
            'hate_speech',
            'harassment',
            'violence',
            'self_harm',
            'sexual_content',
            'spam',
            'misinformation',
            'privacy_violation',
            'copyright_violation',
        ]),
        confidence: zod_1.z.number().min(0).max(1),
        severity: zod_1.z.nativeEnum(ValidationSeverity),
    })),
    action: zod_1.z.enum(['allow', 'flag', 'block', 'review']),
    reason: zod_1.z.string().optional(),
});
