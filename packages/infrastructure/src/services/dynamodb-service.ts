/**
 * DynamoDB Service Layer
 * Core service for DynamoDB operations with connection management and error handling
 */

import {
  DynamoDBClient,
  DynamoDBClientConfig,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
  BatchGetItemCommand,
  BatchWriteItemCommand,
  TransactWriteItemsCommand,
  DescribeTableCommand,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand as DocQueryCommand,
  BatchGetCommand,
  BatchWriteCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { 
  QueryOptions, 
  QueryResult, 
  BatchGetOptions, 
  BatchWriteOptions, 
  UpdateOptions, 
  DeleteOptions, 
  TransactionItem 
} from '@madmall/shared-types/database';

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

export class DynamoDBService {
  private client: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;
  private tableName: string;
  private metrics: ConnectionMetrics;
  private requestTimes: number[] = [];

  constructor(config: DynamoDBServiceConfig) {
    this.tableName = config.tableName;
    this.metrics = {
      activeConnections: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
    };

    // Configure DynamoDB client
    const clientConfig: DynamoDBClientConfig = {
      region: config.region,
      maxAttempts: config.maxRetries || 3,
      requestHandler: new NodeHttpHandler({
        connectionTimeout: config.timeout || 3000,
        socketTimeout: config.timeout || 3000,
        maxSockets: config.connectionPoolSize || 50,
      }),
    };

    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint;
    }

    this.client = new DynamoDBClient(clientConfig);
    this.docClient = DynamoDBDocumentClient.from(this.client, {
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
  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  /**
   * Health check - verify table exists and is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const command = new DescribeTableCommand({ TableName: this.tableName });
      await this.client.send(command);
      return true;
    } catch (error) {
      console.error('DynamoDB health check failed:', error);
      return false;
    }
  }

  /**
   * Get single item by key
   */
  async getItem<T>(pk: string, sk: string, options?: QueryOptions): Promise<T | null> {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    this.metrics.activeConnections++;

    try {
      const params: any = {
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

      const command = new GetCommand(params);
      const result = await this.docClient.send(command);

      this.recordSuccess(startTime);
      return result.Item as T || null;
    } catch (error) {
      this.recordFailure(startTime);
      throw this.handleError(error, 'getItem', { pk, sk });
    } finally {
      this.metrics.activeConnections--;
    }
  }

  /**
   * Put single item
   */
  async putItem<T>(item: T, conditionExpression?: string): Promise<T> {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    this.metrics.activeConnections++;

    try {
      const params: any = {
        TableName: this.tableName,
        Item: item,
        ReturnValues: 'ALL_NEW',
      };

      if (conditionExpression) {
        params.ConditionExpression = conditionExpression;
      }

      const command = new PutCommand(params);
      const result = await this.docClient.send(command);

      this.recordSuccess(startTime);
      return result.Attributes as T;
    } catch (error) {
      this.recordFailure(startTime);
      throw this.handleError(error, 'putItem', { item });
    } finally {
      this.metrics.activeConnections--;
    }
  }

  /**
   * Update item
   */
  async updateItem<T>(
    pk: string,
    sk: string,
    options: UpdateOptions
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    this.metrics.activeConnections++;

    try {
      const params: any = {
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

      const command = new UpdateCommand(params);
      const result = await this.docClient.send(command);

      this.recordSuccess(startTime);
      return result.Attributes as T;
    } catch (error) {
      this.recordFailure(startTime);
      throw this.handleError(error, 'updateItem', { pk, sk, options });
    } finally {
      this.metrics.activeConnections--;
    }
  }

  /**
   * Delete item
   */
  async deleteItem(pk: string, sk: string, options?: DeleteOptions): Promise<void> {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    this.metrics.activeConnections++;

    try {
      const params: any = {
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

      const command = new DeleteCommand(params);
      await this.docClient.send(command);

      this.recordSuccess(startTime);
    } catch (error) {
      this.recordFailure(startTime);
      throw this.handleError(error, 'deleteItem', { pk, sk });
    } finally {
      this.metrics.activeConnections--;
    }
  }

  /**
   * Query items
   */
  async query<T>(
    keyConditionExpression: string,
    options?: QueryOptions & { indexName?: string }
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    this.metrics.activeConnections++;

    try {
      const params: any = {
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

      const command = new DocQueryCommand(params);
      const result = await this.docClient.send(command);

      this.recordSuccess(startTime);

      return {
        items: (result.Items as T[]) || [],
        lastEvaluatedKey: result.LastEvaluatedKey,
        count: result.Count || 0,
        scannedCount: result.ScannedCount,
      };
    } catch (error) {
      this.recordFailure(startTime);
      throw this.handleError(error, 'query', { keyConditionExpression, options });
    } finally {
      this.metrics.activeConnections--;
    }
  }

  /**
   * Batch get items
   */
  async batchGet<T>(
    keys: Array<{ pk: string; sk: string }>,
    options?: BatchGetOptions
  ): Promise<T[]> {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    this.metrics.activeConnections++;

    try {
      const requestItems: any = {
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

      const command = new BatchGetCommand({
        RequestItems: requestItems,
      });

      const result = await this.docClient.send(command);

      this.recordSuccess(startTime);
      return (result.Responses?.[this.tableName] as T[]) || [];
    } catch (error) {
      this.recordFailure(startTime);
      throw this.handleError(error, 'batchGet', { keys });
    } finally {
      this.metrics.activeConnections--;
    }
  }

  /**
   * Batch write items (put/delete)
   */
  async batchWrite<T>(
    items: T[],
    operation: 'put' | 'delete' = 'put',
    options?: BatchWriteOptions
  ): Promise<void> {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    this.metrics.activeConnections++;

    try {
      const requestItems: any = {
        [this.tableName]: items.map(item => {
          if (operation === 'put') {
            return { PutRequest: { Item: item } };
          } else {
            // For delete, item should have PK and SK
            const key = { PK: (item as any).PK, SK: (item as any).SK };
            return { DeleteRequest: { Key: key } };
          }
        }),
      };

      const params: any = {
        RequestItems: requestItems,
      };

      if (options?.returnConsumedCapacity) {
        params.ReturnConsumedCapacity = options.returnConsumedCapacity;
      }

      if (options?.returnItemCollectionMetrics) {
        params.ReturnItemCollectionMetrics = options.returnItemCollectionMetrics;
      }

      const command = new BatchWriteCommand(params);
      await this.docClient.send(command);

      this.recordSuccess(startTime);
    } catch (error) {
      this.recordFailure(startTime);
      throw this.handleError(error, 'batchWrite', { items, operation });
    } finally {
      this.metrics.activeConnections--;
    }
  }

  /**
   * Execute transaction
   */
  async transaction(items: TransactionItem[]): Promise<void> {
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

      const command = new TransactWriteCommand({
        TransactItems: transactItems,
      });

      await this.docClient.send(command);

      this.recordSuccess(startTime);
    } catch (error) {
      this.recordFailure(startTime);
      throw this.handleError(error, 'transaction', { items });
    } finally {
      this.metrics.activeConnections--;
    }
  }

  /**
   * Check if item exists
   */
  async exists(pk: string, sk: string): Promise<boolean> {
    try {
      const result = await this.getItem(pk, sk, {
        projectionExpression: 'PK',
      });
      return result !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get count of items matching query
   */
  async count(
    keyConditionExpression: string,
    options?: QueryOptions & { indexName?: string }
  ): Promise<number> {
    const result = await this.query(keyConditionExpression, {
      ...options,
      projectionExpression: 'PK',
    });
    return result.count;
  }

  /**
   * Record successful operation
   */
  private recordSuccess(startTime: number): void {
    const latency = Date.now() - startTime;
    this.metrics.successfulRequests++;
    this.metrics.lastRequestTime = new Date();
    this.updateAverageLatency(latency);
  }

  /**
   * Record failed operation
   */
  private recordFailure(startTime: number): void {
    const latency = Date.now() - startTime;
    this.metrics.failedRequests++;
    this.metrics.lastRequestTime = new Date();
    this.updateAverageLatency(latency);
  }

  /**
   * Update average latency calculation
   */
  private updateAverageLatency(latency: number): void {
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
  private handleError(error: any, operation: string, context?: any): Error {
    const errorMessage = `DynamoDB ${operation} failed: ${error.message}`;
    const enhancedError = new Error(errorMessage);
    
    // Add context to error for debugging
    (enhancedError as any).originalError = error;
    (enhancedError as any).operation = operation;
    (enhancedError as any).context = context;
    (enhancedError as any).tableName = this.tableName;
    
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
  async close(): Promise<void> {
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