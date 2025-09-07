/**
 * Validation utilities for API Gateway
 */

import { VALIDATION_PATTERNS, PAGINATION_DEFAULTS } from './constants';

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  return VALIDATION_PATTERNS.EMAIL.test(email);
}

/**
 * Validates a URL
 */
export function isValidUrl(url: string): boolean {
  return VALIDATION_PATTERNS.URL.test(url);
}

/**
 * Validates an ID format
 */
export function isValidId(id: string): boolean {
  return VALIDATION_PATTERNS.ID.test(id) && id.length > 0 && id.length <= 255;
}

/**
 * Validates a time format (HH:MM)
 */
export function isValidTime(time: string): boolean {
  return VALIDATION_PATTERNS.TIME.test(time);
}

/**
 * Validates pagination parameters
 */
export function validatePagination(limit?: number, offset?: number): {
  limit: number;
  offset: number;
  errors: string[];
} {
  const errors: string[] = [];
  let validatedLimit = limit ?? PAGINATION_DEFAULTS.LIMIT;
  let validatedOffset = offset ?? PAGINATION_DEFAULTS.OFFSET;

  if (limit !== undefined) {
    if (!Number.isInteger(limit) || limit < 1) {
      errors.push('Limit must be a positive integer');
      validatedLimit = PAGINATION_DEFAULTS.LIMIT;
    } else if (limit > PAGINATION_DEFAULTS.MAX_LIMIT) {
      errors.push(`Limit cannot exceed ${PAGINATION_DEFAULTS.MAX_LIMIT}`);
      validatedLimit = PAGINATION_DEFAULTS.MAX_LIMIT;
    }
  }

  if (offset !== undefined) {
    if (!Number.isInteger(offset) || offset < 0) {
      errors.push('Offset must be a non-negative integer');
      validatedOffset = PAGINATION_DEFAULTS.OFFSET;
    }
  }

  return {
    limit: validatedLimit,
    offset: validatedOffset,
    errors
  };
}

/**
 * Validates required fields in an object
 */
export function validateRequiredFields<T extends Record<string, any>>(
  obj: T,
  requiredFields: (keyof T)[]
): string[] {
  const errors: string[] = [];

  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      errors.push(`Field '${String(field)}' is required`);
    }
  }

  return errors;
}

/**
 * Validates string length
 */
export function validateStringLength(
  value: string,
  fieldName: string,
  minLength?: number,
  maxLength?: number
): string[] {
  const errors: string[] = [];

  if (minLength !== undefined && value.length < minLength) {
    errors.push(`${fieldName} must be at least ${minLength} characters long`);
  }

  if (maxLength !== undefined && value.length > maxLength) {
    errors.push(`${fieldName} cannot exceed ${maxLength} characters`);
  }

  return errors;
}

/**
 * Validates numeric range
 */
export function validateNumericRange(
  value: number,
  fieldName: string,
  min?: number,
  max?: number
): string[] {
  const errors: string[] = [];

  if (min !== undefined && value < min) {
    errors.push(`${fieldName} must be at least ${min}`);
  }

  if (max !== undefined && value > max) {
    errors.push(`${fieldName} cannot exceed ${max}`);
  }

  return errors;
}

/**
 * Validates array length
 */
export function validateArrayLength<T>(
  array: T[],
  fieldName: string,
  minLength?: number,
  maxLength?: number
): string[] {
  const errors: string[] = [];

  if (minLength !== undefined && array.length < minLength) {
    errors.push(`${fieldName} must contain at least ${minLength} items`);
  }

  if (maxLength !== undefined && array.length > maxLength) {
    errors.push(`${fieldName} cannot contain more than ${maxLength} items`);
  }

  return errors;
}