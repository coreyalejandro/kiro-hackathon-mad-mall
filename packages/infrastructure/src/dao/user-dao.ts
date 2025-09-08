/**
 * User DAO Implementation
 * Data access operations for User entities
 */

import { BaseDynamoDAO } from './base-dao';
import { UserDAO, QueryOptions, QueryResult } from '@madmall/shared-types/database';
import { DynamoDBUser, DynamoDBCircleMember, KeyPatterns } from '@madmall/shared-types/database';
import { DataValidator, ValidationResult } from '@madmall/shared-types/database';
import { DynamoDBService } from '../services/dynamodb-service';

export class UserDynamoDAO extends BaseDynamoDAO<DynamoDBUser> implements UserDAO {
  constructor(dynamoService: DynamoDBService) {
    super(dynamoService, 'USER');
  }

  /**
   * Entity-specific validation for users
   */
  protected validateEntitySpecific(entity: DynamoDBUser): ValidationResult {
    return DataValidator.validateUser(entity);
  }

  /**
   * Get user by email address using GSI1
   */
  async getByEmail(email: string): Promise<DynamoDBUser | null> {
    const result = await this.queryGSI('GSI1', `EMAIL#${email}`, undefined, {
      limit: 1,
    });

    return result.items.length > 0 ? result.items[0] : null;
  }

