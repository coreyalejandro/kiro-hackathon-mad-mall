/**
 * DAO Factory and Exports
 * Central factory for creating and managing DAO instances
 */

import { DynamoDBService, DynamoDBServiceConfig } from '../services/dynamodb-service';
import { UserDynamoDAO } from './user-dao';
import { CircleDynamoDAO } from './circle-dao';
// Import other DAOs as they are created
// import { StoryDynamoDAO } from './story-dao';
// import { BusinessDynamoDAO } from './business-dao';
// import { ResourceDynamoDAO } from './resource-dao';

export interface DAOFactory {
  userDAO: UserDynamoDAO;
  circleDAO: CircleDynamoDAO;
  // Add other DAOs as they are implemented
  // storyDAO: StoryDynamoDAO;
  // businessDAO: BusinessDynamoDAO;
  // resourceDAO: ResourceDynamoDAO;
}

export class DynamoDAOFactory implements DAOFactory {
  private dynamoService: DynamoDBService;
  
  public readonly userDAO: UserDynamoDAO;
  public readonly circleDAO: CircleDynamoDAO;
  // Add other DAOs as they are implemented
  // public readonly storyDAO: StoryDynamoDAO;
  // public readonly businessDAO: BusinessDynamoDAO;
  // public readonly resourceDAO: ResourceDynamoDAO;

  constructor(config: DynamoDBServiceConfig) {
    this.dynamoService = new DynamoDBService(config);
    
    // Initialize all DAOs
    this.userDAO = new UserDynamoDAO(this.dynamoService);
    this.circleDAO = new CircleDynamoDAO(this.dynamoService);
    // Initialize other DAOs as they are implemented
    // this.storyDAO = new StoryDynamoDAO(this.dynamoService);
    // this.businessDAO = new BusinessDynamoDAO(this.dynamoService);
    // this.resourceDAO = new ResourceDynamoDAO(this.dynamoService);
  }

  /**
   * Get the underlying DynamoDB service
   */
  getDynamoService(): DynamoDBService {
    return this.dynamoService;
  }

  /**
   * Get connection metrics from the DynamoDB service
   */
  getMetrics() {
    return this.dynamoService.getMetrics();
  }

  /**
   * Perform health check on the DynamoDB connection
   */
  async healthCheck(): Promise<boolean> {
    return await this.dynamoService.healthCheck();
  }

  /**
   * Close all connections and cleanup resources
   */
  async close(): Promise<void> {
    await this.dynamoService.close();
  }
}

// Export individual DAOs and base classes
export { BaseDynamoDAO } from './base-dao';
export { UserDynamoDAO } from './user-dao';
export { CircleDynamoDAO } from './circle-dao';

// Export service and types
export { DynamoDBService } from '../services/dynamodb-service';
export type { DynamoDBServiceConfig } from '../services/dynamodb-service';

// Export migration utilities
export { MigrationService } from '../migration/migration-service';
export { SQLiteDataSource } from '../migration/sqlite-data-source';
export type { DataSource } from '../migration/migration-service';

/**
 * Create DAO factory with environment-specific configuration
 */
export function createDAOFactory(environment: 'development' | 'staging' | 'production'): DynamoDAOFactory {
  const config: DynamoDBServiceConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    tableName: `madmall-${environment}-main`,
    maxRetries: environment === 'production' ? 5 : 3,
    timeout: environment === 'production' ? 5000 : 3000,
    connectionPoolSize: environment === 'production' ? 100 : 50,
    enableXRayTracing: environment === 'production',
    enableMetrics: true,
  };

  // Use local DynamoDB for development
  if (environment === 'development') {
    config.endpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000';
  }

  return new DynamoDAOFactory(config);
}

/**
 * Create DAO factory with custom configuration
 */
export function createCustomDAOFactory(config: DynamoDBServiceConfig): DynamoDAOFactory {
  return new DynamoDAOFactory(config);
}