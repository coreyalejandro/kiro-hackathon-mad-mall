/**
 * Environment Configuration Types
 * Types for environment variables and configuration management
 */

// Environment types
export type Environment = 'development' | 'staging' | 'production' | 'test';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

// Database configuration
export interface DatabaseConfig {
  // DynamoDB configuration
  dynamodb: {
    region: string;
    endpoint?: string; // for local development
    tableName: string;
    gsiNames: {
      gsi1: string;
      gsi2: string;
      gsi3?: string;
    };
    billingMode: 'PAY_PER_REQUEST' | 'PROVISIONED';
    readCapacity?: number;
    writeCapacity?: number;
  };
  
  // ElastiCache configuration (optional)
  redis?: {
    host: string;
    port: number;
    password?: string;
    database: number;
    keyPrefix: string;
    ttl: number; // default TTL in seconds
  };
}

// AWS services configuration
export interface AwsConfig {
  region: string;
  accountId: string;
  
  // Cognito configuration
  cognito: {
    userPoolId: string;
    userPoolClientId: string;
    identityPoolId: string;
    region: string;
  };
  
  // S3 configuration
  s3: {
    bucketName: string;
    region: string;
    cloudFrontDomain?: string;
    uploadLimits: {
      maxFileSize: number; // in bytes
      allowedTypes: string[];
    };
  };
  
  // SES configuration
  ses: {
    region: string;
    fromEmail: string;
    replyToEmail?: string;
    configurationSet?: string;
  };
  
  // SNS configuration
  sns?: {
    region: string;
    topicArn: string;
  };
  
  // SQS configuration
  sqs?: {
    region: string;
    queueUrls: {
      events: string;
      deadLetter: string;
      notifications: string;
    };
  };
  
  // Bedrock configuration
  bedrock: {
    region: string;
    models: {
      textGeneration: string;
      imageGeneration: string;
      embedding: string;
    };
    agents: {
      culturalValidation: string;
      contentModeration: string;
      recommendation: string;
      wellnessCoach: string;
    };
  };
  
  // Lambda configuration
  lambda?: {
    region: string;
    functionNames: {
      userService: string;
      circleService: string;
      storyService: string;
      resourceService: string;
    };
  };
}

// API configuration
export interface ApiConfig {
  baseUrl: string;
  version: string;
  timeout: number; // in milliseconds
  retryAttempts: number;
  retryDelay: number; // in milliseconds
  
  // Rate limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  
  // CORS configuration
  cors: {
    origin: string | string[];
    credentials: boolean;
    optionsSuccessStatus: number;
  };
  
  // Authentication
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenExpiresIn: string;
    passwordResetExpiresIn: string;
    emailVerificationExpiresIn: string;
  };
}

// External services configuration
export interface ExternalServicesConfig {
  // Image providers
  imageProviders: {
    pexels?: {
      apiKey: string;
      baseUrl: string;
      rateLimit: number;
    };
    unsplash?: {
      accessKey: string;
      secretKey: string;
      baseUrl: string;
      rateLimit: number;
    };
    automatic1111?: {
      baseUrl: string;
      timeout: number;
    };
  };
  
  // Analytics services
  analytics?: {
    googleAnalytics?: {
      trackingId: string;
      measurementId: string;
    };
    mixpanel?: {
      token: string;
      apiSecret: string;
    };
  };
  
  // Monitoring services
  monitoring?: {
    sentry?: {
      dsn: string;
      environment: string;
      tracesSampleRate: number;
    };
    datadog?: {
      apiKey: string;
      appKey: string;
      site: string;
    };
  };
  
  // Communication services
  communication?: {
    twilio?: {
      accountSid: string;
      authToken: string;
      fromNumber: string;
    };
    sendgrid?: {
      apiKey: string;
      fromEmail: string;
      templateIds: Record<string, string>;
    };
  };
}

// Security configuration
export interface SecurityConfig {
  // Encryption
  encryption: {
    algorithm: string;
    keyDerivation: {
      iterations: number;
      keyLength: number;
      digest: string;
    };
  };
  
  // Password policy
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number; // in days
    preventReuse: number; // number of previous passwords to check
  };
  
  // Session management
  session: {
    maxAge: number; // in milliseconds
    maxConcurrentSessions: number;
    idleTimeout: number; // in milliseconds
    absoluteTimeout: number; // in milliseconds
  };
  
  // Content security
  contentSecurity: {
    maxContentLength: number;
    allowedHtmlTags: string[];
    allowedFileTypes: string[];
    scanForMalware: boolean;
  };
  
  // API security
  apiSecurity: {
    enableCsrf: boolean;
    enableXssProtection: boolean;
    enableContentTypeValidation: boolean;
    maxRequestSize: number; // in bytes
  };
}

// Feature flags configuration
export interface FeatureFlagsConfig {
  // User features
  userFeatures: {
    socialLogin: boolean;
    multiFactorAuth: boolean;
    profileVerification: boolean;
    advancedPrivacyControls: boolean;
  };
  
  // Circle features
  circleFeatures: {
    privateCircles: boolean;
    circleInvitations: boolean;
    circleModeration: boolean;
    circleAnalytics: boolean;
  };
  
  // Content features
  contentFeatures: {
    storyDrafts: boolean;
    contentScheduling: boolean;
    advancedEditor: boolean;
    contentAnalytics: boolean;
  };
  
  // AI features
  aiFeatures: {
    bedrockIntegration: boolean;
    culturalValidation: boolean;
    contentRecommendations: boolean;
    wellnessCoaching: boolean;
  };
  
  // Business features
  businessFeatures: {
    marketplace: boolean;
    productReviews: boolean;
    businessVerification: boolean;
    premiumListings: boolean;
  };
  
  // System features
  systemFeatures: {
    advancedAnalytics: boolean;
    realTimeNotifications: boolean;
    advancedSearch: boolean;
    dataExport: boolean;
  };
}

// Application configuration (main config interface)
export interface AppConfig {
  environment: Environment;
  logLevel: LogLevel;
  port: number;
  database: DatabaseConfig;
  aws: AwsConfig;
  api: ApiConfig;
  externalServices: ExternalServicesConfig;
  security: SecurityConfig;
  featureFlags: FeatureFlagsConfig;
  
  // Application metadata
  app: {
    name: string;
    version: string;
    description: string;
    maintainer: string;
    repository: string;
  };
}

// Configuration validation types
export interface ConfigValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  allowedValues?: any[];
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
    value?: any;
  }[];
}

// Environment-specific configuration overrides
export interface EnvironmentOverrides {
  development?: Partial<AppConfig>;
  staging?: Partial<AppConfig>;
  production?: Partial<AppConfig>;
  test?: Partial<AppConfig>;
}