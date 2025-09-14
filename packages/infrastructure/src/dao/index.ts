/**
 * DAO Factory and Exports
 * Central factory for creating and managing DAO instances
 */
// Declare Node process to satisfy type checking in environments without Node globals
declare const process: any;

import { DynamoDBService, DynamoDBServiceConfig } from '../services/dynamodb-service';
import { UserDynamoDAO } from './user-dao';
import { CircleDynamoDAO } from './circle-dao';
// New DAOs
// These files will be implemented: image-asset-dao, feedback-dao, incident-dao, advisory-review-dao, premium-source-dao, personalization-dao
// Import stubs to wire factory after implementation
// eslint-disable-next-line import/no-unresolved
import { ImageAssetDynamoDAO } from './image-asset-dao';
// eslint-disable-next-line import/no-unresolved
import { FeedbackDynamoDAO } from './feedback-dao';
// eslint-disable-next-line import/no-unresolved
import { IncidentDynamoDAO } from './incident-dao';
// eslint-disable-next-line import/no-unresolved
import { AdvisoryReviewDynamoDAO } from './advisory-review-dao';
// eslint-disable-next-line import/no-unresolved
import { PremiumSourceDynamoDAO } from './premium-source-dao';
// eslint-disable-next-line import/no-unresolved
import { PersonalizationDynamoDAO } from './personalization-dao';
// Import other DAOs as they are created
// import { StoryDynamoDAO } from './story-dao';
// import { BusinessDynamoDAO } from './business-dao';
// import { ResourceDynamoDAO } from './resource-dao';

export interface DAOFactory {
  userDAO: UserDynamoDAO;
  circleDAO: CircleDynamoDAO;
  imageAssetDAO: ImageAssetDynamoDAO;
  feedbackDAO: FeedbackDynamoDAO;
  incidentDAO: IncidentDynamoDAO;
  advisoryReviewDAO: AdvisoryReviewDynamoDAO;
  premiumSourceDAO: PremiumSourceDynamoDAO;
  personalizationDAO: PersonalizationDynamoDAO;
  // Add other DAOs as they are implemented
  // storyDAO: StoryDynamoDAO;
  // businessDAO: BusinessDynamoDAO;
  // resourceDAO: ResourceDynamoDAO;
}

export class DynamoDAOFactory implements DAOFactory {
  private dynamoService: DynamoDBService;
  
  public readonly userDAO: UserDynamoDAO;
  public readonly circleDAO: CircleDynamoDAO;
  public readonly imageAssetDAO: ImageAssetDynamoDAO;
  public readonly feedbackDAO: FeedbackDynamoDAO;
  public readonly incidentDAO: IncidentDynamoDAO;
  public readonly advisoryReviewDAO: AdvisoryReviewDynamoDAO;
  public readonly premiumSourceDAO: PremiumSourceDynamoDAO;
  public readonly personalizationDAO: PersonalizationDynamoDAO;
  // Add other DAOs as they are implemented
  // public readonly storyDAO: StoryDynamoDAO;
  // public readonly businessDAO: BusinessDynamoDAO;
  // public readonly resourceDAO: ResourceDynamoDAO;

  constructor(config: DynamoDBServiceConfig) {
    this.dynamoService = new DynamoDBService(config);
    
    // Initialize all DAOs
    this.userDAO = new UserDynamoDAO(this.dynamoService);
    this.circleDAO = new CircleDynamoDAO(this.dynamoService);
    this.imageAssetDAO = new ImageAssetDynamoDAO(this.dynamoService);
    this.feedbackDAO = new FeedbackDynamoDAO(this.dynamoService);
    this.incidentDAO = new IncidentDynamoDAO(this.dynamoService);
    this.advisoryReviewDAO = new AdvisoryReviewDynamoDAO(this.dynamoService);
    this.premiumSourceDAO = new PremiumSourceDynamoDAO(this.dynamoService);
    this.personalizationDAO = new PersonalizationDynamoDAO(this.dynamoService);
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
export { ImageAssetDynamoDAO } from './image-asset-dao';
export { FeedbackDynamoDAO } from './feedback-dao';
export { IncidentDynamoDAO } from './incident-dao';
export { AdvisoryReviewDynamoDAO } from './advisory-review-dao';
export { PremiumSourceDynamoDAO } from './premium-source-dao';
export { PersonalizationDynamoDAO } from './personalization-dao';

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