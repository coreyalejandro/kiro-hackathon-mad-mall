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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NoYXJlZC10eXBlcy9zcmMvZGF0YWJhc2UvdmFsaWRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7QUFzQkgsTUFBYSxhQUFhO0lBS3hCOztPQUVHO0lBQ0gsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFTO1FBQzNCLE1BQU0sTUFBTSxHQUFzQixFQUFFLENBQUM7UUFDckMsTUFBTSxRQUFRLEdBQXdCLEVBQUUsQ0FBQztRQUV6QyxrQkFBa0I7UUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDckYsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQ2xGLENBQUM7YUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDOUcsQ0FBQztRQUVELHFCQUFxQjtRQUNyQixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsSUFBSSxDQUFD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QUFDM0MsdUJBQVMsR0FBRyxnQkFBZ0IsQ0FBQztBQUM3Qix5QkFBVyxHQUFHLG9CQUFvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBEYXRhIFZhbGlkYXRpb24gVXRpbGl0aWVzXG4gKiBWYWxpZGF0aW9uIGZ1bmN0aW9ucyBmb3IgRHluYW1vREIgZW50aXRpZXMgYW5kIG9wZXJhdGlvbnNcbiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRpb25SZXN1bHQge1xuICBpc1ZhbGlkOiBib29sZWFuO1xuICBlcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdO1xuICB3YXJuaW5nczogVmFsaWRhdGlvbldhcm5pbmdbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0aW9uRXJyb3Ige1xuICBmaWVsZDogc3RyaW5nO1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIGNvZGU6IHN0cmluZztcbiAgdmFsdWU/OiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGlvbldhcm5pbmcge1xuICBmaWVsZDogc3RyaW5nO1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIGNvZGU6IHN0cmluZztcbiAgdmFsdWU/OiBhbnk7XG59XG5cbmV4cG9ydCBjbGFzcyBEYXRhVmFsaWRhdG9yIHtcbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgRU1BSUxfUkVHRVggPSAvXlteXFxzQF0rQFteXFxzQF0rXFwuW15cXHNAXSskLztcbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgVVJMX1JFR0VYID0gL15odHRwcz86XFwvXFwvLisvO1xuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBQSE9ORV9SRUdFWCA9IC9eXFwrP1tcXGRcXHNcXC1cXChcXCldKyQvO1xuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSB1c2VyIGVudGl0eVxuICAgKi9cbiAgc3RhdGljIHZhbGlkYXRlVXNlcih1c2VyOiBhbnkpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgICBjb25zdCBlcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdID0gW107XG4gICAgY29uc3Qgd2FybmluZ3M6IFZhbGlkYXRpb25XYXJuaW5nW10gPSBbXTtcblxuICAgIC8vIFJlcXVpcmVkIGZpZWxkc1xuICAgIGlmICghdXNlci51c2VySWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICd1c2VySWQnLCBtZXNzYWdlOiAnVXNlciBJRCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuICAgIGlmICghdXNlci5lbWFpbCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2VtYWlsJywgbWVzc2FnZTogJ0VtYWlsIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLkVNQUlMX1JFR0VYLnRlc3QodXNlci5lbWFpbCkpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdlbWFpbCcsIG1lc3NhZ2U6ICdJbnZhbGlkIGVtYWlsIGZvcm1hdCcsIGNvZGU6ICdJTlZBTElEX0ZPUk1BVCcsIHZhbHVlOiB1c2VyLmVtYWlsIH0pO1xuICAgIH1cblxuICAgIC8vIFByb2ZpbGUgdmFsaWRhdGlvblxuICAgIGlmICh1c2VyLnByb2ZpbGUpIHtcbiAgICAgIGlmICghdXNlci5wcm9maWxlLmZpcnN0TmFtZSkge1xuICAgICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAncHJvZmlsZS5maXJzdE5hbWUnLCBtZXNzYWdlOiAnRmlyc3QgbmFtZSBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgICB9XG4gICAgICBpZiAoIXVzZXIucHJvZmlsZS5sYXN0TmFtZSkge1xuICAgICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAncHJvZmlsZS5sYXN0TmFtZScsIG1lc3NhZ2U6ICdMYXN0IG5hbWUgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgICAgfVxuICAgICAgaWYgKHVzZXIucHJvZmlsZS5iaW8gJiYgdXNlci5wcm9maWxlLmJpby5sZW5ndGggPiA1MDApIHtcbiAgICAgICAgd2FybmluZ3MucHVzaCh7IGZpZWxkOiAncHJvZmlsZS5iaW8nLCBtZXNzYWdlOiAnQmlvIGlzIGxvbmdlciB0aGFuIHJlY29tbWVuZGVkIDUwMCBjaGFyYWN0ZXJzJywgY29kZTogJ0xFTkdUSF9XQVJOSU5HJywgdmFsdWU6IHVzZXIucHJvZmlsZS5iaW8ubGVuZ3RoIH0pO1xuICAgICAgfVxuICAgICAgaWYgKCF1c2VyLnByb2ZpbGUuY3VsdHVyYWxCYWNrZ3JvdW5kIHx8ICFBcnJheS5pc0FycmF5KHVzZXIucHJvZmlsZS5jdWx0dXJhbEJhY2tncm91bmQpKSB7XG4gICAgICAgIHdhcm5pbmdzLnB1c2goeyBmaWVsZDogJ3Byb2ZpbGUuY3VsdHVyYWxCYWNrZ3JvdW5kJywgbWVzc2FnZTogJ0N1bHR1cmFsIGJhY2tncm91bmQgc2hvdWxkIGJlIGFuIGFycmF5JywgY29kZTogJ1RZUEVfV0FSTklORycgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdwcm9maWxlJywgbWVzc2FnZTogJ1Byb2ZpbGUgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cblxuICAgIC8vIFNldHRpbmdzIHZhbGlkYXRpb25cbiAgICBpZiAodXNlci5zZXR0aW5ncykge1xuICAgICAgY29uc3QgdmFsaWRUaGVtZXMgPSBbJ2xpZ2h0JywgJ2RhcmsnLCAnYXV0byddO1xuICAgICAgaWYgKHVzZXIuc2V0dGluZ3MudGhlbWUgJiYgIXZhbGlkVGhlbWVzLmluY2x1ZGVzKHVzZXIuc2V0dGluZ3MudGhlbWUpKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdzZXR0aW5ncy50aGVtZScsIG1lc3NhZ2U6ICdJbnZhbGlkIHRoZW1lIHZhbHVlJywgY29kZTogJ0lOVkFMSURfVkFMVUUnLCB2YWx1ZTogdXNlci5zZXR0aW5ncy50aGVtZSB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiBlcnJvcnMubGVuZ3RoID09PSAwLCBlcnJvcnMsIHdhcm5pbmdzIH07XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgY2lyY2xlIGVudGl0eVxuICAgKi9cbiAgc3RhdGljIHZhbGlkYXRlQ2lyY2xlKGNpcmNsZTogYW55KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgY29uc3QgZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JbXSA9IFtdO1xuICAgIGNvbnN0IHdhcm5pbmdzOiBWYWxpZGF0aW9uV2FybmluZ1tdID0gW107XG5cbiAgICAvLyBSZXF1aXJlZCBmaWVsZHNcbiAgICBpZiAoIWNpcmNsZS5jaXJjbGVJZCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2NpcmNsZUlkJywgbWVzc2FnZTogJ0NpcmNsZSBJRCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuICAgIGlmICghY2lyY2xlLm5hbWUpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICduYW1lJywgbWVzc2FnZTogJ0NpcmNsZSBuYW1lIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9IGVsc2UgaWYgKGNpcmNsZS5uYW1lLmxlbmd0aCA8IDMpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICduYW1lJywgbWVzc2FnZTogJ0NpcmNsZSBuYW1lIG11c3QgYmUgYXQgbGVhc3QgMyBjaGFyYWN0ZXJzJywgY29kZTogJ01JTl9MRU5HVEgnLCB2YWx1ZTogY2lyY2xlLm5hbWUubGVuZ3RoIH0pO1xuICAgIH0gZWxzZSBpZiAoY2lyY2xlLm5hbWUubGVuZ3RoID4gMTAwKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnbmFtZScsIG1lc3NhZ2U6ICdDaXJjbGUgbmFtZSBtdXN0IGJlIGxlc3MgdGhhbiAxMDAgY2hhcmFjdGVycycsIGNvZGU6ICdNQVhfTEVOR1RIJywgdmFsdWU6IGNpcmNsZS5uYW1lLmxlbmd0aCB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWNpcmNsZS5kZXNjcmlwdGlvbikge1xuICAgICAgd2FybmluZ3MucHVzaCh7IGZpZWxkOiAnZGVzY3JpcHRpb24nLCBtZXNzYWdlOiAnQ2lyY2xlIGRlc2NyaXB0aW9uIGlzIHJlY29tbWVuZGVkJywgY29kZTogJ1JFQ09NTUVOREVEJyB9KTtcbiAgICB9IGVsc2UgaWYgKGNpcmNsZS5kZXNjcmlwdGlvbi5sZW5ndGggPiAxMDAwKSB7XG4gICAgICB3YXJuaW5ncy5wdXNoKHsgZmllbGQ6ICdkZXNjcmlwdGlvbicsIG1lc3NhZ2U6ICdEZXNjcmlwdGlvbiBpcyBsb25nZXIgdGhhbiByZWNvbW1lbmRlZCAxMDAwIGNoYXJhY3RlcnMnLCBjb2RlOiAnTEVOR1RIX1dBUk5JTkcnLCB2YWx1ZTogY2lyY2xlLmRlc2NyaXB0aW9uLmxlbmd0aCB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWNpcmNsZS50eXBlKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndHlwZScsIG1lc3NhZ2U6ICdDaXJjbGUgdHlwZSBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFjaXJjbGUuY3JlYXRlZEJ5KSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnY3JlYXRlZEJ5JywgbWVzc2FnZTogJ0NyZWF0b3IgSUQgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cblxuICAgIC8vIFNldHRpbmdzIHZhbGlkYXRpb25cbiAgICBpZiAoY2lyY2xlLnNldHRpbmdzKSB7XG4gICAgICBpZiAoY2lyY2xlLnNldHRpbmdzLm1heE1lbWJlcnMgJiYgKGNpcmNsZS5zZXR0aW5ncy5tYXhNZW1iZXJzIDwgMiB8fCBjaXJjbGUuc2V0dGluZ3MubWF4TWVtYmVycyA+IDEwMDAwKSkge1xuICAgICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnc2V0dGluZ3MubWF4TWVtYmVycycsIG1lc3NhZ2U6ICdNYXggbWVtYmVycyBtdXN0IGJlIGJldHdlZW4gMiBhbmQgMTAwMDAnLCBjb2RlOiAnUkFOR0VfRVJST1InLCB2YWx1ZTogY2lyY2xlLnNldHRpbmdzLm1heE1lbWJlcnMgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGNvbnN0IHZhbGlkTW9kZXJhdGlvbkxldmVscyA9IFsnbGlnaHQnLCAnbW9kZXJhdGUnLCAnc3RyaWN0J107XG4gICAgICBpZiAoY2lyY2xlLnNldHRpbmdzLm1vZGVyYXRpb25MZXZlbCAmJiAhdmFsaWRNb2RlcmF0aW9uTGV2ZWxzLmluY2x1ZGVzKGNpcmNsZS5zZXR0aW5ncy5tb2RlcmF0aW9uTGV2ZWwpKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdzZXR0aW5ncy5tb2RlcmF0aW9uTGV2ZWwnLCBtZXNzYWdlOiAnSW52YWxpZCBtb2RlcmF0aW9uIGxldmVsJywgY29kZTogJ0lOVkFMSURfVkFMVUUnLCB2YWx1ZTogY2lyY2xlLnNldHRpbmdzLm1vZGVyYXRpb25MZXZlbCB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiBlcnJvcnMubGVuZ3RoID09PSAwLCBlcnJvcnMsIHdhcm5pbmdzIH07XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgc3RvcnkgZW50aXR5XG4gICAqL1xuICBzdGF0aWMgdmFsaWRhdGVTdG9yeShzdG9yeTogYW55KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgY29uc3QgZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JbXSA9IFtdO1xuICAgIGNvbnN0IHdhcm5pbmdzOiBWYWxpZGF0aW9uV2FybmluZ1tdID0gW107XG5cbiAgICAvLyBSZXF1aXJlZCBmaWVsZHNcbiAgICBpZiAoIXN0b3J5LnN0b3J5SWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdzdG9yeUlkJywgbWVzc2FnZTogJ1N0b3J5IElEIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9XG4gICAgaWYgKCFzdG9yeS50aXRsZSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3RpdGxlJywgbWVzc2FnZTogJ1N0b3J5IHRpdGxlIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9IGVsc2UgaWYgKHN0b3J5LnRpdGxlLmxlbmd0aCA8IDUpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICd0aXRsZScsIG1lc3NhZ2U6ICdTdG9yeSB0aXRsZSBtdXN0IGJlIGF0IGxlYXN0IDUgY2hhcmFjdGVycycsIGNvZGU6ICdNSU5fTEVOR1RIJywgdmFsdWU6IHN0b3J5LnRpdGxlLmxlbmd0aCB9KTtcbiAgICB9IGVsc2UgaWYgKHN0b3J5LnRpdGxlLmxlbmd0aCA+IDIwMCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3RpdGxlJywgbWVzc2FnZTogJ1N0b3J5IHRpdGxlIG11c3QgYmUgbGVzcyB0aGFuIDIwMCBjaGFyYWN0ZXJzJywgY29kZTogJ01BWF9MRU5HVEgnLCB2YWx1ZTogc3RvcnkudGl0bGUubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIGlmICghc3RvcnkuY29udGVudCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2NvbnRlbnQnLCBtZXNzYWdlOiAnU3RvcnkgY29udGVudCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfSBlbHNlIGlmIChzdG9yeS5jb250ZW50Lmxlbmd0aCA8IDUwKSB7XG4gICAgICB3YXJuaW5ncy5wdXNoKHsgZmllbGQ6ICdjb250ZW50JywgbWVzc2FnZTogJ1N0b3J5IGNvbnRlbnQgaXMgcXVpdGUgc2hvcnQnLCBjb2RlOiAnTEVOR1RIX1dBUk5JTkcnLCB2YWx1ZTogc3RvcnkuY29udGVudC5sZW5ndGggfSk7XG4gICAgfSBlbHNlIGlmIChzdG9yeS5jb250ZW50Lmxlbmd0aCA+IDUwMDAwKSB7XG4gICAgICB3YXJuaW5ncy5wdXNoKHsgZmllbGQ6ICdjb250ZW50JywgbWVzc2FnZTogJ1N0b3J5IGNvbnRlbnQgaXMgdmVyeSBsb25nJywgY29kZTogJ0xFTkdUSF9XQVJOSU5HJywgdmFsdWU6IHN0b3J5LmNvbnRlbnQubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIGlmICghc3RvcnkuYXV0aG9yIHx8ICFzdG9yeS5hdXRob3IuaWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdhdXRob3IuaWQnLCBtZXNzYWdlOiAnQXV0aG9yIElEIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9XG5cbiAgICAvLyBUeXBlIHZhbGlkYXRpb25cbiAgICBjb25zdCB2YWxpZFN0b3J5VHlwZXMgPSBbJ3BlcnNvbmFsX2V4cGVyaWVuY2UnLCAnbWlsZXN0b25lX2NlbGVicmF0aW9uJywgJ2NoYWxsZW5nZV9vdmVyY29tZScsICdhZHZpY2Vfc2hhcmluZycsICdncmF0aXR1ZGVfZXhwcmVzc2lvbicsICdhd2FyZW5lc3NfcmFpc2luZyddO1xuICAgIGlmIChzdG9yeS50eXBlICYmICF2YWxpZFN0b3J5VHlwZXMuaW5jbHVkZXMoc3RvcnkudHlwZSkpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICd0eXBlJywgbWVzc2FnZTogJ0ludmFsaWQgc3RvcnkgdHlwZScsIGNvZGU6ICdJTlZBTElEX1ZBTFVFJywgdmFsdWU6IHN0b3J5LnR5cGUgfSk7XG4gICAgfVxuXG4gICAgLy8gU3RhdHVzIHZhbGlkYXRpb25cbiAgICBjb25zdCB2YWxpZFN0YXR1c2VzID0gWydkcmFmdCcsICdwdWJsaXNoZWQnLCAnYXJjaGl2ZWQnLCAnZmxhZ2dlZCcsICdyZW1vdmVkJ107XG4gICAgaWYgKHN0b3J5LnN0YXR1cyAmJiAhdmFsaWRTdGF0dXNlcy5pbmNsdWRlcyhzdG9yeS5zdGF0dXMpKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnc3RhdHVzJywgbWVzc2FnZTogJ0ludmFsaWQgc3Rvcnkgc3RhdHVzJywgY29kZTogJ0lOVkFMSURfVkFMVUUnLCB2YWx1ZTogc3Rvcnkuc3RhdHVzIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7IGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsIGVycm9ycywgd2FybmluZ3MgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBidXNpbmVzcyBlbnRpdHlcbiAgICovXG4gIHN0YXRpYyB2YWxpZGF0ZUJ1c2luZXNzKGJ1c2luZXNzOiBhbnkpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgICBjb25zdCBlcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdID0gW107XG4gICAgY29uc3Qgd2FybmluZ3M6IFZhbGlkYXRpb25XYXJuaW5nW10gPSBbXTtcblxuICAgIC8vIFJlcXVpcmVkIGZpZWxkc1xuICAgIGlmICghYnVzaW5lc3MuYnVzaW5lc3NJZCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2J1c2luZXNzSWQnLCBtZXNzYWdlOiAnQnVzaW5lc3MgSUQgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cblxuICAgIGlmICghYnVzaW5lc3MucHJvZmlsZSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3Byb2ZpbGUnLCBtZXNzYWdlOiAnQnVzaW5lc3MgcHJvZmlsZSBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgICByZXR1cm4geyBpc1ZhbGlkOiBmYWxzZSwgZXJyb3JzLCB3YXJuaW5ncyB9O1xuICAgIH1cblxuICAgIGlmICghYnVzaW5lc3MucHJvZmlsZS5uYW1lKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAncHJvZmlsZS5uYW1lJywgbWVzc2FnZTogJ0J1c2luZXNzIG5hbWUgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH0gZWxzZSBpZiAoYnVzaW5lc3MucHJvZmlsZS5uYW1lLmxlbmd0aCA8IDIpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdwcm9maWxlLm5hbWUnLCBtZXNzYWdlOiAnQnVzaW5lc3MgbmFtZSBtdXN0IGJlIGF0IGxlYXN0IDIgY2hhcmFjdGVycycsIGNvZGU6ICdNSU5fTEVOR1RIJywgdmFsdWU6IGJ1c2luZXNzLnByb2ZpbGUubmFtZS5sZW5ndGggfSk7XG4gICAgfVxuXG4gICAgaWYgKCFidXNpbmVzcy5wcm9maWxlLmRlc2NyaXB0aW9uKSB7XG4gICAgICB3YXJuaW5ncy5wdXNoKHsgZmllbGQ6ICdwcm9maWxlLmRlc2NyaXB0aW9uJywgbWVzc2FnZTogJ0J1c2luZXNzIGRlc2NyaXB0aW9uIGlzIHJlY29tbWVuZGVkJywgY29kZTogJ1JFQ09NTUVOREVEJyB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWJ1c2luZXNzLnByb2ZpbGUuY29udGFjdCB8fCAhYnVzaW5lc3MucHJvZmlsZS5jb250YWN0LmVtYWlsKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAncHJvZmlsZS5jb250YWN0LmVtYWlsJywgbWVzc2FnZTogJ0NvbnRhY3QgZW1haWwgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuRU1BSUxfUkVHRVgudGVzdChidXNpbmVzcy5wcm9maWxlLmNvbnRhY3QuZW1haWwpKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAncHJvZmlsZS5jb250YWN0LmVtYWlsJywgbWVzc2FnZTogJ0ludmFsaWQgZW1haWwgZm9ybWF0JywgY29kZTogJ0lOVkFMSURfRk9STUFUJywgdmFsdWU6IGJ1c2luZXNzLnByb2ZpbGUuY29udGFjdC5lbWFpbCB9KTtcbiAgICB9XG5cbiAgICBpZiAoYnVzaW5lc3MucHJvZmlsZS53ZWJzaXRlICYmICF0aGlzLlVSTF9SRUdFWC50ZXN0KGJ1c2luZXNzLnByb2ZpbGUud2Vic2l0ZSkpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdwcm9maWxlLndlYnNpdGUnLCBtZXNzYWdlOiAnSW52YWxpZCB3ZWJzaXRlIFVSTCBmb3JtYXQnLCBjb2RlOiAnSU5WQUxJRF9GT1JNQVQnLCB2YWx1ZTogYnVzaW5lc3MucHJvZmlsZS53ZWJzaXRlIH0pO1xuICAgIH1cblxuICAgIGlmIChidXNpbmVzcy5wcm9maWxlLmNvbnRhY3QucGhvbmUgJiYgIXRoaXMuUEhPTkVfUkVHRVgudGVzdChidXNpbmVzcy5wcm9maWxlLmNvbnRhY3QucGhvbmUpKSB7XG4gICAgICB3YXJuaW5ncy5wdXNoKHsgZmllbGQ6ICdwcm9maWxlLmNvbnRhY3QucGhvbmUnLCBtZXNzYWdlOiAnUGhvbmUgbnVtYmVyIGZvcm1hdCBtYXkgYmUgaW52YWxpZCcsIGNvZGU6ICdGT1JNQVRfV0FSTklORycsIHZhbHVlOiBidXNpbmVzcy5wcm9maWxlLmNvbnRhY3QucGhvbmUgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFidXNpbmVzcy5vd25lcklkKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnb3duZXJJZCcsIG1lc3NhZ2U6ICdPd25lciBJRCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZXJyb3JzLmxlbmd0aCA9PT0gMCwgZXJyb3JzLCB3YXJuaW5ncyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIHJlc291cmNlIGVudGl0eVxuICAgKi9cbiAgc3RhdGljIHZhbGlkYXRlUmVzb3VyY2UocmVzb3VyY2U6IGFueSk6IFZhbGlkYXRpb25SZXN1bHQge1xuICAgIGNvbnN0IGVycm9yczogVmFsaWRhdGlvbkVycm9yW10gPSBbXTtcbiAgICBjb25zdCB3YXJuaW5nczogVmFsaWRhdGlvbldhcm5pbmdbXSA9IFtdO1xuXG4gICAgLy8gUmVxdWlyZWQgZmllbGRzXG4gICAgaWYgKCFyZXNvdXJjZS5yZXNvdXJjZUlkKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAncmVzb3VyY2VJZCcsIG1lc3NhZ2U6ICdSZXNvdXJjZSBJRCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuICAgIGlmICghcmVzb3VyY2UudGl0bGUpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICd0aXRsZScsIG1lc3NhZ2U6ICdSZXNvdXJjZSB0aXRsZSBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfSBlbHNlIGlmIChyZXNvdXJjZS50aXRsZS5sZW5ndGggPCA1KSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndGl0bGUnLCBtZXNzYWdlOiAnUmVzb3VyY2UgdGl0bGUgbXVzdCBiZSBhdCBsZWFzdCA1IGNoYXJhY3RlcnMnLCBjb2RlOiAnTUlOX0xFTkdUSCcsIHZhbHVlOiByZXNvdXJjZS50aXRsZS5sZW5ndGggfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXNvdXJjZS5kZXNjcmlwdGlvbikge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2Rlc2NyaXB0aW9uJywgbWVzc2FnZTogJ1Jlc291cmNlIGRlc2NyaXB0aW9uIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXJlc291cmNlLnN1bW1hcnkpIHtcbiAgICAgIHdhcm5pbmdzLnB1c2goeyBmaWVsZDogJ3N1bW1hcnknLCBtZXNzYWdlOiAnUmVzb3VyY2Ugc3VtbWFyeSBpcyByZWNvbW1lbmRlZCcsIGNvZGU6ICdSRUNPTU1FTkRFRCcgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXNvdXJjZS5jYXRlZ29yeSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2NhdGVnb3J5JywgbWVzc2FnZTogJ1Jlc291cmNlIGNhdGVnb3J5IGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXJlc291cmNlLmF1dGhvciB8fCAhcmVzb3VyY2UuYXV0aG9yLmlkKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnYXV0aG9yLmlkJywgbWVzc2FnZTogJ0F1dGhvciBJRCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuXG4gICAgLy8gVHlwZSB2YWxpZGF0aW9uXG4gICAgY29uc3QgdmFsaWRSZXNvdXJjZVR5cGVzID0gWydhcnRpY2xlJywgJ3ZpZGVvJywgJ3BvZGNhc3QnLCAnaW5mb2dyYXBoaWMnLCAnY2hlY2tsaXN0JywgJ2d1aWRlJywgJ3Jlc2VhcmNoX3BhcGVyJywgJ3dlYmluYXInLCAndG9vbCcsICd0ZW1wbGF0ZSddO1xuICAgIGlmIChyZXNvdXJjZS50eXBlICYmICF2YWxpZFJlc291cmNlVHlwZXMuaW5jbHVkZXMocmVzb3VyY2UudHlwZSkpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICd0eXBlJywgbWVzc2FnZTogJ0ludmFsaWQgcmVzb3VyY2UgdHlwZScsIGNvZGU6ICdJTlZBTElEX1ZBTFVFJywgdmFsdWU6IHJlc291cmNlLnR5cGUgfSk7XG4gICAgfVxuXG4gICAgLy8gVVJMIHZhbGlkYXRpb25cbiAgICBpZiAocmVzb3VyY2UuZXh0ZXJuYWxVcmwgJiYgIXRoaXMuVVJMX1JFR0VYLnRlc3QocmVzb3VyY2UuZXh0ZXJuYWxVcmwpKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnZXh0ZXJuYWxVcmwnLCBtZXNzYWdlOiAnSW52YWxpZCBleHRlcm5hbCBVUkwgZm9ybWF0JywgY29kZTogJ0lOVkFMSURfRk9STUFUJywgdmFsdWU6IHJlc291cmNlLmV4dGVybmFsVXJsIH0pO1xuICAgIH1cblxuICAgIGlmIChyZXNvdXJjZS5kb3dubG9hZFVybCAmJiAhdGhpcy5VUkxfUkVHRVgudGVzdChyZXNvdXJjZS5kb3dubG9hZFVybCkpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdkb3dubG9hZFVybCcsIG1lc3NhZ2U6ICdJbnZhbGlkIGRvd25sb2FkIFVSTCBmb3JtYXQnLCBjb2RlOiAnSU5WQUxJRF9GT1JNQVQnLCB2YWx1ZTogcmVzb3VyY2UuZG93bmxvYWRVcmwgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZXJyb3JzLmxlbmd0aCA9PT0gMCwgZXJyb3JzLCB3YXJuaW5ncyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIER5bmFtb0RCIGtleSBzdHJ1Y3R1cmVcbiAgICovXG4gIHN0YXRpYyB2YWxpZGF0ZUtleXMoZW50aXR5OiBhbnkpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgICBjb25zdCBlcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdID0gW107XG4gICAgY29uc3Qgd2FybmluZ3M6IFZhbGlkYXRpb25XYXJuaW5nW10gPSBbXTtcblxuICAgIGlmICghZW50aXR5LlBLKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnUEsnLCBtZXNzYWdlOiAnUGFydGl0aW9uIGtleSAoUEspIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbnRpdHkuUEsgIT09ICdzdHJpbmcnKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnUEsnLCBtZXNzYWdlOiAnUGFydGl0aW9uIGtleSAoUEspIG11c3QgYmUgYSBzdHJpbmcnLCBjb2RlOiAnVFlQRV9FUlJPUicgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFlbnRpdHkuU0spIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdTSycsIG1lc3NhZ2U6ICdTb3J0IGtleSAoU0spIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbnRpdHkuU0sgIT09ICdzdHJpbmcnKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnU0snLCBtZXNzYWdlOiAnU29ydCBrZXkgKFNLKSBtdXN0IGJlIGEgc3RyaW5nJywgY29kZTogJ1RZUEVfRVJST1InIH0pO1xuICAgIH1cblxuICAgIGlmICghZW50aXR5LmVudGl0eVR5cGUpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdlbnRpdHlUeXBlJywgbWVzc2FnZTogJ0VudGl0eSB0eXBlIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9XG5cbiAgICBpZiAoZW50aXR5LnZlcnNpb24gPT09IHVuZGVmaW5lZCB8fCBlbnRpdHkudmVyc2lvbiA9PT0gbnVsbCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3ZlcnNpb24nLCBtZXNzYWdlOiAnVmVyc2lvbiBpcyByZXF1aXJlZCBmb3Igb3B0aW1pc3RpYyBsb2NraW5nJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbnRpdHkudmVyc2lvbiAhPT0gJ251bWJlcicgfHwgZW50aXR5LnZlcnNpb24gPCAwKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndmVyc2lvbicsIG1lc3NhZ2U6ICdWZXJzaW9uIG11c3QgYmUgYSBub24tbmVnYXRpdmUgbnVtYmVyJywgY29kZTogJ1RZUEVfRVJST1InIH0pO1xuICAgIH1cblxuICAgIGlmICghZW50aXR5LmNyZWF0ZWRBdCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2NyZWF0ZWRBdCcsIG1lc3NhZ2U6ICdDcmVhdGVkIHRpbWVzdGFtcCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfSBlbHNlIGlmICghdGhpcy5pc1ZhbGlkSVNPRGF0ZShlbnRpdHkuY3JlYXRlZEF0KSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2NyZWF0ZWRBdCcsIG1lc3NhZ2U6ICdDcmVhdGVkIHRpbWVzdGFtcCBtdXN0IGJlIGEgdmFsaWQgSVNPIGRhdGUgc3RyaW5nJywgY29kZTogJ0lOVkFMSURfRk9STUFUJywgdmFsdWU6IGVudGl0eS5jcmVhdGVkQXQgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFlbnRpdHkudXBkYXRlZEF0KSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndXBkYXRlZEF0JywgbWVzc2FnZTogJ1VwZGF0ZWQgdGltZXN0YW1wIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLmlzVmFsaWRJU09EYXRlKGVudGl0eS51cGRhdGVkQXQpKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndXBkYXRlZEF0JywgbWVzc2FnZTogJ1VwZGF0ZWQgdGltZXN0YW1wIG11c3QgYmUgYSB2YWxpZCBJU08gZGF0ZSBzdHJpbmcnLCBjb2RlOiAnSU5WQUxJRF9GT1JNQVQnLCB2YWx1ZTogZW50aXR5LnVwZGF0ZWRBdCB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiBlcnJvcnMubGVuZ3RoID09PSAwLCBlcnJvcnMsIHdhcm5pbmdzIH07XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgZW50aXR5IGNvbnNpc3RlbmN5XG4gICAqL1xuICBzdGF0aWMgdmFsaWRhdGVDb25zaXN0ZW5jeShlbnRpdHk6IGFueSk6IFZhbGlkYXRpb25SZXN1bHQge1xuICAgIGNvbnN0IGVycm9yczogVmFsaWRhdGlvbkVycm9yW10gPSBbXTtcbiAgICBjb25zdCB3YXJuaW5nczogVmFsaWRhdGlvbldhcm5pbmdbXSA9IFtdO1xuXG4gICAgLy8gQ2hlY2sgaWYgY3JlYXRlZEF0IGlzIGJlZm9yZSB1cGRhdGVkQXRcbiAgICBpZiAoZW50aXR5LmNyZWF0ZWRBdCAmJiBlbnRpdHkudXBkYXRlZEF0KSB7XG4gICAgICBjb25zdCBjcmVhdGVkID0gbmV3IERhdGUoZW50aXR5LmNyZWF0ZWRBdCk7XG4gICAgICBjb25zdCB1cGRhdGVkID0gbmV3IERhdGUoZW50aXR5LnVwZGF0ZWRBdCk7XG4gICAgICBcbiAgICAgIGlmIChjcmVhdGVkID4gdXBkYXRlZCkge1xuICAgICAgICBlcnJvcnMucHVzaCh7IFxuICAgICAgICAgIGZpZWxkOiAndGltZXN0YW1wcycsIFxuICAgICAgICAgIG1lc3NhZ2U6ICdDcmVhdGVkIHRpbWVzdGFtcCBjYW5ub3QgYmUgYWZ0ZXIgdXBkYXRlZCB0aW1lc3RhbXAnLCBcbiAgICAgICAgICBjb2RlOiAnQ09OU0lTVEVOQ1lfRVJST1InLFxuICAgICAgICAgIHZhbHVlOiB7IGNyZWF0ZWRBdDogZW50aXR5LmNyZWF0ZWRBdCwgdXBkYXRlZEF0OiBlbnRpdHkudXBkYXRlZEF0IH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgVFRMIGlmIHByZXNlbnRcbiAgICBpZiAoZW50aXR5LnR0bCkge1xuICAgICAgY29uc3Qgbm93ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgICBpZiAoZW50aXR5LnR0bCA8IG5vdykge1xuICAgICAgICB3YXJuaW5ncy5wdXNoKHtcbiAgICAgICAgICBmaWVsZDogJ3R0bCcsXG4gICAgICAgICAgbWVzc2FnZTogJ1RUTCBpcyBpbiB0aGUgcGFzdCwgaXRlbSBtYXkgYmUgZGVsZXRlZCcsXG4gICAgICAgICAgY29kZTogJ1RUTF9XQVJOSU5HJyxcbiAgICAgICAgICB2YWx1ZTogZW50aXR5LnR0bFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiBlcnJvcnMubGVuZ3RoID09PSAwLCBlcnJvcnMsIHdhcm5pbmdzIH07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgc3RyaW5nIGlzIHZhbGlkIElTTyBkYXRlXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBpc1ZhbGlkSVNPRGF0ZShkYXRlU3RyaW5nOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoZGF0ZVN0cmluZyk7XG4gICAgcmV0dXJuIGRhdGUgaW5zdGFuY2VvZiBEYXRlICYmICFpc05hTihkYXRlLmdldFRpbWUoKSkgJiYgZGF0ZS50b0lTT1N0cmluZygpID09PSBkYXRlU3RyaW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIGJhdGNoIG9wZXJhdGlvblxuICAgKi9cbiAgc3RhdGljIHZhbGlkYXRlQmF0Y2goaXRlbXM6IGFueVtdLCBtYXhCYXRjaFNpemU6IG51bWJlciA9IDI1KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgY29uc3QgZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JbXSA9IFtdO1xuICAgIGNvbnN0IHdhcm5pbmdzOiBWYWxpZGF0aW9uV2FybmluZ1tdID0gW107XG5cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoaXRlbXMpKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnaXRlbXMnLCBtZXNzYWdlOiAnSXRlbXMgbXVzdCBiZSBhbiBhcnJheScsIGNvZGU6ICdUWVBFX0VSUk9SJyB9KTtcbiAgICAgIHJldHVybiB7IGlzVmFsaWQ6IGZhbHNlLCBlcnJvcnMsIHdhcm5pbmdzIH07XG4gICAgfVxuXG4gICAgaWYgKGl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2l0ZW1zJywgbWVzc2FnZTogJ0JhdGNoIGNhbm5vdCBiZSBlbXB0eScsIGNvZGU6ICdFTVBUWV9CQVRDSCcgfSk7XG4gICAgfVxuXG4gICAgaWYgKGl0ZW1zLmxlbmd0aCA+IG1heEJhdGNoU2l6ZSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBcbiAgICAgICAgZmllbGQ6ICdpdGVtcycsIFxuICAgICAgICBtZXNzYWdlOiBgQmF0Y2ggc2l6ZSBjYW5ub3QgZXhjZWVkICR7bWF4QmF0Y2hTaXplfWAsIFxuICAgICAgICBjb2RlOiAnQkFUQ0hfU0laRV9FWENFRURFRCcsXG4gICAgICAgIHZhbHVlOiBpdGVtcy5sZW5ndGggXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBlYWNoIGl0ZW0gaW4gdGhlIGJhdGNoXG4gICAgaXRlbXMuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGtleVZhbGlkYXRpb24gPSB0aGlzLnZhbGlkYXRlS2V5cyhpdGVtKTtcbiAgICAgIGlmICgha2V5VmFsaWRhdGlvbi5pc1ZhbGlkKSB7XG4gICAgICAgIGtleVZhbGlkYXRpb24uZXJyb3JzLmZvckVhY2goZXJyb3IgPT4ge1xuICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgIC4uLmVycm9yLFxuICAgICAgICAgICAgZmllbGQ6IGBpdGVtc1ske2luZGV4fV0uJHtlcnJvci5maWVsZH1gLFxuICAgICAgICAgICAgbWVzc2FnZTogYEl0ZW0gJHtpbmRleH06ICR7ZXJyb3IubWVzc2FnZX1gXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZXJyb3JzLmxlbmd0aCA9PT0gMCwgZXJyb3JzLCB3YXJuaW5ncyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIGltYWdlIGFzc2V0IGVudGl0eVxuICAgKi9cbiAgc3RhdGljIHZhbGlkYXRlSW1hZ2VBc3NldChpbWFnZTogYW55KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgY29uc3QgZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JbXSA9IFtdO1xuICAgIGNvbnN0IHdhcm5pbmdzOiBWYWxpZGF0aW9uV2FybmluZ1tdID0gW107XG5cbiAgICBpZiAoIWltYWdlLmltYWdlSWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdpbWFnZUlkJywgbWVzc2FnZTogJ0ltYWdlIElEIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9XG4gICAgaWYgKCFpbWFnZS51cmwpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICd1cmwnLCBtZXNzYWdlOiAnSW1hZ2UgVVJMIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLlVSTF9SRUdFWC50ZXN0KGltYWdlLnVybCkpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICd1cmwnLCBtZXNzYWdlOiAnSW52YWxpZCBpbWFnZSBVUkwgZm9ybWF0JywgY29kZTogJ0lOVkFMSURfRk9STUFUJywgdmFsdWU6IGltYWdlLnVybCB9KTtcbiAgICB9XG4gICAgaWYgKGltYWdlLnRodW1ibmFpbFVybCAmJiAhdGhpcy5VUkxfUkVHRVgudGVzdChpbWFnZS50aHVtYm5haWxVcmwpKSB7XG4gICAgICB3YXJuaW5ncy5wdXNoKHsgZmllbGQ6ICd0aHVtYm5haWxVcmwnLCBtZXNzYWdlOiAnVGh1bWJuYWlsIFVSTCBmb3JtYXQgbWF5IGJlIGludmFsaWQnLCBjb2RlOiAnRk9STUFUX1dBUk5JTkcnLCB2YWx1ZTogaW1hZ2UudGh1bWJuYWlsVXJsIH0pO1xuICAgIH1cbiAgICBpZiAoIWltYWdlLmFsdFRleHQgfHwgaW1hZ2UuYWx0VGV4dC50cmltKCkubGVuZ3RoIDwgNSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2FsdFRleHQnLCBtZXNzYWdlOiAnQWx0IHRleHQgbXVzdCBiZSBhdCBsZWFzdCA1IGNoYXJhY3RlcnMnLCBjb2RlOiAnTUlOX0xFTkdUSCcgfSk7XG4gICAgfVxuICAgIGlmICghaW1hZ2UuY2F0ZWdvcnkpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdjYXRlZ29yeScsIG1lc3NhZ2U6ICdDYXRlZ29yeSBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuICAgIGNvbnN0IHZhbGlkU3RhdHVzID0gWydhY3RpdmUnLCAnYXJjaGl2ZWQnLCAnZmxhZ2dlZCcsICdyZW1vdmVkJywgJ3BlbmRpbmdfcmV2aWV3J107XG4gICAgaWYgKGltYWdlLnN0YXR1cyAmJiAhdmFsaWRTdGF0dXMuaW5jbHVkZXMoaW1hZ2Uuc3RhdHVzKSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3N0YXR1cycsIG1lc3NhZ2U6ICdJbnZhbGlkIHN0YXR1cycsIGNvZGU6ICdJTlZBTElEX1ZBTFVFJywgdmFsdWU6IGltYWdlLnN0YXR1cyB9KTtcbiAgICB9XG4gICAgaWYgKGltYWdlLnZhbGlkYXRpb24pIHtcbiAgICAgIFsnY3VsdHVyYWxTY29yZScsICdzZW5zaXRpdml0eVNjb3JlJywgJ2luY2x1c2l2aXR5U2NvcmUnXS5mb3JFYWNoKChrKSA9PiB7XG4gICAgICAgIGlmIChpbWFnZS52YWxpZGF0aW9uW2tdICE9PSB1bmRlZmluZWQgJiYgKHR5cGVvZiBpbWFnZS52YWxpZGF0aW9uW2tdICE9PSAnbnVtYmVyJyB8fCBpbWFnZS52YWxpZGF0aW9uW2tdIDwgMCB8fCBpbWFnZS52YWxpZGF0aW9uW2tdID4gMSkpIHtcbiAgICAgICAgICB3YXJuaW5ncy5wdXNoKHsgZmllbGQ6IGB2YWxpZGF0aW9uLiR7a31gLCBtZXNzYWdlOiAnU2NvcmUgc2hvdWxkIGJlIGJldHdlZW4gMCBhbmQgMScsIGNvZGU6ICdSQU5HRV9XQVJOSU5HJywgdmFsdWU6IGltYWdlLnZhbGlkYXRpb25ba10gfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7IGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsIGVycm9ycywgd2FybmluZ3MgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBmZWVkYmFjayBlbnRpdHlcbiAgICovXG4gIHN0YXRpYyB2YWxpZGF0ZUZlZWRiYWNrKGZlZWRiYWNrOiBhbnkpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgICBjb25zdCBlcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdID0gW107XG4gICAgY29uc3Qgd2FybmluZ3M6IFZhbGlkYXRpb25XYXJuaW5nW10gPSBbXTtcblxuICAgIGlmICghZmVlZGJhY2suZmVlZGJhY2tJZCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2ZlZWRiYWNrSWQnLCBtZXNzYWdlOiAnRmVlZGJhY2sgSUQgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cbiAgICBpZiAoIWZlZWRiYWNrLmltYWdlSWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdpbWFnZUlkJywgbWVzc2FnZTogJ0ltYWdlIElEIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9XG4gICAgaWYgKCFmZWVkYmFjay51c2VySWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICd1c2VySWQnLCBtZXNzYWdlOiAnVXNlciBJRCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuICAgIGlmIChmZWVkYmFjay5yYXRpbmcgPT09IHVuZGVmaW5lZCB8fCBmZWVkYmFjay5yYXRpbmcgPT09IG51bGwpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdyYXRpbmcnLCBtZXNzYWdlOiAnUmF0aW5nIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBmZWVkYmFjay5yYXRpbmcgIT09ICdudW1iZXInIHx8IGZlZWRiYWNrLnJhdGluZyA8IDEgfHwgZmVlZGJhY2sucmF0aW5nID4gNSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3JhdGluZycsIG1lc3NhZ2U6ICdSYXRpbmcgbXVzdCBiZSBiZXR3ZWVuIDEgYW5kIDUnLCBjb2RlOiAnUkFOR0VfRVJST1InLCB2YWx1ZTogZmVlZGJhY2sucmF0aW5nIH0pO1xuICAgIH1cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZmVlZGJhY2suY2F0ZWdvcmllcykpIHtcbiAgICAgIHdhcm5pbmdzLnB1c2goeyBmaWVsZDogJ2NhdGVnb3JpZXMnLCBtZXNzYWdlOiAnQ2F0ZWdvcmllcyBzaG91bGQgYmUgYW4gYXJyYXknLCBjb2RlOiAnVFlQRV9XQVJOSU5HJyB9KTtcbiAgICB9XG4gICAgY29uc3QgdmFsaWRTZXZlcml0eSA9IFsnbG93JywgJ21lZGl1bScsICdoaWdoJywgJ2NyaXRpY2FsJ107XG4gICAgaWYgKGZlZWRiYWNrLnNldmVyaXR5ICYmICF2YWxpZFNldmVyaXR5LmluY2x1ZGVzKGZlZWRiYWNrLnNldmVyaXR5KSkge1xuICAgICAgd2FybmluZ3MucHVzaCh7IGZpZWxkOiAnc2V2ZXJpdHknLCBtZXNzYWdlOiAnSW52YWxpZCBzZXZlcml0eScsIGNvZGU6ICdJTlZBTElEX1ZBTFVFJywgdmFsdWU6IGZlZWRiYWNrLnNldmVyaXR5IH0pO1xuICAgIH1cbiAgICBjb25zdCB2YWxpZFN0YXR1cyA9IFsnbmV3JywgJ2Fja25vd2xlZGdlZCcsICdpbl9yZXZpZXcnLCAncmVzb2x2ZWQnLCAnZGlzbWlzc2VkJ107XG4gICAgaWYgKGZlZWRiYWNrLnN0YXR1cyAmJiAhdmFsaWRTdGF0dXMuaW5jbHVkZXMoZmVlZGJhY2suc3RhdHVzKSkge1xuICAgICAgd2FybmluZ3MucHVzaCh7IGZpZWxkOiAnc3RhdHVzJywgbWVzc2FnZTogJ0ludmFsaWQgc3RhdHVzJywgY29kZTogJ0lOVkFMSURfVkFMVUUnLCB2YWx1ZTogZmVlZGJhY2suc3RhdHVzIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7IGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsIGVycm9ycywgd2FybmluZ3MgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBpbmNpZGVudCBlbnRpdHlcbiAgICovXG4gIHN0YXRpYyB2YWxpZGF0ZUluY2lkZW50KGluY2lkZW50OiBhbnkpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgICBjb25zdCBlcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdID0gW107XG4gICAgY29uc3Qgd2FybmluZ3M6IFZhbGlkYXRpb25XYXJuaW5nW10gPSBbXTtcblxuICAgIGlmICghaW5jaWRlbnQuaW5jaWRlbnRJZCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ2luY2lkZW50SWQnLCBtZXNzYWdlOiAnSW5jaWRlbnQgSUQgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH1cbiAgICBpZiAoIWluY2lkZW50LnRyaWdnZXJlZEJ5KSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndHJpZ2dlcmVkQnknLCBtZXNzYWdlOiAndHJpZ2dlcmVkQnkgaXMgcmVxdWlyZWQnLCBjb2RlOiAnUkVRVUlSRUQnIH0pO1xuICAgIH0gZWxzZSBpZiAoIVsnY29tbXVuaXR5X3JlcG9ydCcsICdhdXRvbWF0ZWRfZGV0ZWN0aW9uJywgJ3N0YWZmJywgJ2Fkdmlzb3J5X2JvYXJkJ10uaW5jbHVkZXMoaW5jaWRlbnQudHJpZ2dlcmVkQnkpKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAndHJpZ2dlcmVkQnknLCBtZXNzYWdlOiAnSW52YWxpZCB0cmlnZ2VyJywgY29kZTogJ0lOVkFMSURfVkFMVUUnLCB2YWx1ZTogaW5jaWRlbnQudHJpZ2dlcmVkQnkgfSk7XG4gICAgfVxuICAgIGlmICghaW5jaWRlbnQucHJpb3JpdHkgfHwgIVsncDEnLCAncDInLCAncDMnXS5pbmNsdWRlcyhpbmNpZGVudC5wcmlvcml0eSkpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICdwcmlvcml0eScsIG1lc3NhZ2U6ICdQcmlvcml0eSBtdXN0IGJlIHAxfHAyfHAzJywgY29kZTogJ0lOVkFMSURfVkFMVUUnLCB2YWx1ZTogaW5jaWRlbnQucHJpb3JpdHkgfSk7XG4gICAgfVxuICAgIGlmICghaW5jaWRlbnQuc3VtbWFyeSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3N1bW1hcnknLCBtZXNzYWdlOiAnU3VtbWFyeSBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgaXNWYWxpZDogZXJyb3JzLmxlbmd0aCA9PT0gMCwgZXJyb3JzLCB3YXJuaW5ncyB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIGFkdmlzb3J5IHJldmlldyBlbnRpdHlcbiAgICovXG4gIHN0YXRpYyB2YWxpZGF0ZUFkdmlzb3J5UmV2aWV3KHJldmlldzogYW55KTogVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgY29uc3QgZXJyb3JzOiBWYWxpZGF0aW9uRXJyb3JbXSA9IFtdO1xuICAgIGNvbnN0IHdhcm5pbmdzOiBWYWxpZGF0aW9uV2FybmluZ1tdID0gW107XG5cbiAgICBpZiAoIXJldmlldy5yZXZpZXdJZCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3Jldmlld0lkJywgbWVzc2FnZTogJ1JldmlldyBJRCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuICAgIGlmICghcmV2aWV3LnRhcmdldFR5cGUgfHwgIVsnaW1hZ2UnLCAncmVzb3VyY2UnLCAnc3RvcnknXS5pbmNsdWRlcyhyZXZpZXcudGFyZ2V0VHlwZSkpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICd0YXJnZXRUeXBlJywgbWVzc2FnZTogJ0ludmFsaWQgdGFyZ2V0VHlwZScsIGNvZGU6ICdJTlZBTElEX1ZBTFVFJywgdmFsdWU6IHJldmlldy50YXJnZXRUeXBlIH0pO1xuICAgIH1cbiAgICBpZiAoIXJldmlldy50YXJnZXRJZCkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3RhcmdldElkJywgbWVzc2FnZTogJ1RhcmdldCBJRCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuICAgIGNvbnN0IHZhbGlkU3RhdHVzID0gWydxdWV1ZWQnLCAnaW5fcmV2aWV3JywgJ2FwcHJvdmVkJywgJ2NoYW5nZXNfcmVxdWVzdGVkJywgJ3JlamVjdGVkJ107XG4gICAgaWYgKHJldmlldy5zdGF0dXMgJiYgIXZhbGlkU3RhdHVzLmluY2x1ZGVzKHJldmlldy5zdGF0dXMpKSB7XG4gICAgICB3YXJuaW5ncy5wdXNoKHsgZmllbGQ6ICdzdGF0dXMnLCBtZXNzYWdlOiAnSW52YWxpZCBzdGF0dXMnLCBjb2RlOiAnSU5WQUxJRF9WQUxVRScsIHZhbHVlOiByZXZpZXcuc3RhdHVzIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7IGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsIGVycm9ycywgd2FybmluZ3MgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBwcmVtaXVtIHNvdXJjZSBlbnRpdHlcbiAgICovXG4gIHN0YXRpYyB2YWxpZGF0ZVByZW1pdW1Tb3VyY2Uoc291cmNlOiBhbnkpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgICBjb25zdCBlcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdID0gW107XG4gICAgY29uc3Qgd2FybmluZ3M6IFZhbGlkYXRpb25XYXJuaW5nW10gPSBbXTtcblxuICAgIGlmICghc291cmNlLnNvdXJjZUlkKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnc291cmNlSWQnLCBtZXNzYWdlOiAnU291cmNlIElEIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9XG4gICAgaWYgKCFzb3VyY2UucHJvdmlkZXIgfHwgIVsnY3JlYXRlaGVyJywgJ25hcHB5JywgJ290aGVyJ10uaW5jbHVkZXMoc291cmNlLnByb3ZpZGVyKSkge1xuICAgICAgZXJyb3JzLnB1c2goeyBmaWVsZDogJ3Byb3ZpZGVyJywgbWVzc2FnZTogJ0ludmFsaWQgcHJvdmlkZXInLCBjb2RlOiAnSU5WQUxJRF9WQUxVRScsIHZhbHVlOiBzb3VyY2UucHJvdmlkZXIgfSk7XG4gICAgfVxuICAgIGlmICghc291cmNlLmRpc3BsYXlOYW1lKSB7XG4gICAgICBlcnJvcnMucHVzaCh7IGZpZWxkOiAnZGlzcGxheU5hbWUnLCBtZXNzYWdlOiAnRGlzcGxheSBuYW1lIGlzIHJlcXVpcmVkJywgY29kZTogJ1JFUVVJUkVEJyB9KTtcbiAgICB9XG4gICAgaWYgKHNvdXJjZS5hcGlCYXNlVXJsICYmICF0aGlzLlVSTF9SRUdFWC50ZXN0KHNvdXJjZS5hcGlCYXNlVXJsKSkge1xuICAgICAgd2FybmluZ3MucHVzaCh7IGZpZWxkOiAnYXBpQmFzZVVybCcsIG1lc3NhZ2U6ICdBUEkgYmFzZSBVUkwgZm9ybWF0IG1heSBiZSBpbnZhbGlkJywgY29kZTogJ0ZPUk1BVF9XQVJOSU5HJywgdmFsdWU6IHNvdXJjZS5hcGlCYXNlVXJsIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7IGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsIGVycm9ycywgd2FybmluZ3MgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSBwZXJzb25hbGl6YXRpb24gcHJvZmlsZSBlbnRpdHlcbiAgICovXG4gIHN0YXRpYyB2YWxpZGF0ZVBlcnNvbmFsaXphdGlvbihwcm9maWxlOiBhbnkpOiBWYWxpZGF0aW9uUmVzdWx0IHtcbiAgICBjb25zdCBlcnJvcnM6IFZhbGlkYXRpb25FcnJvcltdID0gW107XG4gICAgY29uc3Qgd2FybmluZ3M6IFZhbGlkYXRpb25XYXJuaW5nW10gPSBbXTtcblxuICAgIGlmICghcHJvZmlsZS51c2VySWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgZmllbGQ6ICd1c2VySWQnLCBtZXNzYWdlOiAnVXNlciBJRCBpcyByZXF1aXJlZCcsIGNvZGU6ICdSRVFVSVJFRCcgfSk7XG4gICAgfVxuICAgIGlmIChwcm9maWxlLmVuZ2FnZW1lbnQpIHtcbiAgICAgIFsnaW1wcmVzc2lvbnMnLCAnY2xpY2tzJ10uZm9yRWFjaCgoaykgPT4ge1xuICAgICAgICBpZiAocHJvZmlsZS5lbmdhZ2VtZW50W2tdICE9PSB1bmRlZmluZWQgJiYgKHR5cGVvZiBwcm9maWxlLmVuZ2FnZW1lbnRba10gIT09ICdudW1iZXInIHx8IHByb2ZpbGUuZW5nYWdlbWVudFtrXSA8IDApKSB7XG4gICAgICAgICAgd2FybmluZ3MucHVzaCh7IGZpZWxkOiBgZW5nYWdlbWVudC4ke2t9YCwgbWVzc2FnZTogJ0VuZ2FnZW1lbnQgdmFsdWVzIG11c3QgYmUgbm9uLW5lZ2F0aXZlJywgY29kZTogJ1JBTkdFX1dBUk5JTkcnLCB2YWx1ZTogcHJvZmlsZS5lbmdhZ2VtZW50W2tdIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBpc1ZhbGlkOiBlcnJvcnMubGVuZ3RoID09PSAwLCBlcnJvcnMsIHdhcm5pbmdzIH07XG4gIH1cbn0iXX0=