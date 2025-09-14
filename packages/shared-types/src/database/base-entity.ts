/**
 * Base Entity Types for DynamoDB Single-Table Design
 */

export interface BaseEntity {
  PK: string;           // Partition Key
  SK: string;           // Sort Key
  GSI1PK?: string;      // Global Secondary Index 1 Partition Key
  GSI1SK?: string;      // Global Secondary Index 1 Sort Key
  GSI2PK?: string;      // Global Secondary Index 2 Partition Key
  GSI2SK?: string;      // Global Secondary Index 2 Sort Key
  GSI3PK?: string;      // Global Secondary Index 3 Partition Key
  GSI3SK?: string;      // Global Secondary Index 3 Sort Key
  GSI4PK?: string;      // Global Secondary Index 4 Partition Key (tenant-based)
  GSI4SK?: string;      // Global Secondary Index 4 Sort Key
  entityType: string;   // Entity type identifier
  version: number;      // Optimistic locking version
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
  ttl?: number;         // TTL for temporary data (Unix timestamp)
}

export interface EntityMetadata {
  entityType: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  tenantId?: string;
}

export interface DynamoDBUser extends BaseEntity {
  // Primary access: PK = USER#{userId}, SK = PROFILE
  // Email lookup: GSI1PK = EMAIL#{email}, GSI1SK = USER#{userId}
  // Tenant access: GSI4PK = TENANT#{tenantId}#USERS, GSI4SK = CREATED#{createdAt}
  
  userId: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    bio?: string;
    culturalBackground: string[];
    communicationStyle: string;
    diagnosisStage: string;
    supportNeeds: string[];
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
    joinDate: string;
    lastActive: string;
  };
  preferences: {
    profileVisibility: string;
    showRealName: boolean;
    allowDirectMessages: boolean;
    shareHealthJourney: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyDigest: boolean;
    circleNotifications: boolean;
    contentPreferences: string[];
    circleInterests: string[];
  };
  settings: {
    theme: string;
    language: string;
    timezone: string;
    accessibility: {
      highContrast: boolean;
      largeText: boolean;
      screenReader: boolean;
      reducedMotion: boolean;
    };
  };
  primaryGoals: string[];
  isVerified: boolean;
  isActive: boolean;
  stats?: {
    storiesShared: number;
    circlesJoined: number;
    commentsPosted: number;
    helpfulVotes: number;
    daysActive: number;
    streakDays: number;
  };
}

export interface DynamoDBCircle extends BaseEntity {
  // Primary access: PK = CIRCLE#{circleId}, SK = METADATA
  // Type lookup: GSI1PK = CIRCLE_TYPE#{type}, GSI1SK = CREATED#{createdAt}
  // Status lookup: GSI3PK = CIRCLE_STATUS#{status}, GSI3SK = UPDATED#{updatedAt}
  // Tenant access: GSI4PK = TENANT#{tenantId}#CIRCLES, GSI4SK = CREATED#{createdAt}
  
  circleId: string;
  name: string;
  description: string;
  type: string;
  privacyLevel: string;
  settings: {
    isPrivate: boolean;
    requireApproval: boolean;
    maxMembers?: number;
    culturalFocus?: string[];
    allowGuestPosts: boolean;
    moderationLevel: string;
    contentGuidelines?: string;
    meetingSchedule?: {
      frequency: string;
      dayOfWeek?: number;
      time?: string;
      timezone?: string;
    };
  };
  moderators: string[];
  tags: string[];
  coverImage?: string;
  stats: {
    memberCount: number;
    activeMembers: number;
    postsThisWeek: number;
    postsThisMonth: number;
    engagementRate: number;
    averageResponseTime: number;
  };
  createdBy: string;
  isActive: boolean;
  status: string;
}

export interface DynamoDBCircleMember extends BaseEntity {
  // Primary access: PK = CIRCLE#{circleId}, SK = MEMBER#{userId}
  // User circles: PK = USER#{userId}, SK = CIRCLE#{circleId}
  // Status lookup: GSI3PK = MEMBER_STATUS#{status}, GSI3SK = JOINED#{joinedAt}
  
  circleId: string;
  userId: string;
  role: string;
  status: string;
  joinedAt: string;
  lastActive: string;
  contributionScore: number;
  badges: string[];
  notes?: string;
}

export interface DynamoDBStory extends BaseEntity {
  // Primary access: PK = STORY#{storyId}, SK = METADATA
  // Feed access: GSI2PK = STORY_FEED, GSI2SK = CREATED#{createdAt}
  // Status lookup: GSI3PK = STORY_STATUS#{status}, GSI3SK = CREATED#{createdAt}
  // Author stories: GSI1PK = AUTHOR#{authorId}, GSI1SK = CREATED#{createdAt}
  
