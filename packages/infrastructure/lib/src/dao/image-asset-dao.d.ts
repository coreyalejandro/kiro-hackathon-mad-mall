/**
 * Image Asset DAO Implementation
 * Data access operations for ImageAsset entities
 */
import { BaseDynamoDAO } from './base-dao';
import { QueryOptions, QueryResult } from '@madmall/shared-types';
import { DynamoDBImageAsset } from '@madmall/shared-types';
import { ValidationResult } from '@madmall/shared-types';
import { DynamoDBService } from '../services/dynamodb-service';
export declare class ImageAssetDynamoDAO extends BaseDynamoDAO<DynamoDBImageAsset> {
    constructor(dynamoService: DynamoDBService);
    protected validateEntitySpecific(entity: DynamoDBImageAsset): ValidationResult;
    getById(imageId: string): Promise<DynamoDBImageAsset | null>;
    getByCategory(category: string, options?: QueryOptions): Promise<QueryResult<DynamoDBImageAsset>>;
    getByStatus(status: string, options?: QueryOptions): Promise<QueryResult<DynamoDBImageAsset>>;
    searchByTags(tags: string[], options?: QueryOptions): Promise<QueryResult<DynamoDBImageAsset>>;
    markStatus(imageId: string, status: DynamoDBImageAsset['status'], notes?: string): Promise<DynamoDBImageAsset>;
}
