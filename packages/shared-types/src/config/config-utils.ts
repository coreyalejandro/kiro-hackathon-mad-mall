/**
 * Configuration Utilities
 * Helper functions for configuration management
 */

import { AppConfig, Environment, ConfigValidationRule, ConfigValidationResult } from './environment';
import { FeatureFlag, FeatureFlagContext, FeatureFlagEvaluationResult } from './feature-flags';

// Configuration loading utilities
export function loadConfigFromEnvironment(): Partial<AppConfig> {
  return {
    environment: (process.env.NODE_ENV as Environment) || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    
    app: {
      name: process.env.APP_NAME || 'MADMall Platform',
      version: process.env.APP_VERSION || '1.0.0',
      description: process.env.APP_DESCRIPTION || 'Social wellness platform for Black women with Graves Disease',
      maintainer: process.env.APP_MAINTAINER || 'MADMall Team',
      repository: process.env.APP_REPOSITORY || 'https://github.com/madmall/platform',
    },
    
    database: {
      dynamodb: {
        region: process.env.AWS_REGION || 'us-east-1',
        endpoint: process.env.DYNAMODB_ENDPOINT,
        tableName: process.env.DYNAMODB_TABLE_NAME || 'madmall-main',
        gsiNames: {
          gsi1: process.env.DYNAMODB_GSI1_NAME || 'GSI1',
          gsi2: process.env.DYNAMODB_GSI2_NAME || 'GSI2',
          gsi3: process.env.DYNAMODB_GSI3_NAME,
        },
        billingMode: (process.env.DYNAMODB_BILLING_MODE as 'PAY_PER_REQUEST' | 'PROVISIONED') || 'PAY_PER_REQUEST',
      },
    },
    
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      accountId: process.env.AWS_ACCOUNT_ID || '',
      
      cognito: {
        userPoolId: process.env.COGNITO_USER_POOL_ID || '',
        userPoolClientId: process.env.COGNITO_USER_POOL_CLIENT_ID || '',
        identityPoolId: process.env.COGNITO_IDENTITY_POOL_ID || '',
        region: process.env.COGNITO_REGION || process.env.AWS_REGION || 'us-east-1',
      },
      
      s3: {
        bucketName: process.env.S3_BUCKET_NAME || '',
        region: process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1',
        cloudFrontDomain: process.env.CLOUDFRONT_DOMAIN,
        uploadLimits: {
          maxFileSize: parseInt(process.env.S3_MAX_FILE_SIZE || '10485760', 10), // 10MB default
          allowedTypes: (process.env.S3_ALLOWED_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
        },
      },
      
      bedrock: {
        region: process.env.BEDROCK_REGION || process.env.AWS_REGION || 'us-east-1',
        models: {
          textGeneration: process.env.BEDROCK_TEXT_MODEL || 'anthropic.claude-3-sonnet-20240229-v1:0',
          imageGeneration: process.env.BEDROCK_IMAGE_MODEL || 'stability.stable-diffusion-xl-v1',
          embedding: process.env.BEDROCK_EMBEDDING_MODEL || 'amazon.titan-embed-text-v1',
        },
        agents: {
          culturalValidation: process.env.BEDROCK_CULTURAL_AGENT || '',
          contentModeration: process.env.BEDROCK_MODERATION_AGENT || '',
          recommendation: process.env.BEDROCK_RECOMMENDATION_AGENT || '',
          wellnessCoach: process.env.BEDROCK_WELLNESS_AGENT || '',
        },
      },
    },
    
    api: {
      baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
      version: process.env.API_VERSION || 'v1',
      timeout: parseInt(process.env.API_TIMEOUT || '30000', 10),
      retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3', 10),
      retryDelay: parseInt(process.env.API_RETRY_DELAY || '1000', 10),
      
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
        skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL === 'true',
      },
      
      cors: {
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
        credentials: process.env.CORS_CREDENTIALS === 'true',
        optionsSuccessStatus: parseInt(process.env.CORS_OPTIONS_SUCCESS_STATUS || '200', 10),
      },
      
      auth: {
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
        refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
        passwordResetExpiresIn: process.env.PASSWORD_RESET_EXPIRES_IN || '1h',
        emailVerificationExpiresIn: process.env.EMAIL_VERIFICATION_EXPIRES_IN || '24h',
      },
    },
  };
}

