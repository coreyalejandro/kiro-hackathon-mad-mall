/**
 * Feedback DAO Implementation
 * Community feedback and reports for images
 */

import { BaseDynamoDAO } from './base-dao';
import { QueryOptions, QueryResult } from '@madmall/shared-types';
import { DynamoDBFeedback, KeyPatterns } from '@madmall/shared-types';
import { DataValidator, ValidationResult, ValidationError } from '@madmall/shared-types';
import { DynamoDBService } from '../services/dynamodb-service';

export class FeedbackDynamoDAO extends BaseDynamoDAO<DynamoDBFeedback> {
  constructor(dynamoService: DynamoDBService) {
    super(dynamoService, 'FEEDBACK');
  }

  protected validateEntitySpecific(entity: DynamoDBFeedback): ValidationResult {
    return DataValidator.validateFeedback(entity);
  }

  async createForImage(input: Omit<DynamoDBFeedback, 'createdAt' | 'updatedAt' | 'version' | 'PK' | 'SK' | 'GSI1PK' | 'GSI1SK'>): Promise<DynamoDBFeedback> {
    const now = new Date().toISOString();
    const keys = KeyPatterns.FEEDBACK_FOR_IMAGE(input.imageId, input.userId, now);
    const item: DynamoDBFeedback = {
      ...input,
      ...keys,
      entityType: 'FEEDBACK',
      version: 1,
      createdAt: now,
      updatedAt: now,
    } as DynamoDBFeedback;

    const validation = this.validateEntity(item);
    if (!validation.isValid) {
      throw new Error(`Feedback validation failed: ${validation.errors.map((e: ValidationError) => e.message).join(', ')}`);
    }

    return await this.dynamoService.putItem(item);
  }

  async listForImage(imageId: string, options?: QueryOptions): Promise<QueryResult<DynamoDBFeedback>> {
    return await this.query(`FEEDBACK#IMAGE#${imageId}`, options);
  }

  async listBySeverity(severity: string, options?: QueryOptions): Promise<QueryResult<DynamoDBFeedback>> {
    return await this.queryGSI('GSI3', `FEEDBACK_SEVERITY#${severity}`, undefined, options);
  }

  async updateStatus(pk: string, sk: string, status: DynamoDBFeedback['status']): Promise<DynamoDBFeedback> {
    return await this.update(pk, sk, { status } as any);
  }
}

