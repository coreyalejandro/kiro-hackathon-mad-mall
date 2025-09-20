/**
 * Base DAO Implementation
 * Abstract base class for all DynamoDB DAOs with common CRUD operations
 */
import { DynamoDBService } from '../services/dynamodb-service';
import { BaseDAO, QueryOptions, QueryResult, BatchGetOptions, BatchWriteOptions, UpdateOptions, DeleteOptions, TransactionItem } from '@madmall/shared-types/database';
import { BaseEntity } from '@madmall/shared-types/database';
import { ValidationResult } from '@madmall/shared-types/database';
export declare abstract class BaseDynamoDAO<T extends BaseEntity> implements BaseDAO<T> {
    protected dynamoService: DynamoDBService;
    protected entityType: string;
    constructor(dynamoService: DynamoDBService, entityType: string);
    /**
     * Create a new item with automatic timestamps and validation
     */
    create(item: Omit<T, 'createdAt' | 'updatedAt' | 'version'>): Promise<T>;
    /**
     * Get item by primary key
     */
    getById(pk: string, sk: string, options?: QueryOptions): Promise<T | null>;
    /**
     * Update an existing item with optimistic locking
     */
    update(pk: string, sk: string, updates: Partial<T>, options?: UpdateOptions): Promise<T>;
    /**
     * Delete an item with optional conditions
     */
    delete(pk: string, sk: string, options?: DeleteOptions): Promise<void>;
    /**
     * Query items with partition key
     */
    query(pk: string, options?: QueryOptions): Promise<QueryResult<T>>;
    /**
     * Query items using GSI
     */
    queryGSI(indexName: string, pk: string, sk?: string, options?: QueryOptions): Promise<QueryResult<T>>;
    /**
     * Batch get multiple items
     */
    batchGet(keys: Array<{
        pk: string;
        sk: string;
    }>, options?: BatchGetOptions): Promise<T[]>;
    /**
     * Batch write multiple items
     */
    batchWrite(items: T[], options?: BatchWriteOptions): Promise<void>;
    /**
     * Execute transaction
     */
    transaction(items: TransactionItem[]): Promise<void>;
    /**
     * Check if item exists
     */
    exists(pk: string, sk: string): Promise<boolean>;
    /**
     * Get item count for partition
     */
    count(pk: string, options?: QueryOptions): Promise<number>;
    /**
     * Validate entity using appropriate validator
     */
    protected validateEntity(entity: T): ValidationResult;
    /**
     * Entity-specific validation - to be implemented by subclasses
     */
    protected abstract validateEntitySpecific(entity: T): ValidationResult;
    /**
     * Get GSI partition key attribute name
     */
    protected getGSIPartitionKey(indexName: string): string;
    /**
     * Get GSI sort key attribute name
     */
    protected getGSISortKey(indexName: string): string;
    /**
     * Build filter expression for array contains
     */
    protected buildContainsFilter(attribute: string, values: string[]): {
        filterExpression: string;
        expressionAttributeNames: Record<string, string>;
        expressionAttributeValues: Record<string, any>;
    };
    /**
     * Build IN filter expression
     */
    protected buildInFilter(attribute: string, values: any[]): {
        filterExpression: string;
        expressionAttributeNames: Record<string, string>;
        expressionAttributeValues: Record<string, any>;
    };
    /**
     * Merge query options with additional filters
     */
    protected mergeQueryOptions(baseOptions: QueryOptions | undefined, additionalFilters: {
        filterExpression?: string;
        expressionAttributeNames?: Record<string, string>;
        expressionAttributeValues?: Record<string, any>;
    }): QueryOptions;
}