  storyId: string;
  title: string;
  content: string;
  excerpt?: string;
  author: {
    id: string;
    displayName: string;
    avatar?: string;
    isVerified: boolean;
  };
  type: string;
  status: string;
  themes: string[];
  tags: string[];
  circleId?: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    views: number;
    helpfulVotes: number;
  };
  metadata: {
    readTime: number;
    wordCount: number;
    culturalElements: string[];
    therapeuticValue: string[];
    triggerWarnings?: string[];
    ageAppropriate: boolean;
  };
  moderationStatus: string;
  moderationNotes?: string;
  featuredAt?: string;
  publishedAt?: string;
}

export interface DynamoDBBusiness extends BaseEntity {
  // Primary access: PK = BUSINESS#{businessId}, SK = METADATA
  // Category lookup: GSI1PK = BUSINESS_CATEGORY#{category}, GSI1SK = NAME#{name}
  // Status lookup: GSI3PK = BUSINESS_STATUS#{status}, GSI3SK = UPDATED#{updatedAt}
  
  businessId: string;
  profile: {
    name: string;
    description: string;
    mission?: string;
    foundedYear?: number;
    founderStory?: string;
    website?: string;
    socialMedia: Record<string, string>;
    contact: {
      email: string;
      phone?: string;
      address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
    };
    logo?: string;
    coverImage?: string;
    gallery: string[];
  };
  type: string;
  status: string;
  certifications: string[];
  specialties: string[];
  servicesOffered: string[];
  targetAudience: string[];
  culturalCompetencies: string[];
  metrics: {
    rating: number;
    reviewCount: number;
    trustScore: number;
    responseRate: number;
    averageResponseTime: number;
    repeatCustomerRate: number;
  };
  ownerId: string;
  verifiedAt?: string;
  featuredUntil?: string;
}

export interface DynamoDBResource extends BaseEntity {
  // Primary access: PK = RESOURCE#{resourceId}, SK = METADATA
  // Type lookup: GSI1PK = RESOURCE_TYPE#{type}, GSI1SK = CREATED#{createdAt}
  // Category lookup: GSI2PK = RESOURCE_CATEGORY#{category}, GSI2SK = TITLE#{title}
  // Status lookup: GSI3PK = RESOURCE_STATUS#{status}, GSI3SK = UPDATED#{updatedAt}
  
  resourceId: string;
  title: string;
  description: string;
  content?: string;
  summary: string;
  type: string;
  category: string;
  subcategories: string[];
  status: string;
  author: {
    id: string;
    name: string;
    credentials?: string[];
    bio?: string;
    avatar?: string;
    isVerified: boolean;
    specialties: string[];
  };
  contributors?: Array<{
    id: string;
    name: string;
    credentials?: string[];
    bio?: string;
    avatar?: string;
    isVerified: boolean;
    specialties: string[];
  }>;
  metadata: {
    readTime?: number;
    watchTime?: number;
    listenTime?: number;
    difficulty: string;
    prerequisites?: string[];
    learningObjectives: string[];
    culturalConsiderations: string[];
    therapeuticValue: string[];
    evidenceBased: boolean;
    lastReviewed?: string;
    reviewedBy?: string;
  };
  engagement: {
    views: number;
    likes: number;
    saves: number;
    shares: number;
    helpfulVotes: number;
    completions?: number;
    averageRating: number;
    ratingCount: number;
  };
  tags: string[];
  relatedResources: string[];
  externalUrl?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  isPublic: boolean;
  isPremium: boolean;
  price?: {
    amount: number;
    currency: string;
  };
  publishedAt?: string;
}

/**
 * Image and Cultural Systems Entities (Feedback, Incidents, Advisory, Premium Sources, Personalization)
 */

export interface DynamoDBImageAsset extends BaseEntity {
  // Primary access: PK = IMAGE#{imageId}, SK = METADATA
  // By status: GSI3PK = IMAGE_STATUS#{status}, GSI3SK = UPDATED#{updatedAt}
  // By category: GSI1PK = IMAGE_CATEGORY#{category}, GSI1SK = CREATED#{createdAt}

  imageId: string;
  url: string;
  thumbnailUrl?: string;
  altText: string;
  category: string; // e.g., hero, circle_cover, resource_thumb
  tags: string[];
  source: 'generated' | 'premium' | 'user_upload' | 'stock';
  sourceInfo?: {
    provider?: string; // e.g., CreateHER, Nappy
    licenseType?: string; // e.g., royalty_free, editorial, custom
    licenseId?: string;
    attribution?: string;
    expiresAt?: string;
    originalUrl?: string;
  };
  status: 'active' | 'archived' | 'flagged' | 'removed' | 'pending_review';
  validation?: {
    culturalScore: number; // 0-1
    sensitivityScore: number; // 0-1
    inclusivityScore: number; // 0-1
    lastValidatedAt?: string;
    validator?: string; // agent id or user id
    issues?: string[];
  };
  usage?: {
    contexts: string[]; // e.g., ['concourse.hero', 'circles.page']
    lastUsedAt?: string;
    totalImpressions?: number;
    totalClicks?: number;
  };
}

