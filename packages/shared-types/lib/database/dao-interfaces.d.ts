/**
 * Data Access Object Interfaces
 * Generic DAO patterns for DynamoDB operations
 */
export interface QueryOptions {
    limit?: number;
    exclusiveStartKey?: Record<string, any>;
    scanIndexForward?: boolean;
    consistentRead?: boolean;
    projectionExpression?: string;
    filterExpression?: string;
    expressionAttributeNames?: Record<string, string>;
    expressionAttributeValues?: Record<string, any>;
}
export interface QueryResult<T> {
    items: T[];
    lastEvaluatedKey?: Record<string, any>;
    count: number;
    scannedCount?: number;
}
export interface BatchGetOptions {
    consistentRead?: boolean;
    projectionExpression?: string;
    expressionAttributeNames?: Record<string, string>;
}
export interface BatchWriteOptions {
    returnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE';
    returnItemCollectionMetrics?: 'SIZE' | 'NONE';
}
export interface UpdateOptions {
    updateExpression: string;
    expressionAttributeNames?: Record<string, string>;
    expressionAttributeValues?: Record<string, any>;
    conditionExpression?: string;
    returnValues?: 'NONE' | 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW';
}
export interface DeleteOptions {
    conditionExpression?: string;
    expressionAttributeNames?: Record<string, string>;
    expressionAttributeValues?: Record<string, any>;
    returnValues?: 'NONE' | 'ALL_OLD';
}
export interface TransactionItem {
    operation: 'put' | 'update' | 'delete' | 'conditionCheck';
    item?: any;
    key?: Record<string, any>;
    updateExpression?: string;
    conditionExpression?: string;
    expressionAttributeNames?: Record<string, string>;
    expressionAttributeValues?: Record<string, any>;
}
export interface BaseDAO<T> {
    /**
     * Create a new item
     */
    create(item: Omit<T, 'createdAt' | 'updatedAt' | 'version'>): Promise<T>;
    /**
     * Get item by primary key
     */
    getById(pk: string, sk: string, options?: QueryOptions): Promise<T | null>;
    /**
     * Update an existing item
     */
    update(pk: string, sk: string, updates: Partial<T>, options?: UpdateOptions): Promise<T>;
    /**
     * Delete an item
     */
    delete(pk: string, sk: string, options?: DeleteOptions): Promise<void>;
    /**
     * Query items with partition key
     */
    query(pk: string, options?: QueryOptions): Promise<QueryResult<T>>;
    /**
     * Query items using GSI
     */
    queryGSI(indexName: string, pk: string, sk?: string, options?: QueryOptions): Promise<QueryResult<T>>;
    /**
     * Batch get multiple items
     */
    batchGet(keys: Array<{
        pk: string;
        sk: string;
    }>, options?: BatchGetOptions): Promise<T[]>;
    /**
     * Batch write multiple items
     */
    batchWrite(items: T[], options?: BatchWriteOptions): Promise<void>;
    /**
     * Execute transaction
     */
    transaction(items: TransactionItem[]): Promise<void>;
    /**
     * Check if item exists
     */
    exists(pk: string, sk: string): Promise<boolean>;
    /**
     * Get item count for partition
     */
    count(pk: string, options?: QueryOptions): Promise<number>;
}
export interface UserDAO extends BaseDAO<import('./base-entity').DynamoDBUser> {
    /**
     * Get user by email address
     */
    getByEmail(email: string): Promise<import('./base-entity').DynamoDBUser | null>;
    /**
     * Get user's circles
     */
    getUserCircles(userId: string, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBCircleMember>>;
    /**
     * Search users by criteria
     */
    searchUsers(criteria: {
        culturalBackground?: string[];
        diagnosisStage?: string;
        supportNeeds?: string[];
        location?: {
            city?: string;
            state?: string;
            country?: string;
        };
    }, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBUser>>;
    /**
     * Get users by tenant
     */
    getUsersByTenant(tenantId: string, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBUser>>;
    /**
     * Update user activity timestamp
     */
    updateLastActive(userId: string): Promise<void>;
    /**
     * Increment user stats
     */
    incrementStats(userId: string, stats: Partial<{
        storiesShared: number;
        circlesJoined: number;
        commentsPosted: number;
        helpfulVotes: number;
        daysActive: number;
        streakDays: number;
    }>): Promise<void>;
}
export interface CircleDAO extends BaseDAO<import('./base-entity').DynamoDBCircle> {
    /**
     * Get circles by type
     */
    getByType(type: string, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBCircle>>;
    /**
     * Get circle members
     */
    getMembers(circleId: string, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBCircleMember>>;
    /**
     * Add member to circle
     */
    addMember(circleId: string, userId: string, role?: string): Promise<import('./base-entity').DynamoDBCircleMember>;
    /**
     * Remove member from circle
     */
    removeMember(circleId: string, userId: string): Promise<void>;
    /**
     * Update member role
     */
    updateMemberRole(circleId: string, userId: string, role: string): Promise<void>;
    /**
     * Get active circles
     */
    getActiveCircles(options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBCircle>>;
    /**
     * Search circles
     */
    searchCircles(criteria: {
        type?: string;
        culturalFocus?: string[];
        tags?: string[];
        isPrivate?: boolean;
    }, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBCircle>>;
    /**
     * Update circle stats
     */
    updateStats(circleId: string, stats: Partial<{
        memberCount: number;
        activeMembers: number;
        postsThisWeek: number;
        postsThisMonth: number;
        engagementRate: number;
        averageResponseTime: number;
    }>): Promise<void>;
}
export interface StoryDAO extends BaseDAO<import('./base-entity').DynamoDBStory> {
    /**
     * Get stories for feed
     */
    getFeedStories(options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBStory>>;
    /**
     * Get stories by author
     */
    getByAuthor(authorId: string, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBStory>>;
    /**
     * Get stories by circle
     */
    getByCircle(circleId: string, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBStory>>;
    /**
     * Get published stories
     */
    getPublishedStories(options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBStory>>;
    /**
     * Search stories
     */
    searchStories(criteria: {
        type?: string;
        themes?: string[];
        tags?: string[];
        culturalElements?: string[];
    }, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBStory>>;
    /**
     * Update story engagement
     */
    updateEngagement(storyId: string, engagement: Partial<{
        likes: number;
        comments: number;
        shares: number;
        saves: number;
        views: number;
        helpfulVotes: number;
    }>): Promise<void>;
    /**
     * Get featured stories
     */
    getFeaturedStories(options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBStory>>;
}
export interface BusinessDAO extends BaseDAO<import('./base-entity').DynamoDBBusiness> {
    /**
     * Get businesses by category
     */
    getByCategory(category: string, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBBusiness>>;
    /**
     * Get businesses by owner
     */
    getByOwner(ownerId: string, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBBusiness>>;
    /**
     * Search businesses
     */
    searchBusinesses(criteria: {
        type?: string;
        certifications?: string[];
        specialties?: string[];
        culturalCompetencies?: string[];
        location?: {
            city?: string;
            state?: string;
            country?: string;
        };
    }, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBBusiness>>;
    /**
     * Get verified businesses
     */
    getVerifiedBusinesses(options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBBusiness>>;
    /**
     * Get featured businesses
     */
    getFeaturedBusinesses(options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBBusiness>>;
    /**
     * Update business metrics
     */
    updateMetrics(businessId: string, metrics: Partial<{
        rating: number;
        reviewCount: number;
        trustScore: number;
        responseRate: number;
        averageResponseTime: number;
        repeatCustomerRate: number;
    }>): Promise<void>;
}
export interface ResourceDAO extends BaseDAO<import('./base-entity').DynamoDBResource> {
    /**
     * Get resources by type
     */
    getByType(type: string, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBResource>>;
    /**
     * Get resources by category
     */
    getByCategory(category: string, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBResource>>;
    /**
     * Get resources by author
     */
    getByAuthor(authorId: string, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBResource>>;
    /**
     * Search resources
     */
    searchResources(criteria: {
        type?: string;
        category?: string;
        difficulty?: string;
        tags?: string[];
        culturalConsiderations?: string[];
        therapeuticValue?: string[];
        evidenceBased?: boolean;
    }, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBResource>>;
    /**
     * Get published resources
     */
    getPublishedResources(options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBResource>>;
    /**
     * Get featured resources
     */
    getFeaturedResources(options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBResource>>;
    /**
     * Update resource engagement
     */
    updateEngagement(resourceId: string, engagement: Partial<{
        views: number;
        likes: number;
        saves: number;
        shares: number;
        helpfulVotes: number;
        completions?: number;
        averageRating: number;
        ratingCount: number;
    }>): Promise<void>;
    /**
     * Get resources by tenant
     */
    getResourcesByTenant(tenantId: string, options?: QueryOptions): Promise<QueryResult<import('./base-entity').DynamoDBResource>>;
}
//# sourceMappingURL=dao-interfaces.d.ts.map