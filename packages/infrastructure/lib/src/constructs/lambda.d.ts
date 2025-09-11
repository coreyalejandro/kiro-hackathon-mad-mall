import { Construct } from 'constructs';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Vpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Key } from 'aws-cdk-lib/aws-kms';
export interface LambdaConstructProps {
    /**
     * Environment name (dev, staging, prod)
     */
    environment: string;
    /**
     * VPC for Lambda functions
     */
    vpc: Vpc;
    /**
     * Security group for Lambda functions
     */
    securityGroup: SecurityGroup;
    /**
     * DynamoDB table for data access
     */
    dynamoTable: Table;
    /**
     * KMS key for encryption
     */
    kmsKey: Key;
    /**
     * Additional environment variables
     */
    additionalEnvironmentVariables?: Record<string, string>;
}
export interface LambdaFunctionConfig {
    /**
     * Function name suffix
     */
    name: string;
    /**
     * Function description
     */
    description: string;
    /**
     * Path to the function code
     */
    codePath: string;
    /**
     * Function handler
     */
    handler: string;
    /**
     * Memory allocation in MB
     * @default 512
     */
    memorySize?: number;
    /**
     * Timeout in seconds
     * @default 30
     */
    timeout?: number;
    /**
     * Additional IAM policy statements
     */
    additionalPolicyStatements?: PolicyStatement[];
    /**
     * Function-specific environment variables
     */
    environmentVariables?: Record<string, string>;
}
export declare class LambdaConstruct extends Construct {
    readonly functions: Map<string, LambdaFunction>;
    private readonly baseRole;
    private readonly baseEnvironmentVariables;
    constructor(scope: Construct, id: string, props: LambdaConstructProps);
    private createBaseLambdaRole;
    private createCommonFunctions;
    createFunction(config: LambdaFunctionConfig, environment: string, vpc: Vpc, securityGroup: SecurityGroup): LambdaFunction;
    getFunction(name: string): LambdaFunction | undefined;
    getAllFunctions(): LambdaFunction[];
}
