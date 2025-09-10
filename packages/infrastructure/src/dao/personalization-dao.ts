/**
 * Personalization Profile DAO Implementation
 */

import { BaseDynamoDAO } from './base-dao';
import { QueryOptions, QueryResult } from '@madmall/shared-types';
import { DynamoDBPersonalizationProfile, KeyPatterns } from '@madmall/shared-types';
import { DataValidator, ValidationResult } from '@madmall/shared-types';
import { DynamoDBService } from '../services/dynamodb-service';

export class PersonalizationDynamoDAO extends BaseDynamoDAO<DynamoDBPersonalizationProfile> {
  constructor(dynamoService: DynamoDBService) {
    super(dynamoService, 'PERSONALIZATION');
  }

  protected validateEntitySpecific(entity: DynamoDBPersonalizationProfile): ValidationResult {
    return DataValidator.validatePersonalization(entity);
  }

  async getForUser(userId: string): Promise<DynamoDBPersonalizationProfile | null> {
    const { PK, SK } = KeyPatterns.PERSONALIZATION_PROFILE(userId);
    return await super.getById(PK, SK);
  }

  async upsertForUser(userId: string, updates: Partial<DynamoDBPersonalizationProfile>): Promise<DynamoDBPersonalizationProfile> {
    const { PK, SK } = KeyPatterns.PERSONALIZATION_PROFILE(userId);
    // Use update with upsert semantics
    return await this.dynamoService.updateItem<DynamoDBPersonalizationProfile>(PK, SK, {
      updateExpression: 'SET #entityType = if_not_exists(#entityType, :entityType), #version = if_not_exists(#version, :version), #createdAt = if_not_exists(#createdAt, :createdAt), #updatedAt = :updatedAt' +
        `${updates.preferences ? ', #preferences = :preferences' : ''}` +
        `${updates.engagement ? ', #engagement = :engagement' : ''}` +
        `${updates.abTests ? ', #abTests = :abTests' : ''}` +
        `${updates.cohorts ? ', #cohorts = :cohorts' : ''}` +
        ', #userId = :userId',
      expressionAttributeNames: {
        '#entityType': 'entityType',
        '#version': 'version',
        '#createdAt': 'createdAt',
        '#updatedAt': 'updatedAt',
        '#userId': 'userId',
        ...(updates.preferences ? { '#preferences': 'preferences' } : {}),
        ...(updates.engagement ? { '#engagement': 'engagement' } : {}),
        ...(updates.abTests ? { '#abTests': 'abTests' } : {}),
        ...(updates.cohorts ? { '#cohorts': 'cohorts' } : {}),
      },
      expressionAttributeValues: {
        ':entityType': 'PERSONALIZATION',
        ':version': 1,
        ':createdAt': new Date().toISOString(),
        ':updatedAt': new Date().toISOString(),
        ':userId': userId,
        ...(updates.preferences ? { ':preferences': updates.preferences } : {}),
        ...(updates.engagement ? { ':engagement': updates.engagement } : {}),
        ...(updates.abTests ? { ':abTests': updates.abTests } : {}),
        ...(updates.cohorts ? { ':cohorts': updates.cohorts } : {}),
      },
      returnValues: 'ALL_NEW',
    });
  }

  async listByCohort(cohortId: string, options?: QueryOptions): Promise<QueryResult<DynamoDBPersonalizationProfile>> {
    return await this.queryGSI('GSI1', `COHORT#${cohortId}`, undefined, options);
  }
}

