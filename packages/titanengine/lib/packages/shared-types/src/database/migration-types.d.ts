/**
 * Data Migration Types and Interfaces
 * Types for migrating existing data to DynamoDB single-table design
 */
export interface MigrationConfig {
    sourceType: 'sqlite' | 'mysql' | 'postgresql' | 'mongodb' | 'json' | 'csv';
    sourceConnection?: {
        host?: string;
        port?: number;
        database?: string;
        username?: string;
        password?: string;
        connectionString?: string;
        filePath?: string;
    };
    targetTable: string;
    batchSize: number;
    parallelism: number;
    dryRun: boolean;
    validateData: boolean;
    backupBeforeMigration: boolean;
    continueOnError: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}
export interface MigrationMapping {
    entityType: string;
    sourceTable?: string;
    sourceQuery?: string;
    keyMapping: {
        pk: string | ((item: any) => string);
        sk: string | ((item: any) => string);
        gsi1pk?: string | ((item: any) => string);
        gsi1sk?: string | ((item: any) => string);
        gsi2pk?: string | ((item: any) => string);
        gsi2sk?: string | ((item: any) => string);
        gsi3pk?: string | ((item: any) => string);
        gsi3sk?: string | ((item: any) => string);
        gsi4pk?: string | ((item: any) => string);
        gsi4sk?: string | ((item: any) => string);
    };
    fieldMapping: Record<string, string | ((item: any) => any)>;
    transformations?: Array<{
        field: string;
        transform: (value: any, item: any) => any;
    }>;
    validation?: Array<{
        field: string;
        validator: (value: any, item: any) => boolean | string;
    }>;
    filters?: Array<{
        field: string;
        condition: (value: any, item: any) => boolean;
    }>;
}
export interface MigrationResult {
    entityType: string;
    totalRecords: number;
    processedRecords: number;
    successfulRecords: number;
    failedRecords: number;
    skippedRecords: number;
    errors: MigrationError[];
    duration: number;
    throughput: number;
}
export interface MigrationError {
    recordId?: string;
    record?: any;
    error: string;
    errorType: 'validation' | 'transformation' | 'write' | 'constraint';
    timestamp: Date;
}
export interface MigrationProgress {
    entityType: string;
    phase: 'extracting' | 'transforming' | 'validating' | 'loading' | 'completed' | 'failed';
    totalRecords: number;
    processedRecords: number;
    currentBatch: number;
    totalBatches: number;
    startTime: Date;
    estimatedCompletion?: Date;
    throughput: number;
    errors: number;
}
export interface DataValidationRule {
    field: string;
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    enum?: any[];
    custom?: (value: any, item: any) => boolean | string;
}
export interface MigrationPlan {
    name: string;
    description: string;
    version: string;
    dependencies: string[];
    entities: MigrationMapping[];
    validationRules: Record<string, DataValidationRule[]>;
    preHooks?: Array<() => Promise<void>>;
    postHooks?: Array<() => Promise<void>>;
    rollbackPlan?: {
        enabled: boolean;
        backupLocation?: string;
        rollbackSteps: Array<() => Promise<void>>;
    };
}
export declare const MADMallMigrationMappings: Record<string, MigrationMapping>;
