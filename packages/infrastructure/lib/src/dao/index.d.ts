import { DynamoDBService, DynamoDBServiceConfig } from '../services/dynamodb-service';
import { UserDynamoDAO } from './user-dao';
import { CircleDynamoDAO } from './circle-dao';
import { ImageAssetDynamoDAO } from './image-asset-dao';
import { FeedbackDynamoDAO } from './feedback-dao';
import { IncidentDynamoDAO } from './incident-dao';
import { AdvisoryReviewDynamoDAO } from './advisory-review-dao';
import { PremiumSourceDynamoDAO } from './premium-source-dao';
import { PersonalizationDynamoDAO } from './personalization-dao';
export interface DAOFactory {
    userDAO: UserDynamoDAO;
    circleDAO: CircleDynamoDAO;
    imageAssetDAO: ImageAssetDynamoDAO;
    feedbackDAO: FeedbackDynamoDAO;
    incidentDAO: IncidentDynamoDAO;
    advisoryReviewDAO: AdvisoryReviewDynamoDAO;
    premiumSourceDAO: PremiumSourceDynamoDAO;
    personalizationDAO: PersonalizationDynamoDAO;
}
export declare class DynamoDAOFactory implements DAOFactory {
    private dynamoService;
    readonly userDAO: UserDynamoDAO;
    readonly circleDAO: CircleDynamoDAO;
    readonly imageAssetDAO: ImageAssetDynamoDAO;
    readonly feedbackDAO: FeedbackDynamoDAO;
    readonly incidentDAO: IncidentDynamoDAO;
    readonly advisoryReviewDAO: AdvisoryReviewDynamoDAO;
    readonly premiumSourceDAO: PremiumSourceDynamoDAO;
    readonly personalizationDAO: PersonalizationDynamoDAO;
    constructor(config: DynamoDBServiceConfig);
    /**
     * Get the underlying DynamoDB service
     */
    getDynamoService(): DynamoDBService;
    /**
     * Get connection metrics from the DynamoDB service
     */
    getMetrics(): import("../services/dynamodb-service").ConnectionMetrics;
    /**
     * Perform health check on the DynamoDB connection
     */
    healthCheck(): Promise<boolean>;
    /**
     * Close all connections and cleanup resources
     */
    close(): Promise<void>;
}
export { BaseDynamoDAO } from './base-dao';
export { UserDynamoDAO } from './user-dao';
export { CircleDynamoDAO } from './circle-dao';
export { ImageAssetDynamoDAO } from './image-asset-dao';
export { FeedbackDynamoDAO } from './feedback-dao';
export { IncidentDynamoDAO } from './incident-dao';
export { AdvisoryReviewDynamoDAO } from './advisory-review-dao';
export { PremiumSourceDynamoDAO } from './premium-source-dao';
export { PersonalizationDynamoDAO } from './personalization-dao';
export { DynamoDBService } from '../services/dynamodb-service';
export type { DynamoDBServiceConfig } from '../services/dynamodb-service';
export { MigrationService } from '../migration/migration-service';
export { SQLiteDataSource } from '../migration/sqlite-data-source';
export type { DataSource } from '../migration/migration-service';
/**
 * Create DAO factory with environment-specific configuration
 */
export declare function createDAOFactory(environment: 'development' | 'staging' | 'production'): DynamoDAOFactory;
/**
 * Create DAO factory with custom configuration
 */
export declare function createCustomDAOFactory(config: DynamoDBServiceConfig): DynamoDAOFactory;
