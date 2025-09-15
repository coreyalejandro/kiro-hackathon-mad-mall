import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Role } from 'aws-cdk-lib/aws-iam';
import { Distribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
export interface StorageConstructProps {
    /** Environment name (dev, staging, prod) */
    environment: string;
    /** Authenticated Cognito role requiring S3 access to per-user prefixes */
    authenticatedRole: Role;
}
export declare class StorageConstruct extends Construct {
    readonly contentKmsKey: Key;
    readonly userContentBucket: Bucket;
    readonly cdnDistribution: Distribution;
    readonly originAccessIdentity: OriginAccessIdentity;
    constructor(scope: Construct, id: string, props: StorageConstructProps);
}
