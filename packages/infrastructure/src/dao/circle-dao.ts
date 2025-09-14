/**
 * Circle DAO Implementation
 * Data access operations for Circle entities
 */

import { BaseDynamoDAO } from './base-dao';
import { CircleDAO, QueryOptions, QueryResult } from '@madmall/shared-types/database';
import { DynamoDBCircle, DynamoDBCircleMember, KeyPatterns } from '@madmall/shared-types/database';
import { DataValidator, ValidationResult } from '@madmall/shared-types/database';
import { DynamoDBService } from '../services/dynamodb-service';

export class CircleDynamoDAO extends BaseDynamoDAO<DynamoDBCircle> implements CircleDAO {
  constructor(dynamoService: DynamoDBService) {
    super(dynamoService, 'CIRCLE');
  }

  /**
   * Entity-specific validation for circles
   */
  protected validateEntitySpecific(entity: DynamoDBCircle): ValidationResult {
    return DataValidator.validateCircle(entity);
  }

  /**
   * Get circles by type using GSI1
   */
  async getByType(type: string, options?: QueryOptions): Promise<QueryResult<DynamoDBCircle>> {
    return await this.queryGSI('GSI1', `CIRCLE_TYPE#${type}`, undefined, options);
  }

  /**
   * Get circle members
   */
  async getMembers(circleId: string, options?: QueryOptions): Promise<QueryResult<DynamoDBCircleMember>> {
    const keyConditionExpression = 'PK = :pk AND begins_with(SK, :skPrefix)';
    const expressionAttributeValues = {
      ':pk': `CIRCLE#${circleId}`,
      ':skPrefix': 'MEMBER#',
    };

    return await this.dynamoService.query<DynamoDBCircleMember>(keyConditionExpression, {
      ...options,
      expressionAttributeValues: {
        ...expressionAttributeValues,
        ...options?.expressionAttributeValues,
      },
    });
  }

  /**
   * Add member to circle
   */
  async addMember(circleId: string, userId: string, role: string = 'member'): Promise<DynamoDBCircleMember> {
    const now = new Date().toISOString();
    
    const member: DynamoDBCircleMember = {
      PK: `CIRCLE#${circleId}`,
      SK: `MEMBER#${userId}`,
      GSI3PK: `MEMBER_STATUS#active`,
      GSI3SK: `JOINED#${now}`,
      entityType: 'CIRCLE_MEMBER',
      version: 1,
      createdAt: now,
      updatedAt: now,
      circleId,
      userId,
      role,
      status: 'active',
      joinedAt: now,
      lastActive: now,
      contributionScore: 0,
      badges: [],
    };

    // Also create reverse relationship for user's circles
    const userCircleRelation: DynamoDBCircleMember = {
      ...member,
      PK: `USER#${userId}`,
      SK: `CIRCLE#${circleId}`,
    };

    // Use transaction to ensure both records are created
    await this.dynamoService.transaction([
      {
        operation: 'put',
        item: member,
      },
      {
        operation: 'put',
        item: userCircleRelation,
      },
    ]);

    // Update circle member count
    await this.updateStats(circleId, { memberCount: 1 });

    return member;
  }

  /**
   * Remove member from circle
   */
  async removeMember(circleId: string, userId: string): Promise<void> {
    // Use transaction to remove both relationships
    await this.dynamoService.transaction([
      {
        operation: 'delete',
        key: { PK: `CIRCLE#${circleId}`, SK: `MEMBER#${userId}` },
      },
      {
        operation: 'delete',
        key: { PK: `USER#${userId}`, SK: `CIRCLE#${circleId}` },
      },
    ]);

    // Update circle member count
    await this.updateStats(circleId, { memberCount: -1 });
  }

