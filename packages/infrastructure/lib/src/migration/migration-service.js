"use strict";
/**
 * Data Migration Service
 * Service for migrating existing data to DynamoDB single-table design
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationService = void 0;
const database_1 = require("@madmall/shared-types/database");
const database_2 = require("@madmall/shared-types/database");
const events_1 = require("events");
class MigrationService extends events_1.EventEmitter {
    constructor(dynamoService) {
        super();
        this.isRunning = false;
        this.currentProgress = new Map();
        this.dynamoService = dynamoService;
    }
    /**
     * Set data source for migration
     */
    setDataSource(dataSource) {
        this.dataSource = dataSource;
    }
    /**
     * Execute migration plan
     */
    async executeMigrationPlan(plan, config) {
        if (this.isRunning) {
            throw new Error('Migration is already running');
        }
        this.isRunning = true;
        const results = [];
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
                }
                catch (error) {
                    const errorResult = {
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
        }
        finally {
            this.isRunning = false;
            if (this.dataSource) {
                await this.dataSource.disconnect();
            }
        }
    }
    /**
     * Migrate single entity type
     */
    async migrateEntity(mapping, config, validationRules) {
        const startTime = Date.now();
        const errors = [];
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
            const progress = {
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
                        }
                        catch (error) {
                            // Handle batch write errors
                            validItems.forEach(item => {
                                errors.push({
                                    recordId: item.id,
                                    record: item,
                                    error: error instanceof Error ? error.message : String(error),
                                    errorType: 'write',
                                    timestamp: new Date(),
                                });
                                failedRecords++;
                            });
                        }
                    }
                    else {
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
        }
        catch (error) {
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
    async extractBatch(mapping, offset, batchSize) {
        if (!this.dataSource) {
            throw new Error('Data source not configured');
        }
        let query;
        if (mapping.sourceQuery) {
            query = `${mapping.sourceQuery} LIMIT ${batchSize} OFFSET ${offset}`;
        }
        else if (mapping.sourceTable) {
            query = `SELECT * FROM ${mapping.sourceTable} LIMIT ${batchSize} OFFSET ${offset}`;
        }
        else {
            throw new Error('No source table or query specified');
        }
        return await this.dataSource.query(query);
    }
    /**
     * Transform batch of data according to mapping
     */
    async transformBatch(data, mapping) {
        return data.map(item => this.transformItem(item, mapping));
    }
    /**
     * Transform single item according to mapping
     */
    transformItem(item, mapping) {
        const transformed = {};
        // Apply key mappings
        Object.entries(mapping.keyMapping).forEach(([key, mapper]) => {
            if (typeof mapper === 'string') {
                transformed[key] = item[mapper];
            }
            else if (typeof mapper === 'function') {
                transformed[key] = mapper(item);
            }
        });
        // Apply field mappings
        Object.entries(mapping.fieldMapping).forEach(([targetField, sourceMapper]) => {
            if (typeof sourceMapper === 'string') {
                this.setNestedProperty(transformed, targetField, item[sourceMapper]);
            }
            else if (typeof sourceMapper === 'function') {
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
    async validateBatch(items, validationRules) {
        const validItems = [];
        const invalidItems = [];
        for (const item of items) {
            if (item === null) {
                continue; // Filtered out item
            }
            try {
                // Validate DynamoDB key structure
                const keyValidation = database_2.DataValidator.validateKeys(item);
                if (!keyValidation.isValid) {
                    invalidItems.push({
                        id: item.PK || 'unknown',
                        data: item,
                        error: keyValidation.errors.map(e => e.message).join(', '),
                    });
                    continue;
                }
                // Validate consistency
                const consistencyValidation = database_2.DataValidator.validateConsistency(item);
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
                        entityValidation = database_2.DataValidator.validateUser(item);
                        break;
                    case 'CIRCLE':
                        entityValidation = database_2.DataValidator.validateCircle(item);
                        break;
                    case 'STORY':
                        entityValidation = database_2.DataValidator.validateStory(item);
                        break;
                    case 'BUSINESS':
                        entityValidation = database_2.DataValidator.validateBusiness(item);
                        break;
                    case 'RESOURCE':
                        entityValidation = database_2.DataValidator.validateResource(item);
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
            }
            catch (error) {
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
    async loadBatch(items, config) {
        // Use batch write for efficiency
        await this.dynamoService.batchWrite(items, 'put');
    }
    /**
     * Create backup of existing data
     */
    async createBackup() {
        // Implementation would depend on backup strategy
        // Could use DynamoDB backup, export to S3, etc.
        console.log('Creating backup...');
    }
    /**
     * Get migration progress for entity
     */
    getProgress(entityType) {
        return this.currentProgress.get(entityType);
    }
    /**
     * Get all migration progress
     */
    getAllProgress() {
        return Array.from(this.currentProgress.values());
    }
    /**
     * Cancel running migration
     */
    cancel() {
        this.isRunning = false;
        this.emit('migrationCancelled');
    }
    /**
     * Utility to set nested property
     */
    setNestedProperty(obj, path, value) {
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
    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    /**
     * Create default MADMall migration plan
     */
    static createMADMallMigrationPlan() {
        return {
            name: 'MADMall to DynamoDB Migration',
            description: 'Migrate MADMall platform data to DynamoDB single-table design',
            version: '1.0.0',
            dependencies: [],
            entities: Object.values(database_1.MADMallMigrationMappings),
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
exports.MigrationService = MigrationService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlncmF0aW9uLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbWlncmF0aW9uL21pZ3JhdGlvbi1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7OztBQUVILDZEQVF3QztBQUV4Qyw2REFBK0Q7QUFDL0QsbUNBQXNDO0FBVXRDLE1BQWEsZ0JBQWlCLFNBQVEscUJBQVk7SUFNaEQsWUFBWSxhQUE4QjtRQUN4QyxLQUFLLEVBQUUsQ0FBQztRQUpGLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFDM0Isb0JBQWUsR0FBbUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUlsRSxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxhQUFhLENBQUMsVUFBc0I7UUFDbEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDL0IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLG9CQUFvQixDQUFDLElBQW1CLEVBQUUsTUFBdUI7UUFDckUsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBQ2xELENBQUM7UUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN0QixNQUFNLE9BQU8sR0FBc0IsRUFBRSxDQUFDO1FBRXRDLElBQUksQ0FBQztZQUNILHlCQUF5QjtZQUN6QixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDcEIsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2xDLENBQUM7WUFFRCxvQkFBb0I7WUFDcEIsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2xCLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNqQyxNQUFNLElBQUks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SyxRQUFRLEVBQUUsQ0FBQztnQkFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNwQixDQUFDO1lBQ0QsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBRUQsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7T0FFRztJQUNLLGlCQUFpQixDQUFDLEdBQVEsRUFBRSxJQUFZO1FBQzlDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxNQUFNLENBQUMsMEJBQTBCO1FBQy9CLE9BQU87WUFDTCxJQUFJLEVBQUUsK0JBQStCO1lBQ3JDLFdBQVcsRUFBRSwrREFBK0Q7WUFDNUUsT0FBTyxFQUFFLE9BQU87WUFDaEIsWUFBWSxFQUFFLEVBQUU7WUFDaEIsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsbUNBQXdCLENBQUM7WUFDakQsZUFBZSxFQUFFO2dCQUNmLElBQUksRUFBRSxFQUFFO2dCQUNSLE1BQU0sRUFBRSxFQUFFO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxFQUFFO2dCQUNaLFFBQVEsRUFBRSxFQUFFO2FBQ2I7WUFDRCxZQUFZLEVBQUU7Z0JBQ1osT0FBTyxFQUFFLElBQUk7Z0JBQ2IsYUFBYSxFQUFFLEVBQUU7YUFDbEI7U0FDRixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBOWVELDRDQThlQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRGF0YSBNaWdyYXRpb24gU2VydmljZVxuICogU2VydmljZSBmb3IgbWlncmF0aW5nIGV4aXN0aW5nIGRhdGEgdG8gRHluYW1vREIgc2luZ2xlLXRhYmxlIGRlc2lnblxuICovXG5cbmltcG9ydCB7IFxuICBNaWdyYXRpb25Db25maWcsIFxuICBNaWdyYXRpb25NYXBwaW5nLCBcbiAgTWlncmF0aW9uUmVzdWx0LCBcbiAgTWlncmF0aW9uRXJyb3IsIFxuICBNaWdyYXRpb25Qcm9ncmVzcywgXG4gIE1pZ3JhdGlvblBsYW4sXG4gIE1BRE1hbGxNaWdyYXRpb25NYXBwaW5ncyBcbn0gZnJvbSAnQG1hZG1hbGwvc2hhcmVkLXR5cGVzL2RhdGFiYXNlJztcbmltcG9ydCB7IER5bmFtb0RCU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL2R5bmFtb2RiLXNlcnZpY2UnO1xuaW1wb3J0IHsgRGF0YVZhbGlkYXRvciB9IGZyb20gJ0BtYWRtYWxsL3NoYXJlZC10eXBlcy9kYXRhYmFzZSc7XG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIERhdGFTb3VyY2Uge1xuICBjb25uZWN0KCk6IFByb21pc2U8dm9pZD47XG4gIGRpc2Nvbm5lY3QoKTogUHJvbWlzZTx2b2lkPjtcbiAgcXVlcnkoc3FsOiBzdHJpbmcsIHBhcmFtcz86IGFueVtdKTogUHJvbWlzZTxhbnlbXT47XG4gIGdldFRhYmxlTmFtZXMoKTogUHJvbWlzZTxzdHJpbmdbXT47XG4gIGdldFJvd0NvdW50KHRhYmxlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+O1xufVxuXG5leHBvcnQgY2xhc3MgTWlncmF0aW9uU2VydmljZSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIHByaXZhdGUgZHluYW1vU2VydmljZTogRHluYW1vREJTZXJ2aWNlO1xuICBwcml2YXRlIGRhdGFTb3VyY2U/OiBEYXRhU291cmNlO1xuICBwcml2YXRlIGlzUnVubmluZzogYm9vbGVhbiA9IGZhbHNlO1xuICBwcml2YXRlIGN1cnJlbnRQcm9ncmVzczogTWFwPHN0cmluZywgTWlncmF0aW9uUHJvZ3Jlc3M+ID0gbmV3IE1hcCgpO1xuXG4gIGNvbnN0cnVjdG9yKGR5bmFtb1NlcnZpY2U6IER5bmFtb0RCU2VydmljZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5keW5hbW9TZXJ2aWNlID0gZHluYW1vU2VydmljZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZGF0YSBzb3VyY2UgZm9yIG1pZ3JhdGlvblxuICAgKi9cbiAgc2V0RGF0YVNvdXJjZShkYXRhU291cmNlOiBEYXRhU291cmNlKTogdm9pZCB7XG4gICAgdGhpcy5kYXRhU291cmNlID0gZGF0YVNvdXJjZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIG1pZ3JhdGlvbiBwbGFuXG4gICAqL1xuICBhc3luYyBleGVjdXRlTWlncmF0aW9uUGxhbihwbGFuOiBNaWdyYXRpb25QbGFuLCBjb25maWc6IE1pZ3JhdGlvbkNvbmZpZyk6IFByb21pc2U8TWlncmF0aW9uUmVzdWx0W10+IHtcbiAgICBpZiAodGhpcy5pc1J1bm5pbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlncmF0aW9uIGlzIGFscmVhZHkgcnVubmluZycpO1xuICAgIH1cblxuICAgIHRoaXMuaXNSdW5uaW5nID0gdHJ1ZTtcbiAgICBjb25zdCByZXN1bHRzOiBNaWdyYXRpb25SZXN1bHRbXSA9IFtdO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIENvbm5lY3QgdG8gZGF0YSBzb3VyY2VcbiAgICAgIGlmICh0aGlzLmRhdGFTb3VyY2UpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5kYXRhU291cmNlLmNvbm5lY3QoKTtcbiAgICAgIH1cblxuICAgICAgLy8gRXhlY3V0ZSBwcmUtaG9va3NcbiAgICAgIGlmIChwbGFuLnByZUhvb2tzKSB7XG4gICAgICAgIGZvciAoY29uc3QgaG9vayBvZiBwbGFuLnByZUhvb2tzKSB7XG4gICAgICAgICAgYXdhaXQgaG9vaygpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEJhY2t1cCBleGlzdGluZyBkYXRhIGlmIHJlcXVlc3RlZFxuICAgICAgaWYgKGNvbmZpZy5iYWNrdXBCZWZvcmVNaWdyYXRpb24pIHtcbiAgICAgICAgYXdhaXQgdGhpcy5jcmVhdGVCYWNrdXAoKTtcbiAgICAgIH1cblxuICAgICAgLy8gRXhlY3V0ZSBtaWdyYXRpb25zIGZvciBlYWNoIGVudGl0eVxuICAgICAgZm9yIChjb25zdCBlbnRpdHlNYXBwaW5nIG9mIHBsYW4uZW50aXRpZXMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLm1pZ3JhdGVFbnRpdHkoZW50aXR5TWFwcGluZywgY29uZmlnLCBwbGFuLnZhbGlkYXRpb25SdWxlc1tlbnRpdHlNYXBwaW5nLmVudGl0eVR5cGVdKTtcbiAgICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICAgICAgICBcbiAgICAgICAgICB0aGlzLmVtaXQoJ2VudGl0eUNvbXBsZXRlZCcsIHJlc3VsdCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc3QgZXJyb3JSZXN1bHQ6IE1pZ3JhdGlvblJlc3VsdCA9IHtcbiAgICAgICAgICAgIGVudGl0eVR5cGU6IGVudGl0eU1hcHBpbmcuZW50aXR5VHlwZSxcbiAgICAgICAgICAgIHRvdGFsUmVjb3JkczogMCxcbiAgICAgICAgICAgIHByb2Nlc3NlZFJlY29yZHM6IDAsXG4gICAgICAgICAgICBzdWNjZXNzZnVsUmVjb3JkczogMCxcbiAgICAgICAgICAgIGZhaWxlZFJlY29yZHM6IDAsXG4gICAgICAgICAgICBza2lwcGVkUmVjb3JkczogMCxcbiAgICAgICAgICAgIGVycm9yczogW3tcbiAgICAgICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcbiAgICAgICAgICAgICAgZXJyb3JUeXBlOiAnY29uc3RyYWludCcsXG4gICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgZHVyYXRpb246IDAsXG4gICAgICAgICAgICB0aHJvdWdocHV0OiAwLFxuICAgICAgICAgIH07XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKGVycm9yUmVzdWx0KTtcblxuICAgICAgICAgIGlmICghY29uZmlnLmNvbnRpbnVlT25FcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEV4ZWN1dGUgcG9zdC1ob29rc1xuICAgICAgaWYgKHBsYW4ucG9zdEhvb2tzKSB7XG4gICAgICAgIGZvciAoY29uc3QgaG9vayBvZiBwbGFuLnBvc3RIb29rcykge1xuICAgICAgICAgIGF3YWl0IGhvb2soKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmVtaXQoJ21pZ3JhdGlvbkNvbXBsZXRlZCcsIHJlc3VsdHMpO1xuICAgICAgcmV0dXJuIHJlc3VsdHM7XG5cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICAgIGlmICh0aGlzLmRhdGFTb3VyY2UpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5kYXRhU291cmNlLmRpc2Nvbm5lY3QoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWlncmF0ZSBzaW5nbGUgZW50aXR5IHR5cGVcbiAgICovXG4gIGFzeW5jIG1pZ3JhdGVFbnRpdHkoXG4gICAgbWFwcGluZzogTWlncmF0aW9uTWFwcGluZywgXG4gICAgY29uZmlnOiBNaWdyYXRpb25Db25maWcsXG4gICAgdmFsaWRhdGlvblJ1bGVzPzogYW55W11cbiAgKTogUHJvbWlzZTxNaWdyYXRpb25SZXN1bHQ+IHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIGNvbnN0IGVycm9yczogTWlncmF0aW9uRXJyb3JbXSA9IFtdO1xuICAgIGxldCB0b3RhbFJlY29yZHMgPSAwO1xuICAgIGxldCBwcm9jZXNzZWRSZWNvcmRzID0gMDtcbiAgICBsZXQgc3VjY2Vzc2Z1bFJlY29yZHMgPSAwO1xuICAgIGxldCBmYWlsZWRSZWNvcmRzID0gMDtcbiAgICBsZXQgc2tpcHBlZFJlY29yZHMgPSAwO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIEdldCB0b3RhbCByZWNvcmQgY291bnRcbiAgICAgIGlmIChtYXBwaW5nLnNvdXJjZVRhYmxlICYmIHRoaXMuZGF0YVNvdXJjZSkge1xuICAgICAgICB0b3RhbFJlY29yZHMgPSBhd2FpdCB0aGlzLmRhdGFTb3VyY2UuZ2V0Um93Q291bnQobWFwcGluZy5zb3VyY2VUYWJsZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEluaXRpYWxpemUgcHJvZ3Jlc3MgdHJhY2tpbmdcbiAgICAgIGNvbnN0IHByb2dyZXNzOiBNaWdyYXRpb25Qcm9ncmVzcyA9IHtcbiAgICAgICAgZW50aXR5VHlwZTogbWFwcGluZy5lbnRpdHlUeXBlLFxuICAgICAgICBwaGFzZTogJ2V4dHJhY3RpbmcnLFxuICAgICAgICB0b3RhbFJlY29yZHMsXG4gICAgICAgIHByb2Nlc3NlZFJlY29yZHM6IDAsXG4gICAgICAgIGN1cnJlbnRCYXRjaDogMCxcbiAgICAgICAgdG90YWxCYXRjaGVzOiBNYXRoLmNlaWwodG90YWxSZWNvcmRzIC8gY29uZmlnLmJhdGNoU2l6ZSksXG4gICAgICAgIHN0YXJ0VGltZTogbmV3IERhdGUoKSxcbiAgICAgICAgdGhyb3VnaHB1dDogMCxcbiAgICAgICAgZXJyb3JzOiAwLFxuICAgICAgfTtcbiAgICAgIHRoaXMuY3VycmVudFByb2dyZXNzLnNldChtYXBwaW5nLmVudGl0eVR5cGUsIHByb2dyZXNzKTtcblxuICAgICAgLy8gRXh0cmFjdCBkYXRhIGluIGJhdGNoZXNcbiAgICAgIGxldCBvZmZzZXQgPSAwO1xuICAgICAgbGV0IGJhdGNoTnVtYmVyID0gMDtcblxuICAgICAgd2hpbGUgKG9mZnNldCA8IHRvdGFsUmVjb3JkcyB8fCB0b3RhbFJlY29yZHMgPT09IDApIHtcbiAgICAgICAgYmF0Y2hOdW1iZXIrKztcbiAgICAgICAgcHJvZ3Jlc3MuY3VycmVudEJhdGNoID0gYmF0Y2hOdW1iZXI7XG4gICAgICAgIHByb2dyZXNzLnBoYXNlID0gJ2V4dHJhY3RpbmcnO1xuICAgICAgICB0aGlzLmVtaXQoJ3Byb2dyZXNzVXBkYXRlJywgcHJvZ3Jlc3MpO1xuXG4gICAgICAgIC8vIEV4dHJhY3QgYmF0Y2hcbiAgICAgICAgY29uc3QgYmF0Y2hEYXRhID0gYXdhaXQgdGhpcy5leHRyYWN0QmF0Y2gobWFwcGluZywgb2Zmc2V0LCBjb25maWcuYmF0Y2hTaXplKTtcbiAgICAgICAgaWYgKGJhdGNoRGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRyYW5zZm9ybSBiYXRjaFxuICAgICAgICBwcm9ncmVzcy5waGFzZSA9ICd0cmFuc2Zvcm1pbmcnO1xuICAgICAgICB0aGlzLmVtaXQoJ3Byb2dyZXNzVXBkYXRlJywgcHJvZ3Jlc3MpO1xuXG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkQmF0Y2ggPSBhd2FpdCB0aGlzLnRyYW5zZm9ybUJhdGNoKGJhdGNoRGF0YSwgbWFwcGluZyk7XG5cbiAgICAgICAgLy8gVmFsaWRhdGUgYmF0Y2hcbiAgICAgICAgcHJvZ3Jlc3MucGhhc2UgPSAndmFsaWRhdGluZyc7XG4gICAgICAgIHRoaXMuZW1pdCgncHJvZ3Jlc3NVcGRhdGUnLCBwcm9ncmVzcyk7XG5cbiAgICAgICAgY29uc3QgeyB2YWxpZEl0ZW1zLCBpbnZhbGlkSXRlbXMgfSA9IGF3YWl0IHRoaXMudmFsaWRhdGVCYXRjaCh0cmFuc2Zvcm1lZEJhdGNoLCB2YWxpZGF0aW9uUnVsZXMpO1xuICAgICAgICBcbiAgICAgICAgLy8gVHJhY2sgdmFsaWRhdGlvbiBlcnJvcnNcbiAgICAgICAgaW52YWxpZEl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgZXJyb3JzLnB1c2goe1xuICAgICAgICAgICAgcmVjb3JkSWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICByZWNvcmQ6IGl0ZW0uZGF0YSxcbiAgICAgICAgICAgIGVycm9yOiBpdGVtLmVycm9yLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiAndmFsaWRhdGlvbicsXG4gICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCksXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZmFpbGVkUmVjb3JkcysrO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBMb2FkIHZhbGlkIGl0ZW1zXG4gICAgICAgIGlmICh2YWxpZEl0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBwcm9ncmVzcy5waGFzZSA9ICdsb2FkaW5nJztcbiAgICAgICAgICB0aGlzLmVtaXQoJ3Byb2dyZXNzVXBkYXRlJywgcHJvZ3Jlc3MpO1xuXG4gICAgICAgICAgaWYgKCFjb25maWcuZHJ5UnVuKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBhd2FpdCB0aGlzLmxvYWRCYXRjaCh2YWxpZEl0ZW1zLCBjb25maWcpO1xuICAgICAgICAgICAgICBzdWNjZXNzZnVsUmVjb3JkcyArPSB2YWxpZEl0ZW1zLmxlbmd0aDtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgIC8vIEhhbmRsZSBiYXRjaCB3cml0ZSBlcnJvcnNcbiAgICAgICAgICAgICAgdmFsaWRJdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgIHJlY29yZElkOiAoaXRlbSBhcyBhbnkpLmlkLFxuICAgICAgICAgICAgICAgICAgcmVjb3JkOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcbiAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogJ3dyaXRlJyxcbiAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBmYWlsZWRSZWNvcmRzKys7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdWNjZXNzZnVsUmVjb3JkcyArPSB2YWxpZEl0ZW1zLmxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcm9jZXNzZWRSZWNvcmRzICs9IGJhdGNoRGF0YS5sZW5ndGg7XG4gICAgICAgIHByb2dyZXNzLnByb2Nlc3NlZFJlY29yZHMgPSBwcm9jZXNzZWRSZWNvcmRzO1xuICAgICAgICBwcm9ncmVzcy50aHJvdWdocHV0ID0gcHJvY2Vzc2VkUmVjb3JkcyAvICgoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSkgLyAxMDAwKTtcbiAgICAgICAgcHJvZ3Jlc3MuZXJyb3JzID0gZXJyb3JzLmxlbmd0aDtcblxuICAgICAgICBpZiAodG90YWxSZWNvcmRzID4gMCkge1xuICAgICAgICAgIGNvbnN0IHJlbWFpbmluZ1JlY29yZHMgPSB0b3RhbFJlY29yZHMgLSBwcm9jZXNzZWRSZWNvcmRzO1xuICAgICAgICAgIGNvbnN0IGVzdGltYXRlZFRpbWVSZW1haW5pbmcgPSByZW1haW5pbmdSZWNvcmRzIC8gcHJvZ3Jlc3MudGhyb3VnaHB1dDtcbiAgICAgICAgICBwcm9ncmVzcy5lc3RpbWF0ZWRDb21wbGV0aW9uID0gbmV3IERhdGUoRGF0ZS5ub3coKSArIGVzdGltYXRlZFRpbWVSZW1haW5pbmcgKiAxMDAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZW1pdCgncHJvZ3Jlc3NVcGRhdGUnLCBwcm9ncmVzcyk7XG5cbiAgICAgICAgb2Zmc2V0ICs9IGNvbmZpZy5iYXRjaFNpemU7XG5cbiAgICAgICAgLy8gQnJlYWsgaWYgd2UndmUgcHJvY2Vzc2VkIGFsbCBhdmFpbGFibGUgcmVjb3Jkc1xuICAgICAgICBpZiAoYmF0Y2hEYXRhLmxlbmd0aCA8IGNvbmZpZy5iYXRjaFNpemUpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwcm9ncmVzcy5waGFzZSA9ICdjb21wbGV0ZWQnO1xuICAgICAgdGhpcy5lbWl0KCdwcm9ncmVzc1VwZGF0ZScsIHByb2dyZXNzKTtcblxuICAgICAgY29uc3QgZHVyYXRpb24gPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lO1xuICAgICAgY29uc3QgdGhyb3VnaHB1dCA9IHByb2Nlc3NlZFJlY29yZHMgLyAoZHVyYXRpb24gLyAxMDAwKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZW50aXR5VHlwZTogbWFwcGluZy5lbnRpdHlUeXBlLFxuICAgICAgICB0b3RhbFJlY29yZHMsXG4gICAgICAgIHByb2Nlc3NlZFJlY29yZHMsXG4gICAgICAgIHN1Y2Nlc3NmdWxSZWNvcmRzLFxuICAgICAgICBmYWlsZWRSZWNvcmRzLFxuICAgICAgICBza2lwcGVkUmVjb3JkcyxcbiAgICAgICAgZXJyb3JzLFxuICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgdGhyb3VnaHB1dCxcbiAgICAgIH07XG5cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgcHJvZ3Jlc3MgPSB0aGlzLmN1cnJlbnRQcm9ncmVzcy5nZXQobWFwcGluZy5lbnRpdHlUeXBlKTtcbiAgICAgIGlmIChwcm9ncmVzcykge1xuICAgICAgICBwcm9ncmVzcy5waGFzZSA9ICdmYWlsZWQnO1xuICAgICAgICB0aGlzLmVtaXQoJ3Byb2dyZXNzVXBkYXRlJywgcHJvZ3Jlc3MpO1xuICAgICAgfVxuXG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXh0cmFjdCBiYXRjaCBvZiBkYXRhIGZyb20gc291cmNlXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGV4dHJhY3RCYXRjaChtYXBwaW5nOiBNaWdyYXRpb25NYXBwaW5nLCBvZmZzZXQ6IG51bWJlciwgYmF0Y2hTaXplOiBudW1iZXIpOiBQcm9taXNlPGFueVtdPiB7XG4gICAgaWYgKCF0aGlzLmRhdGFTb3VyY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRGF0YSBzb3VyY2Ugbm90IGNvbmZpZ3VyZWQnKTtcbiAgICB9XG5cbiAgICBsZXQgcXVlcnk6IHN0cmluZztcbiAgICBpZiAobWFwcGluZy5zb3VyY2VRdWVyeSkge1xuICAgICAgcXVlcnkgPSBgJHttYXBwaW5nLnNvdXJjZVF1ZXJ5fSBMSU1JVCAke2JhdGNoU2l6ZX0gT0ZGU0VUICR7b2Zmc2V0fWA7XG4gICAgfSBlbHNlIGlmIChtYXBwaW5nLnNvdXJjZVRhYmxlKSB7XG4gICAgICBxdWVyeSA9IGBTRUxFQ1QgKiBGUk9NICR7bWFwcGluZy5zb3VyY2VUYWJsZX0gTElNSVQgJHtiYXRjaFNpemV9IE9GRlNFVCAke29mZnNldH1gO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIHNvdXJjZSB0YWJsZSBvciBxdWVyeSBzcGVjaWZpZWQnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5kYXRhU291cmNlLnF1ZXJ5KHF1ZXJ5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm0gYmF0Y2ggb2YgZGF0YSBhY2NvcmRpbmcgdG8gbWFwcGluZ1xuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyB0cmFuc2Zvcm1CYXRjaChkYXRhOiBhbnlbXSwgbWFwcGluZzogTWlncmF0aW9uTWFwcGluZyk6IFByb21pc2U8YW55W10+IHtcbiAgICByZXR1cm4gZGF0YS5tYXAoaXRlbSA9PiB0aGlzLnRyYW5zZm9ybUl0ZW0oaXRlbSwgbWFwcGluZykpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybSBzaW5nbGUgaXRlbSBhY2NvcmRpbmcgdG8gbWFwcGluZ1xuICAgKi9cbiAgcHJpdmF0ZSB0cmFuc2Zvcm1JdGVtKGl0ZW06IGFueSwgbWFwcGluZzogTWlncmF0aW9uTWFwcGluZyk6IGFueSB7XG4gICAgY29uc3QgdHJhbnNmb3JtZWQ6IGFueSA9IHt9O1xuXG4gICAgLy8gQXBwbHkga2V5IG1hcHBpbmdzXG4gICAgT2JqZWN0LmVudHJpZXMobWFwcGluZy5rZXlNYXBwaW5nKS5mb3JFYWNoKChba2V5LCBtYXBwZXJdKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIG1hcHBlciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdHJhbnNmb3JtZWRba2V5XSA9IGl0ZW1bbWFwcGVyXTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG1hcHBlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0cmFuc2Zvcm1lZFtrZXldID0gbWFwcGVyKGl0ZW0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gQXBwbHkgZmllbGQgbWFwcGluZ3NcbiAgICBPYmplY3QuZW50cmllcyhtYXBwaW5nLmZpZWxkTWFwcGluZykuZm9yRWFjaCgoW3RhcmdldEZpZWxkLCBzb3VyY2VNYXBwZXJdKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHNvdXJjZU1hcHBlciA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5zZXROZXN0ZWRQcm9wZXJ0eSh0cmFuc2Zvcm1lZCwgdGFyZ2V0RmllbGQsIGl0ZW1bc291cmNlTWFwcGVyXSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzb3VyY2VNYXBwZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5zZXROZXN0ZWRQcm9wZXJ0eSh0cmFuc2Zvcm1lZCwgdGFyZ2V0RmllbGQsIHNvdXJjZU1hcHBlcihpdGVtKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBBcHBseSB0cmFuc2Zvcm1hdGlvbnNcbiAgICBpZiAobWFwcGluZy50cmFuc2Zvcm1hdGlvbnMpIHtcbiAgICAgIG1hcHBpbmcudHJhbnNmb3JtYXRpb25zLmZvckVhY2godHJhbnNmb3JtYXRpb24gPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSB0aGlzLmdldE5lc3RlZFByb3BlcnR5KHRyYW5zZm9ybWVkLCB0cmFuc2Zvcm1hdGlvbi5maWVsZCk7XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlID0gdHJhbnNmb3JtYXRpb24udHJhbnNmb3JtKGN1cnJlbnRWYWx1ZSwgaXRlbSk7XG4gICAgICAgIHRoaXMuc2V0TmVzdGVkUHJvcGVydHkodHJhbnNmb3JtZWQsIHRyYW5zZm9ybWF0aW9uLmZpZWxkLCBuZXdWYWx1ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBBcHBseSBmaWx0ZXJzXG4gICAgaWYgKG1hcHBpbmcuZmlsdGVycykge1xuICAgICAgY29uc3Qgc2hvdWxkSW5jbHVkZSA9IG1hcHBpbmcuZmlsdGVycy5ldmVyeShmaWx0ZXIgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0TmVzdGVkUHJvcGVydHkodHJhbnNmb3JtZWQsIGZpbHRlci5maWVsZCk7XG4gICAgICAgIHJldHVybiBmaWx0ZXIuY29uZGl0aW9uKHZhbHVlLCBpdGVtKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIXNob3VsZEluY2x1ZGUpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRyYW5zZm9ybWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIGJhdGNoIG9mIHRyYW5zZm9ybWVkIGl0ZW1zXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIHZhbGlkYXRlQmF0Y2goXG4gICAgaXRlbXM6IGFueVtdLCBcbiAgICB2YWxpZGF0aW9uUnVsZXM/OiBhbnlbXVxuICApOiBQcm9taXNlPHsgdmFsaWRJdGVtczogYW55W107IGludmFsaWRJdGVtczogQXJyYXk8eyBpZDogc3RyaW5nOyBkYXRhOiBhbnk7IGVycm9yOiBzdHJpbmcgfT4gfT4ge1xuICAgIGNvbnN0IHZhbGlkSXRlbXM6IGFueVtdID0gW107XG4gICAgY29uc3QgaW52YWxpZEl0ZW1zOiBBcnJheTx7IGlkOiBzdHJpbmc7IGRhdGE6IGFueTsgZXJyb3I6IHN0cmluZyB9PiA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgICBpZiAoaXRlbSA9PT0gbnVsbCkge1xuICAgICAgICBjb250aW51ZTsgLy8gRmlsdGVyZWQgb3V0IGl0ZW1cbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVmFsaWRhdGUgRHluYW1vREIga2V5IHN0cnVjdHVyZVxuICAgICAgICBjb25zdCBrZXlWYWxpZGF0aW9uID0gRGF0YVZhbGlkYXRvci52YWxpZGF0ZUtleXMoaXRlbSk7XG4gICAgICAgIGlmICgha2V5VmFsaWRhdGlvbi5pc1ZhbGlkKSB7XG4gICAgICAgICAgaW52YWxpZEl0ZW1zLnB1c2goe1xuICAgICAgICAgICAgaWQ6IGl0ZW0uUEsgfHwgJ3Vua25vd24nLFxuICAgICAgICAgICAgZGF0YTogaXRlbSxcbiAgICAgICAgICAgIGVycm9yOiBrZXlWYWxpZGF0aW9uLmVycm9ycy5tYXAoZSA9PiBlLm1lc3NhZ2UpLmpvaW4oJywgJyksXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBWYWxpZGF0ZSBjb25zaXN0ZW5jeVxuICAgICAgICBjb25zdCBjb25zaXN0ZW5jeVZhbGlkYXRpb24gPSBEYXRhVmFsaWRhdG9yLnZhbGlkYXRlQ29uc2lzdGVuY3koaXRlbSk7XG4gICAgICAgIGlmICghY29uc2lzdGVuY3lWYWxpZGF0aW9uLmlzVmFsaWQpIHtcbiAgICAgICAgICBpbnZhbGlkSXRlbXMucHVzaCh7XG4gICAgICAgICAgICBpZDogaXRlbS5QSyB8fCAndW5rbm93bicsXG4gICAgICAgICAgICBkYXRhOiBpdGVtLFxuICAgICAgICAgICAgZXJyb3I6IGNvbnNpc3RlbmN5VmFsaWRhdGlvbi5lcnJvcnMubWFwKGUgPT4gZS5tZXNzYWdlKS5qb2luKCcsICcpLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW50aXR5LXNwZWNpZmljIHZhbGlkYXRpb25cbiAgICAgICAgbGV0IGVudGl0eVZhbGlkYXRpb247XG4gICAgICAgIHN3aXRjaCAoaXRlbS5lbnRpdHlUeXBlKSB7XG4gICAgICAgICAgY2FzZSAnVVNFUic6XG4gICAgICAgICAgICBlbnRpdHlWYWxpZGF0aW9uID0gRGF0YVZhbGlkYXRvci52YWxpZGF0ZVVzZXIoaXRlbSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdDSVJDTEUnOlxuICAgICAgICAgICAgZW50aXR5VmFsaWRhdGlvbiA9IERhdGFWYWxpZGF0b3IudmFsaWRhdGVDaXJjbGUoaXRlbSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdTVE9SWSc6XG4gICAgICAgICAgICBlbnRpdHlWYWxpZGF0aW9uID0gRGF0YVZhbGlkYXRvci52YWxpZGF0ZVN0b3J5KGl0ZW0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnQlVTSU5FU1MnOlxuICAgICAgICAgICAgZW50aXR5VmFsaWRhdGlvbiA9IERhdGFWYWxpZGF0b3IudmFsaWRhdGVCdXNpbmVzcyhpdGVtKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ1JFU09VUkNFJzpcbiAgICAgICAgICAgIGVudGl0eVZhbGlkYXRpb24gPSBEYXRhVmFsaWRhdG9yLnZhbGlkYXRlUmVzb3VyY2UoaXRlbSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgZW50aXR5VmFsaWRhdGlvbiA9IHsgaXNWYWxpZDogdHJ1ZSwgZXJyb3JzOiBbXSwgd2FybmluZ3M6IFtdIH07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWVudGl0eVZhbGlkYXRpb24uaXNWYWxpZCkge1xuICAgICAgICAgIGludmFsaWRJdGVtcy5wdXNoKHtcbiAgICAgICAgICAgIGlkOiBpdGVtLlBLIHx8ICd1bmtub3duJyxcbiAgICAgICAgICAgIGRhdGE6IGl0ZW0sXG4gICAgICAgICAgICBlcnJvcjogZW50aXR5VmFsaWRhdGlvbi5lcnJvcnMubWFwKGUgPT4gZS5tZXNzYWdlKS5qb2luKCcsICcpLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFsaWRJdGVtcy5wdXNoKGl0ZW0pO1xuXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpbnZhbGlkSXRlbXMucHVzaCh7XG4gICAgICAgICAgaWQ6IGl0ZW0uUEsgfHwgJ3Vua25vd24nLFxuICAgICAgICAgIGRhdGE6IGl0ZW0sXG4gICAgICAgICAgZXJyb3I6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgdmFsaWRJdGVtcywgaW52YWxpZEl0ZW1zIH07XG4gIH1cblxuICAvKipcbiAgICogTG9hZCBiYXRjaCBvZiB2YWxpZCBpdGVtcyB0byBEeW5hbW9EQlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBsb2FkQmF0Y2goaXRlbXM6IGFueVtdLCBjb25maWc6IE1pZ3JhdGlvbkNvbmZpZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFVzZSBiYXRjaCB3cml0ZSBmb3IgZWZmaWNpZW5jeVxuICAgIGF3YWl0IHRoaXMuZHluYW1vU2VydmljZS5iYXRjaFdyaXRlKGl0ZW1zLCAncHV0Jyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGJhY2t1cCBvZiBleGlzdGluZyBkYXRhXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIGNyZWF0ZUJhY2t1cCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBJbXBsZW1lbnRhdGlvbiB3b3VsZCBkZXBlbmQgb24gYmFja3VwIHN0cmF0ZWd5XG4gICAgLy8gQ291bGQgdXNlIER5bmFtb0RCIGJhY2t1cCwgZXhwb3J0IHRvIFMzLCBldGMuXG4gICAgY29uc29sZS5sb2coJ0NyZWF0aW5nIGJhY2t1cC4uLicpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBtaWdyYXRpb24gcHJvZ3Jlc3MgZm9yIGVudGl0eVxuICAgKi9cbiAgZ2V0UHJvZ3Jlc3MoZW50aXR5VHlwZTogc3RyaW5nKTogTWlncmF0aW9uUHJvZ3Jlc3MgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRQcm9ncmVzcy5nZXQoZW50aXR5VHlwZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBtaWdyYXRpb24gcHJvZ3Jlc3NcbiAgICovXG4gIGdldEFsbFByb2dyZXNzKCk6IE1pZ3JhdGlvblByb2dyZXNzW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuY3VycmVudFByb2dyZXNzLnZhbHVlcygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYW5jZWwgcnVubmluZyBtaWdyYXRpb25cbiAgICovXG4gIGNhbmNlbCgpOiB2b2lkIHtcbiAgICB0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xuICAgIHRoaXMuZW1pdCgnbWlncmF0aW9uQ2FuY2VsbGVkJyk7XG4gIH1cblxuICAvKipcbiAgICogVXRpbGl0eSB0byBzZXQgbmVzdGVkIHByb3BlcnR5XG4gICAqL1xuICBwcml2YXRlIHNldE5lc3RlZFByb3BlcnR5KG9iajogYW55LCBwYXRoOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBrZXlzID0gcGF0aC5zcGxpdCgnLicpO1xuICAgIGxldCBjdXJyZW50ID0gb2JqO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgY29uc3Qga2V5ID0ga2V5c1tpXTtcbiAgICAgIGlmICghKGtleSBpbiBjdXJyZW50KSB8fCB0eXBlb2YgY3VycmVudFtrZXldICE9PSAnb2JqZWN0Jykge1xuICAgICAgICBjdXJyZW50W2tleV0gPSB7fTtcbiAgICAgIH1cbiAgICAgIGN1cnJlbnQgPSBjdXJyZW50W2tleV07XG4gICAgfVxuXG4gICAgY3VycmVudFtrZXlzW2tleXMubGVuZ3RoIC0gMV1dID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogVXRpbGl0eSB0byBnZXQgbmVzdGVkIHByb3BlcnR5XG4gICAqL1xuICBwcml2YXRlIGdldE5lc3RlZFByb3BlcnR5KG9iajogYW55LCBwYXRoOiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiBwYXRoLnNwbGl0KCcuJykucmVkdWNlKChjdXJyZW50LCBrZXkpID0+IGN1cnJlbnQ/LltrZXldLCBvYmopO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBkZWZhdWx0IE1BRE1hbGwgbWlncmF0aW9uIHBsYW5cbiAgICovXG4gIHN0YXRpYyBjcmVhdGVNQURNYWxsTWlncmF0aW9uUGxhbigpOiBNaWdyYXRpb25QbGFuIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ01BRE1hbGwgdG8gRHluYW1vREIgTWlncmF0aW9uJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTWlncmF0ZSBNQURNYWxsIHBsYXRmb3JtIGRhdGEgdG8gRHluYW1vREIgc2luZ2xlLXRhYmxlIGRlc2lnbicsXG4gICAgICB2ZXJzaW9uOiAnMS4wLjAnLFxuICAgICAgZGVwZW5kZW5jaWVzOiBbXSxcbiAgICAgIGVudGl0aWVzOiBPYmplY3QudmFsdWVzKE1BRE1hbGxNaWdyYXRpb25NYXBwaW5ncyksXG4gICAgICB2YWxpZGF0aW9uUnVsZXM6IHtcbiAgICAgICAgVVNFUjogW10sXG4gICAgICAgIENJUkNMRTogW10sXG4gICAgICAgIFNUT1JZOiBbXSxcbiAgICAgICAgQlVTSU5FU1M6IFtdLFxuICAgICAgICBSRVNPVVJDRTogW10sXG4gICAgICB9LFxuICAgICAgcm9sbGJhY2tQbGFuOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHJvbGxiYWNrU3RlcHM6IFtdLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG59Il19