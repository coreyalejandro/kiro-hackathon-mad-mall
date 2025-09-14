/**
 * DynamoDB Service Layer
 * Core service for DynamoDB operations with connection management and error handling
 */
import { QueryOptions, QueryResult, BatchGetOptions, BatchWriteOptions, UpdateOptions, DeleteOptions, TransactionItem } from '@madmall/shared-types/database';
export interface DynamoDBServiceConfig {
    region: string;
    tableName: string;
    endpoint?: string;
    maxRetries?: number;
    timeout?: number;
    connectionPoolSize?: number;
    enableXRayTracing?: boolean;
    enableMetrics?: boolean;
}
export interface ConnectionMetrics {
    activeConnections: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatency: number;
    lastRequestTime?: Date;
}
export declare class DynamoDBService {
    private client;
    private docClient;
    private tableName;
    private metrics;
    private requestTimes;
    constructor(config: DynamoDBServiceConfig);
    /**
     * Get connection metrics
     */
    getMetrics(): ConnectionMetrics;
    /**
     * Health check - verify table exists and is accessible
     */
    healthCheck(): Promise<boolean>;
    /**
     * Get single item by key
     */
    getItem<T>(pk: string, sk: string, options?: QueryOptions): Promise<T | null>;
    /**
     * Put single item
     */
    putItem<T>(item: T, conditionExpression?: string): Promise<T>;
    /**
     * Update item
     */
    updateItem<T>(pk: string, sk: string, options: UpdateOptions): Promise<T>;
    /**
     * Delete item
     */
    deleteItem(pk: string, sk: string, options?: DeleteOptions): Promise<void>;
    /**
     * Query items
     */
    query<T>(keyConditionExpression: string, options?: QueryOptions & {
        indexName?: string;
    }): Promise<QueryResult<T>>;
    /**
     * Batch get items
     */
    batchGet<T>(keys: Array<{
        pk: string;
        sk: string;
    }>, options?: BatchGetOptions): Promise<T[]>;
    /**
     * Batch write items (put/delete)
     */
    batchWrite<T>(items: T[], operation?: 'put' | 'delete', options?: BatchWriteOptions): Promise<void>;
    /**
     * Execute transaction
     */
    transaction(items: TransactionItem[]): Promise<void>;
    /**
     * Check if item exists
     */
    exists(pk: string, sk: string): Promise<boolean>;
    /**
     * Get count of items matching query
     */
    count(keyConditionExpression: string, options?: QueryOptions & {
        indexName?: string;
    }): Promise<number>;
    /**
     * Record successful operation
     */
    private recordSuccess;
    /**
     * Record failed operation
     */
    private recordFailure;
    /**
     * Update average latency calculation
     */
    private updateAverageLatency;
    /**
     * Handle and format errors
     */
    private handleError;
    /**
     * Close connections and cleanup
     */
    close(): Promise<void>;
}
