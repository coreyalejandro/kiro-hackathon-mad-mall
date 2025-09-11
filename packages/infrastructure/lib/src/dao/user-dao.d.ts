/**
 * User DAO Implementation
 * Data access operations for User entities
 */
import { BaseDynamoDAO } from './base-dao';
import { UserDAO, QueryOptions, QueryResult } from '@madmall/shared-types/database';
import { DynamoDBUser, DynamoDBCircleMember } from '@madmall/shared-types/database';
import { ValidationResult } from '@madmall/shared-types/database';
import { DynamoDBService } from '../services/dynamodb-service';
export declare class UserDynamoDAO extends BaseDynamoDAO<DynamoDBUser> implements UserDAO {
    constructor(dynamoService: DynamoDBService);
    /**
     * Entity-specific validation for users
     */
    protected validateEntitySpecific(entity: DynamoDBUser): ValidationResult;
    /**
     * Get user by email address using GSI1
     */
    getByEmail(email: string): Promise<DynamoDBUser | null>;
    /**
     * Get user's circles using the user partition
     */
    getUserCircles(userId: string, options?: QueryOptions): Promise<QueryResult<DynamoDBCircleMember>>;
    /**
     * Search users by criteria using filters
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
    }, options?: QueryOptions): Promise<QueryResult<DynamoDBUser>>;
    /**
     * Get users by tenant using GSI4
     */
    getUsersByTenant(tenantId: string, options?: QueryOptions): Promise<QueryResult<DynamoDBUser>>;
    /**
     * Update user's last active timestamp
     */
    updateLastActive(userId: string): Promise<void>;
    /**
     * Increment user statistics
     */
    incrementStats(userId: string, stats: Partial<{
        storiesShared: number;
        circlesJoined: number;
        commentsPosted: number;
        helpfulVotes: number;
        daysActive: number;
        streakDays: number;
    }>): Promise<void>;
    /**
     * Create user with proper key generation
     */
    create(item: Omit<DynamoDBUser, 'createdAt' | 'updatedAt' | 'version'>): Promise<DynamoDBUser>;
    /**
     * Get user by ID (convenience method)
     */
    getUserById(userId: string): Promise<DynamoDBUser | null>;
    /**
     * Update user profile
     */
    updateProfile(userId: string, profileUpdates: Partial<DynamoDBUser['profile']>): Promise<DynamoDBUser>;
    /**
     * Update user preferences
     */
    updatePreferences(userId: string, preferencesUpdates: Partial<DynamoDBUser['preferences']>): Promise<DynamoDBUser>;
}
