/**
 * Data Migration Service
 * Service for migrating existing data to DynamoDB single-table design
 */
import { MigrationConfig, MigrationMapping, MigrationResult, MigrationProgress, MigrationPlan } from '@madmall/shared-types/database';
import { DynamoDBService } from '../services/dynamodb-service';
import { EventEmitter } from 'events';
export interface DataSource {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(sql: string, params?: any[]): Promise<any[]>;
    getTableNames(): Promise<string[]>;
    getRowCount(tableName: string): Promise<number>;
}
export declare class MigrationService extends EventEmitter {
    private dynamoService;
    private dataSource?;
    private isRunning;
    private currentProgress;
    constructor(dynamoService: DynamoDBService);
    /**
     * Set data source for migration
     */
    setDataSource(dataSource: DataSource): void;
    /**
     * Execute migration plan
     */
    executeMigrationPlan(plan: MigrationPlan, config: MigrationConfig): Promise<MigrationResult[]>;
    /**
     * Migrate single entity type
     */
    migrateEntity(mapping: MigrationMapping, config: MigrationConfig, validationRules?: any[]): Promise<MigrationResult>;
    /**
     * Extract batch of data from source
     */
    private extractBatch;
    /**
     * Transform batch of data according to mapping
     */
    private transformBatch;
    /**
     * Transform single item according to mapping
     */
    private transformItem;
    /**
     * Validate batch of transformed items
     */
    private validateBatch;
    /**
     * Load batch of valid items to DynamoDB
     */
    private loadBatch;
    /**
     * Create backup of existing data
     */
    private createBackup;
    /**
     * Get migration progress for entity
     */
    getProgress(entityType: string): MigrationProgress | undefined;
    /**
     * Get all migration progress
     */
    getAllProgress(): MigrationProgress[];
    /**
     * Cancel running migration
     */
    cancel(): void;
    /**
     * Utility to set nested property
     */
    private setNestedProperty;
    /**
     * Utility to get nested property
     */
    private getNestedProperty;
    /**
     * Create default MADMall migration plan
     */
    static createMADMallMigrationPlan(): MigrationPlan;
}
