/**
 * DynamoDB Query Builder
 * Fluent interface for building DynamoDB queries
 */
export interface QueryCondition {
    attribute: string;
    operator: 'EQ' | 'NE' | 'LT' | 'LE' | 'GT' | 'GE' | 'BETWEEN' | 'IN' | 'BEGINS_WITH' | 'CONTAINS' | 'EXISTS' | 'NOT_EXISTS';
    value?: any;
    values?: any[];
}
export interface SortCondition {
    attribute: string;
    direction: 'ASC' | 'DESC';
}
export declare class DynamoDBQueryBuilder {
    private keyConditions;
    private filterConditions;
    private sortConditions;
    private projectionAttributes;
    private indexName?;
    private limitValue?;
    private exclusiveStartKeyValue?;
    private consistentReadValue?;
    private scanIndexForwardValue?;
    /**
     * Add key condition (for partition key and sort key)
     */
    keyCondition(attribute: string, operator: QueryCondition['operator'], value?: any, values?: any[]): this;
    /**
     * Add filter condition (applied after query)
     */
    filterCondition(attribute: string, operator: QueryCondition['operator'], value?: any, values?: any[]): this;
    /**
     * Set partition key condition
     */
    partitionKey(attribute: string, value: any): this;
    /**
     * Set sort key condition
     */
    sortKey(attribute: string, operator: QueryCondition['operator'], value?: any, values?: any[]): this;
    /**
     * Add begins with condition for sort key
     */
    beginsWith(attribute: string, value: string): this;
    /**
     * Add between condition
     */
    between(attribute: string, low: any, high: any): this;
    /**
     * Add filter for attribute existence
     */
    exists(attribute: string): this;
    /**
     * Add filter for attribute non-existence
     */
    notExists(attribute: string): this;
    /**
     * Add contains filter
     */
    contains(attribute: string, value: any): this;
    /**
     * Add IN filter
     */
    in(attribute: string, values: any[]): this;
    /**
     * Set projection (select specific attributes)
     */
    project(...attributes: string[]): this;
    /**
     * Use Global Secondary Index
     */
    useIndex(indexName: string): this;
    /**
     * Set query limit
     */
    limit(count: number): this;
    /**
     * Set pagination start key
     */
    exclusiveStartKey(key: Record<string, any>): this;
    /**
     * Enable consistent read
     */
    consistentRead(enabled?: boolean): this;
    /**
     * Set scan direction
     */
    scanIndexForward(forward?: boolean): this;
    /**
     * Sort in ascending order
     */
    sortAsc(attribute?: string): this;
    /**
     * Sort in descending order
     */
    sortDesc(attribute?: string): this;
    /**
     * Build the query parameters
     */
    build(): {
        keyConditionExpression?: string;
        filterExpression?: string;
        projectionExpression?: string;
        expressionAttributeNames?: Record<string, string>;
        expressionAttributeValues?: Record<string, any>;
        indexName?: string;
        limit?: number;
        exclusiveStartKey?: Record<string, any>;
        consistentRead?: boolean;
        scanIndexForward?: boolean;
    };
    /**
     * Create a new query builder instance
     */
    static create(): DynamoDBQueryBuilder;
}
export declare const QueryBuilder: {
    /**
     * Query by partition key
     */
    byPartitionKey(pk: string, value: any): DynamoDBQueryBuilder;
    /**
     * Query by partition key and sort key
     */
    byKeys(pk: string, pkValue: any, sk: string, skValue: any): DynamoDBQueryBuilder;
    /**
     * Query with begins_with on sort key
     */
    beginsWith(pk: string, pkValue: any, sk: string, skPrefix: string): DynamoDBQueryBuilder;
    /**
     * Query GSI by partition key
     */
    gsiByPartitionKey(indexName: string, pk: string, value: any): DynamoDBQueryBuilder;
    /**
     * Query GSI by partition key and sort key
     */
    gsiByKeys(indexName: string, pk: string, pkValue: any, sk: string, skValue: any): DynamoDBQueryBuilder;
};
