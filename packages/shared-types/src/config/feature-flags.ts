/**
 * Feature Flags Types
 * Types for feature flag management and configuration
 */

// Feature flag value types
export type FeatureFlagValue = boolean | string | number | object;

export type FeatureFlagType = 'boolean' | 'string' | 'number' | 'json';

export type FeatureFlagEnvironment = 'development' | 'staging' | 'production' | 'test';

// Feature flag targeting
export interface FeatureFlagTarget {
  type: 'user' | 'group' | 'percentage' | 'custom';
  values: string[];
  percentage?: number; // for percentage-based targeting
  customRule?: string; // for custom targeting rules
}

export interface FeatureFlagRule {
  id: string;
  name: string;
  description?: string;
  targets: FeatureFlagTarget[];
  value: FeatureFlagValue;
  isEnabled: boolean;
  priority: number; // higher priority rules are evaluated first
}

// Feature flag definition
export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  type: FeatureFlagType;
  defaultValue: FeatureFlagValue;
  rules: FeatureFlagRule[];
  environments: {
    [K in FeatureFlagEnvironment]?: {
      isEnabled: boolean;
      defaultValue: FeatureFlagValue;
      rules: FeatureFlagRule[];
    };
  };
  tags: string[];
  category: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// Feature flag evaluation context
export interface FeatureFlagContext {
  userId?: string;
  userGroups?: string[];
  userAttributes?: Record<string, any>;
  environment: FeatureFlagEnvironment;
  timestamp: string;
  customAttributes?: Record<string, any>;
}

// Feature flag evaluation result
export interface FeatureFlagEvaluationResult {
  key: string;
  value: FeatureFlagValue;
  ruleId?: string;
  reason: 'default' | 'rule_match' | 'targeting' | 'percentage' | 'disabled';
  metadata?: Record<string, any>;
}

// Feature flag service interface
export interface FeatureFlagService {
  evaluate(key: string, context: FeatureFlagContext): Promise<FeatureFlagEvaluationResult>;
  evaluateAll(context: FeatureFlagContext): Promise<Record<string, FeatureFlagEvaluationResult>>;
  isEnabled(key: string, context: FeatureFlagContext): Promise<boolean>;
  getValue<T = FeatureFlagValue>(key: string, context: FeatureFlagContext, defaultValue?: T): Promise<T>;
}

// Feature flag management
export interface CreateFeatureFlagRequest {
  key: string;
  name: string;
  description: string;
  type: FeatureFlagType;
  defaultValue: FeatureFlagValue;
  category: string;
  tags?: string[];
  owner: string;
}

export interface UpdateFeatureFlagRequest {
  key: string;
  name?: string;
  description?: string;
  defaultValue?: FeatureFlagValue;
  category?: string;
  tags?: string[];
  owner?: string;
}

export interface CreateFeatureFlagRuleRequest {
  flagKey: string;
  name: string;
  description?: string;
  targets: FeatureFlagTarget[];
  value: FeatureFlagValue;
  isEnabled: boolean;
  priority: number;
  environment?: FeatureFlagEnvironment;
}

export interface UpdateFeatureFlagRuleRequest {
  flagKey: string;
  ruleId: string;
  name?: string;
  description?: string;
  targets?: FeatureFlagTarget[];
  value?: FeatureFlagValue;
  isEnabled?: boolean;
  priority?: number;
}

// Feature flag analytics
export interface FeatureFlagUsageMetrics {
  flagKey: string;
  environment: FeatureFlagEnvironment;
  period: {
    start: string;
    end: string;
  };
  evaluations: {
    total: number;
    byValue: Record<string, number>;
    byRule: Record<string, number>;
    byReason: Record<string, number>;
  };
  uniqueUsers: number;
  performance: {
    averageEvaluationTime: number;
    p95EvaluationTime: number;
    errorRate: number;
  };
}

export interface FeatureFlagAuditLog {
  id: string;
  flagKey: string;
  action: 'created' | 'updated' | 'deleted' | 'rule_added' | 'rule_updated' | 'rule_deleted' | 'toggled';
  actor: {
    userId: string;
    email: string;
    name: string;
  };
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  environment?: FeatureFlagEnvironment;
  timestamp: string;
  reason?: string;
}

// Predefined feature flag categories
export const FEATURE_FLAG_CATEGORIES = {
  USER_EXPERIENCE: 'user_experience',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  INTEGRATION: 'integration',
  EXPERIMENTAL: 'experimental',
  ROLLOUT: 'rollout',
  MAINTENANCE: 'maintenance',
  BUSINESS_LOGIC: 'business_logic',
} as const;

export type FeatureFlagCategory = typeof FEATURE_FLAG_CATEGORIES[keyof typeof FEATURE_FLAG_CATEGORIES];

// Common feature flags for the MADMall platform
export interface MADMallFeatureFlags {
  // User features
  'user.social_login': boolean;
  'user.mfa_enabled': boolean;
  'user.profile_verification': boolean;
  'user.advanced_privacy': boolean;
  'user.data_export': boolean;
  
  // Circle features
  'circles.private_circles': boolean;
  'circles.invitation_system': boolean;
  'circles.moderation_tools': boolean;
  'circles.analytics_dashboard': boolean;
  'circles.live_chat': boolean;
  
  // Content features
  'content.story_drafts': boolean;
  'content.scheduled_posting': boolean;
  'content.rich_editor': boolean;
  'content.ai_suggestions': boolean;
  'content.content_analytics': boolean;
  
  // AI features
  'ai.bedrock_integration': boolean;
  'ai.cultural_validation': boolean;
  'ai.content_recommendations': boolean;
  'ai.wellness_coaching': boolean;
  'ai.image_generation': boolean;
  
  // Business features
  'business.marketplace': boolean;
  'business.product_reviews': boolean;
  'business.verification_system': boolean;
  'business.premium_listings': boolean;
  'business.analytics_dashboard': boolean;
  
  // System features
  'system.real_time_notifications': boolean;
  'system.advanced_search': boolean;
  'system.performance_monitoring': boolean;
  'system.a_b_testing': boolean;
  'system.maintenance_mode': boolean;
  
  // Experimental features
  'experimental.new_ui_design': boolean;
  'experimental.voice_messages': boolean;
  'experimental.video_stories': boolean;
  'experimental.gamification': boolean;
  'experimental.blockchain_integration': boolean;
}

// Feature flag configuration helpers
export interface FeatureFlagConfig {
  provider: 'local' | 'aws_appconfig' | 'launchdarkly' | 'split' | 'custom';
  refreshInterval: number; // in seconds
  timeout: number; // in milliseconds
  fallbackToDefault: boolean;
  enableAnalytics: boolean;
  enableAuditLog: boolean;
  
  // Provider-specific configuration
  providerConfig?: {
    // AWS AppConfig
    awsAppConfig?: {
      applicationId: string;
      environmentId: string;
      configurationProfileId: string;
      region: string;
    };
    
    // LaunchDarkly
    launchDarkly?: {
      sdkKey: string;
      baseUri?: string;
      streamUri?: string;
      eventsUri?: string;
    };
    
    // Split.io
    split?: {
      authorizationKey: string;
      baseUri?: string;
    };
    
    // Custom provider
    custom?: {
      endpoint: string;
      apiKey?: string;
      headers?: Record<string, string>;
    };
  };
}