"use strict";
/**
 * Data Validation Utilities
 * Validation functions for DynamoDB entities and operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataValidator = void 0;
class DataValidator {
    /**
     * Validate user entity
     */
    static validateUser(user) {
        const errors = [];
        const warnings = [];
        // Required fields
        if (!user.userId) {
            errors.push({ field: 'userId', message: 'User ID is required', code: 'REQUIRED' });
        }
        if (!user.email) {
            errors.push({ field: 'email', message: 'Email is required', code: 'REQUIRED' });
        }
        else if (!this.EMAIL_REGEX.test(user.email)) {
            errors.push({ field: 'email', message: 'Invalid email format', code: 'INVALID_FORMAT', value: user.email });
        }
        // Profile validation
        if (user.profile) {
            if (!user.profile.firstName) {
                errors.push({ field: 'profile.firstName', message: 'First name is required', code: 'REQUIRED' });
            }
            if (!user.profile.lastName) {
                errors.push({ field: 'profile.lastName', message: 'Last name is required', code: 'REQUIRED' });
            }
            if (user.profile.bio && user.profile.bio.length > 500) {
                warnings.push({ field: 'profile.bio', message: 'Bio is longer than recommended 500 characters', code: 'LENGTH_WARNING', value: user.profile.bio.length });
            }
            if (!user.profile.culturalBackground || !Array.isArray(user.profile.culturalBackground)) {
                warnings.push({ field: 'profile.culturalBackground', message: 'Cultural background should be an array', code: 'TYPE_WARNING' });
            }
        }
        else {
            errors.push({ field: 'profile', message: 'Profile is required', code: 'REQUIRED' });
        }
        // Settings validation
        if (user.settings) {
            const validThemes = ['light', 'dark', 'auto'];
            if (user.settings.theme && !validThemes.includes(user.settings.theme)) {
                errors.push({ field: 'settings.theme', message: 'Invalid theme value', code: 'INVALID_VALUE', value: user.settings.theme });
            }
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    /**
     * Validate circle entity
     */
    static validateCircle(circle) {
        const errors = [];
        const warnings = [];
        // Required fields
        if (!circle.circleId) {
            errors.push({ field: 'circleId', message: 'Circle ID is required', code: 'REQUIRED' });
        }
        if (!circle.name) {
            errors.push({ field: 'name', message: 'Circle name is required', code: 'REQUIRED' });
        }
        else if (circle.name.length < 3) {
            errors.push({ field: 'name', message: 'Circle name must be at least 3 characters', code: 'MIN_LENGTH', value: circle.name.length });
        }
        else if (circle.name.length > 100) {
            errors.push({ field: 'name', message: 'Circle name must be less than 100 characters', code: 'MAX_LENGTH', value: circle.name.length });
        }
        if (!circle.description) {
            warnings.push({ field: 'description', message: 'Circle description is recommended', code: 'RECOMMENDED' });
        }
        else if (circle.description.length > 1000) {
            warnings.push({ field: 'description', message: 'Description is longer than recommended 1000 characters', code: 'LENGTH_WARNING', value: circle.description.length });
        }
        if (!circle.type) {
            errors.push({ field: 'type', message: 'Circle type is required', code: 'REQUIRED' });
        }
        if (!circle.createdBy) {
            errors.push({ field: 'createdBy', message: 'Creator ID is required', code: 'REQUIRED' });
        }
        // Settings validation
        if (circle.settings) {
            if (circle.settings.maxMembers && (circle.settings.maxMembers < 2 || circle.settings.maxMembers > 10000)) {
                errors.push({ field: 'settings.maxMembers', message: 'Max members must be between 2 and 10000', code: 'RANGE_ERROR', value: circle.settings.maxMembers });
            }
            const validModerationLevels = ['light', 'moderate', 'strict'];
            if (circle.settings.moderationLevel && !validModerationLevels.includes(circle.settings.moderationLevel)) {
                errors.push({ field: 'settings.moderationLevel', message: 'Invalid moderation level', code: 'INVALID_VALUE', value: circle.settings.moderationLevel });
            }
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    /**
     * Validate story entity
     */
    static validateStory(story) {
        const errors = [];
        const warnings = [];
        // Required fields
        if (!story.storyId) {
            errors.push({ field: 'storyId', message: 'Story ID is required', code: 'REQUIRED' });
        }
        if (!story.title) {
            errors.push({ field: 'title', message: 'Story title is required', code: 'REQUIRED' });
        }
        else if (story.title.length < 5) {
            errors.push({ field: 'title', message: 'Story title must be at least 5 characters', code: 'MIN_LENGTH', value: story.title.length });
        }
        else if (story.title.length > 200) {
            errors.push({ field: 'title', message: 'Story title must be less than 200 characters', code: 'MAX_LENGTH', value: story.title.length });
        }
        if (!story.content) {
            errors.push({ field: 'content', message: 'Story content is required', code: 'REQUIRED' });
        }
        else if (story.content.length < 50) {
            warnings.push({ field: 'content', message: 'Story content is quite short', code: 'LENGTH_WARNING', value: story.content.length });
        }
        else if (story.content.length > 50000) {
            warnings.push({ field: 'content', message: 'Story content is very long', code: 'LENGTH_WARNING', value: story.content.length });
        }
        if (!story.author || !story.author.id) {
            errors.push({ field: 'author.id', message: 'Author ID is required', code: 'REQUIRED' });
        }
        // Type validation
        const validStoryTypes = ['personal_experience', 'milestone_celebration', 'challenge_overcome', 'advice_sharing', 'gratitude_expression', 'awareness_raising'];
        if (story.type && !validStoryTypes.includes(story.type)) {
            errors.push({ field: 'type', message: 'Invalid story type', code: 'INVALID_VALUE', value: story.type });
        }
        // Status validation
        const validStatuses = ['draft', 'published', 'archived', 'flagged', 'removed'];
        if (story.status && !validStatuses.includes(story.status)) {
            errors.push({ field: 'status', message: 'Invalid story status', code: 'INVALID_VALUE', value: story.status });
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    /**
     * Validate business entity
     */
    static validateBusiness(business) {
        const errors = [];
        const warnings = [];
        // Required fields
        if (!business.businessId) {
            errors.push({ field: 'businessId', message: 'Business ID is required', code: 'REQUIRED' });
        }
        if (!business.profile) {
            errors.push({ field: 'profile', message: 'Business profile is required', code: 'REQUIRED' });
            return { isValid: false, errors, warnings };
        }
        if (!business.profile.name) {
            errors.push({ field: 'profile.name', message: 'Business name is required', code: 'REQUIRED' });
        }
        else if (business.profile.name.length < 2) {
            errors.push({ field: 'profile.name', message: 'Business name must be at least 2 characters', code: 'MIN_LENGTH', value: business.profile.name.length });
        }
        if (!business.profile.description) {
            warnings.push({ field: 'profile.description', message: 'Business description is recommended', code: 'RECOMMENDED' });
        }
        if (!business.profile.contact || !business.profile.contact.email) {
            errors.push({ field: 'profile.contact.email', message: 'Contact email is required', code: 'REQUIRED' });
        }
        else if (!this.EMAIL_REGEX.test(business.profile.contact.email)) {
            errors.push({ field: 'profile.contact.email', message: 'Invalid email format', code: 'INVALID_FORMAT', value: business.profile.contact.email });
        }
        if (business.profile.website && !this.URL_REGEX.test(business.profile.website)) {
            errors.push({ field: 'profile.website', message: 'Invalid website URL format', code: 'INVALID_FORMAT', value: business.profile.website });
        }
        if (business.profile.contact.phone && !this.PHONE_REGEX.test(business.profile.contact.phone)) {
            warnings.push({ field: 'profile.contact.phone', message: 'Phone number format may be invalid', code: 'FORMAT_WARNING', value: business.profile.contact.phone });
        }
        if (!business.ownerId) {
            errors.push({ field: 'ownerId', message: 'Owner ID is required', code: 'REQUIRED' });
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    /**
     * Validate resource entity
     */
    static validateResource(resource) {
        const errors = [];
        const warnings = [];
        // Required fields
        if (!resource.resourceId) {
            errors.push({ field: 'resourceId', message: 'Resource ID is required', code: 'REQUIRED' });
        }
        if (!resource.title) {
            errors.push({ field: 'title', message: 'Resource title is required', code: 'REQUIRED' });
        }
        else if (resource.title.length < 5) {
            errors.push({ field: 'title', message: 'Resource title must be at least 5 characters', code: 'MIN_LENGTH', value: resource.title.length });
        }
        if (!resource.description) {
            errors.push({ field: 'description', message: 'Resource description is required', code: 'REQUIRED' });
        }
        if (!resource.summary) {
            warnings.push({ field: 'summary', message: 'Resource summary is recommended', code: 'RECOMMENDED' });
        }
        if (!resource.category) {
            errors.push({ field: 'category', message: 'Resource category is required', code: 'REQUIRED' });
        }
        if (!resource.author || !resource.author.id) {
            errors.push({ field: 'author.id', message: 'Author ID is required', code: 'REQUIRED' });
        }
        // Type validation
        const validResourceTypes = ['article', 'video', 'podcast', 'infographic', 'checklist', 'guide', 'research_paper', 'webinar', 'tool', 'template'];
        if (resource.type && !validResourceTypes.includes(resource.type)) {
            errors.push({ field: 'type', message: 'Invalid resource type', code: 'INVALID_VALUE', value: resource.type });
        }
        // URL validation
        if (resource.externalUrl && !this.URL_REGEX.test(resource.externalUrl)) {
            errors.push({ field: 'externalUrl', message: 'Invalid external URL format', code: 'INVALID_FORMAT', value: resource.externalUrl });
        }
        if (resource.downloadUrl && !this.URL_REGEX.test(resource.downloadUrl)) {
            errors.push({ field: 'downloadUrl', message: 'Invalid download URL format', code: 'INVALID_FORMAT', value: resource.downloadUrl });
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    /**
     * Validate DynamoDB key structure
     */
    static validateKeys(entity) {
        const errors = [];
        const warnings = [];
        if (!entity.PK) {
            errors.push({ field: 'PK', message: 'Partition key (PK) is required', code: 'REQUIRED' });
        }
        else if (typeof entity.PK !== 'string') {
            errors.push({ field: 'PK', message: 'Partition key (PK) must be a string', code: 'TYPE_ERROR' });
        }
        if (!entity.SK) {
            errors.push({ field: 'SK', message: 'Sort key (SK) is required', code: 'REQUIRED' });
        }
        else if (typeof entity.SK !== 'string') {
            errors.push({ field: 'SK', message: 'Sort key (SK) must be a string', code: 'TYPE_ERROR' });
        }
        if (!entity.entityType) {
            errors.push({ field: 'entityType', message: 'Entity type is required', code: 'REQUIRED' });
        }
        if (entity.version === undefined || entity.version === null) {
            errors.push({ field: 'version', message: 'Version is required for optimistic locking', code: 'REQUIRED' });
        }
        else if (typeof entity.version !== 'number' || entity.version < 0) {
            errors.push({ field: 'version', message: 'Version must be a non-negative number', code: 'TYPE_ERROR' });
        }
        if (!entity.createdAt) {
            errors.push({ field: 'createdAt', message: 'Created timestamp is required', code: 'REQUIRED' });
        }
        else if (!this.isValidISODate(entity.createdAt)) {
            errors.push({ field: 'createdAt', message: 'Created timestamp must be a valid ISO date string', code: 'INVALID_FORMAT', value: entity.createdAt });
        }
        if (!entity.updatedAt) {
            errors.push({ field: 'updatedAt', message: 'Updated timestamp is required', code: 'REQUIRED' });
        }
        else if (!this.isValidISODate(entity.updatedAt)) {
            errors.push({ field: 'updatedAt', message: 'Updated timestamp must be a valid ISO date string', code: 'INVALID_FORMAT', value: entity.updatedAt });
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    /**
     * Validate entity consistency
     */
    static validateConsistency(entity) {
        const errors = [];
        const warnings = [];
        // Check if createdAt is before updatedAt
        if (entity.createdAt && entity.updatedAt) {
            const created = new Date(entity.createdAt);
            const updated = new Date(entity.updatedAt);
            if (created > updated) {
                errors.push({
                    field: 'timestamps',
                    message: 'Created timestamp cannot be after updated timestamp',
                    code: 'CONSISTENCY_ERROR',
                    value: { createdAt: entity.createdAt, updatedAt: entity.updatedAt }
                });
            }
        }
        // Check TTL if present
        if (entity.ttl) {
            const now = Math.floor(Date.now() / 1000);
            if (entity.ttl < now) {
                warnings.push({
                    field: 'ttl',
                    message: 'TTL is in the past, item may be deleted',
                    code: 'TTL_WARNING',
                    value: entity.ttl
                });
            }
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    /**
     * Check if string is valid ISO date
     */
    static isValidISODate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime()) && date.toISOString() === dateString;
    }
    /**
     * Validate batch operation
     */
    static validateBatch(items, maxBatchSize = 25) {
        const errors = [];
        const warnings = [];
        if (!Array.isArray(items)) {
            errors.push({ field: 'items', message: 'Items must be an array', code: 'TYPE_ERROR' });
            return { isValid: false, errors, warnings };
        }
        if (items.length === 0) {
            errors.push({ field: 'items', message: 'Batch cannot be empty', code: 'EMPTY_BATCH' });
        }
        if (items.length > maxBatchSize) {
            errors.push({
                field: 'items',
                message: `Batch size cannot exceed ${maxBatchSize}`,
                code: 'BATCH_SIZE_EXCEEDED',
                value: items.length
            });
        }
        // Validate each item in the batch
        items.forEach((item, index) => {
            const keyValidation = this.validateKeys(item);
            if (!keyValidation.isValid) {
                keyValidation.errors.forEach(error => {
                    errors.push({
                        ...error,
                        field: `items[${index}].${error.field}`,
                        message: `Item ${index}: ${error.message}`
                    });
                });
            }
        });
        return { isValid: errors.length === 0, errors, warnings };
    }
    /**
     * Validate image asset entity
     */
    static validateImageAsset(image) {
        const errors = [];
        const warnings = [];
        if (!image.imageId) {
            errors.push({ field: 'imageId', message: 'Image ID is required', code: 'REQUIRED' });
        }
        if (!image.url) {
            errors.push({ field: 'url', message: 'Image URL is required', code: 'REQUIRED' });
        }
        else if (!this.URL_REGEX.test(image.url)) {
            errors.push({ field: 'url', message: 'Invalid image URL format', code: 'INVALID_FORMAT', value: image.url });
        }
        if (image.thumbnailUrl && !this.URL_REGEX.test(image.thumbnailUrl)) {
            warnings.push({ field: 'thumbnailUrl', message: 'Thumbnail URL format may be invalid', code: 'FORMAT_WARNING', value: image.thumbnailUrl });
        }
        if (!image.altText || image.altText.trim().length < 5) {
            errors.push({ field: 'altText', message: 'Alt text must be at least 5 characters', code: 'MIN_LENGTH' });
        }
        if (!image.category) {
            errors.push({ field: 'category', message: 'Category is required', code: 'REQUIRED' });
        }
        const validStatus = ['active', 'archived', 'flagged', 'removed', 'pending_review'];
        if (image.status && !validStatus.includes(image.status)) {
            errors.push({ field: 'status', message: 'Invalid status', code: 'INVALID_VALUE', value: image.status });
        }
        if (image.validation) {
            ['culturalScore', 'sensitivityScore', 'inclusivityScore'].forEach((k) => {
                if (image.validation[k] !== undefined && (typeof image.validation[k] !== 'number' || image.validation[k] < 0 || image.validation[k] > 1)) {
                    warnings.push({ field: `validation.${k}`, message: 'Score should be between 0 and 1', code: 'RANGE_WARNING', value: image.validation[k] });
                }
            });
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    /**
     * Validate feedback entity
     */
    static validateFeedback(feedback) {
        const errors = [];
        const warnings = [];
        if (!feedback.feedbackId) {
            errors.push({ field: 'feedbackId', message: 'Feedback ID is required', code: 'REQUIRED' });
        }
        if (!feedback.imageId) {
            errors.push({ field: 'imageId', message: 'Image ID is required', code: 'REQUIRED' });
        }
        if (!feedback.userId) {
            errors.push({ field: 'userId', message: 'User ID is required', code: 'REQUIRED' });
        }
        if (feedback.rating === undefined || feedback.rating === null) {
            errors.push({ field: 'rating', message: 'Rating is required', code: 'REQUIRED' });
        }
        else if (typeof feedback.rating !== 'number' || feedback.rating < 1 || feedback.rating > 5) {
            errors.push({ field: 'rating', message: 'Rating must be between 1 and 5', code: 'RANGE_ERROR', value: feedback.rating });
        }
        if (!Array.isArray(feedback.categories)) {
            warnings.push({ field: 'categories', message: 'Categories should be an array', code: 'TYPE_WARNING' });
        }
        const validSeverity = ['low', 'medium', 'high', 'critical'];
        if (feedback.severity && !validSeverity.includes(feedback.severity)) {
            warnings.push({ field: 'severity', message: 'Invalid severity', code: 'INVALID_VALUE', value: feedback.severity });
        }
        const validStatus = ['new', 'acknowledged', 'in_review', 'resolved', 'dismissed'];
        if (feedback.status && !validStatus.includes(feedback.status)) {
            warnings.push({ field: 'status', message: 'Invalid status', code: 'INVALID_VALUE', value: feedback.status });
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    /**
     * Validate incident entity
     */
    static validateIncident(incident) {
        const errors = [];
        const warnings = [];
        if (!incident.incidentId) {
            errors.push({ field: 'incidentId', message: 'Incident ID is required', code: 'REQUIRED' });
        }
        if (!incident.triggeredBy) {
            errors.push({ field: 'triggeredBy', message: 'triggeredBy is required', code: 'REQUIRED' });
        }
        else if (!['community_report', 'automated_detection', 'staff', 'advisory_board'].includes(incident.triggeredBy)) {
            errors.push({ field: 'triggeredBy', message: 'Invalid trigger', code: 'INVALID_VALUE', value: incident.triggeredBy });
        }
        if (!incident.priority || !['p1', 'p2', 'p3'].includes(incident.priority)) {
            errors.push({ field: 'priority', message: 'Priority must be p1|p2|p3', code: 'INVALID_VALUE', value: incident.priority });
        }
        if (!incident.summary) {
            errors.push({ field: 'summary', message: 'Summary is required', code: 'REQUIRED' });
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    /**
     * Validate advisory review entity
     */
    static validateAdvisoryReview(review) {
        const errors = [];
        const warnings = [];
        if (!review.reviewId) {
            errors.push({ field: 'reviewId', message: 'Review ID is required', code: 'REQUIRED' });
        }
        if (!review.targetType || !['image', 'resource', 'story'].includes(review.targetType)) {
            errors.push({ field: 'targetType', message: 'Invalid targetType', code: 'INVALID_VALUE', value: review.targetType });
        }
        if (!review.targetId) {
            errors.push({ field: 'targetId', message: 'Target ID is required', code: 'REQUIRED' });
        }
        const validStatus = ['queued', 'in_review', 'approved', 'changes_requested', 'rejected'];
        if (review.status && !validStatus.includes(review.status)) {
            warnings.push({ field: 'status', message: 'Invalid status', code: 'INVALID_VALUE', value: review.status });
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    /**
     * Validate premium source entity
     */
    static validatePremiumSource(source) {
        const errors = [];
        const warnings = [];
        if (!source.sourceId) {
            errors.push({ field: 'sourceId', message: 'Source ID is required', code: 'REQUIRED' });
        }
        if (!source.provider || !['createher', 'nappy', 'other'].includes(source.provider)) {
            errors.push({ field: 'provider', message: 'Invalid provider', code: 'INVALID_VALUE', value: source.provider });
        }
        if (!source.displayName) {
            errors.push({ field: 'displayName', message: 'Display name is required', code: 'REQUIRED' });
        }
        if (source.apiBaseUrl && !this.URL_REGEX.test(source.apiBaseUrl)) {
            warnings.push({ field: 'apiBaseUrl', message: 'API base URL format may be invalid', code: 'FORMAT_WARNING', value: source.apiBaseUrl });
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    /**
     * Validate personalization profile entity
     */
    static validatePersonalization(profile) {
        const errors = [];
        const warnings = [];
        if (!profile.userId) {
            errors.push({ field: 'userId', message: 'User ID is required', code: 'REQUIRED' });
        }
        if (profile.engagement) {
            ['impressions', 'clicks'].forEach((k) => {
                if (profile.engagement[k] !== undefined && (typeof profile.engagement[k] !== 'number' || profile.engagement[k] < 0)) {
                    warnings.push({ field: `engagement.${k}`, message: 'Engagement values must be non-negative', code: 'RANGE_WARNING', value: profile.engagement[k] });
                }
            });
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
}
exports.DataValidator = DataValidator;
DataValidator.EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
DataValidator.URL_REGEX = /^https?:\/\/.+/;
DataValidator.PHONE_REGEX = /^\+?[\d\s\-\(\)]+$/;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInZhbGlkYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7O0FBc0JILE1BQWEsYUFBYTtJQUt4Qjs7T0FFRztJQUNILE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBUztRQUMzQixNQUFNLE1BQU0sR0FBc0IsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sUUFBUSxHQUF3QixFQUFFLENBQUM7UUFFekMsa0JBQWtCO1FBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQ3JGLENBQUM7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUNsRixDQUFDO2FBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQzlDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzlHLENBQUM7UUFFRCxxQkFBcUI7UUFDckIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzVCLE1BQU0sQ0FBQyxJ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RyxvQkFBb0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRGF0YSBWYWxpZGF0aW9uIFV0aWxpdGllc1xuICogVmFsaWRhdGlvbiBmdW5jdGlvbnMgZm9yIER5bmFtb0RCIGVudGl0aWVzIGFuZCBvcGVyYXRpb25zXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgaXNWYWxpZDogYm9vbGVhbjtcbiAgZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JbXTtcbiAgd2FybmluZ3M6IFZhbGlkYXRpb25XYXJuaW5nW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGlvbkVycm9yIHtcbiAgZmllbGQ6IHN0cmluZztcbiAgbWVzc2FnZTogc3RyaW5nO1xuICBjb2RlOiBzdHJpbmc7XG4gIHZhbHVlPzogYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRpb25XYXJuaW5nIHtcbiAgZmllbGQ6IHN0cmluZztcbiAgbWVzc2FnZTogc3RyaW5nO1xuICBjb2RlOiBzdHJpbmc7XG4gIHZhbHVlPzogYW55O1xufVxuXG5leHBvcnQgY2xhc3MgRGF0YVZhbGlkYXRvciB7XG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IEVNQUlMX1JFR0VYID0gL15bXlxcc0BdK0BbXlxcc0BdK1xcLlteXFxzQF0rJC87XG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFVSTF9SRUdFWCA9IC9eaHR0cHM/OlxcL1xcLy4rLztcbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgUEhPTkVfUkVHRVggPSAvXlxcKz9bXFxkXFxzXFwtXFwoXFwpXSskLztcblxuICAvKipcbiAgICogVmFsaWRhdGUgdXNlciBlbnRpdHlcbiAgICovXG4gIHN0YXRpYyB2YWxpZGF0ZVVzZXIodXNlcjogYW55KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgY29uc3QgZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JbXSA9IFtdO1xuICAgIGNvbnN0IHdhcm5pbmdzOiBWYWxpZGF0aW9uV2FybmluZ1tdID0gW107XG5cbiAgICAvLyBSZXF1aXJlZCBmaWVsZHNcbiAgICBpZiAoIXVzZXIudXNlcklkKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndXNlcklkJywgbWVzc2FnZTogJ1VzZXIgSUQgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cbiAgICBpZiAoIXVzZXIuZW1haWwpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdlbWFpbCcsIG1lc3NhZ2U6ICdFbWFpbCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfSBlbHNlIGlmICghdGhpcy5FTUFJTF9SRUdFWC50ZXN0KHVzZXIuZW1haWwpKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnZW1haWwnLCBtZXNzYWdlOiAnSW52YWxpZCBlbWFpbCBmb3JtYXQnLCBjb2RlOiAnSU5WQUxJRF9GT1JNQVQnLCB2YWx1ZTogdXNlci5lbWFpbCB9KTtcbiAgICB9XG5cbiAgICAvLyBQcm9maWxlIHZhbGlkYXRpb25cbiAgICBpZiAodXNlci5wcm9maWxlKSB7XG4gICAgICBpZiAoIXVzZXIucHJvZmlsZS5maXJzdE5hbWUpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3Byb2ZpbGUuZmlyc3ROYW1lJywgbWVzc2FnZTogJ0ZpcnN0IG5hbWUgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgICAgfVxuICAgICAgaWYgKCF1c2VyLnByb2ZpbGUubGFzdE5hbWUpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3Byb2ZpbGUubGFzdE5hbWUnLCBtZXNzYWdlOiAnTGFzdCBuYW1lIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICAgIH1cbiAgICAgIGlmICh1c2VyLnByb2ZpbGUuYmlvICYmIHVzZXIucHJvZmlsZS5iaW8ubGVuZ3RoID4gNTAwKSB7XG4gICAgICAgIHdhcm5pbmdzLnB1c2goeyBmaWVsZDogJ3Byb2ZpbGUuYmlvJywgbWVzc2FnZTogJ0JpbyBpcyBsb25nZXIgdGhhbiByZWNvbW1lbmRlZCA1MDAgY2hhcmFjdGVycycsIGNvZGU6ICdMRU5HVEhfV0FSTklORycsIHZhbHVlOiB1c2VyLnByb2ZpbGUuYmlvLmxlbmd0aCB9KTtcbiAgICAgIH1cbiAgICAgIGlmICghdXNlci5wcm9maWxlLmN1bHR1cmFsQmFja2dyb3VuZCB8fCAhQXJyYXkuaXNBcnJheSh1c2VyLnByb2ZpbGUuY3VsdHVyYWxCYWNrZ3JvdW5kKSkge1xuICAgICAgICB3YXJuaW5ncy5wdXNoKHsgZmllbGQ6ICdwcm9maWxlLmN1bHR1cmFsQmFja2dyb3VuZCcsIG1lc3NhZ2U6ICdDdWx0dXJhbCBiYWNrZ3JvdW5kIHNob3VsZCBiZSBhbiBhcnJheScsIGNvZGU6ICdUWVBFX1dBUk5JTkcnIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAncHJvZmlsZScsIG1lc3NhZ2U6ICdQcm9maWxlIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9XG5cbiAgICAvLyBTZXR0aW5ncyB2YWxpZGF0aW9uXG4gICAgaWYgKHVzZXIuc2V0dGluZ3MpIHtcbiAgICAgIGNvbnN0IHZhbGlkVGhlbWVzID0gWydsaWdodCcsICdkYXJrJywgJ2F1dG8nXTtcbiAgICAgIGlmICh1c2VyLnNldHRpbmdzLnRoZW1lICYmICF2YWxpZFRoZW1lcy5pbmNsdWRlcyh1c2VyLnNldHRpbmdzLnRoZW1lKSkge1xuICAgICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnc2V0dGluZ3MudGhlbWUnLCBtZXNzYWdlOiAnSW52YWxpZCB0aGVtZSB2YWx1ZScsIGNvZGU6ICdJTlZBTElEX1ZBTFVFJywgdmFsdWU6IHVzZXIuc2V0dGluZ3MudGhlbWUgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZXJyb3JzLmxlbmd0aCA9PT0gMCwgZXJyb3JzLCB3YXJuaW5ncyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIGNpcmNsZSBlbnRpdHlcbiAgICovXG4gIHN0YXRpYyB2YWxpZGF0ZUNpcmNsZShjaXJjbGU6IGFueSk6IFZhbGlkYXRpb25SZXN1bHQge1xuICAgIGNvbnN0IGVycm9yczogVmFsaWRhdGlvbkVycm9yW10gPSBbXTtcbiAgICBjb25zdCB3YXJuaW5nczogVmFsaWRhdGlvbldhcm5pbmdbXSA9IFtdO1xuXG4gICAgLy8gUmVxdWlyZWQgZmllbGRzXG4gICAgaWYgKCFjaXJjbGUuY2lyY2xlSWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdjaXJjbGVJZCcsIG1lc3NhZ2U6ICdDaXJjbGUgSUQgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cbiAgICBpZiAoIWNpcmNsZS5uYW1lKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnbmFtZScsIG1lc3NhZ2U6ICdDaXJjbGUgbmFtZSBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfSBlbHNlIGlmIChjaXJjbGUubmFtZS5sZW5ndGggPCAzKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnbmFtZScsIG1lc3NhZ2U6ICdDaXJjbGUgbmFtZSBtdXN0IGJlIGF0IGxlYXN0IDMgY2hhcmFjdGVycycsIGNvZGU6ICdNSU5fTEVOR1RIJywgdmFsdWU6IGNpcmNsZS5uYW1lLmxlbmd0aCB9KTtcbiAgICB9IGVsc2UgaWYgKGNpcmNsZS5uYW1lLmxlbmd0aCA+IDEwMCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ25hbWUnLCBtZXNzYWdlOiAnQ2lyY2xlIG5hbWUgbXVzdCBiZSBsZXNzIHRoYW4gMTAwIGNoYXJhY3RlcnMnLCBjb2RlOiAnTUFYX0xFTkdUSCcsIHZhbHVlOiBjaXJjbGUubmFtZS5sZW5ndGggfSk7XG4gICAgfVxuXG4gICAgaWYgKCFjaXJjbGUuZGVzY3JpcHRpb24pIHtcbiAgICAgIHdhcm5pbmdzLnB1c2goeyBmaWVsZDogJ2Rlc2NyaXB0aW9uJywgbWVzc2FnZTogJ0NpcmNsZSBkZXNjcmlwdGlvbiBpcyByZWNvbW1lbmRlZCcsIGNvZGU6ICdSRUNPTU1FTkRFRCcgfSk7XG4gICAgfSBlbHNlIGlmIChjaXJjbGUuZGVzY3JpcHRpb24ubGVuZ3RoID4gMTAwMCkge1xuICAgICAgd2FybmluZ3MucHVzaCh7IGZpZWxkOiAnZGVzY3JpcHRpb24nLCBtZXNzYWdlOiAnRGVzY3JpcHRpb24gaXMgbG9uZ2VyIHRoYW4gcmVjb21tZW5kZWQgMTAwMCBjaGFyYWN0ZXJzJywgY29kZTogJ0xFTkdUSF9XQVJOSU5HJywgdmFsdWU6IGNpcmNsZS5kZXNjcmlwdGlvbi5sZW5ndGggfSk7XG4gICAgfVxuXG4gICAgaWYgKCFjaXJjbGUudHlwZSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3R5cGUnLCBtZXNzYWdlOiAnQ2lyY2xlIHR5cGUgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cblxuICAgIGlmICghY2lyY2xlLmNyZWF0ZWRCeSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2NyZWF0ZWRCeScsIG1lc3NhZ2U6ICdDcmVhdG9yIElEIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9XG5cbiAgICAvLyBTZXR0aW5ncyB2YWxpZGF0aW9uXG4gICAgaWYgKGNpcmNsZS5zZXR0aW5ncykge1xuICAgICAgaWYgKGNpcmNsZS5zZXR0aW5ncy5tYXhNZW1iZXJzICYmIChjaXJjbGUuc2V0dGluZ3MubWF4TWVtYmVycyA8IDIgfHwgY2lyY2xlLnNldHRpbmdzLm1heE1lbWJlcnMgPiAxMDAwMCkpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3NldHRpbmdzLm1heE1lbWJlcnMnLCBtZXNzYWdlOiAnTWF4IG1lbWJlcnMgbXVzdCBiZSBiZXR3ZWVuIDIgYW5kIDEwMDAwJywgY29kZTogJ1JBTkdFX0VSUk9SJywgdmFsdWU6IGNpcmNsZS5zZXR0aW5ncy5tYXhNZW1iZXJzIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjb25zdCB2YWxpZE1vZGVyYXRpb25MZXZlbHMgPSBbJ2xpZ2h0JywgJ21vZGVyYXRlJywgJ3N0cmljdCddO1xuICAgICAgaWYgKGNpcmNsZS5zZXR0aW5ncy5tb2RlcmF0aW9uTGV2ZWwgJiYgIXZhbGlkTW9kZXJhdGlvbkxldmVscy5pbmNsdWRlcyhjaXJjbGUuc2V0dGluZ3MubW9kZXJhdGlvbkxldmVsKSkge1xuICAgICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnc2V0dGluZ3MubW9kZXJhdGlvbkxldmVsJywgbWVzc2FnZTogJ0ludmFsaWQgbW9kZXJhdGlvbiBsZXZlbCcsIGNvZGU6ICdJTlZBTElEX1ZBTFVFJywgdmFsdWU6IGNpcmNsZS5zZXR0aW5ncy5tb2RlcmF0aW9uTGV2ZWwgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZXJyb3JzLmxlbmd0aCA9PT0gMCwgZXJyb3JzLCB3YXJuaW5ncyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIHN0b3J5IGVudGl0eVxuICAgKi9cbiAgc3RhdGljIHZhbGlkYXRlU3Rvcnkoc3Rvcnk6IGFueSk6IFZhbGlkYXRpb25SZXN1bHQge1xuICAgIGNvbnN0IGVycm9yczogVmFsaWRhdGlvbkVycm9yW10gPSBbXTtcbiAgICBjb25zdCB3YXJuaW5nczogVmFsaWRhdGlvbldhcm5pbmdbXSA9IFtdO1xuXG4gICAgLy8gUmVxdWlyZWQgZmllbGRzXG4gICAgaWYgKCFzdG9yeS5zdG9yeUlkKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnc3RvcnlJZCcsIG1lc3NhZ2U6ICdTdG9yeSBJRCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuICAgIGlmICghc3RvcnkudGl0bGUpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICd0aXRsZScsIG1lc3NhZ2U6ICdTdG9yeSB0aXRsZSBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfSBlbHNlIGlmIChzdG9yeS50aXRsZS5sZW5ndGggPCA1KSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndGl0bGUnLCBtZXNzYWdlOiAnU3RvcnkgdGl0bGUgbXVzdCBiZSBhdCBsZWFzdCA1IGNoYXJhY3RlcnMnLCBjb2RlOiAnTUlOX0xFTkdUSCcsIHZhbHVlOiBzdG9yeS50aXRsZS5sZW5ndGggfSk7XG4gICAgfSBlbHNlIGlmIChzdG9yeS50aXRsZS5sZW5ndGggPiAyMDApIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICd0aXRsZScsIG1lc3NhZ2U6ICdTdG9yeSB0aXRsZSBtdXN0IGJlIGxlc3MgdGhhbiAyMDAgY2hhcmFjdGVycycsIGNvZGU6ICdNQVhfTEVOR1RIJywgdmFsdWU6IHN0b3J5LnRpdGxlLmxlbmd0aCB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXN0b3J5LmNvbnRlbnQpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdjb250ZW50JywgbWVzc2FnZTogJ1N0b3J5IGNvbnRlbnQgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH0gZWxzZSBpZiAoc3RvcnkuY29udGVudC5sZW5ndGggPCA1MCkge1xuICAgICAgd2FybmluZ3MucHVzaCh7IGZpZWxkOiAnY29udGVudCcsIG1lc3NhZ2U6ICdTdG9yeSBjb250ZW50IGlzIHF1aXRlIHNob3J0JywgY29kZTogJ0xFTkdUSF9XQVJOSU5HJywgdmFsdWU6IHN0b3J5LmNvbnRlbnQubGVuZ3RoIH0pO1xuICAgIH0gZWxzZSBpZiAoc3RvcnkuY29udGVudC5sZW5ndGggPiA1MDAwMCkge1xuICAgICAgd2FybmluZ3MucHVzaCh7IGZpZWxkOiAnY29udGVudCcsIG1lc3NhZ2U6ICdTdG9yeSBjb250ZW50IGlzIHZlcnkgbG9uZycsIGNvZGU6ICdMRU5HVEhfV0FSTklORycsIHZhbHVlOiBzdG9yeS5jb250ZW50Lmxlbmd0aCB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXN0b3J5LmF1dGhvciB8fCAhc3RvcnkuYXV0aG9yLmlkKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnYXV0aG9yLmlkJywgbWVzc2FnZTogJ0F1dGhvciBJRCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuXG4gICAgLy8gVHlwZSB2YWxpZGF0aW9uXG4gICAgY29uc3QgdmFsaWRTdG9yeVR5cGVzID0gWydwZXJzb25hbF9leHBlcmllbmNlJywgJ21pbGVzdG9uZV9jZWxlYnJhdGlvbicsICdjaGFsbGVuZ2Vfb3ZlcmNvbWUnLCAnYWR2aWNlX3NoYXJpbmcnLCAnZ3JhdGl0dWRlX2V4cHJlc3Npb24nLCAnYXdhcmVuZXNzX3JhaXNpbmcnXTtcbiAgICBpZiAoc3RvcnkudHlwZSAmJiAhdmFsaWRTdG9yeVR5cGVzLmluY2x1ZGVzKHN0b3J5LnR5cGUpKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndHlwZScsIG1lc3NhZ2U6ICdJbnZhbGlkIHN0b3J5IHR5cGUnLCBjb2RlOiAnSU5WQUxJRF9WQUxVRScsIHZhbHVlOiBzdG9yeS50eXBlIH0pO1xuICAgIH1cblxuICAgIC8vIFN0YXR1cyB2YWxpZGF0aW9uXG4gICAgY29uc3QgdmFsaWRTdGF0dXNlcyA9IFsnZHJhZnQnLCAncHVibGlzaGVkJywgJ2FyY2hpdmVkJywgJ2ZsYWdnZWQnLCAncmVtb3ZlZCddO1xuICAgIGlmIChzdG9yeS5zdGF0dXMgJiYgIXZhbGlkU3RhdHVzZXMuaW5jbHVkZXMoc3Rvcnkuc3RhdHVzKSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3N0YXR1cycsIG1lc3NhZ2U6ICdJbnZhbGlkIHN0b3J5IHN0YXR1cycsIGNvZGU6ICdJTlZBTElEX1ZBTFVFJywgdmFsdWU6IHN0b3J5LnN0YXR1cyB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiBlcnJvcnMubGVuZ3RoID09PSAwLCBlcnJvcnMsIHdhcm5pbmdzIH07XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgYnVzaW5lc3MgZW50aXR5XG4gICAqL1xuICBzdGF0aWMgdmFsaWRhdGVCdXNpbmVzcyhidXNpbmVzczogYW55KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgY29uc3QgZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JbXSA9IFtdO1xuICAgIGNvbnN0IHdhcm5pbmdzOiBWYWxpZGF0aW9uV2FybmluZ1tdID0gW107XG5cbiAgICAvLyBSZXF1aXJlZCBmaWVsZHNcbiAgICBpZiAoIWJ1c2luZXNzLmJ1c2luZXNzSWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdidXNpbmVzc0lkJywgbWVzc2FnZTogJ0J1c2luZXNzIElEIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWJ1c2luZXNzLnByb2ZpbGUpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdwcm9maWxlJywgbWVzc2FnZTogJ0J1c2luZXNzIHByb2ZpbGUgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgICAgcmV0dXJuIHsgaXNWYWxpZDogZmFsc2UsIGVycm9ycywgd2FybmluZ3MgfTtcbiAgICB9XG5cbiAgICBpZiAoIWJ1c2luZXNzLnByb2ZpbGUubmFtZSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3Byb2ZpbGUubmFtZScsIG1lc3NhZ2U6ICdCdXNpbmVzcyBuYW1lIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9IGVsc2UgaWYgKGJ1c2luZXNzLnByb2ZpbGUubmFtZS5sZW5ndGggPCAyKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAncHJvZmlsZS5uYW1lJywgbWVzc2FnZTogJ0J1c2luZXNzIG5hbWUgbXVzdCBiZSBhdCBsZWFzdCAyIGNoYXJhY3RlcnMnLCBjb2RlOiAnTUlOX0xFTkdUSCcsIHZhbHVlOiBidXNpbmVzcy5wcm9maWxlLm5hbWUubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIGlmICghYnVzaW5lc3MucHJvZmlsZS5kZXNjcmlwdGlvbikge1xuICAgICAgd2FybmluZ3MucHVzaCh7IGZpZWxkOiAncHJvZmlsZS5kZXNjcmlwdGlvbicsIG1lc3NhZ2U6ICdCdXNpbmVzcyBkZXNjcmlwdGlvbiBpcyByZWNvbW1lbmRlZCcsIGNvZGU6ICdSRUNPTU1FTkRFRCcgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFidXNpbmVzcy5wcm9maWxlLmNvbnRhY3QgfHwgIWJ1c2luZXNzLnByb2ZpbGUuY29udGFjdC5lbWFpbCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3Byb2ZpbGUuY29udGFjdC5lbWFpbCcsIG1lc3NhZ2U6ICdDb250YWN0IGVtYWlsIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLkVNQUlMX1JFR0VYLnRlc3QoYnVzaW5lc3MucHJvZmlsZS5jb250YWN0LmVtYWlsKSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3Byb2ZpbGUuY29udGFjdC5lbWFpbCcsIG1lc3NhZ2U6ICdJbnZhbGlkIGVtYWlsIGZvcm1hdCcsIGNvZGU6ICdJTlZBTElEX0ZPUk1BVCcsIHZhbHVlOiBidXNpbmVzcy5wcm9maWxlLmNvbnRhY3QuZW1haWwgfSk7XG4gICAgfVxuXG4gICAgaWYgKGJ1c2luZXNzLnByb2ZpbGUud2Vic2l0ZSAmJiAhdGhpcy5VUkxfUkVHRVgudGVzdChidXNpbmVzcy5wcm9maWxlLndlYnNpdGUpKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAncHJvZmlsZS53ZWJzaXRlJywgbWVzc2FnZTogJ0ludmFsaWQgd2Vic2l0ZSBVUkwgZm9ybWF0JywgY29kZTogJ0lOVkFMSURfRk9STUFUJywgdmFsdWU6IGJ1c2luZXNzLnByb2ZpbGUud2Vic2l0ZSB9KTtcbiAgICB9XG5cbiAgICBpZiAoYnVzaW5lc3MucHJvZmlsZS5jb250YWN0LnBob25lICYmICF0aGlzLlBIT05FX1JFR0VYLnRlc3QoYnVzaW5lc3MucHJvZmlsZS5jb250YWN0LnBob25lKSkge1xuICAgICAgd2FybmluZ3MucHVzaCh7IGZpZWxkOiAncHJvZmlsZS5jb250YWN0LnBob25lJywgbWVzc2FnZTogJ1Bob25lIG51bWJlciBmb3JtYXQgbWF5IGJlIGludmFsaWQnLCBjb2RlOiAnRk9STUFUX1dBUk5JTkcnLCB2YWx1ZTogYnVzaW5lc3MucHJvZmlsZS5jb250YWN0LnBob25lIH0pO1xuICAgIH1cblxuICAgIGlmICghYnVzaW5lc3Mub3duZXJJZCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ293bmVySWQnLCBtZXNzYWdlOiAnT3duZXIgSUQgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7IGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsIGVycm9ycywgd2FybmluZ3MgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSByZXNvdXJjZSBlbnRpdHlcbiAgICovXG4gIHN0YXRpYyB2YWxpZGF0ZVJlc291cmNlKHJlc291cmNlOiBhbnkpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgICBjb25zdCBlcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdID0gW107XG4gICAgY29uc3Qgd2FybmluZ3M6IFZhbGlkYXRpb25XYXJuaW5nW10gPSBbXTtcblxuICAgIC8vIFJlcXVpcmVkIGZpZWxkc1xuICAgIGlmICghcmVzb3VyY2UucmVzb3VyY2VJZCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3Jlc291cmNlSWQnLCBtZXNzYWdlOiAnUmVzb3VyY2UgSUQgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cbiAgICBpZiAoIXJlc291cmNlLnRpdGxlKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndGl0bGUnLCBtZXNzYWdlOiAnUmVzb3VyY2UgdGl0bGUgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH0gZWxzZSBpZiAocmVzb3VyY2UudGl0bGUubGVuZ3RoIDwgNSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3RpdGxlJywgbWVzc2FnZTogJ1Jlc291cmNlIHRpdGxlIG11c3QgYmUgYXQgbGVhc3QgNSBjaGFyYWN0ZXJzJywgY29kZTogJ01JTl9MRU5HVEgnLCB2YWx1ZTogcmVzb3VyY2UudGl0bGUubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIGlmICghcmVzb3VyY2UuZGVzY3JpcHRpb24pIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdkZXNjcmlwdGlvbicsIG1lc3NhZ2U6ICdSZXNvdXJjZSBkZXNjcmlwdGlvbiBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXNvdXJjZS5zdW1tYXJ5KSB7XG4gICAgICB3YXJuaW5ncy5wdXNoKHsgZmllbGQ6ICdzdW1tYXJ5JywgbWVzc2FnZTogJ1Jlc291cmNlIHN1bW1hcnkgaXMgcmVjb21tZW5kZWQnLCBjb2RlOiAnUkVDT01NRU5ERUQnIH0pO1xuICAgIH1cblxuICAgIGlmICghcmVzb3VyY2UuY2F0ZWdvcnkpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdjYXRlZ29yeScsIG1lc3NhZ2U6ICdSZXNvdXJjZSBjYXRlZ29yeSBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXNvdXJjZS5hdXRob3IgfHwgIXJlc291cmNlLmF1dGhvci5pZCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2F1dGhvci5pZCcsIG1lc3NhZ2U6ICdBdXRob3IgSUQgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cblxuICAgIC8vIFR5cGUgdmFsaWRhdGlvblxuICAgIGNvbnN0IHZhbGlkUmVzb3VyY2VUeXBlcyA9IFsnYXJ0aWNsZScsICd2aWRlbycsICdwb2RjYXN0JywgJ2luZm9ncmFwaGljJywgJ2NoZWNrbGlzdCcsICdndWlkZScsICdyZXNlYXJjaF9wYXBlcicsICd3ZWJpbmFyJywgJ3Rvb2wnLCAndGVtcGxhdGUnXTtcbiAgICBpZiAocmVzb3VyY2UudHlwZSAmJiAhdmFsaWRSZXNvdXJjZVR5cGVzLmluY2x1ZGVzKHJlc291cmNlLnR5cGUpKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndHlwZScsIG1lc3NhZ2U6ICdJbnZhbGlkIHJlc291cmNlIHR5cGUnLCBjb2RlOiAnSU5WQUxJRF9WQUxVRScsIHZhbHVlOiByZXNvdXJjZS50eXBlIH0pO1xuICAgIH1cblxuICAgIC8vIFVSTCB2YWxpZGF0aW9uXG4gICAgaWYgKHJlc291cmNlLmV4dGVybmFsVXJsICYmICF0aGlzLlVSTF9SRUdFWC50ZXN0KHJlc291cmNlLmV4dGVybmFsVXJsKSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2V4dGVybmFsVXJsJywgbWVzc2FnZTogJ0ludmFsaWQgZXh0ZXJuYWwgVVJMIGZvcm1hdCcsIGNvZGU6ICdJTlZBTElEX0ZPUk1BVCcsIHZhbHVlOiByZXNvdXJjZS5leHRlcm5hbFVybCB9KTtcbiAgICB9XG5cbiAgICBpZiAocmVzb3VyY2UuZG93bmxvYWRVcmwgJiYgIXRoaXMuVVJMX1JFR0VYLnRlc3QocmVzb3VyY2UuZG93bmxvYWRVcmwpKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnZG93bmxvYWRVcmwnLCBtZXNzYWdlOiAnSW52YWxpZCBkb3dubG9hZCBVUkwgZm9ybWF0JywgY29kZTogJ0lOVkFMSURfRk9STUFUJywgdmFsdWU6IHJlc291cmNlLmRvd25sb2FkVXJsIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7IGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsIGVycm9ycywgd2FybmluZ3MgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBEeW5hbW9EQiBrZXkgc3RydWN0dXJlXG4gICAqL1xuICBzdGF0aWMgdmFsaWRhdGVLZXlzKGVudGl0eTogYW55KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgY29uc3QgZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JbXSA9IFtdO1xuICAgIGNvbnN0IHdhcm5pbmdzOiBWYWxpZGF0aW9uV2FybmluZ1tdID0gW107XG5cbiAgICBpZiAoIWVudGl0eS5QSykge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ1BLJywgbWVzc2FnZTogJ1BhcnRpdGlvbiBrZXkgKFBLKSBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZW50aXR5LlBLICE9PSAnc3RyaW5nJykge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ1BLJywgbWVzc2FnZTogJ1BhcnRpdGlvbiBrZXkgKFBLKSBtdXN0IGJlIGEgc3RyaW5nJywgY29kZTogJ1RZUEVfRVJST1InIH0pO1xuICAgIH1cblxuICAgIGlmICghZW50aXR5LlNLKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnU0snLCBtZXNzYWdlOiAnU29ydCBrZXkgKFNLKSBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZW50aXR5LlNLICE9PSAnc3RyaW5nJykge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ1NLJywgbWVzc2FnZTogJ1NvcnQga2V5IChTSykgbXVzdCBiZSBhIHN0cmluZycsIGNvZGU6ICdUWVBFX0VSUk9SJyB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWVudGl0eS5lbnRpdHlUeXBlKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnZW50aXR5VHlwZScsIG1lc3NhZ2U6ICdFbnRpdHkgdHlwZSBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuXG4gICAgaWYgKGVudGl0eS52ZXJzaW9uID09PSB1bmRlZmluZWQgfHwgZW50aXR5LnZlcnNpb24gPT09IG51bGwpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICd2ZXJzaW9uJywgbWVzc2FnZTogJ1ZlcnNpb24gaXMgcmVxdWlyZWQgZm9yIG9wdGltaXN0aWMgbG9ja2luZycsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZW50aXR5LnZlcnNpb24gIT09ICdudW1iZXInIHx8IGVudGl0eS52ZXJzaW9uIDwgMCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3ZlcnNpb24nLCBtZXNzYWdlOiAnVmVyc2lvbiBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIG51bWJlcicsIGNvZGU6ICdUWVBFX0VSUk9SJyB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWVudGl0eS5jcmVhdGVkQXQpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdjcmVhdGVkQXQnLCBtZXNzYWdlOiAnQ3JlYXRlZCB0aW1lc3RhbXAgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNWYWxpZElTT0RhdGUoZW50aXR5LmNyZWF0ZWRBdCkpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdjcmVhdGVkQXQnLCBtZXNzYWdlOiAnQ3JlYXRlZCB0aW1lc3RhbXAgbXVzdCBiZSBhIHZhbGlkIElTTyBkYXRlIHN0cmluZycsIGNvZGU6ICdJTlZBTElEX0ZPUk1BVCcsIHZhbHVlOiBlbnRpdHkuY3JlYXRlZEF0IH0pO1xuICAgIH1cblxuICAgIGlmICghZW50aXR5LnVwZGF0ZWRBdCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3VwZGF0ZWRBdCcsIG1lc3NhZ2U6ICdVcGRhdGVkIHRpbWVzdGFtcCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfSBlbHNlIGlmICghdGhpcy5pc1ZhbGlkSVNPRGF0ZShlbnRpdHkudXBkYXRlZEF0KSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3VwZGF0ZWRBdCcsIG1lc3NhZ2U6ICdVcGRhdGVkIHRpbWVzdGFtcCBtdXN0IGJlIGEgdmFsaWQgSVNPIGRhdGUgc3RyaW5nJywgY29kZTogJ0lOVkFMSURfRk9STUFUJywgdmFsdWU6IGVudGl0eS51cGRhdGVkQXQgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZXJyb3JzLmxlbmd0aCA9PT0gMCwgZXJyb3JzLCB3YXJuaW5ncyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIGVudGl0eSBjb25zaXN0ZW5jeVxuICAgKi9cbiAgc3RhdGljIHZhbGlkYXRlQ29uc2lzdGVuY3koZW50aXR5OiBhbnkpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgICBjb25zdCBlcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdID0gW107XG4gICAgY29uc3Qgd2FybmluZ3M6IFZhbGlkYXRpb25XYXJuaW5nW10gPSBbXTtcblxuICAgIC8vIENoZWNrIGlmIGNyZWF0ZWRBdCBpcyBiZWZvcmUgdXBkYXRlZEF0XG4gICAgaWYgKGVudGl0eS5jcmVhdGVkQXQgJiYgZW50aXR5LnVwZGF0ZWRBdCkge1xuICAgICAgY29uc3QgY3JlYXRlZCA9IG5ldyBEYXRlKGVudGl0eS5jcmVhdGVkQXQpO1xuICAgICAgY29uc3QgdXBkYXRlZCA9IG5ldyBEYXRlKGVudGl0eS51cGRhdGVkQXQpO1xuICAgICAgXG4gICAgICBpZiAoY3JlYXRlZCA+IHVwZGF0ZWQpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goeyBcbiAgICAgICAgICBmaWVsZDogJ3RpbWVzdGFtcHMnLCBcbiAgICAgICAgICBtZXNzYWdlOiAnQ3JlYXRlZCB0aW1lc3RhbXAgY2Fubm90IGJlIGFmdGVyIHVwZGF0ZWQgdGltZXN0YW1wJywgXG4gICAgICAgICAgY29kZTogJ0NPTlNJU1RFTkNZX0VSUk9SJyxcbiAgICAgICAgICB2YWx1ZTogeyBjcmVhdGVkQXQ6IGVudGl0eS5jcmVhdGVkQXQsIHVwZGF0ZWRBdDogZW50aXR5LnVwZGF0ZWRBdCB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIFRUTCBpZiBwcmVzZW50XG4gICAgaWYgKGVudGl0eS50dGwpIHtcbiAgICAgIGNvbnN0IG5vdyA9IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApO1xuICAgICAgaWYgKGVudGl0eS50dGwgPCBub3cpIHtcbiAgICAgICAgd2FybmluZ3MucHVzaCh7XG4gICAgICAgICAgZmllbGQ6ICd0dGwnLFxuICAgICAgICAgIG1lc3NhZ2U6ICdUVEwgaXMgaW4gdGhlIHBhc3QsIGl0ZW0gbWF5IGJlIGRlbGV0ZWQnLFxuICAgICAgICAgIGNvZGU6ICdUVExfV0FSTklORycsXG4gICAgICAgICAgdmFsdWU6IGVudGl0eS50dGxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZXJyb3JzLmxlbmd0aCA9PT0gMCwgZXJyb3JzLCB3YXJuaW5ncyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHN0cmluZyBpcyB2YWxpZCBJU08gZGF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgaXNWYWxpZElTT0RhdGUoZGF0ZVN0cmluZzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKGRhdGVTdHJpbmcpO1xuICAgIHJldHVybiBkYXRlIGluc3RhbmNlb2YgRGF0ZSAmJiAhaXNOYU4oZGF0ZS5nZXRUaW1lKCkpICYmIGRhdGUudG9JU09TdHJpbmcoKSA9PT0gZGF0ZVN0cmluZztcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBiYXRjaCBvcGVyYXRpb25cbiAgICovXG4gIHN0YXRpYyB2YWxpZGF0ZUJhdGNoKGl0ZW1zOiBhbnlbXSwgbWF4QmF0Y2hTaXplOiBudW1iZXIgPSAyNSk6IFZhbGlkYXRpb25SZXN1bHQge1xuICAgIGNvbnN0IGVycm9yczogVmFsaWRhdGlvbkVycm9yW10gPSBbXTtcbiAgICBjb25zdCB3YXJuaW5nczogVmFsaWRhdGlvbldhcm5pbmdbXSA9IFtdO1xuXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGl0ZW1zKSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2l0ZW1zJywgbWVzc2FnZTogJ0l0ZW1zIG11c3QgYmUgYW4gYXJyYXknLCBjb2RlOiAnVFlQRV9FUlJPUicgfSk7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3JzLCB3YXJuaW5ncyB9O1xuICAgIH1cblxuICAgIGlmIChpdGVtcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdpdGVtcycsIG1lc3NhZ2U6ICdCYXRjaCBjYW5ub3QgYmUgZW1wdHknLCBjb2RlOiAnRU1QVFlfQkFUQ0gnIH0pO1xuICAgIH1cblxuICAgIGlmIChpdGVtcy5sZW5ndGggPiBtYXhCYXRjaFNpemUpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgXG4gICAgICAgIGZpZWxkOiAnaXRlbXMnLCBcbiAgICAgICAgbWVzc2FnZTogYEJhdGNoIHNpemUgY2Fubm90IGV4Y2VlZCAke21heEJhdGNoU2l6ZX1gLCBcbiAgICAgICAgY29kZTogJ0JBVENIX1NJWkVfRVhDRUVERUQnLFxuICAgICAgICB2YWx1ZTogaXRlbXMubGVuZ3RoIFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgZWFjaCBpdGVtIGluIHRoZSBiYXRjaFxuICAgIGl0ZW1zLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBrZXlWYWxpZGF0aW9uID0gdGhpcy52YWxpZGF0ZUtleXMoaXRlbSk7XG4gICAgICBpZiAoIWtleVZhbGlkYXRpb24uaXNWYWxpZCkge1xuICAgICAgICBrZXlWYWxpZGF0aW9uLmVycm9ycy5mb3JFYWNoKGVycm9yID0+IHtcbiAgICAgICAgICBlcnJvcnMucHVzaCh7XG4gICAgICAgICAgICAuLi5lcnJvcixcbiAgICAgICAgICAgIGZpZWxkOiBgaXRlbXNbJHtpbmRleH1dLiR7ZXJyb3IuZmllbGR9YCxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGBJdGVtICR7aW5kZXh9OiAke2Vycm9yLm1lc3NhZ2V9YFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB7IGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsIGVycm9ycywgd2FybmluZ3MgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBpbWFnZSBhc3NldCBlbnRpdHlcbiAgICovXG4gIHN0YXRpYyB2YWxpZGF0ZUltYWdlQXNzZXQoaW1hZ2U6IGFueSk6IFZhbGlkYXRpb25SZXN1bHQge1xuICAgIGNvbnN0IGVycm9yczogVmFsaWRhdGlvbkVycm9yW10gPSBbXTtcbiAgICBjb25zdCB3YXJuaW5nczogVmFsaWRhdGlvbldhcm5pbmdbXSA9IFtdO1xuXG4gICAgaWYgKCFpbWFnZS5pbWFnZUlkKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnaW1hZ2VJZCcsIG1lc3NhZ2U6ICdJbWFnZSBJRCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuICAgIGlmICghaW1hZ2UudXJsKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndXJsJywgbWVzc2FnZTogJ0ltYWdlIFVSTCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfSBlbHNlIGlmICghdGhpcy5VUkxfUkVHRVgudGVzdChpbWFnZS51cmwpKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndXJsJywgbWVzc2FnZTogJ0ludmFsaWQgaW1hZ2UgVVJMIGZvcm1hdCcsIGNvZGU6ICdJTlZBTElEX0ZPUk1BVCcsIHZhbHVlOiBpbWFnZS51cmwgfSk7XG4gICAgfVxuICAgIGlmIChpbWFnZS50aHVtYm5haWxVcmwgJiYgIXRoaXMuVVJMX1JFR0VYLnRlc3QoaW1hZ2UudGh1bWJuYWlsVXJsKSkge1xuICAgICAgd2FybmluZ3MucHVzaCh7IGZpZWxkOiAndGh1bWJuYWlsVXJsJywgbWVzc2FnZTogJ1RodW1ibmFpbCBVUkwgZm9ybWF0IG1heSBiZSBpbnZhbGlkJywgY29kZTogJ0ZPUk1BVF9XQVJOSU5HJywgdmFsdWU6IGltYWdlLnRodW1ibmFpbFVybCB9KTtcbiAgICB9XG4gICAgaWYgKCFpbWFnZS5hbHRUZXh0IHx8IGltYWdlLmFsdFRleHQudHJpbSgpLmxlbmd0aCA8IDUpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdhbHRUZXh0JywgbWVzc2FnZTogJ0FsdCB0ZXh0IG11c3QgYmUgYXQgbGVhc3QgNSBjaGFyYWN0ZXJzJywgY29kZTogJ01JTl9MRU5HVEgnIH0pO1xuICAgIH1cbiAgICBpZiAoIWltYWdlLmNhdGVnb3J5KSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnY2F0ZWdvcnknLCBtZXNzYWdlOiAnQ2F0ZWdvcnkgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cbiAgICBjb25zdCB2YWxpZFN0YXR1cyA9IFsnYWN0aXZlJywgJ2FyY2hpdmVkJywgJ2ZsYWdnZWQnLCAncmVtb3ZlZCcsICdwZW5kaW5nX3JldmlldyddO1xuICAgIGlmIChpbWFnZS5zdGF0dXMgJiYgIXZhbGlkU3RhdHVzLmluY2x1ZGVzKGltYWdlLnN0YXR1cykpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdzdGF0dXMnLCBtZXNzYWdlOiAnSW52YWxpZCBzdGF0dXMnLCBjb2RlOiAnSU5WQUxJRF9WQUxVRScsIHZhbHVlOiBpbWFnZS5zdGF0dXMgfSk7XG4gICAgfVxuICAgIGlmIChpbWFnZS52YWxpZGF0aW9uKSB7XG4gICAgICBbJ2N1bHR1cmFsU2NvcmUnLCAnc2Vuc2l0aXZpdHlTY29yZScsICdpbmNsdXNpdml0eVNjb3JlJ10uZm9yRWFjaCgoaykgPT4ge1xuICAgICAgICBpZiAoaW1hZ2UudmFsaWRhdGlvbltrXSAhPT0gdW5kZWZpbmVkICYmICh0eXBlb2YgaW1hZ2UudmFsaWRhdGlvbltrXSAhPT0gJ251bWJlcicgfHwgaW1hZ2UudmFsaWRhdGlvbltrXSA8IDAgfHwgaW1hZ2UudmFsaWRhdGlvbltrXSA+IDEpKSB7XG4gICAgICAgICAgd2FybmluZ3MucHVzaCh7IGZpZWxkOiBgdmFsaWRhdGlvbi4ke2t9YCwgbWVzc2FnZTogJ1Njb3JlIHNob3VsZCBiZSBiZXR3ZWVuIDAgYW5kIDEnLCBjb2RlOiAnUkFOR0VfV0FSTklORycsIHZhbHVlOiBpbWFnZS52YWxpZGF0aW9uW2tdIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiBlcnJvcnMubGVuZ3RoID09PSAwLCBlcnJvcnMsIHdhcm5pbmdzIH07XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgZmVlZGJhY2sgZW50aXR5XG4gICAqL1xuICBzdGF0aWMgdmFsaWRhdGVGZWVkYmFjayhmZWVkYmFjazogYW55KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgY29uc3QgZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JbXSA9IFtdO1xuICAgIGNvbnN0IHdhcm5pbmdzOiBWYWxpZGF0aW9uV2FybmluZ1tdID0gW107XG5cbiAgICBpZiAoIWZlZWRiYWNrLmZlZWRiYWNrSWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdmZWVkYmFja0lkJywgbWVzc2FnZTogJ0ZlZWRiYWNrIElEIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9XG4gICAgaWYgKCFmZWVkYmFjay5pbWFnZUlkKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnaW1hZ2VJZCcsIG1lc3NhZ2U6ICdJbWFnZSBJRCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuICAgIGlmICghZmVlZGJhY2sudXNlcklkKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndXNlcklkJywgbWVzc2FnZTogJ1VzZXIgSUQgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cbiAgICBpZiAoZmVlZGJhY2sucmF0aW5nID09PSB1bmRlZmluZWQgfHwgZmVlZGJhY2sucmF0aW5nID09PSBudWxsKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAncmF0aW5nJywgbWVzc2FnZTogJ1JhdGluZyBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZmVlZGJhY2sucmF0aW5nICE9PSAnbnVtYmVyJyB8fCBmZWVkYmFjay5yYXRpbmcgPCAxIHx8IGZlZWRiYWNrLnJhdGluZyA+IDUpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdyYXRpbmcnLCBtZXNzYWdlOiAnUmF0aW5nIG11c3QgYmUgYmV0d2VlbiAxIGFuZCA1JywgY29kZTogJ1JBTkdFX0VSUk9SJywgdmFsdWU6IGZlZWRiYWNrLnJhdGluZyB9KTtcbiAgICB9XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGZlZWRiYWNrLmNhdGVnb3JpZXMpKSB7XG4gICAgICB3YXJuaW5ncy5wdXNoKHsgZmllbGQ6ICdjYXRlZ29yaWVzJywgbWVzc2FnZTogJ0NhdGVnb3JpZXMgc2hvdWxkIGJlIGFuIGFycmF5JywgY29kZTogJ1RZUEVfV0FSTklORycgfSk7XG4gICAgfVxuICAgIGNvbnN0IHZhbGlkU2V2ZXJpdHkgPSBbJ2xvdycsICdtZWRpdW0nLCAnaGlnaCcsICdjcml0aWNhbCddO1xuICAgIGlmIChmZWVkYmFjay5zZXZlcml0eSAmJiAhdmFsaWRTZXZlcml0eS5pbmNsdWRlcyhmZWVkYmFjay5zZXZlcml0eSkpIHtcbiAgICAgIHdhcm5pbmdzLnB1c2goeyBmaWVsZDogJ3NldmVyaXR5JywgbWVzc2FnZTogJ0ludmFsaWQgc2V2ZXJpdHknLCBjb2RlOiAnSU5WQUxJRF9WQUxVRScsIHZhbHVlOiBmZWVkYmFjay5zZXZlcml0eSB9KTtcbiAgICB9XG4gICAgY29uc3QgdmFsaWRTdGF0dXMgPSBbJ25ldycsICdhY2tub3dsZWRnZWQnLCAnaW5fcmV2aWV3JywgJ3Jlc29sdmVkJywgJ2Rpc21pc3NlZCddO1xuICAgIGlmIChmZWVkYmFjay5zdGF0dXMgJiYgIXZhbGlkU3RhdHVzLmluY2x1ZGVzKGZlZWRiYWNrLnN0YXR1cykpIHtcbiAgICAgIHdhcm5pbmdzLnB1c2goeyBmaWVsZDogJ3N0YXR1cycsIG1lc3NhZ2U6ICdJbnZhbGlkIHN0YXR1cycsIGNvZGU6ICdJTlZBTElEX1ZBTFVFJywgdmFsdWU6IGZlZWRiYWNrLnN0YXR1cyB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiBlcnJvcnMubGVuZ3RoID09PSAwLCBlcnJvcnMsIHdhcm5pbmdzIH07XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgaW5jaWRlbnQgZW50aXR5XG4gICAqL1xuICBzdGF0aWMgdmFsaWRhdGVJbmNpZGVudChpbmNpZGVudDogYW55KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgY29uc3QgZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JbXSA9IFtdO1xuICAgIGNvbnN0IHdhcm5pbmdzOiBWYWxpZGF0aW9uV2FybmluZ1tdID0gW107XG5cbiAgICBpZiAoIWluY2lkZW50LmluY2lkZW50SWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdpbmNpZGVudElkJywgbWVzc2FnZTogJ0luY2lkZW50IElEIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9XG4gICAgaWYgKCFpbmNpZGVudC50cmlnZ2VyZWRCeSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3RyaWdnZXJlZEJ5JywgbWVzc2FnZTogJ3RyaWdnZXJlZEJ5IGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9IGVsc2UgaWYgKCFbJ2NvbW11bml0eV9yZXBvcnQnLCAnYXV0b21hdGVkX2RldGVjdGlvbicsICdzdGFmZicsICdhZHZpc29yeV9ib2FyZCddLmluY2x1ZGVzKGluY2lkZW50LnRyaWdnZXJlZEJ5KSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3RyaWdnZXJlZEJ5JywgbWVzc2FnZTogJ0ludmFsaWQgdHJpZ2dlcicsIGNvZGU6ICdJTlZBTElEX1ZBTFVFJywgdmFsdWU6IGluY2lkZW50LnRyaWdnZXJlZEJ5IH0pO1xuICAgIH1cbiAgICBpZiAoIWluY2lkZW50LnByaW9yaXR5IHx8ICFbJ3AxJywgJ3AyJywgJ3AzJ10uaW5jbHVkZXMoaW5jaWRlbnQucHJpb3JpdHkpKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAncHJpb3JpdHknLCBtZXNzYWdlOiAnUHJpb3JpdHkgbXVzdCBiZSBwMXxwMnxwMycsIGNvZGU6ICdJTlZBTElEX1ZBTFVFJywgdmFsdWU6IGluY2lkZW50LnByaW9yaXR5IH0pO1xuICAgIH1cbiAgICBpZiAoIWluY2lkZW50LnN1bW1hcnkpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdzdW1tYXJ5JywgbWVzc2FnZTogJ1N1bW1hcnkgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7IGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsIGVycm9ycywgd2FybmluZ3MgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBhZHZpc29yeSByZXZpZXcgZW50aXR5XG4gICAqL1xuICBzdGF0aWMgdmFsaWRhdGVBZHZpc29yeVJldmlldyhyZXZpZXc6IGFueSk6IFZhbGlkYXRpb25SZXN1bHQge1xuICAgIGNvbnN0IGVycm9yczogVmFsaWRhdGlvbkVycm9yW10gPSBbXTtcbiAgICBjb25zdCB3YXJuaW5nczogVmFsaWRhdGlvbldhcm5pbmdbXSA9IFtdO1xuXG4gICAgaWYgKCFyZXZpZXcucmV2aWV3SWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdyZXZpZXdJZCcsIG1lc3NhZ2U6ICdSZXZpZXcgSUQgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cbiAgICBpZiAoIXJldmlldy50YXJnZXRUeXBlIHx8ICFbJ2ltYWdlJywgJ3Jlc291cmNlJywgJ3N0b3J5J10uaW5jbHVkZXMocmV2aWV3LnRhcmdldFR5cGUpKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndGFyZ2V0VHlwZScsIG1lc3NhZ2U6ICdJbnZhbGlkIHRhcmdldFR5cGUnLCBjb2RlOiAnSU5WQUxJRF9WQUxVRScsIHZhbHVlOiByZXZpZXcudGFyZ2V0VHlwZSB9KTtcbiAgICB9XG4gICAgaWYgKCFyZXZpZXcudGFyZ2V0SWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICd0YXJnZXRJZCcsIG1lc3NhZ2U6ICdUYXJnZXQgSUQgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cbiAgICBjb25zdCB2YWxpZFN0YXR1cyA9IFsncXVldWVkJywgJ2luX3JldmlldycsICdhcHByb3ZlZCcsICdjaGFuZ2VzX3JlcXVlc3RlZCcsICdyZWplY3RlZCddO1xuICAgIGlmIChyZXZpZXcuc3RhdHVzICYmICF2YWxpZFN0YXR1cy5pbmNsdWRlcyhyZXZpZXcuc3RhdHVzKSkge1xuICAgICAgd2FybmluZ3MucHVzaCh7IGZpZWxkOiAnc3RhdHVzJywgbWVzc2FnZTogJ0ludmFsaWQgc3RhdHVzJywgY29kZTogJ0lOVkFMSURfVkFMVUUnLCB2YWx1ZTogcmV2aWV3LnN0YXR1cyB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiBlcnJvcnMubGVuZ3RoID09PSAwLCBlcnJvcnMsIHdhcm5pbmdzIH07XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgcHJlbWl1bSBzb3VyY2UgZW50aXR5XG4gICAqL1xuICBzdGF0aWMgdmFsaWRhdGVQcmVtaXVtU291cmNlKHNvdXJjZTogYW55KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgY29uc3QgZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JbXSA9IFtdO1xuICAgIGNvbnN0IHdhcm5pbmdzOiBWYWxpZGF0aW9uV2FybmluZ1tdID0gW107XG5cbiAgICBpZiAoIXNvdXJjZS5zb3VyY2VJZCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3NvdXJjZUlkJywgbWVzc2FnZTogJ1NvdXJjZSBJRCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuICAgIGlmICghc291cmNlLnByb3ZpZGVyIHx8ICFbJ2NyZWF0ZWhlcicsICduYXBweScsICdvdGhlciddLmluY2x1ZGVzKHNvdXJjZS5wcm92aWRlcikpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdwcm92aWRlcicsIG1lc3NhZ2U6ICdJbnZhbGlkIHByb3ZpZGVyJywgY29kZTogJ0lOVkFMSURfVkFMVUUnLCB2YWx1ZTogc291cmNlLnByb3ZpZGVyIH0pO1xuICAgIH1cbiAgICBpZiAoIXNvdXJjZS5kaXNwbGF5TmFtZSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2Rpc3BsYXlOYW1lJywgbWVzc2FnZTogJ0Rpc3BsYXkgbmFtZSBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuICAgIGlmIChzb3VyY2UuYXBpQmFzZVVybCAmJiAhdGhpcy5VUkxfUkVHRVgudGVzdChzb3VyY2UuYXBpQmFzZVVybCkpIHtcbiAgICAgIHdhcm5pbmdzLnB1c2goeyBmaWVsZDogJ2FwaUJhc2VVcmwnLCBtZXNzYWdlOiAnQVBJIGJhc2UgVVJMIGZvcm1hdCBtYXkgYmUgaW52YWxpZCcsIGNvZGU6ICdGT1JNQVRfV0FSTklORycsIHZhbHVlOiBzb3VyY2UuYXBpQmFzZVVybCB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiBlcnJvcnMubGVuZ3RoID09PSAwLCBlcnJvcnMsIHdhcm5pbmdzIH07XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgcGVyc29uYWxpemF0aW9uIHByb2ZpbGUgZW50aXR5XG4gICAqL1xuICBzdGF0aWMgdmFsaWRhdGVQZXJzb25hbGl6YXRpb24ocHJvZmlsZTogYW55KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgY29uc3QgZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JbXSA9IFtdO1xuICAgIGNvbnN0IHdhcm5pbmdzOiBWYWxpZGF0aW9uV2FybmluZ1tdID0gW107XG5cbiAgICBpZiAoIXByb2ZpbGUudXNlcklkKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndXNlcklkJywgbWVzc2FnZTogJ1VzZXIgSUQgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cbiAgICBpZiAocHJvZmlsZS5lbmdhZ2VtZW50KSB7XG4gICAgICBbJ2ltcHJlc3Npb25zJywgJ2NsaWNrcyddLmZvckVhY2goKGspID0+IHtcbiAgICAgICAgaWYgKHByb2ZpbGUuZW5nYWdlbWVudFtrXSAhPT0gdW5kZWZpbmVkICYmICh0eXBlb2YgcHJvZmlsZS5lbmdhZ2VtZW50W2tdICE9PSAnbnVtYmVyJyB8fCBwcm9maWxlLmVuZ2FnZW1lbnRba10gPCAwKSkge1xuICAgICAgICAgIHdhcm5pbmdzLnB1c2goeyBmaWVsZDogYGVuZ2FnZW1lbnQuJHtrfWAsIG1lc3NhZ2U6ICdFbmdhZ2VtZW50IHZhbHVlcyBtdXN0IGJlIG5vbi1uZWdhdGl2ZScsIGNvZGU6ICdSQU5HRV9XQVJOSU5HJywgdmFsdWU6IHByb2ZpbGUuZW5nYWdlbWVudFtrXSB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZXJyb3JzLmxlbmd0aCA9PT0gMCwgZXJyb3JzLCB3YXJuaW5ncyB9O1xuICB9XG59Il19