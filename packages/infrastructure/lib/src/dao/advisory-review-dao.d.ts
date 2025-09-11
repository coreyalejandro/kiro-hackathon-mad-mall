/**
 * Advisory Review DAO Implementation
 * Cultural advisory board review queue and decisions
 */
import { BaseDynamoDAO } from './base-dao';
import { QueryOptions, QueryResult } from '@madmall/shared-types';
import { DynamoDBAdvisoryReview } from '@madmall/shared-types';
import { ValidationResult } from '@madmall/shared-types';
import { DynamoDBService } from '../services/dynamodb-service';
export declare class AdvisoryReviewDynamoDAO extends BaseDynamoDAO<DynamoDBAdvisoryReview> {
    constructor(dynamoService: DynamoDBService);
    protected validateEntitySpecific(entity: DynamoDBAdvisoryReview): ValidationResult;
    enqueue(input: Omit<DynamoDBAdvisoryReview, 'createdAt' | 'updatedAt' | 'version' | 'PK' | 'SK' | 'GSI1PK'>): Promise<DynamoDBAdvisoryReview>;
    listQueue(options?: QueryOptions): Promise<QueryResult<DynamoDBAdvisoryReview>>;
    listByTarget(targetType: string, targetId: string, options?: QueryOptions): Promise<QueryResult<DynamoDBAdvisoryReview>>;
    updateStatus(reviewId: string, status: DynamoDBAdvisoryReview['status']): Promise<DynamoDBAdvisoryReview>;
    addDecision(reviewId: string, decision: {
        reviewerId: string;
        decision: 'approve' | 'request_changes' | 'reject';
        rationale: string;
        decidedAt?: string;
    }): Promise<DynamoDBAdvisoryReview>;
}
