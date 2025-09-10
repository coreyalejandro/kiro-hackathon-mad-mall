/**
 * Advisory Review DAO Implementation
 * Cultural advisory board review queue and decisions
 */

import { BaseDynamoDAO } from './base-dao';
import { QueryOptions, QueryResult } from '@madmall/shared-types';
import { DynamoDBAdvisoryReview, KeyPatterns } from '@madmall/shared-types';
import { DataValidator, ValidationResult, ValidationError } from '@madmall/shared-types';
import { DynamoDBService } from '../services/dynamodb-service';

export class AdvisoryReviewDynamoDAO extends BaseDynamoDAO<DynamoDBAdvisoryReview> {
  constructor(dynamoService: DynamoDBService) {
    super(dynamoService, 'ADVISORY_REVIEW');
  }

  protected validateEntitySpecific(entity: DynamoDBAdvisoryReview): ValidationResult {
    return DataValidator.validateAdvisoryReview(entity);
  }

  async enqueue(input: Omit<DynamoDBAdvisoryReview, 'createdAt' | 'updatedAt' | 'version' | 'PK' | 'SK' | 'GSI1PK'>): Promise<DynamoDBAdvisoryReview> {
    const now = new Date().toISOString();
    const keys = KeyPatterns.ADVISORY_QUEUE(input.reviewId);
    const gsi1 = KeyPatterns.ADVISORY_BY_TARGET(input.targetType, input.targetId);
    const item: DynamoDBAdvisoryReview = {
      ...input,
      ...keys,
      ...gsi1,
      entityType: 'ADVISORY_REVIEW',
      version: 1,
      createdAt: now,
      updatedAt: now,
    } as DynamoDBAdvisoryReview;

    const validation = this.validateEntity(item);
    if (!validation.isValid) {
      throw new Error(`Advisory review validation failed: ${validation.errors.map((e: ValidationError) => e.message).join(', ')}`);
    }

    return await this.dynamoService.putItem(item);
  }

  async listQueue(options?: QueryOptions): Promise<QueryResult<DynamoDBAdvisoryReview>> {
    return await this.query('ADVISORY#QUEUE', options);
  }

  async listByTarget(targetType: string, targetId: string, options?: QueryOptions): Promise<QueryResult<DynamoDBAdvisoryReview>> {
    return await this.queryGSI('GSI1', `REVIEW_TARGET#${targetType}#${targetId}`, undefined, options);
  }

  async updateStatus(reviewId: string, status: DynamoDBAdvisoryReview['status']): Promise<DynamoDBAdvisoryReview> {
    const { PK, SK } = KeyPatterns.ADVISORY_QUEUE(reviewId);
    return await this.dynamoService.updateItem<DynamoDBAdvisoryReview>(PK, SK, {
      updateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
      expressionAttributeNames: { '#status': 'status', '#updatedAt': 'updatedAt' },
      expressionAttributeValues: { ':status': status, ':updatedAt': new Date().toISOString() },
      returnValues: 'ALL_NEW',
    });
  }

  async addDecision(reviewId: string, decision: { reviewerId: string; decision: 'approve' | 'request_changes' | 'reject'; rationale: string; decidedAt?: string }): Promise<DynamoDBAdvisoryReview> {
    const { PK, SK } = KeyPatterns.ADVISORY_QUEUE(reviewId);
    const decidedAt = decision.decidedAt || new Date().toISOString();
    return await this.dynamoService.updateItem<DynamoDBAdvisoryReview>(PK, SK, {
      updateExpression: 'SET #decisions = list_append(if_not_exists(#decisions, :empty), :decision), #updatedAt = :updatedAt',
      expressionAttributeNames: { '#decisions': 'decisions', '#updatedAt': 'updatedAt' },
      expressionAttributeValues: { ':decision': [{ ...decision, decidedAt }], ':empty': [], ':updatedAt': decidedAt },
      returnValues: 'ALL_NEW',
    });
  }
}

