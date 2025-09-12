"use strict";
/**
 * DynamoDB Service Layer
 * Core service for DynamoDB operations with connection management and error handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBService = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const node_http_handler_1 = require("@aws-sdk/node-http-handler");
class DynamoDBService {
    constructor(config) {
        this.requestTimes = [];
        this.tableName = config.tableName;
        this.metrics = {
            activeConnections: 0,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageLatency: 0,
        };
        // Configure DynamoDB client
        const clientConfig = {
            region: config.region,
            maxAttempts: config.maxRetries || 3,
            requestHandler: new node_http_handler_1.NodeHttpHandler({
                connectionTimeout: config.timeout || 3000,
                socketTimeout: config.timeout || 3000,
                maxSockets: config.connectionPoolSize || 50,
            }),
        };
        if (config.endpoint) {
            clientConfig.endpoint = config.endpoint;
        }
        this.client = new client_dynamodb_1.DynamoDBClient(clientConfig);
        this.docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(this.client, {
            marshallOptions: {
                convertEmptyValues: false,
                removeUndefinedValues: true,
                convertClassInstanceToMap: true,
            },
            unmarshallOptions: {
                wrapNumbers: false,
            },
        });
    }
    /**
     * Get connection metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Health check - verify table exists and is accessible
     */
    async healthCheck() {
        try {
            const command = new client_dynamodb_1.DescribeTableCommand({ TableName: this.tableName });
            await this.client.send(command);
            return true;
        }
        catch (error) {
            console.error('DynamoDB health check failed:', error);
            return false;
        }
    }
    /**
     * Get single item by key
     */
    async getItem(pk, sk, options) {
        const startTime = Date.now();
        this.metrics.totalRequests++;
        this.metrics.activeConnections++;
        try {
            const params = {
                TableName: this.tableName,
                Key: { PK: pk, SK: sk },
            };
            if (options?.consistentRead) {
                params.ConsistentRead = options.consistentRead;
            }
            if (options?.projectionExpression) {
                params.ProjectionExpression = options.projectionExpression;
            }
            if (options?.expressionAttributeNames) {
                params.ExpressionAttributeNames = options.expressionAttributeNames;
            }
            const command = new lib_dynamodb_1.GetCommand(params);
            const result = await this.docClient.send(command);
            this.recordSuccess(startTime);
            return result.Item || null;
        }
        catch (error) {
            this.recordFailure(startTime);
            throw this.handleError(error, 'getItem', { pk, sk });
        }
        finally {
            this.metrics.activeConnections--;
        }
    }
    /**
     * Put single item
     */
    async putItem(item, conditionExpression) {
        const startTime = Date.now();
        this.metrics.totalRequests++;
        this.metrics.activeConnections++;
        try {
            const params = {
                TableName: this.tableName,
                Item: item,
                ReturnValues: 'ALL_NEW',
            };
            if (conditionExpression) {
                params.ConditionExpression = conditionExpression;
            }
            const command = new lib_dynamodb_1.PutCommand(params);
            const result = await this.docClient.send(command);
            this.recordSuccess(startTime);
            return result.Attributes;
        }
        catch (error) {
            this.recordFailure(startTime);
            throw this.handleError(error, 'putItem', { item });
        }
        finally {
            this.metrics.activeConnections--;
        }
    }
    /**
     * Update item
     */
    async updateItem(pk, sk, options) {
        const startTime = Date.now();
        this.metrics.totalRequests++;
        this.metrics.activeConnections++;
        try {
            const params = {
                TableName: this.tableName,
                Key: { PK: pk, SK: sk },
                UpdateExpression: options.updateExpression,
                ReturnValues: options.returnValues || 'ALL_NEW',
            };
            if (options.conditionExpression) {
                params.ConditionExpression = options.conditionExpression;
            }
            if (options.expressionAttributeNames) {
                params.ExpressionAttributeNames = options.expressionAttributeNames;
            }
            if (options.expressionAttributeValues) {
                params.ExpressionAttributeValues = options.expressionAttributeValues;
            }
            const command = new lib_dynamodb_1.UpdateCommand(params);
            const result = await this.docClient.send(command);
            this.recordSuccess(startTime);
            return result.Attributes;
        }
        catch (error) {
            this.recordFailure(startTime);
            throw this.handleError(error, 'updateItem', { pk, sk, options });
        }
        finally {
            this.metrics.activeConnections--;
        }
    }
    /**
     * Delete item
     */
    async deleteItem(pk, sk, options) {
        const startTime = Date.now();
        this.metrics.totalRequests++;
        this.metrics.activeConnections++;
        try {
            const params = {
                TableName: this.tableName,
                Key: { PK: pk, SK: sk },
            };
            if (options?.conditionExpression) {
                params.ConditionExpression = options.conditionExpression;
            }
            if (options?.expressionAttributeNames) {
                params.ExpressionAttributeNames = options.expressionAttributeNames;
            }
            if (options?.expressionAttributeValues) {
                params.ExpressionAttributeValues = options.expressionAttributeValues;
            }
            if (options?.returnValues) {
                params.ReturnValues = options.returnValues;
            }
            const command = new lib_dynamodb_1.DeleteCommand(params);
            await this.docClient.send(command);
            this.recordSuccess(startTime);
        }
        catch (error) {
            this.recordFailure(startTime);
            throw this.handleError(error, 'deleteItem', { pk, sk });
        }
        finally {
            this.metrics.activeConnections--;
        }
    }
    /**
     * Query items
     */
    async query(keyConditionExpression, options) {
        const startTime = Date.now();
        this.metrics.totalRequests++;
        this.metrics.activeConnections++;
        try {
            const params = {
                TableName: this.tableName,
                KeyConditionExpression: keyConditionExpression,
            };
            if (options?.indexName) {
                params.IndexName = options.indexName;
            }
            if (options?.filterExpression) {
                params.FilterExpression = options.filterExpression;
            }
            if (options?.projectionExpression) {
                params.ProjectionExpression = options.projectionExpression;
            }
            if (options?.expressionAttributeNames) {
                params.ExpressionAttributeNames = options.expressionAttributeNames;
            }
            if (options?.expressionAttributeValues) {
                params.ExpressionAttributeValues = options.expressionAttributeValues;
            }
            if (options?.limit) {
                params.Limit = options.limit;
            }
            if (options?.exclusiveStartKey) {
                params.ExclusiveStartKey = options.exclusiveStartKey;
            }
            if (options?.consistentRead) {
                params.ConsistentRead = options.consistentRead;
            }
            if (options?.scanIndexForward !== undefined) {
                params.ScanIndexForward = options.scanIndexForward;
            }
            const command = new lib_dynamodb_1.QueryCommand(params);
            const result = await this.docClient.send(command);
            this.recordSuccess(startTime);
            return {
                items: result.Items || [],
                lastEvaluatedKey: result.LastEvaluatedKey,
                count: result.Count || 0,
                scannedCount: result.ScannedCount,
            };
        }
        catch (error) {
            this.recordFailure(startTime);
            throw this.handleError(error, 'query', { keyConditionExpression, options });
        }
        finally {
            this.metrics.activeConnections--;
        }
    }
    /**
     * Batch get items
     */
    async batchGet(keys, options) {
        const startTime = Date.now();
        this.metrics.totalRequests++;
        this.metrics.activeConnections++;
        try {
            const requestItems = {
                [this.tableName]: {
                    Keys: keys.map(key => ({ PK: key.pk, SK: key.sk })),
                },
            };
            if (options?.consistentRead) {
                requestItems[this.tableName].ConsistentRead = options.consistentRead;
            }
            if (options?.projectionExpression) {
                requestItems[this.tableName].ProjectionExpression = options.projectionExpression;
            }
            if (options?.expressionAttributeNames) {
                requestItems[this.tableName].ExpressionAttributeNames = options.expressionAttributeNames;
            }
            const command = new lib_dynamodb_1.BatchGetCommand({
                RequestItems: requestItems,
            });
            const result = await this.docClient.send(command);
            this.recordSuccess(startTime);
            return result.Responses?.[this.tableName] || [];
        }
        catch (error) {
            this.recordFailure(startTime);
            throw this.handleError(error, 'batchGet', { keys });
        }
        finally {
            this.metrics.activeConnections--;
        }
    }
    /**
     * Batch write items (put/delete)
     */
    async batchWrite(items, operation = 'put', options) {
        const startTime = Date.now();
        this.metrics.totalRequests++;
        this.metrics.activeConnections++;
        try {
            const requestItems = {
                [this.tableName]: items.map(item => {
                    if (operation === 'put') {
                        return { PutRequest: { Item: item } };
                    }
                    else {
                        // For delete, item should have PK and SK
                        const key = { PK: item.PK, SK: item.SK };
                        return { DeleteRequest: { Key: key } };
                    }
                }),
            };
            const params = {
                RequestItems: requestItems,
            };
            if (options?.returnConsumedCapacity) {
                params.ReturnConsumedCapacity = options.returnConsumedCapacity;
            }
            if (options?.returnItemCollectionMetrics) {
                params.ReturnItemCollectionMetrics = options.returnItemCollectionMetrics;
            }
            const command = new lib_dynamodb_1.BatchWriteCommand(params);
            await this.docClient.send(command);
            this.recordSuccess(startTime);
        }
        catch (error) {
            this.recordFailure(startTime);
            throw this.handleError(error, 'batchWrite', { items, operation });
        }
        finally {
            this.metrics.activeConnections--;
        }
    }
    /**
     * Execute transaction
     */
    async transaction(items) {
        const startTime = Date.now();
        this.metrics.totalRequests++;
        this.metrics.activeConnections++;
        try {
            const transactItems = items.map(item => {
                const baseParams = {
                    TableName: this.tableName,
                    ConditionExpression: item.conditionExpression,
                    ExpressionAttributeNames: item.expressionAttributeNames,
                    ExpressionAttributeValues: item.expressionAttributeValues,
                };
                switch (item.operation) {
                    case 'put':
                        return {
                            Put: {
                                ...baseParams,
                                Item: item.item,
                            },
                        };
                    case 'update':
                        return {
                            Update: {
                                ...baseParams,
                                Key: item.key,
                                UpdateExpression: item.updateExpression,
                            },
                        };
                    case 'delete':
                        return {
                            Delete: {
                                ...baseParams,
                                Key: item.key,
                            },
                        };
                    case 'conditionCheck':
                        return {
                            ConditionCheck: {
                                ...baseParams,
                                Key: item.key,
                            },
                        };
                    default:
                        throw new Error(`Unsupported transaction operation: ${item.operation}`);
                }
            });
            const command = new lib_dynamodb_1.TransactWriteCommand({
                TransactItems: transactItems,
            });
            await this.docClient.send(command);
            this.recordSuccess(startTime);
        }
        catch (error) {
            this.recordFailure(startTime);
            throw this.handleError(error, 'transaction', { items });
        }
        finally {
            this.metrics.activeConnections--;
        }
    }
    /**
     * Check if item exists
     */
    async exists(pk, sk) {
        try {
            const result = await this.getItem(pk, sk, {
                projectionExpression: 'PK',
            });
            return result !== null;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get count of items matching query
     */
    async count(keyConditionExpression, options) {
        const result = await this.query(keyConditionExpression, {
            ...options,
            projectionExpression: 'PK',
        });
        return result.count;
    }
    /**
     * Record successful operation
     */
    recordSuccess(startTime) {
        const latency = Date.now() - startTime;
        this.metrics.successfulRequests++;
        this.metrics.lastRequestTime = new Date();
        this.updateAverageLatency(latency);
    }
    /**
     * Record failed operation
     */
    recordFailure(startTime) {
        const latency = Date.now() - startTime;
        this.metrics.failedRequests++;
        this.metrics.lastRequestTime = new Date();
        this.updateAverageLatency(latency);
    }
    /**
     * Update average latency calculation
     */
    updateAverageLatency(latency) {
        this.requestTimes.push(latency);
        // Keep only last 100 request times for rolling average
        if (this.requestTimes.length > 100) {
            this.requestTimes.shift();
        }
        this.metrics.averageLatency =
            this.requestTimes.reduce((sum, time) => sum + time, 0) / this.requestTimes.length;
    }
    /**
     * Handle and format errors
     */
    handleError(error, operation, context) {
        const errorMessage = `DynamoDB ${operation} failed: ${error.message}`;
        const enhancedError = new Error(errorMessage);
        // Add context to error for debugging
        enhancedError.originalError = error;
        enhancedError.operation = operation;
        enhancedError.context = context;
        enhancedError.tableName = this.tableName;
        // Log error for monitoring
        console.error('DynamoDB Error:', {
            operation,
            error: error.message,
            context,
            tableName: this.tableName,
        });
        return enhancedError;
    }
    /**
     * Close connections and cleanup
     */
    async close() {
        // DynamoDB client doesn't require explicit closing
        // but we can reset metrics
        this.metrics = {
            activeConnections: 0,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageLatency: 0,
        };
        this.requestTimes = [];
    }
}
exports.DynamoDBService = DynamoDBService;
//# sourceMappingURL=dynamodb-service.js.map