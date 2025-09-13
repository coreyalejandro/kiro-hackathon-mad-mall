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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbi10eXBlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2JlZHJvY2stYWdlbnRzL3NyYy90eXBlcy92YWxpZGF0aW9uLXR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZCQUF3QjtBQUV4QixrQ0FBa0M7QUFDckIsUUFBQSxxQkFBcUIsR0FBRyxPQUFDLENBQUMsTUFBTSxDQUFDO0lBQzVDLGNBQWMsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFO0lBQzFCLGlCQUFpQixFQUFFLE9BQUMsQ0FBQyxLQUFLLENBQUMsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztJQUNsRCxNQUFNLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNsQixRQUFRLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNwQix1QkFBdUIsRUFBRSxPQUFDLENBQUMsS0FBSyxDQUFDLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7SUFDeEQsZUFBZSxFQUFFLE9BQUMsQ0FBQyxLQUFLLENBQUMsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztDQUNqRCxDQUFDLENBQUM7QUFJSCwyQkFBMkI7QUFDZCxRQUFBLDRCQUE0QixHQUFHLE9BQUMsQ0FBQyxNQUFNLENBQUM7SUFDbkQsT0FBTyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUU7SUFDbkIsV0FBVyxFQUFFLE9BQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNwRSxlQUFlLEVBQUUsNkJBQXFCO0lBQ3RDLGNBQWMsRUFBRSxPQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLFFBQVEsRUFBRSxPQUFDLENBQUMsTUFBTSxDQUFDO1lBQ2pCLEdBQUcsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN0QixHQUFHLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7U0FDekIsQ0FBQztRQUNGLGNBQWMsRUFBRSxPQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDakcsWUFBWSxFQUFFLE9BQUMsQ0FBQyxLQUFLLENBQUMsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2xDLENBQUM7Q0FDSCxDQUFDLENBQUM7QUFJSCw0QkFBNEI7QUFDNUIsSUFBWSxrQkFLWDtBQUxELFdBQVksa0JBQWtCO0lBQzVCLGlDQUFXLENBQUE7SUFDWCx1Q0FBaUIsQ0FBQTtJQUNqQixtQ0FBYSxDQUFBO0lBQ2IsMkNBQXFCLENBQUE7QUFDdkIsQ0FBQyxFQUxXLGtCQUFrQixrQ0FBbEIsa0JBQWtCLFFBSzdCO0FBRUQsbUJBQW1CO0FBQ04sUUFBQSxxQkFBcUIsR0FBRyxPQUFDLENBQUMsTUFBTSxDQUFDO0lBQzVDLElBQUksRUFBRSxPQUFDLENBQUMsSUFBSSxDQUFDO1FBQ1gsd0JBQXdCO1FBQ3hCLHdCQUF3QjtRQUN4Qix3QkFBd0I7UUFDeEIsb0JBQW9CO1FBQ3BCLG1CQUFtQjtRQUNuQix5QkFBeUI7UUFDekIsYUFBYTtRQUNiLGFBQWE7UUFDYixxQkFBcUI7S0FDdEIsQ0FBQztJQUNGLFFBQVEsRUFBRSxPQUFDLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDO0lBQzFDLFdBQVcsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFO0lBQ3ZCLFVBQVUsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ2pDLFVBQVUsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDcEMsUUFBUSxFQUFFLE9BQUMsQ0FBQyxNQUFNLENBQUM7UUFDakIsS0FBSyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7UUFDNUIsR0FBRyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7UUFDMUIsT0FBTyxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7S0FDL0IsQ0FBQyxDQUFDLFFBQVEsRUFBRTtDQUNkLENBQUMsQ0FBQztBQUlILDZCQUE2QjtBQUNoQixRQUFBLDhCQUE4QixHQUFHLE9BQUMsQ0FBQyxNQUFNLENBQUM7SUFDckQsYUFBYSxFQUFFLE9BQUMsQ0FBQyxPQUFPLEVBQUU7SUFDMUIsWUFBWSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN0QyxNQUFNLEVBQUUsT0FBQyxDQUFDLEtBQUssQ0FBQyw2QkFBcUIsQ0FBQztJQUN0QyxXQUFXLEVBQUUsT0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDaEMsc0JBQXNCLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hELGdCQUFnQixFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMxQyxnQkFBZ0IsRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDM0MsQ0FBQyxDQUFDO0FBSUgsMkJBQTJCO0FBQ2QsUUFBQSw0QkFBNEIsR0FBRyxPQUFDLENBQUMsTUFBTSxDQUFDO0lBQ25ELE9BQU8sRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFO0lBQ25CLFdBQVcsRUFBRSxPQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDcEUsZUFBZSxFQUFFLE9BQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztJQUM5RSxXQUFXLEVBQUUsT0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFDLENBQUMsTUFBTSxDQUFDO1FBQzVCLE9BQU8sRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFO1FBQ25CLE1BQU0sRUFBRSxPQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6QyxNQUFNLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRTtLQUNuQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO0NBQ2hCLENBQUMsQ0FBQztBQUlILDRCQUE0QjtBQUNmLFFBQUEsNkJBQTZCLEdBQUcsT0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNwRCxTQUFTLEVBQUUsT0FBQyxDQUFDLE9BQU8sRUFBRTtJQUN0QixTQUFTLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ25DLFVBQVUsRUFBRSxPQUFDLENBQUMsS0FBSyxDQUFDLE9BQUMsQ0FBQyxNQUFNLENBQUM7UUFDM0IsUUFBUSxFQUFFLE9BQUMsQ0FBQyxJQUFJLENBQUM7WUFDZixhQUFhO1lBQ2IsWUFBWTtZQUNaLFVBQVU7WUFDVixXQUFXO1lBQ1gsZ0JBQWdCO1lBQ2hCLE1BQU07WUFDTixnQkFBZ0I7WUFDaEIsbUJBQW1CO1lBQ25CLHFCQUFxQjtTQUN0QixDQUFDO1FBQ0YsVUFBVSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNwQyxRQUFRLEVBQUUsT0FBQyxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQztLQUMzQyxDQUFDLENBQUM7SUFDSCxNQUFNLEVBQUUsT0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3BELE1BQU0sRUFBRSxPQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0NBQzlCLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xuXG4vLyBDdWx0dXJhbCBjb250ZXh0IGZvciB2YWxpZGF0aW9uXG5leHBvcnQgY29uc3QgQ3VsdHVyYWxDb250ZXh0U2NoZW1hID0gei5vYmplY3Qoe1xuICBwcmltYXJ5Q3VsdHVyZTogei5zdHJpbmcoKSxcbiAgc2Vjb25kYXJ5Q3VsdHVyZXM6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG4gIHJlZ2lvbjogei5zdHJpbmcoKSxcbiAgbGFuZ3VhZ2U6IHouc3RyaW5nKCksXG4gIHJlbGlnaW91c0NvbnNpZGVyYXRpb25zOiB6LmFycmF5KHouc3RyaW5nKCkpLmRlZmF1bHQoW10pLFxuICBzZW5zaXRpdmVUb3BpY3M6IHouYXJyYXkoei5zdHJpbmcoKSkuZGVmYXVsdChbXSksXG59KTtcblxuZXhwb3J0IHR5cGUgQ3VsdHVyYWxDb250ZXh0ID0gei5pbmZlcjx0eXBlb2YgQ3VsdHVyYWxDb250ZXh0U2NoZW1hPjtcblxuLy8gQ29udGVudCB2YWxpZGF0aW9uIGlucHV0XG5leHBvcnQgY29uc3QgQ29udGVudFZhbGlkYXRpb25JbnB1dFNjaGVtYSA9IHoub2JqZWN0KHtcbiAgY29udGVudDogei5zdHJpbmcoKSxcbiAgY29udGVudFR5cGU6IHouZW51bShbJ3RleHQnLCAnaW1hZ2VfdXJsJywgJ3ZpZGVvX3VybCcsICdhdWRpb191cmwnXSksXG4gIGN1bHR1cmFsQ29udGV4dDogQ3VsdHVyYWxDb250ZXh0U2NoZW1hLFxuICB0YXJnZXRBdWRpZW5jZTogei5vYmplY3Qoe1xuICAgIGFnZVJhbmdlOiB6Lm9iamVjdCh7XG4gICAgICBtaW46IHoubnVtYmVyKCkubWluKDApLFxuICAgICAgbWF4OiB6Lm51bWJlcigpLm1heCgxMjApLFxuICAgIH0pLFxuICAgIGRpYWdub3Npc1N0YWdlOiB6LmVudW0oWyduZXdseV9kaWFnbm9zZWQnLCAnaW5fdHJlYXRtZW50JywgJ3N1cnZpdm9yJywgJ2NhcmVnaXZlcicsICdzdXBwb3J0ZXInXSksXG4gICAgc3VwcG9ydE5lZWRzOiB6LmFycmF5KHouc3RyaW5nKCkpLFxuICB9KSxcbn0pO1xuXG5leHBvcnQgdHlwZSBDb250ZW50VmFsaWRhdGlvbklucHV0ID0gei5pbmZlcjx0eXBlb2YgQ29udGVudFZhbGlkYXRpb25JbnB1dFNjaGVtYT47XG5cbi8vIFZhbGlkYXRpb24gaXNzdWUgc2V2ZXJpdHlcbmV4cG9ydCBlbnVtIFZhbGlkYXRpb25TZXZlcml0eSB7XG4gIExPVyA9ICdsb3cnLFxuICBNRURJVU0gPSAnbWVkaXVtJyxcbiAgSElHSCA9ICdoaWdoJyxcbiAgQ1JJVElDQUwgPSAnY3JpdGljYWwnLFxufVxuXG4vLyBWYWxpZGF0aW9uIGlzc3VlXG5leHBvcnQgY29uc3QgVmFsaWRhdGlvbklzc3VlU2NoZW1hID0gei5vYmplY3Qoe1xuICB0eXBlOiB6LmVudW0oW1xuICAgICdjdWx0dXJhbF9pbnNlbnNpdGl2aXR5JyxcbiAgICAnaW5hcHByb3ByaWF0ZV9sYW5ndWFnZScsXG4gICAgJ21lZGljYWxfbWlzaW5mb3JtYXRpb24nLFxuICAgICd0cmlnZ2VyaW5nX2NvbnRlbnQnLFxuICAgICdhZ2VfaW5hcHByb3ByaWF0ZScsXG4gICAgJ3JlbGlnaW91c19pbnNlbnNpdGl2aXR5JyxcbiAgICAnZ2VuZGVyX2JpYXMnLFxuICAgICdyYWNpYWxfYmlhcycsXG4gICAgJ2FjY2Vzc2liaWxpdHlfaXNzdWUnLFxuICBdKSxcbiAgc2V2ZXJpdHk6IHoubmF0aXZlRW51bShWYWxpZGF0aW9uU2V2ZXJpdHkpLFxuICBkZXNjcmlwdGlvbjogei5zdHJpbmcoKSxcbiAgc3VnZ2VzdGlvbjogei5zdHJpbmcoKS5vcHRpb25hbCgpLFxuICBjb25maWRlbmNlOiB6Lm51bWJlcigpLm1pbigwKS5tYXgoMSksXG4gIGxvY2F0aW9uOiB6Lm9iamVjdCh7XG4gICAgc3RhcnQ6IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgICBlbmQ6IHoubnVtYmVyKCkub3B0aW9uYWwoKSxcbiAgICBjb250ZXh0OiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG4gIH0pLm9wdGlvbmFsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgVmFsaWRhdGlvbklzc3VlID0gei5pbmZlcjx0eXBlb2YgVmFsaWRhdGlvbklzc3VlU2NoZW1hPjtcblxuLy8gQ3VsdHVyYWwgdmFsaWRhdGlvbiByZXN1bHRcbmV4cG9ydCBjb25zdCBDdWx0dXJhbFZhbGlkYXRpb25SZXN1bHRTY2hlbWEgPSB6Lm9iamVjdCh7XG4gIGlzQXBwcm9wcmlhdGU6IHouYm9vbGVhbigpLFxuICBvdmVyYWxsU2NvcmU6IHoubnVtYmVyKCkubWluKDApLm1heCgxKSxcbiAgaXNzdWVzOiB6LmFycmF5KFZhbGlkYXRpb25Jc3N1ZVNjaGVtYSksXG4gIHN1Z2dlc3Rpb25zOiB6LmFycmF5KHouc3RyaW5nKCkpLFxuICBjdWx0dXJhbFJlbGV2YW5jZVNjb3JlOiB6Lm51bWJlcigpLm1pbigwKS5tYXgoMSksXG4gIHNlbnNpdGl2aXR5U2NvcmU6IHoubnVtYmVyKCkubWluKDApLm1heCgxKSxcbiAgaW5jbHVzaXZpdHlTY29yZTogei5udW1iZXIoKS5taW4oMCkubWF4KDEpLFxufSk7XG5cbmV4cG9ydCB0eXBlIEN1bHR1cmFsVmFsaWRhdGlvblJlc3VsdCA9IHouaW5mZXI8dHlwZW9mIEN1bHR1cmFsVmFsaWRhdGlvblJlc3VsdFNjaGVtYT47XG5cbi8vIENvbnRlbnQgbW9kZXJhdGlvbiBpbnB1dFxuZXhwb3J0IGNvbnN0IENvbnRlbnRNb2RlcmF0aW9uSW5wdXRTY2hlbWEgPSB6Lm9iamVjdCh7XG4gIGNvbnRlbnQ6IHouc3RyaW5nKCksXG4gIGNvbnRlbnRUeXBlOiB6LmVudW0oWyd0ZXh0JywgJ2ltYWdlX3VybCcsICd2aWRlb191cmwnLCAnYXVkaW9fdXJsJ10pLFxuICBtb2RlcmF0aW9uTGV2ZWw6IHouZW51bShbJ3N0cmljdCcsICdtb2RlcmF0ZScsICdsZW5pZW50J10pLmRlZmF1bHQoJ21vZGVyYXRlJyksXG4gIGN1c3RvbVJ1bGVzOiB6LmFycmF5KHoub2JqZWN0KHtcbiAgICBwYXR0ZXJuOiB6LnN0cmluZygpLFxuICAgIGFjdGlvbjogei5lbnVtKFsnZmxhZycsICdibG9jaycsICd3YXJuJ10pLFxuICAgIHJlYXNvbjogei5zdHJpbmcoKSxcbiAgfSkpLmRlZmF1bHQoW10pLFxufSk7XG5cbmV4cG9ydCB0eXBlIENvbnRlbnRNb2RlcmF0aW9uSW5wdXQgPSB6LmluZmVyPHR5cGVvZiBDb250ZW50TW9kZXJhdGlvbklucHV0U2NoZW1hPjtcblxuLy8gQ29udGVudCBtb2RlcmF0aW9uIHJlc3VsdFxuZXhwb3J0IGNvbnN0IENvbnRlbnRNb2RlcmF0aW9uUmVzdWx0U2NoZW1hID0gei5vYmplY3Qoe1xuICBpc0FsbG93ZWQ6IHouYm9vbGVhbigpLFxuICByaXNrU2NvcmU6IHoubnVtYmVyKCkubWluKDApLm1heCgxKSxcbiAgY2F0ZWdvcmllczogei5hcnJheSh6Lm9iamVjdCh7XG4gICAgY2F0ZWdvcnk6IHouZW51bShbXG4gICAgICAnaGF0ZV9zcGVlY2gnLFxuICAgICAgJ2hhcmFzc21lbnQnLFxuICAgICAgJ3Zpb2xlbmNlJyxcbiAgICAgICdzZWxmX2hhcm0nLFxuICAgICAgJ3NleHVhbF9jb250ZW50JyxcbiAgICAgICdzcGFtJyxcbiAgICAgICdtaXNpbmZvcm1hdGlvbicsXG4gICAgICAncHJpdmFjeV92aW9sYXRpb24nLFxuICAgICAgJ2NvcHlyaWdodF92aW9sYXRpb24nLFxuICAgIF0pLFxuICAgIGNvbmZpZGVuY2U6IHoubnVtYmVyKCkubWluKDApLm1heCgxKSxcbiAgICBzZXZlcml0eTogei5uYXRpdmVFbnVtKFZhbGlkYXRpb25TZXZlcml0eSksXG4gIH0pKSxcbiAgYWN0aW9uOiB6LmVudW0oWydhbGxvdycsICdmbGFnJywgJ2Jsb2NrJywgJ3JldmlldyddKSxcbiAgcmVhc29uOiB6LnN0cmluZygpLm9wdGlvbmFsKCksXG59KTtcblxuZXhwb3J0IHR5cGUgQ29udGVudE1vZGVyYXRpb25SZXN1bHQgPSB6LmluZmVyPHR5cGVvZiBDb250ZW50TW9kZXJhdGlvblJlc3VsdFNjaGVtYT47Il19