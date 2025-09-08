import { z } from 'zod';

// Cultural context for validation
export const CulturalContextSchema = z.object({
  primaryCulture: z.string(),
  secondaryCultures: z.array(z.string()).default([]),
  region: z.string(),
  language: z.string(),
  religiousConsiderations: z.array(z.string()).default([]),
  sensitiveTopics: z.array(z.string()).default([]),
});

export type CulturalContext = z.infer<typeof CulturalContextSchema>;

// Content validation input
export const ContentValidationInputSchema = z.object({
  content: z.string(),
  contentType: z.enum(['text', 'image_url', 'video_url', 'audio_url']),
  culturalContext: CulturalContextSchema,
  targetAudience: z.object({
    ageRange: z.object({
      min: z.number().min(0),
      max: z.number().max(120),
    }),
    diagnosisStage: z.enum(['newly_diagnosed', 'in_treatment', 'survivor', 'caregiver', 'supporter']),
    supportNeeds: z.array(z.string()),
  }),
});

export type ContentValidationInput = z.infer<typeof ContentValidationInputSchema>;

// Validation issue severity
export enum ValidationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Validation issue
export const ValidationIssueSchema = z.object({
  type: z.enum([
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
  severity: z.nativeEnum(ValidationSeverity),
  description: z.string(),
  suggestion: z.string().optional(),
  confidence: z.number().min(0).max(1),
  location: z.object({
    start: z.number().optional(),
    end: z.number().optional(),
    context: z.string().optional(),
  }).optional(),
});

export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;

// Cultural validation result
export const CulturalValidationResultSchema = z.object({
  isAppropriate: z.boolean(),
  overallScore: z.number().min(0).max(1),
  issues: z.array(ValidationIssueSchema),
  suggestions: z.array(z.string()),
  culturalRelevanceScore: z.number().min(0).max(1),
  sensitivityScore: z.number().min(0).max(1),
  inclusivityScore: z.number().min(0).max(1),
});

export type CulturalValidationResult = z.infer<typeof CulturalValidationResultSchema>;

// Content moderation input
export const ContentModerationInputSchema = z.object({
  content: z.string(),
  contentType: z.enum(['text', 'image_url', 'video_url', 'audio_url']),
  moderationLevel: z.enum(['strict', 'moderate', 'lenient']).default('moderate'),
  customRules: z.array(z.object({
    pattern: z.string(),
    action: z.enum(['flag', 'block', 'warn']),
    reason: z.string(),
  })).default([]),
});

export type ContentModerationInput = z.infer<typeof ContentModerationInputSchema>;

// Content moderation result
export const ContentModerationResultSchema = z.object({
  isAllowed: z.boolean(),
  riskScore: z.number().min(0).max(1),
  categories: z.array(z.object({
    category: z.enum([
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
    confidence: z.number().min(0).max(1),
    severity: z.nativeEnum(ValidationSeverity),
  })),
  action: z.enum(['allow', 'flag', 'block', 'review']),
  reason: z.string().optional(),
});

export type ContentModerationResult = z.infer<typeof ContentModerationResultSchema>;