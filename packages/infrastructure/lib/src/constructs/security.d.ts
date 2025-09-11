import { Construct } from 'constructs';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
export interface SecurityConstructProps {
    /** Environment name (dev, staging, prod) */
    environment: string;
    /** REST API to protect with WAF */
    restApi: RestApi;
    /** Additional S3 buckets to include in CloudTrail data events */
    additionalS3Buckets?: Bucket[];
}
export declare class SecurityConstruct extends Construct {
    readonly auditKmsKey: Key;
    readonly auditBucket: Bucket;
    readonly webAcl: wafv2.CfnWebACL;
    constructor(scope: Construct, id: string, props: SecurityConstructProps);
    private createSecret;
}