  /**
   * Update member role
   */
  async updateMemberRole(circleId: string, userId: string, role: string): Promise<void> {
    const now = new Date().toISOString();

    // Update both relationship records
    await this.dynamoService.transaction([
      {
        operation: 'update',
        key: { PK: `CIRCLE#${circleId}`, SK: `MEMBER#${userId}` },
        updateExpression: 'SET #role = :role, #updatedAt = :updatedAt, #version = #version + :inc',
        expressionAttributeNames: {
          '#role': 'role',
          '#updatedAt': 'updatedAt',
          '#version': 'version',
        },
        expressionAttributeValues: {
          ':role': role,
          ':updatedAt': now,
          ':inc': 1,
        },
      },
      {
        operation: 'update',
        key: { PK: `USER#${userId}`, SK: `CIRCLE#${circleId}` },
        updateExpression: 'SET #role = :role, #updatedAt = :updatedAt, #version = #version + :inc',
        expressionAttributeNames: {
          '#role': 'role',
          '#updatedAt': 'updatedAt',
          '#version': 'version',
        },
        expressionAttributeValues: {
          ':role': role,
          ':updatedAt': now,
          ':inc': 1,
        },
      },
    ]);
  }

  /**
   * Get active circles using GSI3
   */
  async getActiveCircles(options?: QueryOptions): Promise<QueryResult<DynamoDBCircle>> {
    return await this.queryGSI('GSI3', 'CIRCLE_STATUS#ACTIVE', undefined, options);
  }

  /**
   * Search circles by criteria
   */
  async searchCircles(criteria: {
    type?: string;
    culturalFocus?: string[];
    tags?: string[];
    isPrivate?: boolean;
  }, options?: QueryOptions): Promise<QueryResult<DynamoDBCircle>> {
    let baseQuery: Promise<QueryResult<DynamoDBCircle>>;
    
    // Start with type-based query if type is specified
    if (criteria.type) {
      baseQuery = this.getByType(criteria.type, options);
    } else {
      // Otherwise get all active circles
      baseQuery = this.getActiveCircles(options);
    }

    const result = await baseQuery;

    // Apply additional filters in memory (for better performance, consider using search service)
    let filteredItems = result.items;

    if (criteria.culturalFocus && criteria.culturalFocus.length > 0) {
      filteredItems = filteredItems.filter(circle => 
        circle.settings.culturalFocus?.some(focus => 
          criteria.culturalFocus!.includes(focus)
        )
      );
    }

    if (criteria.tags && criteria.tags.length > 0) {
      filteredItems = filteredItems.filter(circle =>
        circle.tags.some(tag => criteria.tags!.includes(tag))
      );
    }

    if (criteria.isPrivate !== undefined) {
      filteredItems = filteredItems.filter(circle =>
        circle.settings.isPrivate === criteria.isPrivate
      );
    }

    return {
      ...result,
      items: filteredItems,
      count: filteredItems.length,
    };
  }

  /**
   * Update circle statistics
   */
  async updateStats(circleId: string, stats: Partial<{
    memberCount: number;
    activeMembers: number;
    postsThisWeek: number;
    postsThisMonth: number;
    engagementRate: number;
    averageResponseTime: number;
  }>): Promise<void> {
    const { PK, SK } = KeyPatterns.CIRCLE_METADATA(circleId);
    
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {
      '#updatedAt': 'updatedAt',
      '#version': 'version',
    };
    const expressionAttributeValues: Record<string, any> = {
      ':updatedAt': new Date().toISOString(),
      ':versionIncrement': 1,
    };

    // Build update expressions for each stat
    Object.entries(stats).forEach(([statName, value]) => {
      if (value !== undefined) {
        const attrName = `#stats_${statName}`;
        const attrValue = `:${statName}`;
        
        if (typeof value === 'number' && (statName === 'memberCount' || statName === 'postsThisWeek' || statName === 'postsThisMonth')) {
          // For counts, use ADD operation to increment/decrement
          updateExpressions.push(`#stats.${attrName} = if_not_exists(#stats.${attrName}, :zero) + ${attrValue}`);
          expressionAttributeValues[':zero'] = 0;
        } else {
          // For rates and averages, use SET operation
          updateExpressions.push(`#stats.${attrName} = ${attrValue}`);
        }
        
        expressionAttributeNames['#stats'] = 'stats';
        expressionAttributeNames[attrName] = statName;
        expressionAttributeValues[attrValue] = value;
      }
    });

    if (updateExpressions.length > 0) {
      updateExpressions.push('#updatedAt = :updatedAt');
      updateExpressions.push('#version = #version + :versionIncrement');

      await this.dynamoService.updateItem(PK, SK, {
        updateExpression: `SET ${updateExpressions.join(', ')}`,
        expressionAttributeNames,
        expressionAttributeValues,
      });
    }
  }

