/**
 * Data Migration Service
 * Service for migrating existing data to DynamoDB single-table design
 */

import { 
  MigrationConfig, 
  MigrationMapping, 
  MigrationResult, 
  MigrationError, 
  MigrationProgress, 
  MigrationPlan,
  MADMallMigrationMappings 
} from '@madmall/shared-types/database';
import { DynamoDBService } from '../services/dynamodb-service';
import { DataValidator } from '@madmall/shared-types/database';
import { EventEmitter } from 'events';

export interface DataSource {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(sql: string, params?: any[]): Promise<any[]>;
  getTableNames(): Promise<string[]>;
  getRowCount(tableName: string): Promise<number>;
}

export class MigrationService extends EventEmitter {
  private dynamoService: DynamoDBService;
  private dataSource?: DataSource;
  private isRunning: boolean = false;
  private currentProgress: Map<string, MigrationProgress> = new Map();

  constructor(dynamoService: DynamoDBService) {
    super();
    this.dynamoService = dynamoService;
  }

  /**
   * Set data source for migration
   */
  setDataSource(dataSource: DataSource): void {
    this.dataSource = dataSource;
  }

  /**
   * Execute migration plan
   */
  async executeMigrationPlan(plan: MigrationPlan, config: MigrationConfig): Promise<MigrationResult[]> {
    if (this.isRunning) {
      throw new Error('Migration is already running');
    }

    this.isRunning = true;
    const results: MigrationResult[] = [];

    try {
      // Connect to data source
      if (this.dataSource) {
        await this.dataSource.connect();
      }

      // Execute pre-hooks
      if (plan.preHooks) {
        for (const hook of plan.preHooks) {
          await hook();
        }
      }

      // Backup existing data if requested
      if (config.backupBeforeMigration) {
        await this.createBackup();
      }

      // Execute migrations for each entity
      for (const entityMapping of plan.entities) {
        try {
          const result = await this.migrateEntity(entityMapping, config, plan.validationRules[entityMapping.entityType]);
          results.push(result);
          
          this.emit('entityCompleted', result);
        } catch (error) {
          const errorResult: MigrationResult = {
            entityType: entityMapping.entityType,
            totalRecords: 0,
            processedRecords: 0,
            successfulRecords: 0,
            failedRecords: 0,
            skippedRecords: 0,
            errors: [{
              error: error instanceof Error ? error.message : String(error),
              errorType: 'constraint',
              timestamp: new Date(),
            }],
            duration: 0,
            throughput: 0,
          };
          results.push(errorResult);

          if (!config.continueOnError) {
            throw error;
          }
        }
      }

      // Execute post-hooks
      if (plan.postHooks) {
        for (const hook of plan.postHooks) {
          await hook();
        }
      }

      this.emit('migrationCompleted', results);
      return results;

    } finally {
      this.isRunning = false;
      if (this.dataSource) {
        await this.dataSource.disconnect();
      }
    }
  }

