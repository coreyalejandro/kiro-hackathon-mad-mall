/**
 * Environment Configuration Types
 * Types for environment variables and configuration management
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';
export interface DatabaseConfig {
    dynamodb: {
        region: string;
        endpoint?: string;
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
    redis?: {
        host: string;
        port: number;
        password?: string;
        database: number;
        keyPrefix: string;
        ttl: number;
    };
}
export interface AwsConfig {
    region: string;
    accountId: string;
    cognito: {
        userPoolId: string;
        userPoolClientId: string;
        identityPoolId: string;
        region: string;
    };
    s3: {
        bucketName: string;
        region: string;
        cloudFrontDomain?: string;
        uploadLimits: {
            maxFileSize: number;
            allowedTypes: string[];
        };
    };
    ses: {
        region: string;
        fromEmail: string;
        replyToEmail?: string;
        configurationSet?: string;
    };
    sns?: {
        region: string;
        topicArn: string;
    };
    sqs?: {
        region: string;
        queueUrls: {
            events: string;
            deadLetter: string;
            notifications: string;
        };
    };
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
export interface ApiConfig {
    baseUrl: string;
    version: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    rateLimit: {
        windowMs: number;
        maxRequests: number;
        skipSuccessfulRequests: boolean;
    };
    cors: {
        origin: string | string[];
        credentials: boolean;
        optionsSuccessStatus: number;
    };
    auth: {
        jwtSecret: string;
        jwtExpiresIn: string;
        refreshTokenExpiresIn: string;
        passwordResetExpiresIn: string;
        emailVerificationExpiresIn: string;
    };
}
export interface ExternalServicesConfig {
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
export interface SecurityConfig {
    encryption: {
        algorithm: string;
        keyDerivation: {
            iterations: number;
            keyLength: number;
            digest: string;
        };
    };
    passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
        maxAge: number;
        preventReuse: number;
    };
    session: {
        maxAge: number;
        maxConcurrentSessions: number;
        idleTimeout: number;
        absoluteTimeout: number;
    };
    contentSecurity: {
        maxContentLength: number;
        allowedHtmlTags: string[];
        allowedFileTypes: string[];
        scanForMalware: boolean;
    };
    apiSecurity: {
        enableCsrf: boolean;
        enableXssProtection: boolean;
        enableContentTypeValidation: boolean;
        maxRequestSize: number;
    };
}
export interface FeatureFlagsConfig {
    userFeatures: {
        socialLogin: boolean;
        multiFactorAuth: boolean;
        profileVerification: boolean;
        advancedPrivacyControls: boolean;
    };
    circleFeatures: {
        privateCircles: boolean;
        circleInvitations: boolean;
        circleModeration: boolean;
        circleAnalytics: boolean;
    };
    contentFeatures: {
        storyDrafts: boolean;
        contentScheduling: boolean;
        advancedEditor: boolean;
        contentAnalytics: boolean;
    };
    aiFeatures: {
        bedrockIntegration: boolean;
        culturalValidation: boolean;
        contentRecommendations: boolean;
        wellnessCoaching: boolean;
    };
    businessFeatures: {
        marketplace: boolean;
        productReviews: boolean;
        businessVerification: boolean;
        premiumListings: boolean;
    };
    systemFeatures: {
        advancedAnalytics: boolean;
        realTimeNotifications: boolean;
        advancedSearch: boolean;
        dataExport: boolean;
    };
}
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
    app: {
        name: string;
        version: string;
        description: string;
        maintainer: string;
        repository: string;
    };
}
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
export interface EnvironmentOverrides {
    development?: Partial<AppConfig>;
    staging?: Partial<AppConfig>;
    production?: Partial<AppConfig>;
    test?: Partial<AppConfig>;
}
//# sourceMappingURL=environment.d.ts.map