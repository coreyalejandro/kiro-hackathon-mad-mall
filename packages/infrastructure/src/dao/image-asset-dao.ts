/**
 * Image Asset DAO Implementation
 * Data access operations for ImageAsset entities
 */

import { BaseDynamoDAO } from './base-dao';
import { QueryOptions, QueryResult } from '@madmall/shared-types';
import { DynamoDBImageAsset, KeyPatterns } from '@madmall/shared-types';
import { DataValidator, ValidationResult } from '@madmall/shared-types';
import { DynamoDBService } from '../services/dynamodb-service';

export class ImageAssetDynamoDAO extends BaseDynamoDAO<DynamoDBImageAsset> {
  constructor(dynamoService: DynamoDBService) {
    super(dynamoService, 'IMAGE');
  }

  protected validateEntitySpecific(entity: DynamoDBImageAsset): ValidationResult {
    return DataValidator.validateImageAsset(entity);
  }

  async getById(imageId: string): Promise<DynamoDBImageAsset | null> {
    const { PK, SK } = KeyPatterns.IMAGE_METADATA(imageId);
    return await super.getById(PK, SK);
  }

  async getByCategory(category: string, options?: QueryOptions): Promise<QueryResult<DynamoDBImageAsset>> {
    return await this.queryGSI('GSI1', `IMAGE_CATEGORY#${category}`, undefined, options);
  }

  async getByStatus(status: string, options?: QueryOptions): Promise<QueryResult<DynamoDBImageAsset>> {
    return await this.queryGSI('GSI3', `IMAGE_STATUS#${status}`, undefined, options);
  }

  async searchByTags(tags: string[], options?: QueryOptions): Promise<QueryResult<DynamoDBImageAsset>> {
    const filters = this.buildContainsFilter('tags', tags);
    return await this.queryGSI('GSI1', 'IMAGE_CATEGORY#', undefined, this.mergeQueryOptions(options, filters));
  }

  async markStatus(imageId: string, status: DynamoDBImageAsset['status'], notes?: string): Promise<DynamoDBImageAsset> {
    const { PK, SK } = KeyPatterns.IMAGE_METADATA(imageId);
    const updateExpressionParts: string[] = ['#status = :status'];
    const names: Record<string, string> = { '#status': 'status' };
    const values: Record<string, any> = { ':status': status };
    if (notes) {
      updateExpressionParts.push('#validation.#issues = list_append(if_not_exists(#validation.#issues, :emptyList), :notes)');
      names['#validation'] = 'validation';
      names['#issues'] = 'issues';
      values[':notes'] = [notes];
      values[':emptyList'] = [];
    }
    return await this.dynamoService.updateItem<DynamoDBImageAsset>(PK, SK, {
      updateExpression: `SET ${updateExpressionParts.join(', ')}`,
      expressionAttributeNames: names,
      expressionAttributeValues: values,
      returnValues: 'ALL_NEW',
    });
  }
}