  /**
   * Migrate single entity type
   */
  async migrateEntity(
    mapping: MigrationMapping, 
    config: MigrationConfig,
    validationRules?: any[]
  ): Promise<MigrationResult> {
    const startTime = Date.now();
    const errors: MigrationError[] = [];
    let totalRecords = 0;
    let processedRecords = 0;
    let successfulRecords = 0;
    let failedRecords = 0;
    let skippedRecords = 0;

    try {
      // Get total record count
      if (mapping.sourceTable && this.dataSource) {
        totalRecords = await this.dataSource.getRowCount(mapping.sourceTable);
      }

      // Initialize progress tracking
      const progress: MigrationProgress = {
        entityType: mapping.entityType,
        phase: 'extracting',
        totalRecords,
        processedRecords: 0,
        currentBatch: 0,
        totalBatches: Math.ceil(totalRecords / config.batchSize),
        startTime: new Date(),
        throughput: 0,
        errors: 0,
      };
      this.currentProgress.set(mapping.entityType, progress);

      // Extract data in batches
      let offset = 0;
      let batchNumber = 0;

      while (offset < totalRecords || totalRecords === 0) {
        batchNumber++;
        progress.currentBatch = batchNumber;
        progress.phase = 'extracting';
        this.emit('progressUpdate', progress);

        // Extract batch
        const batchData = await this.extractBatch(mapping, offset, config.batchSize);
        if (batchData.length === 0) {
          break;
        }

        // Transform batch
        progress.phase = 'transforming';
        this.emit('progressUpdate', progress);

        const transformedBatch = await this.transformBatch(batchData, mapping);

        // Validate batch
        progress.phase = 'validating';
        this.emit('progressUpdate', progress);

        const { validItems, invalidItems } = await this.validateBatch(transformedBatch, validationRules);
        
        // Track validation errors
        invalidItems.forEach(item => {
          errors.push({
            recordId: item.id,
            record: item.data,
            error: item.error,
            errorType: 'validation',
            timestamp: new Date(),
          });
          failedRecords++;
        });

        // Load valid items
        if (validItems.length > 0) {
          progress.phase = 'loading';
          this.emit('progressUpdate', progress);

          if (!config.dryRun) {
            try {
              await this.loadBatch(validItems, config);
              successfulRecords += validItems.length;
            } catch (error) {
              // Handle batch write errors
              validItems.forEach(item => {
                errors.push({
                  recordId: (item as any).id,
                  record: item,
                  error: error instanceof Error ? error.message : String(error),
                  errorType: 'write',
                  timestamp: new Date(),
                });
                failedRecords++;
              });
            }
          } else {
            successfulRecords += validItems.length;
          }
        }

        processedRecords += batchData.length;
        progress.processedRecords = processedRecords;
        progress.throughput = processedRecords / ((Date.now() - startTime) / 1000);
        progress.errors = errors.length;

        if (totalRecords > 0) {
          const remainingRecords = totalRecords - processedRecords;
          const estimatedTimeRemaining = remainingRecords / progress.throughput;
          progress.estimatedCompletion = new Date(Date.now() + estimatedTimeRemaining * 1000);
        }

        this.emit('progressUpdate', progress);

        offset += config.batchSize;

        // Break if we've processed all available records
        if (batchData.length < config.batchSize) {
          break;
        }
      }

      progress.phase = 'completed';
      this.emit('progressUpdate', progress);

      const duration = Date.now() - startTime;
      const throughput = processedRecords / (duration / 1000);

      return {
        entityType: mapping.entityType,
        totalRecords,
        processedRecords,
        successfulRecords,
        failedRecords,
        skippedRecords,
        errors,
        duration,
        throughput,
      };

    } catch (error) {
      const progress = this.currentProgress.get(mapping.entityType);
      if (progress) {
        progress.phase = 'failed';
        this.emit('progressUpdate', progress);
      }

      throw error;
    }
  }

  /**
   * Extract batch of data from source
   */
  private async extractBatch(mapping: MigrationMapping, offset: number, batchSize: number): Promise<any[]> {
    if (!this.dataSource) {
      throw new Error('Data source not configured');
    }

    let query: string;
    if (mapping.sourceQuery) {
      query = `${mapping.sourceQuery} LIMIT ${batchSize} OFFSET ${offset}`;
    } else if (mapping.sourceTable) {
      query = `SELECT * FROM ${mapping.sourceTable} LIMIT ${batchSize} OFFSET ${offset}`;
    } else {
      throw new Error('No source table or query specified');
    }

    return await this.dataSource.query(query);
  }

  /**
   * Transform batch of data according to mapping
   */
  private async transformBatch(data: any[], mapping: MigrationMapping): Promise<any[]> {
    return data.map(item => this.transformItem(item, mapping));
  }

  /**
   * Transform single item according to mapping
   */
  private transformItem(item: any, mapping: MigrationMapping): any {
    const transformed: any = {};

    // Apply key mappings
    Object.entries(mapping.keyMapping).forEach(([key, mapper]) => {
      if (typeof mapper === 'string') {
        transformed[key] = item[mapper];
      } else if (typeof mapper === 'function') {
        transformed[key] = mapper(item);
      }
    });

    // Apply field mappings
    Object.entries(mapping.fieldMapping).forEach(([targetField, sourceMapper]) => {
      if (typeof sourceMapper === 'string') {
        this.setNestedProperty(transformed, targetField, item[sourceMapper]);
      } else if (typeof sourceMapper === 'function') {
        this.setNestedProperty(transformed, targetField, sourceMapper(item));
      }
    });

    // Apply transformations
    if (mapping.transformations) {
      mapping.transformations.forEach(transformation => {
        const currentValue = this.getNestedProperty(transformed, transformation.field);
        const newValue = transformation.transform(currentValue, item);
        this.setNestedProperty(transformed, transformation.field, newValue);
      });
    }

    // Apply filters
    if (mapping.filters) {
      const shouldInclude = mapping.filters.every(filter => {
        const value = this.getNestedProperty(transformed, filter.field);
        return filter.condition(value, item);
      });

      if (!shouldInclude) {
        return null;
      }
    }

    return transformed;
  }