// Configuration validation
export function validateConfig(config: Partial<AppConfig>, rules: ConfigValidationRule[]): ConfigValidationResult {
  const errors: ConfigValidationResult['errors'] = [];
  
  for (const rule of rules) {
    const value = getNestedValue(config, rule.field);
    
    // Check if required field is missing
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field: rule.field,
        message: `Required field '${rule.field}' is missing`,
        value,
      });
      continue;
    }
    
    // Skip validation if field is not required and not present
    if (!rule.required && (value === undefined || value === null)) {
      continue;
    }
    
    // Type validation
    if (rule.type && typeof value !== rule.type) {
      errors.push({
        field: rule.field,
        message: `Field '${rule.field}' must be of type ${rule.type}, got ${typeof value}`,
        value,
      });
      continue;
    }
    
    // Pattern validation for strings
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors.push({
        field: rule.field,
        message: `Field '${rule.field}' does not match required pattern`,
        value,
      });
    }
    
    // Length validation for strings
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push({
          field: rule.field,
          message: `Field '${rule.field}' must be at least ${rule.minLength} characters long`,
          value,
        });
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push({
          field: rule.field,
          message: `Field '${rule.field}' must be no more than ${rule.maxLength} characters long`,
          value,
        });
      }
    }
    
    // Range validation for numbers
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push({
          field: rule.field,
          message: `Field '${rule.field}' must be at least ${rule.min}`,
          value,
        });
      }
      
      if (rule.max !== undefined && value > rule.max) {
        errors.push({
          field: rule.field,
          message: `Field '${rule.field}' must be no more than ${rule.max}`,
          value,
        });
      }
    }
    
    // Allowed values validation
    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      errors.push({
        field: rule.field,
        message: `Field '${rule.field}' must be one of: ${rule.allowedValues.join(', ')}`,
        value,
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Configuration merging utilities
export function mergeConfigs(base: Partial<AppConfig>, override: Partial<AppConfig>): Partial<AppConfig> {
  return deepMerge(base, override);
}

export function deepMerge(target: any, source: any): any {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

// Configuration access utilities
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    return current[key];
  }, obj);
  
  target[lastKey] = value;
}

// Environment-specific configuration
export function getEnvironmentConfig(environment: Environment): Partial<AppConfig> {
  const baseConfig = loadConfigFromEnvironment();
  
  switch (environment) {
    case 'development':
      return mergeConfigs(baseConfig, {
        logLevel: 'debug',
        api: {
          timeout: 60000, // Longer timeout for development
        },
        featureFlags: {
          systemFeatures: {
            advancedAnalytics: true,
            realTimeNotifications: true,
            advancedSearch: true,
            dataExport: true,
          },
        },
      });
      
    case 'staging':
      return mergeConfigs(baseConfig, {
        logLevel: 'info',
        featureFlags: {
          systemFeatures: {
            advancedAnalytics: true,
            realTimeNotifications: true,
            advancedSearch: false,
            dataExport: false,
          },
        },
      });
      
    case 'production':
      return mergeConfigs(baseConfig, {
        logLevel: 'warn',
        featureFlags: {
          systemFeatures: {
            advancedAnalytics: false,
            realTimeNotifications: true,
            advancedSearch: false,
            dataExport: false,
          },
        },
      });
      
    case 'test':
      return mergeConfigs(baseConfig, {
        logLevel: 'error',
        database: {
          dynamodb: {
            endpoint: 'http://localhost:8000', // Local DynamoDB for testing
          },
        },
      });
      
    default:
      return baseConfig;
  }
}

// Configuration validation rules for MADMall platform
export const MADMALL_CONFIG_RULES: ConfigValidationRule[] = [
  { field: 'environment', required: true, type: 'string', allowedValues: ['development', 'staging', 'production', 'test'] },
  { field: 'port', required: true, type: 'number', min: 1, max: 65535 },
  { field: 'aws.region', required: true, type: 'string', minLength: 1 },
  { field: 'aws.accountId', required: true, type: 'string', pattern: /^\d{12}$/ },
  { field: 'aws.cognito.userPoolId', required: true, type: 'string', minLength: 1 },
  { field: 'aws.cognito.userPoolClientId', required: true, type: 'string', minLength: 1 },
  { field: 'aws.s3.bucketName', required: true, type: 'string', minLength: 1 },
  { field: 'database.dynamodb.tableName', required: true, type: 'string', minLength: 1 },
  { field: 'api.baseUrl', required: true, type: 'string', pattern: /^https?:\/\/.+/ },
  { field: 'api.auth.jwtSecret', required: true, type: 'string', minLength: 32 },
];