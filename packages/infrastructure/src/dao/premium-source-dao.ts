/**
 * Premium Source DAO Implementation
 * Manages premium image providers and licensing metadata
 */

import { BaseDynamoDAO } from './base-dao';
import { QueryOptions, QueryResult } from '@madmall/shared-types';
import { DynamoDBPremiumSource, KeyPatterns } from '@madmall/shared-types';
import { DataValidator, ValidationResult } from '@madmall/shared-types';
import { DynamoDBService } from '../services/dynamodb-service';

export class PremiumSourceDynamoDAO extends BaseDynamoDAO<DynamoDBPremiumSource> {
  constructor(dynamoService: DynamoDBService) {
    super(dynamoService, 'PREMIUM_SOURCE');
  }

  protected validateEntitySpecific(entity: DynamoDBPremiumSource): ValidationResult {
    return DataValidator.validatePremiumSource(entity);
  }

  async getByProvider(provider: string, options?: QueryOptions): Promise<QueryResult<DynamoDBPremiumSource>> {
    return await this.queryGSI('GSI1', `PROVIDER#${provider}`, undefined, options);
  }

  async getById(sourceId: string): Promise<DynamoDBPremiumSource | null> {
    const { PK, SK } = KeyPatterns.PREMIUM_SOURCE_METADATA(sourceId);
    return await super.getById(PK, SK);
  }
}