  /**
   * Validate batch of transformed items
   */
  private async validateBatch(
    items: any[], 
    validationRules?: any[]
  ): Promise<{ validItems: any[]; invalidItems: Array<{ id: string; data: any; error: string }> }> {
    const validItems: any[] = [];
    const invalidItems: Array<{ id: string; data: any; error: string }> = [];

    for (const item of items) {
      if (item === null) {
        continue; // Filtered out item
      }

      try {
        // Validate DynamoDB key structure
        const keyValidation = DataValidator.validateKeys(item);
        if (!keyValidation.isValid) {
          invalidItems.push({
            id: item.PK || 'unknown',
            data: item,
            error: keyValidation.errors.map(e => e.message).join(', '),
          });
          continue;
        }

        // Validate consistency
        const consistencyValidation = DataValidator.validateConsistency(item);
        if (!consistencyValidation.isValid) {
          invalidItems.push({
            id: item.PK || 'unknown',
            data: item,
            error: consistencyValidation.errors.map(e => e.message).join(', '),
          });
          continue;
        }

        // Entity-specific validation
        let entityValidation;
        switch (item.entityType) {
          case 'USER':
            entityValidation = DataValidator.validateUser(item);
            break;
          case 'CIRCLE':
            entityValidation = DataValidator.validateCircle(item);
            break;
          case 'STORY':
            entityValidation = DataValidator.validateStory(item);
            break;
          case 'BUSINESS':
            entityValidation = DataValidator.validateBusiness(item);
            break;
          case 'RESOURCE':
            entityValidation = DataValidator.validateResource(item);
            break;
          default:
            entityValidation = { isValid: true, errors: [], warnings: [] };
        }

        if (!entityValidation.isValid) {
          invalidItems.push({
            id: item.PK || 'unknown',
            data: item,
            error: entityValidation.errors.map(e => e.message).join(', '),
          });
          continue;
        }

        validItems.push(item);

      } catch (error) {
        invalidItems.push({
          id: item.PK || 'unknown',
          data: item,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { validItems, invalidItems };
  }

  /**
   * Load batch of valid items to DynamoDB
   */
  private async loadBatch(items: any[], config: MigrationConfig): Promise<void> {
    // Use batch write for efficiency
    await this.dynamoService.batchWrite(items, 'put');
  }

  /**
   * Create backup of existing data
   */
  private async createBackup(): Promise<void> {
    // Implementation would depend on backup strategy
    // Could use DynamoDB backup, export to S3, etc.
    console.log('Creating backup...');
  }

  /**
   * Get migration progress for entity
   */
  getProgress(entityType: string): MigrationProgress | undefined {
    return this.currentProgress.get(entityType);
  }

  /**
   * Get all migration progress
   */
  getAllProgress(): MigrationProgress[] {
    return Array.from(this.currentProgress.values());
  }

  /**
   * Cancel running migration
   */
  cancel(): void {
    this.isRunning = false;
    this.emit('migrationCancelled');
  }

  /**
   * Utility to set nested property
   */
  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Utility to get nested property
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Create default MADMall migration plan
   */
  static createMADMallMigrationPlan(): MigrationPlan {
    return {
      name: 'MADMall to DynamoDB Migration',
      description: 'Migrate MADMall platform data to DynamoDB single-table design',
      version: '1.0.0',
      dependencies: [],
      entities: Object.values(MADMallMigrationMappings),
      validationRules: {
        USER: [],
        CIRCLE: [],
        STORY: [],
        BUSINESS: [],
        RESOURCE: [],
      },
      rollbackPlan: {
        enabled: true,
        rollbackSteps: [],
      },
    };
  }
}