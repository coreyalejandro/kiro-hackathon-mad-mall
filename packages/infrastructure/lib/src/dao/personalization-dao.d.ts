/**
 * Personalization Profile DAO Implementation
 */
import { BaseDynamoDAO } from './base-dao';
import { QueryOptions, QueryResult } from '@madmall/shared-types';
import { DynamoDBPersonalizationProfile } from '@madmall/shared-types';
import { ValidationResult } from '@madmall/shared-types';
import { DynamoDBService } from '../services/dynamodb-service';
export declare class PersonalizationDynamoDAO extends BaseDynamoDAO<DynamoDBPersonalizationProfile> {
    constructor(dynamoService: DynamoDBService);
    protected validateEntitySpecific(entity: DynamoDBPersonalizationProfile): ValidationResult;
    getForUser(userId: string): Promise<DynamoDBPersonalizationProfile | null>;
    upsertForUser(userId: string, updates: Partial<DynamoDBPersonalizationProfile>): Promise<DynamoDBPersonalizationProfile>;
    listByCohort(cohortId: string, options?: QueryOptions): Promise<QueryResult<DynamoDBPersonalizationProfile>>;
}
