/**
 * Form validation utilities for authentication and user input
 * Implements WCAG 2.2 AA compliant validation with clear error messages
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

/**
 * Email validation with comprehensive pattern matching
 */
export function validateEmail(email: string): string | null {
  if (!email) {
    return 'Email address is required';
  }
  
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailPattern.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
}

/**
 * Password validation with security requirements
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (password.length > 128) {
    return 'Password must be less than 128 characters';
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '12345678', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    return 'Please choose a stronger, less common password';
  }
  
  return null;
}

/**
 * Name validation for first and last names
 */
export function validateName(name: string, fieldName: string = 'Name'): string | null {
  if (!name || !name.trim()) {
    return `${fieldName} is required`;
  }
  
  if (name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  
  if (name.trim().length > 50) {
    return `${fieldName} must be less than 50 characters`;
  }
  
  // Allow letters, spaces, hyphens, and apostrophes
  const namePattern = /^[a-zA-Z\s\-']+$/;
  if (!namePattern.test(name.trim())) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }
  
  return null;
}

/**
 * Generic field validation using schema
 */
export function validateField(value: any, rule: ValidationRule, fieldName: string): string | null {
  // Required validation
  if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return `${fieldName} is required`;
  }
  
  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && !value.trim())) {
    return null;
  }
  
  // String-specific validations
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return `${fieldName} must be at least ${rule.minLength} characters long`;
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      return `${fieldName} must be less than ${rule.maxLength} characters`;
    }
    
    if (rule.pattern && !rule.pattern.test(value)) {
      return `${fieldName} format is invalid`;
    }
  }
  
  // Custom validation
  if (rule.custom) {
    return rule.custom(value);
  }
  
  return null;
}

/**
 * Validate entire form using schema
 */
export function validateForm(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
  const errors: Record<string, string> = {};
  
  for (const [field, rule] of Object.entries(schema)) {
    const error = validateField(data[field], rule, field);
    if (error) {
      errors[field] = error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Password confirmation validation
 */
export function validatePasswordConfirmation(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
}

/**
 * Accessibility-focused error message formatting
 */
export function formatErrorMessage(error: string, fieldName: string): string {
  return `${fieldName}: ${error}`;
}

/**
 * Generate ARIA attributes for form fields with validation
 */
export function getAriaAttributes(fieldName: string, error?: string, description?: string) {
  const attributes: Record<string, string> = {};
  
  if (error) {
    attributes['aria-invalid'] = 'true';
    attributes['aria-describedby'] = `${fieldName}-error`;
  }
  
  if (description) {
    attributes['aria-describedby'] = `${fieldName}-description`;
  }
  
  if (error && description) {
    attributes['aria-describedby'] = `${fieldName}-description ${fieldName}-error`;
  }
  
  return attributes;
}

/**
 * Check password strength and return score (0-4)
 */
export function getPasswordStrength(password: string): {
  score: number;
  feedback: string;
  color: 'red' | 'orange' | 'yellow' | 'green';
} {
  if (!password) {
    return { score: 0, feedback: 'Enter a password', color: 'red' };
  }
  
  let score = 0;
  const feedback: string[] = [];
  
  // Length check
  if (password.length >= 8) score++;
  else feedback.push('Use at least 8 characters');
  
  // Lowercase check
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Include lowercase letters');
  
  // Uppercase check
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Include uppercase letters');
  
  // Number check
  if (/\d/.test(password)) score++;
  else feedback.push('Include numbers');
  
  // Special character bonus
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score = Math.min(score + 0.5, 4);
  }
  
  const strengthLevels = [
    { feedback: 'Very weak', color: 'red' as const },
    { feedback: 'Weak', color: 'red' as const },
    { feedback: 'Fair', color: 'orange' as const },
    { feedback: 'Good', color: 'yellow' as const },
    { feedback: 'Strong', color: 'green' as const }
  ];
  
  const level = Math.floor(score);
  const result = strengthLevels[level] || strengthLevels[0];
  
  return {
    score: level,
    feedback: feedback.length > 0 ? feedback.join(', ') : result.feedback,
    color: result.color
  };
}