  /**
   * Get user's circles using the user partition
   */
  async getUserCircles(userId: string, options?: QueryOptions): Promise<QueryResult<DynamoDBCircleMember>> {
    const keyConditionExpression = 'PK = :pk AND begins_with(SK, :skPrefix)';
    const expressionAttributeValues = {
      ':pk': `USER#${userId}`,
      ':skPrefix': 'CIRCLE#',
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
   * Search users by criteria using filters
   */
  async searchUsers(criteria: {
    culturalBackground?: string[];
    diagnosisStage?: string;
    supportNeeds?: string[];
    location?: { city?: string; state?: string; country?: string };
  }, options?: QueryOptions): Promise<QueryResult<DynamoDBUser>> {
    // This is a complex search that would typically use a scan operation
    // For better performance, consider using OpenSearch or similar search service
    
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Filter by cultural background
    if (criteria.culturalBackground && criteria.culturalBackground.length > 0) {
      const culturalFilters = criteria.culturalBackground.map((bg, index) => {
        const attrValue = `:culturalBg${index}`;
        expressionAttributeValues[attrValue] = bg;
        return `contains(#profile.#culturalBackground, ${attrValue})`;
      });
      filterExpressions.push(`(${culturalFilters.join(' OR ')})`);
      expressionAttributeNames['#profile'] = 'profile';
      expressionAttributeNames['#culturalBackground'] = 'culturalBackground';
    }

    // Filter by diagnosis stage
    if (criteria.diagnosisStage) {
      filterExpressions.push('#profile.#diagnosisStage = :diagnosisStage');
      expressionAttributeNames['#profile'] = 'profile';
      expressionAttributeNames['#diagnosisStage'] = 'diagnosisStage';
      expressionAttributeValues[':diagnosisStage'] = criteria.diagnosisStage;
    }

    // Filter by support needs
    if (criteria.supportNeeds && criteria.supportNeeds.length > 0) {
      const supportFilters = criteria.supportNeeds.map((need, index) => {
        const attrValue = `:supportNeed${index}`;
        expressionAttributeValues[attrValue] = need;
        return `contains(#profile.#supportNeeds, ${attrValue})`;
      });
      filterExpressions.push(`(${supportFilters.join(' OR ')})`);
      expressionAttributeNames['#profile'] = 'profile';
      expressionAttributeNames['#supportNeeds'] = 'supportNeeds';
    }

    // Filter by location
    if (criteria.location) {
      if (criteria.location.city) {
        filterExpressions.push('#profile.#location.#city = :city');
        expressionAttributeNames['#profile'] = 'profile';
        expressionAttributeNames['#location'] = 'location';
        expressionAttributeNames['#city'] = 'city';
        expressionAttributeValues[':city'] = criteria.location.city;
      }
      if (criteria.location.state) {
        filterExpressions.push('#profile.#location.#state = :state');
        expressionAttributeNames['#profile'] = 'profile';
        expressionAttributeNames['#location'] = 'location';
        expressionAttributeNames['#state'] = 'state';
        expressionAttributeValues[':state'] = criteria.location.state;
      }
      if (criteria.location.country) {
        filterExpressions.push('#profile.#location.#country = :country');
        expressionAttributeNames['#profile'] = 'profile';
        expressionAttributeNames['#location'] = 'location';
        expressionAttributeNames['#country'] = 'country';
        expressionAttributeValues[':country'] = criteria.location.country;
      }
    }

    // Use GSI1 to scan all users with entity type filter
    const keyConditionExpression = 'GSI1PK = :entityType';
    const baseExpressionAttributeValues = { ':entityType': 'USER' };

    const queryOptions: QueryOptions = {
      ...options,
      indexName: 'GSI1',
      expressionAttributeNames: {
        ...expressionAttributeNames,
        ...options?.expressionAttributeNames,
      },
      expressionAttributeValues: {
        ...baseExpressionAttributeValues,
        ...expressionAttributeValues,
        ...options?.expressionAttributeValues,
      },
    };

    if (filterExpressions.length > 0) {
      const combinedFilter = filterExpressions.join(' AND ');
      queryOptions.filterExpression = options?.filterExpression 
        ? `(${options.filterExpression}) AND (${combinedFilter})`
        : combinedFilter;
    }

    return await this.dynamoService.query<DynamoDBUser>(keyConditionExpression, queryOptions);
  }

  /**
   * Get users by tenant using GSI4
   */
  async getUsersByTenant(tenantId: string, options?: QueryOptions): Promise<QueryResult<DynamoDBUser>> {
    return await this.queryGSI('GSI4', `TENANT#${tenantId}#USERS`, undefined, options);
  }

  /**
   * Update user's last active timestamp
   */
  async updateLastActive(userId: string): Promise<void> {
    const now = new Date().toISOString();
    const { PK, SK } = KeyPatterns.USER_PROFILE(userId);

    await this.dynamoService.updateItem(PK, SK, {
      updateExpression: 'SET #profile.#lastActive = :lastActive, #updatedAt = :updatedAt',
      expressionAttributeNames: {
        '#profile': 'profile',
        '#lastActive': 'lastActive',
        '#updatedAt': 'updatedAt',
      },
      expressionAttributeValues: {
        ':lastActive': now,
        ':updatedAt': now,
      },
    });
  }

  /**
   * Increment user statistics
   */
  async incrementStats(userId: string, stats: Partial<{
    storiesShared: number;
    circlesJoined: number;
    commentsPosted: number;
    helpfulVotes: number;
    daysActive: number;
    streakDays: number;
  }>): Promise<void> {
    const { PK, SK } = KeyPatterns.USER_PROFILE(userId);
    
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {
      '#updatedAt': 'updatedAt',
    };
    const expressionAttributeValues: Record<string, any> = {
      ':updatedAt': new Date().toISOString(),
    };

    // Build increment expressions for each stat
    Object.entries(stats).forEach(([statName, increment]) => {
      if (increment && increment !== 0) {
        const attrName = `#stats_${statName}`;
        const attrValue = `:${statName}`;
        
        updateExpressions.push(`#stats.${attrName} = if_not_exists(#stats.${attrName}, :zero) + ${attrValue}`);
        expressionAttributeNames['#stats'] = 'stats';
        expressionAttributeNames[attrName] = statName;
        expressionAttributeValues[attrValue] = increment;
        expressionAttributeValues[':zero'] = 0;
      }
    });

    if (updateExpressions.length > 0) {
      updateExpressions.push('#updatedAt = :updatedAt');

      await this.dynamoService.updateItem(PK, SK, {
        updateExpression: `SET ${updateExpressions.join(', ')}`,
        expressionAttributeNames,
        expressionAttributeValues,
      });
    }
  }

  /**
   * Create user with proper key generation
   */
  async create(item: Omit<DynamoDBUser, 'createdAt' | 'updatedAt' | 'version'>): Promise<DynamoDBUser> {
    const now = new Date().toISOString();
    
    // Generate keys using patterns
    const { PK, SK } = KeyPatterns.USER_PROFILE(item.userId);
    const { GSI1PK, GSI1SK } = KeyPatterns.USER_BY_EMAIL(item.email, item.userId);
    
    const newUser: DynamoDBUser = {
      ...item,
      PK,
      SK,
      GSI1PK,
      GSI1SK,
      GSI4PK: `TENANT#${(item as any).tenantId || 'default'}#USERS`,
      GSI4SK: `CREATED#${now}`,
      entityType: 'USER',
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    // Validate before creating
    const validation = this.validateEntitySpecific(newUser);
    if (!validation.isValid) {
      throw new Error(`User validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Check for duplicate email
    const existingUser = await this.getByEmail(item.email);
    if (existingUser) {
      throw new Error(`User with email ${item.email} already exists`);
    }

    return await this.dynamoService.putItem(newUser);
  }

  /**
   * Get user by ID (convenience method)
   */
  async getUserById(userId: string): Promise<DynamoDBUser | null> {
    const { PK, SK } = KeyPatterns.USER_PROFILE(userId);
    return await this.getById(PK, SK);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileUpdates: Partial<DynamoDBUser['profile']>): Promise<DynamoDBUser> {
    const { PK, SK } = KeyPatterns.USER_PROFILE(userId);
    
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {
      '#updatedAt': 'updatedAt',
      '#version': 'version',
    };
    const expressionAttributeValues: Record<string, any> = {
      ':updatedAt': new Date().toISOString(),
      ':versionIncrement': 1,
    };

    // Build update expressions for profile fields
    Object.entries(profileUpdates).forEach(([field, value]) => {
      const attrName = `#profile_${field}`;
      const attrValue = `:profile_${field}`;
      
      updateExpressions.push(`#profile.${attrName} = ${attrValue}`);
      expressionAttributeNames['#profile'] = 'profile';
      expressionAttributeNames[attrName] = field;
      expressionAttributeValues[attrValue] = value;
    });

    updateExpressions.push('#updatedAt = :updatedAt');
    updateExpressions.push('#version = #version + :versionIncrement');

    return await this.dynamoService.updateItem<DynamoDBUser>(PK, SK, {
      updateExpression: `SET ${updateExpressions.join(', ')}`,
      expressionAttributeNames,
      expressionAttributeValues,
      returnValues: 'ALL_NEW',
    });
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferencesUpdates: Partial<DynamoDBUser['preferences']>): Promise<DynamoDBUser> {
    const { PK, SK } = KeyPatterns.USER_PROFILE(userId);
    
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {
      '#updatedAt': 'updatedAt',
      '#version': 'version',
    };
    const expressionAttributeValues: Record<string, any> = {
      ':updatedAt': new Date().toISOString(),
      ':versionIncrement': 1,
    };

    // Build update expressions for preference fields
    Object.entries(preferencesUpdates).forEach(([field, value]) => {
      const attrName = `#preferences_${field}`;
      const attrValue = `:preferences_${field}`;
      
      updateExpressions.push(`#preferences.${attrName} = ${attrValue}`);
      expressionAttributeNames['#preferences'] = 'preferences';
      expressionAttributeNames[attrName] = field;
      expressionAttributeValues[attrValue] = value;
    });

    updateExpressions.push('#updatedAt = :updatedAt');
    updateExpressions.push('#version = #version + :versionIncrement');

    return await this.dynamoService.updateItem<DynamoDBUser>(PK, SK, {
      updateExpression: `SET ${updateExpressions.join(', ')}`,
      expressionAttributeNames,
      expressionAttributeValues,
      returnValues: 'ALL_NEW',
    });
  }
}