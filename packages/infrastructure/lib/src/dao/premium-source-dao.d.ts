/**
 * Premium Source DAO Implementation
 * Manages premium image providers and licensing metadata
 */
import { BaseDynamoDAO } from './base-dao';
import { QueryOptions, QueryResult } from '@madmall/shared-types';
import { DynamoDBPremiumSource } from '@madmall/shared-types';
import { ValidationResult } from '@madmall/shared-types';
import { DynamoDBService } from '../services/dynamodb-service';
export declare class PremiumSourceDynamoDAO extends BaseDynamoDAO<DynamoDBPremiumSource> {
    constructor(dynamoService: DynamoDBService);
    protected validateEntitySpecific(entity: DynamoDBPremiumSource): ValidationResult;
    getByProvider(provider: string, options?: QueryOptions): Promise<QueryResult<DynamoDBPremiumSource>>;
    getById(sourceId: string): Promise<DynamoDBPremiumSource | null>;
}