  /**
   * Create circle with proper key generation
   */
  async create(item: Omit<DynamoDBCircle, 'createdAt' | 'updatedAt' | 'version'>): Promise<DynamoDBCircle> {
    const now = new Date().toISOString();
    
    // Generate keys using patterns
    const { PK, SK } = KeyPatterns.CIRCLE_METADATA(item.circleId);
    
    const newCircle: DynamoDBCircle = {
      ...item,
      PK,
      SK,
      GSI1PK: `CIRCLE_TYPE#${item.type}`,
      GSI1SK: `CREATED#${now}`,
      GSI3PK: `CIRCLE_STATUS#${item.status || 'ACTIVE'}`,
      GSI3SK: `UPDATED#${now}`,
      GSI4PK: `TENANT#${(item as any).tenantId || 'default'}#CIRCLES`,
      GSI4SK: `CREATED#${now}`,
      entityType: 'CIRCLE',
      version: 1,
      createdAt: now,
      updatedAt: now,
      status: item.status || 'ACTIVE',
    };

    // Validate before creating
    const validation = this.validateEntitySpecific(newCircle);
    if (!validation.isValid) {
      throw new Error(`Circle validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const createdCircle = await this.dynamoService.putItem(newCircle);

    // Add creator as first member with admin role
    await this.addMember(item.circleId, item.createdBy, 'admin');

    return createdCircle;
  }

  /**
   * Get circle by ID (convenience method)
   */
  async getCircleById(circleId: string): Promise<DynamoDBCircle | null> {
    const { PK, SK } = KeyPatterns.CIRCLE_METADATA(circleId);
    return await this.getById(PK, SK);
  }

  /**
   * Update circle settings
   */
  async updateSettings(circleId: string, settingsUpdates: Partial<DynamoDBCircle['settings']>): Promise<DynamoDBCircle> {
    const { PK, SK } = KeyPatterns.CIRCLE_METADATA(circleId);
    
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {
      '#updatedAt': 'updatedAt',
      '#version': 'version',
    };
    const expressionAttributeValues: Record<string, any> = {
      ':updatedAt': new Date().toISOString(),
      ':versionIncrement': 1,
    };

    // Build update expressions for settings fields
    Object.entries(settingsUpdates).forEach(([field, value]) => {
      const attrName = `#settings_${field}`;
      const attrValue = `:settings_${field}`;
      
      updateExpressions.push(`#settings.${attrName} = ${attrValue}`);
      expressionAttributeNames['#settings'] = 'settings';
      expressionAttributeNames[attrName] = field;
      expressionAttributeValues[attrValue] = value;
    });

    updateExpressions.push('#updatedAt = :updatedAt');
    updateExpressions.push('#version = #version + :versionIncrement');

    return await this.dynamoService.updateItem<DynamoDBCircle>(PK, SK, {
      updateExpression: `SET ${updateExpressions.join(', ')}`,
      expressionAttributeNames,
      expressionAttributeValues,
      returnValues: 'ALL_NEW',
    });
  }

  /**
   * Get member by circle and user ID
   */
  async getMember(circleId: string, userId: string): Promise<DynamoDBCircleMember | null> {
    const { PK, SK } = KeyPatterns.CIRCLE_MEMBER(circleId, userId);
    return await this.dynamoService.getItem<DynamoDBCircleMember>(PK, SK);
  }

  /**
   * Check if user is member of circle
   */
  async isMember(circleId: string, userId: string): Promise<boolean> {
    const member = await this.getMember(circleId, userId);
    return member !== null && member.status === 'active';
  }

  /**
   * Get circles by member status using GSI3
   */
  async getCirclesByMemberStatus(status: string, options?: QueryOptions): Promise<QueryResult<DynamoDBCircleMember>> {
    return await this.queryGSI('GSI3', `MEMBER_STATUS#${status}`, undefined, options);
  }
}