export interface DynamoDBFeedback extends BaseEntity {
  // Primary access: PK = FEEDBACK#IMAGE#{imageId}, SK = USER#{userId}#TS#{timestamp}
  // By image aggregate: GSI1PK = IMAGE#${imageId}#FEEDBACK, GSI1SK = TS#${timestamp}
  // By severity/report: GSI3PK = FEEDBACK_SEVERITY#{severity}, GSI3SK = CREATED#${createdAt}

  feedbackId: string;
  imageId: string;
  userId: string;
  rating: number; // 1-5 cultural sensitivity rating
  comment?: string;
  categories: Array<'representation' | 'appropriateness' | 'stereotype' | 'context_mismatch' | 'other'>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  isReport: boolean;
  status: 'new' | 'acknowledged' | 'in_review' | 'resolved' | 'dismissed';
  resolution?: {
    resolvedBy?: string;
    resolvedAt?: string;
    action?: 'removed' | 'replaced' | 'edited' | 'no_action';
    notes?: string;
  };
  metadata?: Record<string, any>;
}

export interface DynamoDBIncident extends BaseEntity {
  // Primary access: PK = INCIDENT#{incidentId}, SK = METADATA
  // By status/priority: GSI3PK = INCIDENT_STATUS#{status}, GSI3SK = PRIORITY#{priority}#CREATED#{createdAt}

  incidentId: string;
  relatedImageId?: string;
  triggeredBy: 'community_report' | 'automated_detection' | 'staff' | 'advisory_board';
  status: 'open' | 'investigating' | 'mitigated' | 'closed';
  priority: 'p1' | 'p2' | 'p3';
  summary: string;
  details?: string;
  escalation?: {
    level: 0 | 1 | 2 | 3;
    onCallNotifiedAt?: string;
    advisoryBoardNotifiedAt?: string;
    commsSentAt?: string;
  };
  alerts?: Array<{ type: string; sentAt: string; channel: 'email' | 'slack' | 'sms' | 'webhook'; }>; 
}

export interface DynamoDBAdvisoryReview extends BaseEntity {
  // Primary access: PK = ADVISORY#QUEUE, SK = REVIEW#{reviewId}
  // By item: GSI1PK = REVIEW_TARGET#${targetType}#${targetId}, GSI1SK = CREATED#${createdAt}
  // By status: GSI3PK = REVIEW_STATUS#${status}, GSI3SK = UPDATED#${updatedAt}

  reviewId: string;
  targetType: 'image' | 'resource' | 'story';
  targetId: string;
  submittedBy: string; // userId or system
  assignedTo?: string; // advisory member userId
  status: 'queued' | 'in_review' | 'approved' | 'changes_requested' | 'rejected';
  notes?: string;
  decisions?: Array<{
    reviewerId: string;
    decision: 'approve' | 'request_changes' | 'reject';
    rationale: string;
    decidedAt: string;
  }>;
  consensus?: {
    score: number; // 0-1 agreement among reviewers
    requiredVotes: number;
    receivedVotes: number;
  };
}

export interface DynamoDBPremiumSource extends BaseEntity {
  // Primary access: PK = PREMIUM_SOURCE#{sourceId}, SK = METADATA
  // By provider: GSI1PK = PROVIDER#${provider}, GSI1SK = CREATED#${createdAt}

  sourceId: string;
  provider: 'createher' | 'nappy' | 'other';
  displayName: string;
  apiBaseUrl?: string;
  apiKeyArn?: string; // reference to secret manager
  licenseDefaults: {
    licenseType: string;
    attributionTemplate?: string;
    usageRestrictions?: string[];
  };
  status: 'active' | 'inactive';
  qualityThreshold?: number; // 0-1 minimum validation score
}

export interface DynamoDBPersonalizationProfile extends BaseEntity {
  // Primary access: PK = USER#${userId}, SK = PERSONALIZATION
  // By cohort: GSI1PK = COHORT#${cohortId}, GSI1SK = UPDATED#${updatedAt}

  userId: string;
  preferences: {
    imageStyles?: string[]; // e.g., documentary, studio, candid
    avoidTags?: string[];
    preferredContexts?: string[]; // page contexts user engages with
  };
  engagement: {
    impressions: number;
    clicks: number;
    dwellTimeMs?: number;
    lastInteractionAt?: string;
  };
  abTests?: Array<{
    experimentId: string;
    variant: 'A' | 'B' | 'C';
    startedAt: string;
    endedAt?: string;
    metrics?: Record<string, number>;
  }>;
  cohorts?: string[];
}

