import { Construct } from 'constructs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Key } from 'aws-cdk-lib/aws-kms';
import { RemovalPolicy } from 'aws-cdk-lib';
export interface DatabaseConstructProps {
    /**
     * Environment name (dev, staging, prod)
     */
    environment: string;
    /**
     * Whether to enable point-in-time recovery
     * @default true
     */
    enablePointInTimeRecovery?: boolean;
    /**
     * Whether to enable DynamoDB streams
     * @default true
     */
    enableStreams?: boolean;
    /**
     * Removal policy for the table
     * @default RemovalPolicy.RETAIN for prod, RemovalPolicy.DESTROY for others
     */
    removalPolicy?: RemovalPolicy;
}
export declare class DatabaseConstruct extends Construct {
    readonly mainTable: Table;
    readonly kmsKey: Key;
    constructor(scope: Construct, id: string, props: DatabaseConstructProps);
    private addGlobalSecondaryIndexes;
    /**
     * Get access patterns documentation for the single-table design
     */
    getAccessPatterns(): Record<string, string>;
}
