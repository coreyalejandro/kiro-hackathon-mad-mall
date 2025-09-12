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
export declare class DataValidator {
    private static readonly EMAIL_REGEX;
    private static readonly URL_REGEX;
    private static readonly PHONE_REGEX;
    /**
     * Validate user entity
     */
    static validateUser(user: any): ValidationResult;
    /**
     * Validate circle entity
     */
    static validateCircle(circle: any): ValidationResult;
    /**
     * Validate story entity
     */
    static validateStory(story: any): ValidationResult;
    /**
     * Validate business entity
     */
    static validateBusiness(business: any): ValidationResult;
    /**
     * Validate resource entity
     */
    static validateResource(resource: any): ValidationResult;
    /**
     * Validate DynamoDB key structure
     */
    static validateKeys(entity: any): ValidationResult;
    /**
     * Validate entity consistency
     */
    static validateConsistency(entity: any): ValidationResult;
    /**
     * Check if string is valid ISO date
     */
    private static isValidISODate;
    /**
     * Validate batch operation
     */
    static validateBatch(items: any[], maxBatchSize?: number): ValidationResult;
    /**
     * Validate image asset entity
     */
    static validateImageAsset(image: any): ValidationResult;
    /**
     * Validate feedback entity
     */
    static validateFeedback(feedback: any): ValidationResult;
    /**
     * Validate incident entity
     */
    static validateIncident(incident: any): ValidationResult;
    /**
     * Validate advisory review entity
     */
    static validateAdvisoryReview(review: any): ValidationResult;
    /**
     * Validate premium source entity
     */
    static validatePremiumSource(source: any): ValidationResult;
    /**
     * Validate personalization profile entity
     */
    static validatePersonalization(profile: any): ValidationResult;
}
