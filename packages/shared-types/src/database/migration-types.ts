/**
 * Data Migration Types and Interfaces
 * Types for migrating existing data to DynamoDB single-table design
 */

export interface MigrationConfig {
  sourceType: 'sqlite' | 'mysql' | 'postgresql' | 'mongodb' | 'json' | 'csv';
  sourceConnection?: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    connectionString?: string;
    filePath?: string;
  };
  targetTable: string;
  batchSize: number;
  parallelism: number;
  dryRun: boolean;
  validateData: boolean;
  backupBeforeMigration: boolean;
  continueOnError: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface MigrationMapping {
  entityType: string;
  sourceTable?: string;
  sourceQuery?: string;
  keyMapping: {
    pk: string | ((item: any) => string);
    sk: string | ((item: any) => string);
    gsi1pk?: string | ((item: any) => string);
    gsi1sk?: string | ((item: any) => string);
    gsi2pk?: string | ((item: any) => string);
    gsi2sk?: string | ((item: any) => string);
    gsi3pk?: string | ((item: any) => string);
    gsi3sk?: string | ((item: any) => string);
    gsi4pk?: string | ((item: any) => string);
    gsi4sk?: string | ((item: any) => string);
  };
  fieldMapping: Record<string, string | ((item: any) => any)>;
  transformations?: Array<{
    field: string;
    transform: (value: any, item: any) => any;
  }>;
  validation?: Array<{
    field: string;
    validator: (value: any, item: any) => boolean | string;
  }>;
  filters?: Array<{
    field: string;
    condition: (value: any, item: any) => boolean;
  }>;
}

export interface MigrationResult {
  entityType: string;
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  skippedRecords: number;
  errors: MigrationError[];
  duration: number;
  throughput: number;
}

export interface MigrationError {
  recordId?: string;
  record?: any;
  error: string;
  errorType: 'validation' | 'transformation' | 'write' | 'constraint';
  timestamp: Date;
}

export interface MigrationProgress {
  entityType: string;
  phase: 'extracting' | 'transforming' | 'validating' | 'loading' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  currentBatch: number;
  totalBatches: number;
  startTime: Date;
  estimatedCompletion?: Date;
  throughput: number;
  errors: number;
}

export interface DataValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any, item: any) => boolean | string;
}

export interface MigrationPlan {
  name: string;
  description: string;
  version: string;
  dependencies: string[];
  entities: MigrationMapping[];
  validationRules: Record<string, DataValidationRule[]>;
  preHooks?: Array<() => Promise<void>>;
  postHooks?: Array<() => Promise<void>>;
  rollbackPlan?: {
    enabled: boolean;
    backupLocation?: string;
    rollbackSteps: Array<() => Promise<void>>;
  };
}

