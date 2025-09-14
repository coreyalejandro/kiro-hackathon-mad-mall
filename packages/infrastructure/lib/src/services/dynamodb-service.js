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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1vZGItc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2aWNlcy9keW5hbW9kYi1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7OztBQUVILDhEQVlrQztBQUNsQyx3REFVK0I7QUFFL0Isa0VBQTZEO0FBK0I3RCxNQUFhLGVBQWU7SUFPMUIsWUFBWSxNQUE2QjtRQUZqQyxpQkFBWSxHQUFhLEVBQUUsQ0FBQztRQUdsQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDbEMsSUFBSSxDQUFDLE9BQU8sR0FBRztZQUNiLGlCQUFpQixFQUFFLENBQUM7WUFDcEIsYUFBYSxFQUFFLENBQUM7WUFDaEIsa0JBQWtCLEVBQUUsQ0FBQztZQUNyQixjQUFjLEVBQUUsQ0FBQztZQUNqQixjQUFjLEVBQUUsQ0FBQztTQUNsQixDQUFDO1FBRUYsNEJBQTRCO1FBQzVCLE1BQU0sWUFBWSxHQUF5QjtZQUN6QyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07WUFDckIsV0FBVyxFQUFFLE1BQU0sQ0FBQyxVQUFVLElBQUksQ0FBQztZQUNuQyxjQUFjLEVBQUUsSUFBSSxtQ0FBZSxDQUFDO2dCQUNsQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsT0FBTyxJQUFJLElBQUk7Z0JBQ3pDLGFBQWEsRUFBRSxNQUFNLENBQUMsT0FBTyxJQUFJLElBQUk7Z0JBQ3JDLFVBQVUsRUFBRSxNQUFNLENBQUMsa0JBQWtCLElBQUksRUFBRTthQUM1QyxDQUFDO1NBQ0gsQ0FBQztRQUVGLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3BCLFlBQVksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUMxQyxDQUFDO1FBRUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGdDQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLFNBQVMs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Q0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLENBQUM7Q0FDRjtBQWhqQkQsMENBZ2pCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRHluYW1vREIgU2VydmljZSBMYXllclxuICogQ29yZSBzZXJ2aWNlIGZvciBEeW5hbW9EQiBvcGVyYXRpb25zIHdpdGggY29ubmVjdGlvbiBtYW5hZ2VtZW50IGFuZCBlcnJvciBoYW5kbGluZ1xuICovXG5cbmltcG9ydCB7XG4gIER5bmFtb0RCQ2xpZW50LFxuICBEeW5hbW9EQkNsaWVudENvbmZpZyxcbiAgR2V0SXRlbUNvbW1hbmQsXG4gIFB1dEl0ZW1Db21tYW5kLFxuICBVcGRhdGVJdGVtQ29tbWFuZCxcbiAgRGVsZXRlSXRlbUNvbW1hbmQsXG4gIFF1ZXJ5Q29tbWFuZCxcbiAgQmF0Y2hHZXRJdGVtQ29tbWFuZCxcbiAgQmF0Y2hXcml0ZUl0ZW1Db21tYW5kLFxuICBUcmFuc2FjdFdyaXRlSXRlbXNDb21tYW5kLFxuICBEZXNjcmliZVRhYmxlQ29tbWFuZCxcbn0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiJztcbmltcG9ydCB7XG4gIER5bmFtb0RCRG9jdW1lbnRDbGllbnQsXG4gIEdldENvbW1hbmQsXG4gIFB1dENvbW1hbmQsXG4gIFVwZGF0ZUNvbW1hbmQsXG4gIERlbGV0ZUNvbW1hbmQsXG4gIFF1ZXJ5Q29tbWFuZCBhcyBEb2NRdWVyeUNvbW1hbmQsXG4gIEJhdGNoR2V0Q29tbWFuZCxcbiAgQmF0Y2hXcml0ZUNvbW1hbmQsXG4gIFRyYW5zYWN0V3JpdGVDb21tYW5kLFxufSBmcm9tICdAYXdzLXNkay9saWItZHluYW1vZGInO1xuaW1wb3J0IHsgbWFyc2hhbGwsIHVubWFyc2hhbGwgfSBmcm9tICdAYXdzLXNkay91dGlsLWR5bmFtb2RiJztcbmltcG9ydCB7IE5vZGVIdHRwSGFuZGxlciB9IGZyb20gJ0Bhd3Mtc2RrL25vZGUtaHR0cC1oYW5kbGVyJztcbmltcG9ydCB7IFxuICBRdWVyeU9wdGlvbnMsIFxuICBRdWVyeVJlc3VsdCwgXG4gIEJhdGNoR2V0T3B0aW9ucywgXG4gIEJhdGNoV3JpdGVPcHRpb25zLCBcbiAgVXBkYXRlT3B0aW9ucywgXG4gIERlbGV0ZU9wdGlvbnMsIFxuICBUcmFuc2FjdGlvbkl0ZW0gXG59IGZyb20gJ0BtYWRtYWxsL3NoYXJlZC10eXBlcy9kYXRhYmFzZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHluYW1vREJTZXJ2aWNlQ29uZmlnIHtcbiAgcmVnaW9uOiBzdHJpbmc7XG4gIHRhYmxlTmFtZTogc3RyaW5nO1xuICBlbmRwb2ludD86IHN0cmluZztcbiAgbWF4UmV0cmllcz86IG51bWJlcjtcbiAgdGltZW91dD86IG51bWJlcjtcbiAgY29ubmVjdGlvblBvb2xTaXplPzogbnVtYmVyO1xuICBlbmFibGVYUmF5VHJhY2luZz86IGJvb2xlYW47XG4gIGVuYWJsZU1ldHJpY3M/OiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbm5lY3Rpb25NZXRyaWNzIHtcbiAgYWN0aXZlQ29ubmVjdGlvbnM6IG51bWJlcjtcbiAgdG90YWxSZXF1ZXN0czogbnVtYmVyO1xuICBzdWNjZXNzZnVsUmVxdWVzdHM6IG51bWJlcjtcbiAgZmFpbGVkUmVxdWVzdHM6IG51bWJlcjtcbiAgYXZlcmFnZUxhdGVuY3k6IG51bWJlcjtcbiAgbGFzdFJlcXVlc3RUaW1lPzogRGF0ZTtcbn1cblxuZXhwb3J0IGNsYXNzIER5bmFtb0RCU2VydmljZSB7XG4gIHByaXZhdGUgY2xpZW50OiBEeW5hbW9EQkNsaWVudDtcbiAgcHJpdmF0ZSBkb2NDbGllbnQ6IER5bmFtb0RCRG9jdW1lbnRDbGllbnQ7XG4gIHByaXZhdGUgdGFibGVOYW1lOiBzdHJpbmc7XG4gIHByaXZhdGUgbWV0cmljczogQ29ubmVjdGlvbk1ldHJpY3M7XG4gIHByaXZhdGUgcmVxdWVzdFRpbWVzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogRHluYW1vREJTZXJ2aWNlQ29uZmlnKSB7XG4gICAgdGhpcy50YWJsZU5hbWUgPSBjb25maWcudGFibGVOYW1lO1xuICAgIHRoaXMubWV0cmljcyA9IHtcbiAgICAgIGFjdGl2ZUNvbm5lY3Rpb25zOiAwLFxuICAgICAgdG90YWxSZXF1ZXN0czogMCxcbiAgICAgIHN1Y2Nlc3NmdWxSZXF1ZXN0czogMCxcbiAgICAgIGZhaWxlZFJlcXVlc3RzOiAwLFxuICAgICAgYXZlcmFnZUxhdGVuY3k6IDAsXG4gICAgfTtcblxuICAgIC8vIENvbmZpZ3VyZSBEeW5hbW9EQiBjbGllbnRcbiAgICBjb25zdCBjbGllbnRDb25maWc6IER5bmFtb0RCQ2xpZW50Q29uZmlnID0ge1xuICAgICAgcmVnaW9uOiBjb25maWcucmVnaW9uLFxuICAgICAgbWF4QXR0ZW1wdHM6IGNvbmZpZy5tYXhSZXRyaWVzIHx8IDMsXG4gICAgICByZXF1ZXN0SGFuZGxlcjogbmV3IE5vZGVIdHRwSGFuZGxlcih7XG4gICAgICAgIGNvbm5lY3Rpb25UaW1lb3V0OiBjb25maWcudGltZW91dCB8fCAzMDAwLFxuICAgICAgICBzb2NrZXRUaW1lb3V0OiBjb25maWcudGltZW91dCB8fCAzMDAwLFxuICAgICAgICBtYXhTb2NrZXRzOiBjb25maWcuY29ubmVjdGlvblBvb2xTaXplIHx8IDUwLFxuICAgICAgfSksXG4gICAgfTtcblxuICAgIGlmIChjb25maWcuZW5kcG9pbnQpIHtcbiAgICAgIGNsaWVudENvbmZpZy5lbmRwb2ludCA9IGNvbmZpZy5lbmRwb2ludDtcbiAgICB9XG5cbiAgICB0aGlzLmNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudChjbGllbnRDb25maWcpO1xuICAgIHRoaXMuZG9jQ2xpZW50ID0gRHluYW1vREJEb2N1bWVudENsaWVudC5mcm9tKHRoaXMuY2xpZW50LCB7XG4gICAgICBtYXJzaGFsbE9wdGlvbnM6IHtcbiAgICAgICAgY29udmVydEVtcHR5VmFsdWVzOiBmYWxzZSxcbiAgICAgICAgcmVtb3ZlVW5kZWZpbmVkVmFsdWVzOiB0cnVlLFxuICAgICAgICBjb252ZXJ0Q2xhc3NJbnN0YW5jZVRvTWFwOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIHVubWFyc2hhbGxPcHRpb25zOiB7XG4gICAgICAgIHdyYXBOdW1iZXJzOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGNvbm5lY3Rpb24gbWV0cmljc1xuICAgKi9cbiAgZ2V0TWV0cmljcygpOiBDb25uZWN0aW9uTWV0cmljcyB7XG4gICAgcmV0dXJuIHsgLi4udGhpcy5tZXRyaWNzIH07XG4gIH1cblxuICAvKipcbiAgICogSGVhbHRoIGNoZWNrIC0gdmVyaWZ5IHRhYmxlIGV4aXN0cyBhbmQgaXMgYWNjZXNzaWJsZVxuICAgKi9cbiAgYXN5bmMgaGVhbHRoQ2hlY2soKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgRGVzY3JpYmVUYWJsZUNvbW1hbmQoeyBUYWJsZU5hbWU6IHRoaXMudGFibGVOYW1lIH0pO1xuICAgICAgYXdhaXQgdGhpcy5jbGllbnQuc2VuZChjb21tYW5kKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdEeW5hbW9EQiBoZWFsdGggY2hlY2sgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHNpbmdsZSBpdGVtIGJ5IGtleVxuICAgKi9cbiAgYXN5bmMgZ2V0SXRlbTxUPihwazogc3RyaW5nLCBzazogc3RyaW5nLCBvcHRpb25zPzogUXVlcnlPcHRpb25zKTogUHJvbWlzZTxUIHwgbnVsbD4ge1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgdGhpcy5tZXRyaWNzLnRvdGFsUmVxdWVzdHMrKztcbiAgICB0aGlzLm1ldHJpY3MuYWN0aXZlQ29ubmVjdGlvbnMrKztcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgICAgVGFibGVOYW1lOiB0aGlzLnRhYmxlTmFtZSxcbiAgICAgICAgS2V5OiB7IFBLOiBwaywgU0s6IHNrIH0sXG4gICAgICB9O1xuXG4gICAgICBpZiAob3B0aW9ucz8uY29uc2lzdGVudFJlYWQpIHtcbiAgICAgICAgcGFyYW1zLkNvbnNpc3RlbnRSZWFkID0gb3B0aW9ucy5jb25zaXN0ZW50UmVhZDtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnM/LnByb2plY3Rpb25FeHByZXNzaW9uKSB7XG4gICAgICAgIHBhcmFtcy5Qcm9qZWN0aW9uRXhwcmVzc2lvbiA9IG9wdGlvbnMucHJvamVjdGlvbkV4cHJlc3Npb247XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zPy5leHByZXNzaW9uQXR0cmlidXRlTmFtZXMpIHtcbiAgICAgICAgcGFyYW1zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcyA9IG9wdGlvbnMuZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjb21tYW5kID0gbmV3IEdldENvbW1hbmQocGFyYW1zKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZG9jQ2xpZW50LnNlbmQoY29tbWFuZCk7XG5cbiAgICAgIHRoaXMucmVjb3JkU3VjY2VzcyhzdGFydFRpbWUpO1xuICAgICAgcmV0dXJuIHJlc3VsdC5JdGVtIGFzIFQgfHwgbnVsbDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5yZWNvcmRGYWlsdXJlKHN0YXJ0VGltZSk7XG4gICAgICB0aHJvdyB0aGlzLmhhbmRsZUVycm9yKGVycm9yLCAnZ2V0SXRlbScsIHsgcGssIHNrIH0pO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLm1ldHJpY3MuYWN0aXZlQ29ubmVjdGlvbnMtLTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHV0IHNpbmdsZSBpdGVtXG4gICAqL1xuICBhc3luYyBwdXRJdGVtPFQ+KGl0ZW06IFQsIGNvbmRpdGlvbkV4cHJlc3Npb24/OiBzdHJpbmcpOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMubWV0cmljcy50b3RhbFJlcXVlc3RzKys7XG4gICAgdGhpcy5tZXRyaWNzLmFjdGl2ZUNvbm5lY3Rpb25zKys7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICAgIFRhYmxlTmFtZTogdGhpcy50YWJsZU5hbWUsXG4gICAgICAgIEl0ZW06IGl0ZW0sXG4gICAgICAgIFJldHVyblZhbHVlczogJ0FMTF9ORVcnLFxuICAgICAgfTtcblxuICAgICAgaWYgKGNvbmRpdGlvbkV4cHJlc3Npb24pIHtcbiAgICAgICAgcGFyYW1zLkNvbmRpdGlvbkV4cHJlc3Npb24gPSBjb25kaXRpb25FeHByZXNzaW9uO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjb21tYW5kID0gbmV3IFB1dENvbW1hbmQocGFyYW1zKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZG9jQ2xpZW50LnNlbmQoY29tbWFuZCk7XG5cbiAgICAgIHRoaXMucmVjb3JkU3VjY2VzcyhzdGFydFRpbWUpO1xuICAgICAgcmV0dXJuIHJlc3VsdC5BdHRyaWJ1dGVzIGFzIFQ7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMucmVjb3JkRmFpbHVyZShzdGFydFRpbWUpO1xuICAgICAgdGhyb3cgdGhpcy5oYW5kbGVFcnJvcihlcnJvciwgJ3B1dEl0ZW0nLCB7IGl0ZW0gfSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMubWV0cmljcy5hY3RpdmVDb25uZWN0aW9ucy0tO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgaXRlbVxuICAgKi9cbiAgYXN5bmMgdXBkYXRlSXRlbTxUPihcbiAgICBwazogc3RyaW5nLFxuICAgIHNrOiBzdHJpbmcsXG4gICAgb3B0aW9uczogVXBkYXRlT3B0aW9uc1xuICApOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMubWV0cmljcy50b3RhbFJlcXVlc3RzKys7XG4gICAgdGhpcy5tZXRyaWNzLmFjdGl2ZUNvbm5lY3Rpb25zKys7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICAgIFRhYmxlTmFtZTogdGhpcy50YWJsZU5hbWUsXG4gICAgICAgIEtleTogeyBQSzogcGssIFNLOiBzayB9LFxuICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiBvcHRpb25zLnVwZGF0ZUV4cHJlc3Npb24sXG4gICAgICAgIFJldHVyblZhbHVlczogb3B0aW9ucy5yZXR1cm5WYWx1ZXMgfHwgJ0FMTF9ORVcnLFxuICAgICAgfTtcblxuICAgICAgaWYgKG9wdGlvbnMuY29uZGl0aW9uRXhwcmVzc2lvbikge1xuICAgICAgICBwYXJhbXMuQ29uZGl0aW9uRXhwcmVzc2lvbiA9IG9wdGlvbnMuY29uZGl0aW9uRXhwcmVzc2lvbjtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzKSB7XG4gICAgICAgIHBhcmFtcy5FeHByZXNzaW9uQXR0cmlidXRlTmFtZXMgPSBvcHRpb25zLmV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcztcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMuZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcykge1xuICAgICAgICBwYXJhbXMuRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyA9IG9wdGlvbnMuZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcztcbiAgICAgIH1cblxuICAgICAgY29uc3QgY29tbWFuZCA9IG5ldyBVcGRhdGVDb21tYW5kKHBhcmFtcyk7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmRvY0NsaWVudC5zZW5kKGNvbW1hbmQpO1xuXG4gICAgICB0aGlzLnJlY29yZFN1Y2Nlc3Moc3RhcnRUaW1lKTtcbiAgICAgIHJldHVybiByZXN1bHQuQXR0cmlidXRlcyBhcyBUO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLnJlY29yZEZhaWx1cmUoc3RhcnRUaW1lKTtcbiAgICAgIHRocm93IHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IsICd1cGRhdGVJdGVtJywgeyBwaywgc2ssIG9wdGlvbnMgfSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMubWV0cmljcy5hY3RpdmVDb25uZWN0aW9ucy0tO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGUgaXRlbVxuICAgKi9cbiAgYXN5bmMgZGVsZXRlSXRlbShwazogc3RyaW5nLCBzazogc3RyaW5nLCBvcHRpb25zPzogRGVsZXRlT3B0aW9ucyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgdGhpcy5tZXRyaWNzLnRvdGFsUmVxdWVzdHMrKztcbiAgICB0aGlzLm1ldHJpY3MuYWN0aXZlQ29ubmVjdGlvbnMrKztcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgICAgVGFibGVOYW1lOiB0aGlzLnRhYmxlTmFtZSxcbiAgICAgICAgS2V5OiB7IFBLOiBwaywgU0s6IHNrIH0sXG4gICAgICB9O1xuXG4gICAgICBpZiAob3B0aW9ucz8uY29uZGl0aW9uRXhwcmVzc2lvbikge1xuICAgICAgICBwYXJhbXMuQ29uZGl0aW9uRXhwcmVzc2lvbiA9IG9wdGlvbnMuY29uZGl0aW9uRXhwcmVzc2lvbjtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnM/LmV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcykge1xuICAgICAgICBwYXJhbXMuRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzID0gb3B0aW9ucy5leHByZXNzaW9uQXR0cmlidXRlTmFtZXM7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zPy5leHByZXNzaW9uQXR0cmlidXRlVmFsdWVzKSB7XG4gICAgICAgIHBhcmFtcy5FeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzID0gb3B0aW9ucy5leHByZXNzaW9uQXR0cmlidXRlVmFsdWVzO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucz8ucmV0dXJuVmFsdWVzKSB7XG4gICAgICAgIHBhcmFtcy5SZXR1cm5WYWx1ZXMgPSBvcHRpb25zLnJldHVyblZhbHVlcztcbiAgICAgIH1cblxuICAgICAgY29uc3QgY29tbWFuZCA9IG5ldyBEZWxldGVDb21tYW5kKHBhcmFtcyk7XG4gICAgICBhd2FpdCB0aGlzLmRvY0NsaWVudC5zZW5kKGNvbW1hbmQpO1xuXG4gICAgICB0aGlzLnJlY29yZFN1Y2Nlc3Moc3RhcnRUaW1lKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5yZWNvcmRGYWlsdXJlKHN0YXJ0VGltZSk7XG4gICAgICB0aHJvdyB0aGlzLmhhbmRsZUVycm9yKGVycm9yLCAnZGVsZXRlSXRlbScsIHsgcGssIHNrIH0pO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLm1ldHJpY3MuYWN0aXZlQ29ubmVjdGlvbnMtLTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUXVlcnkgaXRlbXNcbiAgICovXG4gIGFzeW5jIHF1ZXJ5PFQ+KFxuICAgIGtleUNvbmRpdGlvbkV4cHJlc3Npb246IHN0cmluZyxcbiAgICBvcHRpb25zPzogUXVlcnlPcHRpb25zICYgeyBpbmRleE5hbWU/OiBzdHJpbmcgfVxuICApOiBQcm9taXNlPFF1ZXJ5UmVzdWx0PFQ+PiB7XG4gICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLm1ldHJpY3MudG90YWxSZXF1ZXN0cysrO1xuICAgIHRoaXMubWV0cmljcy5hY3RpdmVDb25uZWN0aW9ucysrO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgICBUYWJsZU5hbWU6IHRoaXMudGFibGVOYW1lLFxuICAgICAgICBLZXlDb25kaXRpb25FeHByZXNzaW9uOiBrZXlDb25kaXRpb25FeHByZXNzaW9uLFxuICAgICAgfTtcblxuICAgICAgaWYgKG9wdGlvbnM/LmluZGV4TmFtZSkge1xuICAgICAgICBwYXJhbXMuSW5kZXhOYW1lID0gb3B0aW9ucy5pbmRleE5hbWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zPy5maWx0ZXJFeHByZXNzaW9uKSB7XG4gICAgICAgIHBhcmFtcy5GaWx0ZXJFeHByZXNzaW9uID0gb3B0aW9ucy5maWx0ZXJFeHByZXNzaW9uO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucz8ucHJvamVjdGlvbkV4cHJlc3Npb24pIHtcbiAgICAgICAgcGFyYW1zLlByb2plY3Rpb25FeHByZXNzaW9uID0gb3B0aW9ucy5wcm9qZWN0aW9uRXhwcmVzc2lvbjtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnM/LmV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcykge1xuICAgICAgICBwYXJhbXMuRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzID0gb3B0aW9ucy5leHByZXNzaW9uQXR0cmlidXRlTmFtZXM7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zPy5leHByZXNzaW9uQXR0cmlidXRlVmFsdWVzKSB7XG4gICAgICAgIHBhcmFtcy5FeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzID0gb3B0aW9ucy5leHByZXNzaW9uQXR0cmlidXRlVmFsdWVzO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucz8ubGltaXQpIHtcbiAgICAgICAgcGFyYW1zLkxpbWl0ID0gb3B0aW9ucy5saW1pdDtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnM/LmV4Y2x1c2l2ZVN0YXJ0S2V5KSB7XG4gICAgICAgIHBhcmFtcy5FeGNsdXNpdmVTdGFydEtleSA9IG9wdGlvbnMuZXhjbHVzaXZlU3RhcnRLZXk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zPy5jb25zaXN0ZW50UmVhZCkge1xuICAgICAgICBwYXJhbXMuQ29uc2lzdGVudFJlYWQgPSBvcHRpb25zLmNvbnNpc3RlbnRSZWFkO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucz8uc2NhbkluZGV4Rm9yd2FyZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHBhcmFtcy5TY2FuSW5kZXhGb3J3YXJkID0gb3B0aW9ucy5zY2FuSW5kZXhGb3J3YXJkO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjb21tYW5kID0gbmV3IERvY1F1ZXJ5Q29tbWFuZChwYXJhbXMpO1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5kb2NDbGllbnQuc2VuZChjb21tYW5kKTtcblxuICAgICAgdGhpcy5yZWNvcmRTdWNjZXNzKHN0YXJ0VGltZSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGl0ZW1zOiAocmVzdWx0Lkl0ZW1zIGFzIFRbXSkgfHwgW10sXG4gICAgICAgIGxhc3RFdmFsdWF0ZWRLZXk6IHJlc3VsdC5MYXN0RXZhbHVhdGVkS2V5LFxuICAgICAgICBjb3VudDogcmVzdWx0LkNvdW50IHx8IDAsXG4gICAgICAgIHNjYW5uZWRDb3VudDogcmVzdWx0LlNjYW5uZWRDb3VudCxcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMucmVjb3JkRmFpbHVyZShzdGFydFRpbWUpO1xuICAgICAgdGhyb3cgdGhpcy5oYW5kbGVFcnJvcihlcnJvciwgJ3F1ZXJ5JywgeyBrZXlDb25kaXRpb25FeHByZXNzaW9uLCBvcHRpb25zIH0pO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0aGlzLm1ldHJpY3MuYWN0aXZlQ29ubmVjdGlvbnMtLTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQmF0Y2ggZ2V0IGl0ZW1zXG4gICAqL1xuICBhc3luYyBiYXRjaEdldDxUPihcbiAgICBrZXlzOiBBcnJheTx7IHBrOiBzdHJpbmc7IHNrOiBzdHJpbmcgfT4sXG4gICAgb3B0aW9ucz86IEJhdGNoR2V0T3B0aW9uc1xuICApOiBQcm9taXNlPFRbXT4ge1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgdGhpcy5tZXRyaWNzLnRvdGFsUmVxdWVzdHMrKztcbiAgICB0aGlzLm1ldHJpY3MuYWN0aXZlQ29ubmVjdGlvbnMrKztcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXF1ZXN0SXRlbXM6IGFueSA9IHtcbiAgICAgICAgW3RoaXMudGFibGVOYW1lXToge1xuICAgICAgICAgIEtleXM6IGtleXMubWFwKGtleSA9PiAoeyBQSzoga2V5LnBrLCBTSzoga2V5LnNrIH0pKSxcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIGlmIChvcHRpb25zPy5jb25zaXN0ZW50UmVhZCkge1xuICAgICAgICByZXF1ZXN0SXRlbXNbdGhpcy50YWJsZU5hbWVdLkNvbnNpc3RlbnRSZWFkID0gb3B0aW9ucy5jb25zaXN0ZW50UmVhZDtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnM/LnByb2plY3Rpb25FeHByZXNzaW9uKSB7XG4gICAgICAgIHJlcXVlc3RJdGVtc1t0aGlzLnRhYmxlTmFtZV0uUHJvamVjdGlvbkV4cHJlc3Npb24gPSBvcHRpb25zLnByb2plY3Rpb25FeHByZXNzaW9uO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucz8uZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzKSB7XG4gICAgICAgIHJlcXVlc3RJdGVtc1t0aGlzLnRhYmxlTmFtZV0uRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzID0gb3B0aW9ucy5leHByZXNzaW9uQXR0cmlidXRlTmFtZXM7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgQmF0Y2hHZXRDb21tYW5kKHtcbiAgICAgICAgUmVxdWVzdEl0ZW1zOiByZXF1ZXN0SXRlbXMsXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5kb2NDbGllbnQuc2VuZChjb21tYW5kKTtcblxuICAgICAgdGhpcy5yZWNvcmRTdWNjZXNzKHN0YXJ0VGltZSk7XG4gICAgICByZXR1cm4gKHJlc3VsdC5SZXNwb25zZXM/Llt0aGlzLnRhYmxlTmFtZV0gYXMgVFtdKSB8fCBbXTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5yZWNvcmRGYWlsdXJlKHN0YXJ0VGltZSk7XG4gICAgICB0aHJvdyB0aGlzLmhhbmRsZUVycm9yKGVycm9yLCAnYmF0Y2hHZXQnLCB7IGtleXMgfSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMubWV0cmljcy5hY3RpdmVDb25uZWN0aW9ucy0tO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBCYXRjaCB3cml0ZSBpdGVtcyAocHV0L2RlbGV0ZSlcbiAgICovXG4gIGFzeW5jIGJhdGNoV3JpdGU8VD4oXG4gICAgaXRlbXM6IFRbXSxcbiAgICBvcGVyYXRpb246ICdwdXQnIHwgJ2RlbGV0ZScgPSAncHV0JyxcbiAgICBvcHRpb25zPzogQmF0Y2hXcml0ZU9wdGlvbnNcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLm1ldHJpY3MudG90YWxSZXF1ZXN0cysrO1xuICAgIHRoaXMubWV0cmljcy5hY3RpdmVDb25uZWN0aW9ucysrO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcXVlc3RJdGVtczogYW55ID0ge1xuICAgICAgICBbdGhpcy50YWJsZU5hbWVdOiBpdGVtcy5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgaWYgKG9wZXJhdGlvbiA9PT0gJ3B1dCcpIHtcbiAgICAgICAgICAgIHJldHVybiB7IFB1dFJlcXVlc3Q6IHsgSXRlbTogaXRlbSB9IH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEZvciBkZWxldGUsIGl0ZW0gc2hvdWxkIGhhdmUgUEsgYW5kIFNLXG4gICAgICAgICAgICBjb25zdCBrZXkgPSB7IFBLOiAoaXRlbSBhcyBhbnkpLlBLLCBTSzogKGl0ZW0gYXMgYW55KS5TSyB9O1xuICAgICAgICAgICAgcmV0dXJuIHsgRGVsZXRlUmVxdWVzdDogeyBLZXk6IGtleSB9IH07XG4gICAgICAgICAgfVxuICAgICAgICB9KSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgICBSZXF1ZXN0SXRlbXM6IHJlcXVlc3RJdGVtcyxcbiAgICAgIH07XG5cbiAgICAgIGlmIChvcHRpb25zPy5yZXR1cm5Db25zdW1lZENhcGFjaXR5KSB7XG4gICAgICAgIHBhcmFtcy5SZXR1cm5Db25zdW1lZENhcGFjaXR5ID0gb3B0aW9ucy5yZXR1cm5Db25zdW1lZENhcGFjaXR5O1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucz8ucmV0dXJuSXRlbUNvbGxlY3Rpb25NZXRyaWNzKSB7XG4gICAgICAgIHBhcmFtcy5SZXR1cm5JdGVtQ29sbGVjdGlvbk1ldHJpY3MgPSBvcHRpb25zLnJldHVybkl0ZW1Db2xsZWN0aW9uTWV0cmljcztcbiAgICAgIH1cblxuICAgICAgY29uc3QgY29tbWFuZCA9IG5ldyBCYXRjaFdyaXRlQ29tbWFuZChwYXJhbXMpO1xuICAgICAgYXdhaXQgdGhpcy5kb2NDbGllbnQuc2VuZChjb21tYW5kKTtcblxuICAgICAgdGhpcy5yZWNvcmRTdWNjZXNzKHN0YXJ0VGltZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMucmVjb3JkRmFpbHVyZShzdGFydFRpbWUpO1xuICAgICAgdGhyb3cgdGhpcy5oYW5kbGVFcnJvcihlcnJvciwgJ2JhdGNoV3JpdGUnLCB7IGl0ZW1zLCBvcGVyYXRpb24gfSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMubWV0cmljcy5hY3RpdmVDb25uZWN0aW9ucy0tO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIHRyYW5zYWN0aW9uXG4gICAqL1xuICBhc3luYyB0cmFuc2FjdGlvbihpdGVtczogVHJhbnNhY3Rpb25JdGVtW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHRoaXMubWV0cmljcy50b3RhbFJlcXVlc3RzKys7XG4gICAgdGhpcy5tZXRyaWNzLmFjdGl2ZUNvbm5lY3Rpb25zKys7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgdHJhbnNhY3RJdGVtcyA9IGl0ZW1zLm1hcChpdGVtID0+IHtcbiAgICAgICAgY29uc3QgYmFzZVBhcmFtcyA9IHtcbiAgICAgICAgICBUYWJsZU5hbWU6IHRoaXMudGFibGVOYW1lLFxuICAgICAgICAgIENvbmRpdGlvbkV4cHJlc3Npb246IGl0ZW0uY29uZGl0aW9uRXhwcmVzc2lvbixcbiAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IGl0ZW0uZXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzLFxuICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IGl0ZW0uZXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlcyxcbiAgICAgICAgfTtcblxuICAgICAgICBzd2l0Y2ggKGl0ZW0ub3BlcmF0aW9uKSB7XG4gICAgICAgICAgY2FzZSAncHV0JzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIFB1dDoge1xuICAgICAgICAgICAgICAgIC4uLmJhc2VQYXJhbXMsXG4gICAgICAgICAgICAgICAgSXRlbTogaXRlbS5pdGVtLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICBjYXNlICd1cGRhdGUnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgVXBkYXRlOiB7XG4gICAgICAgICAgICAgICAgLi4uYmFzZVBhcmFtcyxcbiAgICAgICAgICAgICAgICBLZXk6IGl0ZW0ua2V5LFxuICAgICAgICAgICAgICAgIFVwZGF0ZUV4cHJlc3Npb246IGl0ZW0udXBkYXRlRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIERlbGV0ZToge1xuICAgICAgICAgICAgICAgIC4uLmJhc2VQYXJhbXMsXG4gICAgICAgICAgICAgICAgS2V5OiBpdGVtLmtleSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgY2FzZSAnY29uZGl0aW9uQ2hlY2snOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgQ29uZGl0aW9uQ2hlY2s6IHtcbiAgICAgICAgICAgICAgICAuLi5iYXNlUGFyYW1zLFxuICAgICAgICAgICAgICAgIEtleTogaXRlbS5rZXksXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIHRyYW5zYWN0aW9uIG9wZXJhdGlvbjogJHtpdGVtLm9wZXJhdGlvbn1gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgVHJhbnNhY3RXcml0ZUNvbW1hbmQoe1xuICAgICAgICBUcmFuc2FjdEl0ZW1zOiB0cmFuc2FjdEl0ZW1zLFxuICAgICAgfSk7XG5cbiAgICAgIGF3YWl0IHRoaXMuZG9jQ2xpZW50LnNlbmQoY29tbWFuZCk7XG5cbiAgICAgIHRoaXMucmVjb3JkU3VjY2VzcyhzdGFydFRpbWUpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLnJlY29yZEZhaWx1cmUoc3RhcnRUaW1lKTtcbiAgICAgIHRocm93IHRoaXMuaGFuZGxlRXJyb3IoZXJyb3IsICd0cmFuc2FjdGlvbicsIHsgaXRlbXMgfSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMubWV0cmljcy5hY3RpdmVDb25uZWN0aW9ucy0tO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBpdGVtIGV4aXN0c1xuICAgKi9cbiAgYXN5bmMgZXhpc3RzKHBrOiBzdHJpbmcsIHNrOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5nZXRJdGVtKHBrLCBzaywge1xuICAgICAgICBwcm9qZWN0aW9uRXhwcmVzc2lvbjogJ1BLJyxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdCAhPT0gbnVsbDtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY291bnQgb2YgaXRlbXMgbWF0Y2hpbmcgcXVlcnlcbiAgICovXG4gIGFzeW5jIGNvdW50KFxuICAgIGtleUNvbmRpdGlvbkV4cHJlc3Npb246IHN0cmluZyxcbiAgICBvcHRpb25zPzogUXVlcnlPcHRpb25zICYgeyBpbmRleE5hbWU/OiBzdHJpbmcgfVxuICApOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucXVlcnkoa2V5Q29uZGl0aW9uRXhwcmVzc2lvbiwge1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIHByb2plY3Rpb25FeHByZXNzaW9uOiAnUEsnLFxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQuY291bnQ7XG4gIH1cblxuICAvKipcbiAgICogUmVjb3JkIHN1Y2Nlc3NmdWwgb3BlcmF0aW9uXG4gICAqL1xuICBwcml2YXRlIHJlY29yZFN1Y2Nlc3Moc3RhcnRUaW1lOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBsYXRlbmN5ID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICB0aGlzLm1ldHJpY3Muc3VjY2Vzc2Z1bFJlcXVlc3RzKys7XG4gICAgdGhpcy5tZXRyaWNzLmxhc3RSZXF1ZXN0VGltZSA9IG5ldyBEYXRlKCk7XG4gICAgdGhpcy51cGRhdGVBdmVyYWdlTGF0ZW5jeShsYXRlbmN5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWNvcmQgZmFpbGVkIG9wZXJhdGlvblxuICAgKi9cbiAgcHJpdmF0ZSByZWNvcmRGYWlsdXJlKHN0YXJ0VGltZTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgbGF0ZW5jeSA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG4gICAgdGhpcy5tZXRyaWNzLmZhaWxlZFJlcXVlc3RzKys7XG4gICAgdGhpcy5tZXRyaWNzLmxhc3RSZXF1ZXN0VGltZSA9IG5ldyBEYXRlKCk7XG4gICAgdGhpcy51cGRhdGVBdmVyYWdlTGF0ZW5jeShsYXRlbmN5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgYXZlcmFnZSBsYXRlbmN5IGNhbGN1bGF0aW9uXG4gICAqL1xuICBwcml2YXRlIHVwZGF0ZUF2ZXJhZ2VMYXRlbmN5KGxhdGVuY3k6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMucmVxdWVzdFRpbWVzLnB1c2gobGF0ZW5jeSk7XG4gICAgXG4gICAgLy8gS2VlcCBvbmx5IGxhc3QgMTAwIHJlcXVlc3QgdGltZXMgZm9yIHJvbGxpbmcgYXZlcmFnZVxuICAgIGlmICh0aGlzLnJlcXVlc3RUaW1lcy5sZW5ndGggPiAxMDApIHtcbiAgICAgIHRoaXMucmVxdWVzdFRpbWVzLnNoaWZ0KCk7XG4gICAgfVxuICAgIFxuICAgIHRoaXMubWV0cmljcy5hdmVyYWdlTGF0ZW5jeSA9IFxuICAgICAgdGhpcy5yZXF1ZXN0VGltZXMucmVkdWNlKChzdW0sIHRpbWUpID0+IHN1bSArIHRpbWUsIDApIC8gdGhpcy5yZXF1ZXN0VGltZXMubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBhbmQgZm9ybWF0IGVycm9yc1xuICAgKi9cbiAgcHJpdmF0ZSBoYW5kbGVFcnJvcihlcnJvcjogYW55LCBvcGVyYXRpb246IHN0cmluZywgY29udGV4dD86IGFueSk6IEVycm9yIHtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRHluYW1vREIgJHtvcGVyYXRpb259IGZhaWxlZDogJHtlcnJvci5tZXNzYWdlfWA7XG4gICAgY29uc3QgZW5oYW5jZWRFcnJvciA9IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgIFxuICAgIC8vIEFkZCBjb250ZXh0IHRvIGVycm9yIGZvciBkZWJ1Z2dpbmdcbiAgICAoZW5oYW5jZWRFcnJvciBhcyBhbnkpLm9yaWdpbmFsRXJyb3IgPSBlcnJvcjtcbiAgICAoZW5oYW5jZWRFcnJvciBhcyBhbnkpLm9wZXJhdGlvbiA9IG9wZXJhdGlvbjtcbiAgICAoZW5oYW5jZWRFcnJvciBhcyBhbnkpLmNvbnRleHQgPSBjb250ZXh0O1xuICAgIChlbmhhbmNlZEVycm9yIGFzIGFueSkudGFibGVOYW1lID0gdGhpcy50YWJsZU5hbWU7XG4gICAgXG4gICAgLy8gTG9nIGVycm9yIGZvciBtb25pdG9yaW5nXG4gICAgY29uc29sZS5lcnJvcignRHluYW1vREIgRXJyb3I6Jywge1xuICAgICAgb3BlcmF0aW9uLFxuICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UsXG4gICAgICBjb250ZXh0LFxuICAgICAgdGFibGVOYW1lOiB0aGlzLnRhYmxlTmFtZSxcbiAgICB9KTtcbiAgICBcbiAgICByZXR1cm4gZW5oYW5jZWRFcnJvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZSBjb25uZWN0aW9ucyBhbmQgY2xlYW51cFxuICAgKi9cbiAgYXN5bmMgY2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gRHluYW1vREIgY2xpZW50IGRvZXNuJ3QgcmVxdWlyZSBleHBsaWNpdCBjbG9zaW5nXG4gICAgLy8gYnV0IHdlIGNhbiByZXNldCBtZXRyaWNzXG4gICAgdGhpcy5tZXRyaWNzID0ge1xuICAgICAgYWN0aXZlQ29ubmVjdGlvbnM6IDAsXG4gICAgICB0b3RhbFJlcXVlc3RzOiAwLFxuICAgICAgc3VjY2Vzc2Z1bFJlcXVlc3RzOiAwLFxuICAgICAgZmFpbGVkUmVxdWVzdHM6IDAsXG4gICAgICBhdmVyYWdlTGF0ZW5jeTogMCxcbiAgICB9O1xuICAgIHRoaXMucmVxdWVzdFRpbWVzID0gW107XG4gIH1cbn0iXX0=