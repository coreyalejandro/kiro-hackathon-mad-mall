/**
 * Data Validation Utilities
 * Validation functions for DynamoDB entities and operations
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export class DataValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly URL_REGEX = /^https?:\/\/.+/;
  private static readonly PHONE_REGEX = /^\+?[\d\s\-\(\)]+$/;

  /**
   * Validate user entity
   */
  static validateUser(user: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!user.userId) {
      errors.push({ field: 'userId', message: 'User ID is required', code: 'REQUIRED' });
    }
    if (!user.email) {
      errors.push({ field: 'email', message: 'Email is required', code: 'REQUIRED' });
    } else if (!this.EMAIL_REGEX.test(user.email)) {
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
    } else {
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
  static validateCircle(circle: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!circle.circleId) {
      errors.push({ field: 'circleId', message: 'Circle ID is required', code: 'REQUIRED' });
    }
    if (!circle.name) {
      errors.push({ field: 'name', message: 'Circle name is required', code: 'REQUIRED' });
    } else if (circle.name.length < 3) {
      errors.push({ field: 'name', message: 'Circle name must be at least 3 characters', code: 'MIN_LENGTH', value: circle.name.length });
    } else if (circle.name.length > 100) {
      errors.push({ field: 'name', message: 'Circle name must be less than 100 characters', code: 'MAX_LENGTH', value: circle.name.length });
    }

    if (!circle.description) {
      warnings.push({ field: 'description', message: 'Circle description is recommended', code: 'RECOMMENDED' });
    } else if (circle.description.length > 1000) {
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
  static validateStory(story: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!story.storyId) {
      errors.push({ field: 'storyId', message: 'Story ID is required', code: 'REQUIRED' });
    }
    if (!story.title) {
      errors.push({ field: 'title', message: 'Story title is required', code: 'REQUIRED' });
    } else if (story.title.length < 5) {
      errors.push({ field: 'title', message: 'Story title must be at least 5 characters', code: 'MIN_LENGTH', value: story.title.length });
    } else if (story.title.length > 200) {
      errors.push({ field: 'title', message: 'Story title must be less than 200 characters', code: 'MAX_LENGTH', value: story.title.length });
    }

    if (!story.content) {
      errors.push({ field: 'content', message: 'Story content is required', code: 'REQUIRED' });
    } else if (story.content.length < 50) {
      warnings.push({ field: 'content', message: 'Story content is quite short', code: 'LENGTH_WARNING', value: story.content.length });
    } else if (story.content.length > 50000) {
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
  static validateBusiness(business: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

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
    } else if (business.profile.name.length < 2) {
      errors.push({ field: 'profile.name', message: 'Business name must be at least 2 characters', code: 'MIN_LENGTH', value: business.profile.name.length });
    }

    if (!business.profile.description) {
      warnings.push({ field: 'profile.description', message: 'Business description is recommended', code: 'RECOMMENDED' });
    }

    if (!business.profile.contact || !business.profile.contact.email) {
      errors.push({ field: 'profile.contact.email', message: 'Contact email is required', code: 'REQUIRED' });
    } else if (!this.EMAIL_REGEX.test(business.profile.contact.email)) {
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
  static validateResource(resource: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields
    if (!resource.resourceId) {
      errors.push({ field: 'resourceId', message: 'Resource ID is required', code: 'REQUIRED' });
    }
    if (!resource.title) {
      errors.push({ field: 'title', message: 'Resource title is required', code: 'REQUIRED' });
    } else if (resource.title.length < 5) {
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
  static validateKeys(entity: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!entity.PK) {
      errors.push({ field: 'PK', message: 'Partition key (PK) is required', code: 'REQUIRED' });
    } else if (typeof entity.PK !== 'string') {
      errors.push({ field: 'PK', message: 'Partition key (PK) must be a string', code: 'TYPE_ERROR' });
    }

    if (!entity.SK) {
      errors.push({ field: 'SK', message: 'Sort key (SK) is required', code: 'REQUIRED' });
    } else if (typeof entity.SK !== 'string') {
      errors.push({ field: 'SK', message: 'Sort key (SK) must be a string', code: 'TYPE_ERROR' });
    }

    if (!entity.entityType) {
      errors.push({ field: 'entityType', message: 'Entity type is required', code: 'REQUIRED' });
    }

    if (entity.version === undefined || entity.version === null) {
      errors.push({ field: 'version', message: 'Version is required for optimistic locking', code: 'REQUIRED' });
    } else if (typeof entity.version !== 'number' || entity.version < 0) {
      errors.push({ field: 'version', message: 'Version must be a non-negative number', code: 'TYPE_ERROR' });
    }

    if (!entity.createdAt) {
      errors.push({ field: 'createdAt', message: 'Created timestamp is required', code: 'REQUIRED' });
    } else if (!this.isValidISODate(entity.createdAt)) {
      errors.push({ field: 'createdAt', message: 'Created timestamp must be a valid ISO date string', code: 'INVALID_FORMAT', value: entity.createdAt });
    }

    if (!entity.updatedAt) {
      errors.push({ field: 'updatedAt', message: 'Updated timestamp is required', code: 'REQUIRED' });
    } else if (!this.isValidISODate(entity.updatedAt)) {
      errors.push({ field: 'updatedAt', message: 'Updated timestamp must be a valid ISO date string', code: 'INVALID_FORMAT', value: entity.updatedAt });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate entity consistency
   */
  static validateConsistency(entity: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

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
  private static isValidISODate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && date.toISOString() === dateString;
  }

  /**
   * Validate batch operation
   */
  static validateBatch(items: any[], maxBatchSize: number = 25): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

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
  static validateImageAsset(image: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!image.imageId) {
      errors.push({ field: 'imageId', message: 'Image ID is required', code: 'REQUIRED' });
    }
    if (!image.url) {
      errors.push({ field: 'url', message: 'Image URL is required', code: 'REQUIRED' });
    } else if (!this.URL_REGEX.test(image.url)) {
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
  static validateFeedback(feedback: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

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
    } else if (typeof feedback.rating !== 'number' || feedback.rating < 1 || feedback.rating > 5) {
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
  static validateIncident(incident: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!incident.incidentId) {
      errors.push({ field: 'incidentId', message: 'Incident ID is required', code: 'REQUIRED' });
    }
    if (!incident.triggeredBy) {
      errors.push({ field: 'triggeredBy', message: 'triggeredBy is required', code: 'REQUIRED' });
    } else if (!['community_report', 'automated_detection', 'staff', 'advisory_board'].includes(incident.triggeredBy)) {
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
  static validateAdvisoryReview(review: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

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
  static validatePremiumSource(source: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

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
  static validatePersonalization(profile: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

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