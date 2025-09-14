/**
 * Feedback DAO Implementation
 * Community feedback and reports for images
 */
import { BaseDynamoDAO } from './base-dao';
import { QueryOptions, QueryResult } from '@madmall/shared-types';
import { DynamoDBFeedback } from '@madmall/shared-types';
import { ValidationResult } from '@madmall/shared-types';
import { DynamoDBService } from '../services/dynamodb-service';
export declare class FeedbackDynamoDAO extends BaseDynamoDAO<DynamoDBFeedback> {
    constructor(dynamoService: DynamoDBService);
    protected validateEntitySpecific(entity: DynamoDBFeedback): ValidationResult;
    createForImage(input: Omit<DynamoDBFeedback, 'createdAt' | 'updatedAt' | 'version' | 'PK' | 'SK' | 'GSI1PK' | 'GSI1SK'>): Promise<DynamoDBFeedback>;
    listForImage(imageId: string, options?: QueryOptions): Promise<QueryResult<DynamoDBFeedback>>;
    listBySeverity(severity: string, options?: QueryOptions): Promise<QueryResult<DynamoDBFeedback>>;
    updateStatus(pk: string, sk: string, status: DynamoDBFeedback['status']): Promise<DynamoDBFeedback>;
}