// Predefined migration mappings for MADMall entities
export const MADMallMigrationMappings: Record<string, MigrationMapping> = {
  users: {
    entityType: 'USER',
    sourceTable: 'users',
    keyMapping: {
      pk: (item: any) => `USER#${item.id}`,
      sk: () => 'PROFILE',
      gsi1pk: (item: any) => `EMAIL#${item.email}`,
      gsi1sk: (item: any) => `USER#${item.id}`,
      gsi4pk: (item: any) => `TENANT#${item.tenantId || 'default'}#USERS`,
      gsi4sk: (item: any) => `CREATED#${item.createdAt || new Date().toISOString()}`,
    },
    fieldMapping: {
      userId: 'id',
      email: 'email',
      'profile.firstName': 'firstName',
      'profile.lastName': 'lastName',
      'profile.bio': 'bio',
      'profile.culturalBackground': (item: any) => item.culturalBackground ? JSON.parse(item.culturalBackground) : [],
      'profile.communicationStyle': 'communicationStyle',
      'profile.diagnosisStage': 'diagnosisStage',
      'profile.supportNeeds': (item: any) => item.supportNeeds ? JSON.parse(item.supportNeeds) : [],
      'profile.joinDate': 'createdAt',
      'profile.lastActive': 'lastActive',
      'preferences.profileVisibility': (item: any) => item.profileVisibility || 'circles_only',
      'preferences.showRealName': (item: any) => item.showRealName !== false,
      'preferences.allowDirectMessages': (item: any) => item.allowDirectMessages !== false,
      'preferences.shareHealthJourney': (item: any) => item.shareHealthJourney !== false,
      'preferences.emailNotifications': (item: any) => item.emailNotifications !== false,
      'preferences.pushNotifications': (item: any) => item.pushNotifications !== false,
      'preferences.weeklyDigest': (item: any) => item.weeklyDigest !== false,
      'preferences.circleNotifications': (item: any) => item.circleNotifications !== false,
      'preferences.contentPreferences': (item: any) => item.contentPreferences ? JSON.parse(item.contentPreferences) : [],
      'preferences.circleInterests': (item: any) => item.circleInterests ? JSON.parse(item.circleInterests) : [],
      'settings.theme': (item: any) => item.theme || 'auto',
      'settings.language': (item: any) => item.language || 'en',
      'settings.timezone': (item: any) => item.timezone || 'UTC',
      primaryGoals: (item: any) => item.primaryGoals ? JSON.parse(item.primaryGoals) : [],
      isVerified: (item: any) => item.isVerified === true,
      isActive: (item: any) => item.isActive !== false,
      entityType: () => 'USER',
      version: () => 1,
    },
    transformations: [
      {
        field: 'createdAt',
        transform: (value: any) => value ? new Date(value).toISOString() : new Date().toISOString(),
      },
      {
        field: 'updatedAt',
        transform: (value: any) => value ? new Date(value).toISOString() : new Date().toISOString(),
      },
    ],
  },

  circles: {
    entityType: 'CIRCLE',
    sourceTable: 'circles',
    keyMapping: {
      pk: (item: any) => `CIRCLE#${item.id}`,
      sk: () => 'METADATA',
      gsi1pk: (item: any) => `CIRCLE_TYPE#${item.type}`,
      gsi1sk: (item: any) => `CREATED#${item.createdAt || new Date().toISOString()}`,
      gsi3pk: (item: any) => `CIRCLE_STATUS#${item.isActive ? 'ACTIVE' : 'INACTIVE'}`,
      gsi3sk: (item: any) => `UPDATED#${item.updatedAt || new Date().toISOString()}`,
      gsi4pk: (item: any) => `TENANT#${item.tenantId || 'default'}#CIRCLES`,
      gsi4sk: (item: any) => `CREATED#${item.createdAt || new Date().toISOString()}`,
    },
    fieldMapping: {
      circleId: 'id',
      name: 'name',
      description: 'description',
      type: 'type',
      privacyLevel: (item: any) => item.privacyLevel || 'public',
      'settings.isPrivate': (item: any) => item.isPrivate === true,
      'settings.requireApproval': (item: any) => item.requireApproval === true,
      'settings.maxMembers': 'maxMembers',
      'settings.culturalFocus': (item: any) => item.culturalFocus ? JSON.parse(item.culturalFocus) : [],
      'settings.allowGuestPosts': (item: any) => item.allowGuestPosts !== false,
      'settings.moderationLevel': (item: any) => item.moderationLevel || 'moderate',
      'settings.contentGuidelines': 'contentGuidelines',
      moderators: (item: any) => item.moderators ? JSON.parse(item.moderators) : [],
      tags: (item: any) => item.tags ? JSON.parse(item.tags) : [],
      coverImage: 'coverImage',
      'stats.memberCount': (item: any) => item.memberCount || 0,
      'stats.activeMembers': (item: any) => item.activeMembers || 0,
      'stats.postsThisWeek': (item: any) => item.postsThisWeek || 0,
      'stats.postsThisMonth': (item: any) => item.postsThisMonth || 0,
      'stats.engagementRate': (item: any) => item.engagementRate || 0,
      'stats.averageResponseTime': (item: any) => item.averageResponseTime || 0,
      createdBy: 'createdBy',
      isActive: (item: any) => item.isActive !== false,
      status: (item: any) => item.isActive ? 'ACTIVE' : 'INACTIVE',
      entityType: () => 'CIRCLE',
      version: () => 1,
    },
  },

  stories: {
    entityType: 'STORY',
    sourceTable: 'stories',
    keyMapping: {
      pk: (item: any) => `STORY#${item.id}`,
      sk: () => 'METADATA',
      gsi1pk: (item: any) => `AUTHOR#${item.authorId}`,
      gsi1sk: (item: any) => `CREATED#${item.createdAt || new Date().toISOString()}`,
      gsi2pk: () => 'STORY_FEED',
      gsi2sk: (item: any) => `CREATED#${item.createdAt || new Date().toISOString()}`,
      gsi3pk: (item: any) => `STORY_STATUS#${item.status || 'PUBLISHED'}`,
      gsi3sk: (item: any) => `CREATED#${item.createdAt || new Date().toISOString()}`,
    },
    fieldMapping: {
      storyId: 'id',
      title: 'title',
      content: 'content',
      excerpt: 'excerpt',
      'author.id': 'authorId',
      'author.displayName': 'authorDisplayName',
      'author.avatar': 'authorAvatar',
      'author.isVerified': (item: any) => item.authorIsVerified === true,
      type: (item: any) => item.type || 'personal_experience',
      status: (item: any) => item.status || 'published',
      themes: (item: any) => item.themes ? JSON.parse(item.themes) : [],
      tags: (item: any) => item.tags ? JSON.parse(item.tags) : [],
      circleId: 'circleId',
      'engagement.likes': (item: any) => item.likes || 0,
      'engagement.comments': (item: any) => item.comments || 0,
      'engagement.shares': (item: any) => item.shares || 0,
      'engagement.saves': (item: any) => item.saves || 0,
      'engagement.views': (item: any) => item.views || 0,
      'engagement.helpfulVotes': (item: any) => item.helpfulVotes || 0,
      'metadata.readTime': (item: any) => item.readTime || 5,
      'metadata.wordCount': (item: any) => item.wordCount || 0,
      'metadata.culturalElements': (item: any) => item.culturalElements ? JSON.parse(item.culturalElements) : [],
      'metadata.therapeuticValue': (item: any) => item.therapeuticValue ? JSON.parse(item.therapeuticValue) : [],
      'metadata.triggerWarnings': (item: any) => item.triggerWarnings ? JSON.parse(item.triggerWarnings) : undefined,
      'metadata.ageAppropriate': (item: any) => item.ageAppropriate !== false,
      moderationStatus: (item: any) => item.moderationStatus || 'approved',
      moderationNotes: 'moderationNotes',
      featuredAt: (item: any) => item.featuredAt ? new Date(item.featuredAt).toISOString() : undefined,
      publishedAt: (item: any) => item.publishedAt ? new Date(item.publishedAt).toISOString() : undefined,
      entityType: () => 'STORY',
      version: () => 1,
    },
  },

  businesses: {
    entityType: 'BUSINESS',
    sourceTable: 'businesses',
    keyMapping: {
      pk: (item: any) => `BUSINESS#${item.id}`,
      sk: () => 'METADATA',
      gsi1pk: (item: any) => `BUSINESS_CATEGORY#${item.category || 'general'}`,
      gsi1sk: (item: any) => `NAME#${item.name}`,
      gsi3pk: (item: any) => `BUSINESS_STATUS#${item.status || 'ACTIVE'}`,
      gsi3sk: (item: any) => `UPDATED#${item.updatedAt || new Date().toISOString()}`,
    },
    fieldMapping: {
      businessId: 'id',
      'profile.name': 'name',
      'profile.description': 'description',
      'profile.mission': 'mission',
      'profile.foundedYear': 'foundedYear',
      'profile.founderStory': 'founderStory',
      'profile.website': 'website',
      'profile.socialMedia': (item: any) => item.socialMedia ? JSON.parse(item.socialMedia) : {},
      'profile.contact.email': 'email',
      'profile.contact.phone': 'phone',
      'profile.logo': 'logo',
      'profile.coverImage': 'coverImage',
      'profile.gallery': (item: any) => item.gallery ? JSON.parse(item.gallery) : [],
      type: (item: any) => item.type || 'wellness_center',
      status: (item: any) => item.status || 'active',
      certifications: (item: any) => item.certifications ? JSON.parse(item.certifications) : [],
      specialties: (item: any) => item.specialties ? JSON.parse(item.specialties) : [],
      servicesOffered: (item: any) => item.servicesOffered ? JSON.parse(item.servicesOffered) : [],
      targetAudience: (item: any) => item.targetAudience ? JSON.parse(item.targetAudience) : [],
      culturalCompetencies: (item: any) => item.culturalCompetencies ? JSON.parse(item.culturalCompetencies) : [],
      'metrics.rating': (item: any) => item.rating || 0,
      'metrics.reviewCount': (item: any) => item.reviewCount || 0,
      'metrics.trustScore': (item: any) => item.trustScore || 0,
      'metrics.responseRate': (item: any) => item.responseRate || 0,
      'metrics.averageResponseTime': (item: any) => item.averageResponseTime || 0,
      'metrics.repeatCustomerRate': (item: any) => item.repeatCustomerRate || 0,
      ownerId: 'ownerId',
      verifiedAt: (item: any) => item.verifiedAt ? new Date(item.verifiedAt).toISOString() : undefined,
      featuredUntil: (item: any) => item.featuredUntil ? new Date(item.featuredUntil).toISOString() : undefined,
      entityType: () => 'BUSINESS',
      version: () => 1,
    },
  },

  resources: {
    entityType: 'RESOURCE',
    sourceTable: 'resources',
    keyMapping: {
      pk: (item: any) => `RESOURCE#${item.id}`,
      sk: () => 'METADATA',
      gsi1pk: (item: any) => `RESOURCE_TYPE#${item.type}`,
      gsi1sk: (item: any) => `CREATED#${item.createdAt || new Date().toISOString()}`,
      gsi2pk: (item: any) => `RESOURCE_CATEGORY#${item.category}`,
      gsi2sk: (item: any) => `TITLE#${item.title}`,
      gsi3pk: (item: any) => `RESOURCE_STATUS#${item.status || 'PUBLISHED'}`,
      gsi3sk: (item: any) => `UPDATED#${item.updatedAt || new Date().toISOString()}`,
      gsi4pk: (item: any) => `TENANT#${item.tenantId || 'default'}#RESOURCES`,
      gsi4sk: (item: any) => `CREATED#${item.createdAt || new Date().toISOString()}`,
    },
    fieldMapping: {
      resourceId: 'id',
      title: 'title',
      description: 'description',
      content: 'content',
      summary: 'summary',
      type: (item: any) => item.type || 'article',
      category: 'category',
      subcategories: (item: any) => item.subcategories ? JSON.parse(item.subcategories) : [],
      status: (item: any) => item.status || 'published',
      'author.id': 'authorId',
      'author.name': 'authorName',
      'author.credentials': (item: any) => item.authorCredentials ? JSON.parse(item.authorCredentials) : [],
      'author.bio': 'authorBio',
      'author.avatar': 'authorAvatar',
      'author.isVerified': (item: any) => item.authorIsVerified === true,
      'author.specialties': (item: any) => item.authorSpecialties ? JSON.parse(item.authorSpecialties) : [],
      'metadata.readTime': (item: any) => item.readTime || 5,
      'metadata.difficulty': (item: any) => item.difficulty || 'beginner',
      'metadata.prerequisites': (item: any) => item.prerequisites ? JSON.parse(item.prerequisites) : [],
      'metadata.learningObjectives': (item: any) => item.learningObjectives ? JSON.parse(item.learningObjectives) : [],
      'metadata.culturalConsiderations': (item: any) => item.culturalConsiderations ? JSON.parse(item.culturalConsiderations) : [],
      'metadata.therapeuticValue': (item: any) => item.therapeuticValue ? JSON.parse(item.therapeuticValue) : [],
      'metadata.evidenceBased': (item: any) => item.evidenceBased === true,
      'engagement.views': (item: any) => item.views || 0,
      'engagement.likes': (item: any) => item.likes || 0,
      'engagement.saves': (item: any) => item.saves || 0,
      'engagement.shares': (item: any) => item.shares || 0,
      'engagement.helpfulVotes': (item: any) => item.helpfulVotes || 0,
      'engagement.averageRating': (item: any) => item.averageRating || 0,
      'engagement.ratingCount': (item: any) => item.ratingCount || 0,
      tags: (item: any) => item.tags ? JSON.parse(item.tags) : [],
      relatedResources: (item: any) => item.relatedResources ? JSON.parse(item.relatedResources) : [],
      externalUrl: 'externalUrl',
      downloadUrl: 'downloadUrl',
      thumbnailUrl: 'thumbnailUrl',
      isPublic: (item: any) => item.isPublic !== false,
      isPremium: (item: any) => item.isPremium === true,
      publishedAt: (item: any) => item.publishedAt ? new Date(item.publishedAt).toISOString() : undefined,
      entityType: () => 'RESOURCE',
      version: () => 1,
    },
  },
};