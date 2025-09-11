/**
 * Circle DAO Implementation
 * Data access operations for Circle entities
 */
import { BaseDynamoDAO } from './base-dao';
import { CircleDAO, QueryOptions, QueryResult } from '@madmall/shared-types/database';
import { DynamoDBCircle, DynamoDBCircleMember } from '@madmall/shared-types/database';
import { ValidationResult } from '@madmall/shared-types/database';
import { DynamoDBService } from '../services/dynamodb-service';
export declare class CircleDynamoDAO extends BaseDynamoDAO<DynamoDBCircle> implements CircleDAO {
    constructor(dynamoService: DynamoDBService);
    /**
     * Entity-specific validation for circles
     */
    protected validateEntitySpecific(entity: DynamoDBCircle): ValidationResult;
    /**
     * Get circles by type using GSI1
     */
    getByType(type: string, options?: QueryOptions): Promise<QueryResult<DynamoDBCircle>>;
    /**
     * Get circle members
     */
    getMembers(circleId: string, options?: QueryOptions): Promise<QueryResult<DynamoDBCircleMember>>;
    /**
     * Add member to circle
     */
    addMember(circleId: string, userId: string, role?: string): Promise<DynamoDBCircleMember>;
    /**
     * Remove member from circle
     */
    removeMember(circleId: string, userId: string): Promise<void>;
    /**
     * Update member role
     */
    updateMemberRole(circleId: string, userId: string, role: string): Promise<void>;
    /**
     * Get active circles using GSI3
     */
    getActiveCircles(options?: QueryOptions): Promise<QueryResult<DynamoDBCircle>>;
    /**
     * Search circles by criteria
     */
    searchCircles(criteria: {
        type?: string;
        culturalFocus?: string[];
        tags?: string[];
        isPrivate?: boolean;
    }, options?: QueryOptions): Promise<QueryResult<DynamoDBCircle>>;
    /**
     * Update circle statistics
     */
    updateStats(circleId: string, stats: Partial<{
        memberCount: number;
        activeMembers: number;
        postsThisWeek: number;
        postsThisMonth: number;
        engagementRate: number;
        averageResponseTime: number;
    }>): Promise<void>;
    /**
     * Create circle with proper key generation
     */
    create(item: Omit<DynamoDBCircle, 'createdAt' | 'updatedAt' | 'version'>): Promise<DynamoDBCircle>;
    /**
     * Get circle by ID (convenience method)
     */
    getCircleById(circleId: string): Promise<DynamoDBCircle | null>;
    /**
     * Update circle settings
     */
    updateSettings(circleId: string, settingsUpdates: Partial<DynamoDBCircle['settings']>): Promise<DynamoDBCircle>;
    /**
     * Get member by circle and user ID
     */
    getMember(circleId: string, userId: string): Promise<DynamoDBCircleMember | null>;
    /**
     * Check if user is member of circle
     */
    isMember(circleId: string, userId: string): Promise<boolean>;
    /**
     * Get circles by member status using GSI3
     */
    getCirclesByMemberStatus(status: string, options?: QueryOptions): Promise<QueryResult<DynamoDBCircleMember>>;
}
