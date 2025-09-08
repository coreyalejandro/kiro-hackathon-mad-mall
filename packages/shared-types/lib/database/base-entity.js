/**
 * Base Entity Types for DynamoDB Single-Table Design
 */
// Key generation utilities
export const KeyPatterns = {
    // User patterns
    USER_PROFILE: (userId) => ({ PK: `USER#${userId}`, SK: 'PROFILE' }),
    USER_BY_EMAIL: (email, userId) => ({ GSI1PK: `EMAIL#${email}`, GSI1SK: `USER#${userId}` }),
    USER_CIRCLES: (userId) => ({ PK: `USER#${userId}`, SK: { beginsWith: 'CIRCLE#' } }),
    // Circle patterns
    CIRCLE_METADATA: (circleId) => ({ PK: `CIRCLE#${circleId}`, SK: 'METADATA' }),
    CIRCLE_MEMBER: (circleId, userId) => ({ PK: `CIRCLE#${circleId}`, SK: `MEMBER#${userId}` }),
    CIRCLES_BY_TYPE: (type) => ({ GSI1PK: `CIRCLE_TYPE#${type}` }),
    // Story patterns
    STORY_METADATA: (storyId) => ({ PK: `STORY#${storyId}`, SK: 'METADATA' }),
    STORY_COMMENT: (storyId, commentId) => ({ PK: `STORY#${storyId}`, SK: `COMMENT#${commentId}` }),
    STORY_FEED: () => ({ GSI2PK: 'STORY_FEED' }),
    // Business patterns
    BUSINESS_METADATA: (businessId) => ({ PK: `BUSINESS#${businessId}`, SK: 'METADATA' }),
    BUSINESSES_BY_CATEGORY: (category) => ({ GSI1PK: `BUSINESS_CATEGORY#${category}` }),
    // Resource patterns
    RESOURCE_METADATA: (resourceId) => ({ PK: `RESOURCE#${resourceId}`, SK: 'METADATA' }),
    RESOURCES_BY_TYPE: (type) => ({ GSI1PK: `RESOURCE_TYPE#${type}` }),
    RESOURCES_BY_CATEGORY: (category) => ({ GSI2PK: `RESOURCE_CATEGORY#${category}` }),
    // Tenant patterns (multi-tenancy)
    TENANT_USERS: (tenantId) => ({ GSI4PK: `TENANT#${tenantId}#USERS` }),
    TENANT_CIRCLES: (tenantId) => ({ GSI4PK: `TENANT#${tenantId}#CIRCLES` }),
    TENANT_RESOURCES: (tenantId) => ({ GSI4PK: `TENANT#${tenantId}#RESOURCES` }),
};