// Key generation utilities
export const KeyPatterns = {
  // User patterns
  USER_PROFILE: (userId: string) => ({ PK: `USER#${userId}`, SK: 'PROFILE' }),
  USER_BY_EMAIL: (email: string, userId: string) => ({ GSI1PK: `EMAIL#${email}`, GSI1SK: `USER#${userId}` }),
  USER_CIRCLES: (userId: string) => ({ PK: `USER#${userId}`, SK: { beginsWith: 'CIRCLE#' } }),
  
  // Circle patterns
  CIRCLE_METADATA: (circleId: string) => ({ PK: `CIRCLE#${circleId}`, SK: 'METADATA' }),
  CIRCLE_MEMBER: (circleId: string, userId: string) => ({ PK: `CIRCLE#${circleId}`, SK: `MEMBER#${userId}` }),
  CIRCLES_BY_TYPE: (type: string) => ({ GSI1PK: `CIRCLE_TYPE#${type}` }),
  
  // Story patterns
  STORY_METADATA: (storyId: string) => ({ PK: `STORY#${storyId}`, SK: 'METADATA' }),
  STORY_COMMENT: (storyId: string, commentId: string) => ({ PK: `STORY#${storyId}`, SK: `COMMENT#${commentId}` }),
  STORY_FEED: () => ({ GSI2PK: 'STORY_FEED' }),
  
  // Business patterns
  BUSINESS_METADATA: (businessId: string) => ({ PK: `BUSINESS#${businessId}`, SK: 'METADATA' }),
  BUSINESSES_BY_CATEGORY: (category: string) => ({ GSI1PK: `BUSINESS_CATEGORY#${category}` }),
  
  // Resource patterns
  RESOURCE_METADATA: (resourceId: string) => ({ PK: `RESOURCE#${resourceId}`, SK: 'METADATA' }),
  RESOURCES_BY_TYPE: (type: string) => ({ GSI1PK: `RESOURCE_TYPE#${type}` }),
  RESOURCES_BY_CATEGORY: (category: string) => ({ GSI2PK: `RESOURCE_CATEGORY#${category}` }),
  
  // Tenant patterns (multi-tenancy)
  TENANT_USERS: (tenantId: string) => ({ GSI4PK: `TENANT#${tenantId}#USERS` }),
  TENANT_CIRCLES: (tenantId: string) => ({ GSI4PK: `TENANT#${tenantId}#CIRCLES` }),
  TENANT_RESOURCES: (tenantId: string) => ({ GSI4PK: `TENANT#${tenantId}#RESOURCES` }),
  
  // Image and cultural systems
  IMAGE_METADATA: (imageId: string) => ({ PK: `IMAGE#${imageId}`, SK: 'METADATA' }),
  IMAGES_BY_CATEGORY: (category: string) => ({ GSI1PK: `IMAGE_CATEGORY#${category}` }),
  IMAGE_STATUS: (status: string) => ({ GSI3PK: `IMAGE_STATUS#${status}` }),

  FEEDBACK_FOR_IMAGE: (imageId: string, userId: string, timestampIso: string) => ({
    PK: `FEEDBACK#IMAGE#${imageId}`,
    SK: `USER#${userId}#TS#${timestampIso}`,
    GSI1PK: `IMAGE#${imageId}#FEEDBACK`,
    GSI1SK: `TS#${timestampIso}`,
  }),
  FEEDBACK_BY_SEVERITY: (severity: string) => ({ GSI3PK: `FEEDBACK_SEVERITY#${severity}` }),

  INCIDENT_METADATA: (incidentId: string) => ({ PK: `INCIDENT#${incidentId}`, SK: 'METADATA' }),
  INCIDENT_STATUS: (status: string) => ({ GSI3PK: `INCIDENT_STATUS#${status}` }),

  ADVISORY_QUEUE: (reviewId: string) => ({ PK: 'ADVISORY#QUEUE', SK: `REVIEW#${reviewId}` }),
  ADVISORY_BY_TARGET: (targetType: string, targetId: string) => ({ GSI1PK: `REVIEW_TARGET#${targetType}#${targetId}` }),
  ADVISORY_BY_STATUS: (status: string) => ({ GSI3PK: `REVIEW_STATUS#${status}` }),

  PREMIUM_SOURCE_METADATA: (sourceId: string) => ({ PK: `PREMIUM_SOURCE#${sourceId}`, SK: 'METADATA' }),
  PREMIUM_BY_PROVIDER: (provider: string) => ({ GSI1PK: `PROVIDER#${provider}` }),

  PERSONALIZATION_PROFILE: (userId: string) => ({ PK: `USER#${userId}`, SK: 'PERSONALIZATION' }),
  PERSONALIZATION_BY_COHORT: (cohortId: string) => ({ GSI1PK: `COHORT#${cohortId}` }),
} as const;