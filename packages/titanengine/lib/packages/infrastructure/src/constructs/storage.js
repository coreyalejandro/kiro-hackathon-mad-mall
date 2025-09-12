"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageConstruct = void 0;
const constructs_1 = require("constructs");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_s3_1 = require("aws-cdk-lib/aws-s3");
const aws_kms_1 = require("aws-cdk-lib/aws-kms");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
class StorageConstruct extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const { environment, authenticatedRole } = props;
        // KMS key for user content bucket
        this.contentKmsKey = new aws_kms_1.Key(this, 'ContentKmsKey', {
            description: `MADMall ${environment} KMS key for S3 user content`,
            enableKeyRotation: true,
            keyUsage: aws_kms_1.KeyUsage.ENCRYPT_DECRYPT,
            keySpec: aws_kms_1.KeySpec.SYMMETRIC_DEFAULT,
            removalPolicy: environment === 'prod' ? aws_cdk_lib_1.RemovalPolicy.RETAIN : aws_cdk_lib_1.RemovalPolicy.DESTROY,
        });
        aws_cdk_lib_1.Tags.of(this.contentKmsKey).add('Name', `madmall-${environment}-content-key`);
        aws_cdk_lib_1.Tags.of(this.contentKmsKey).add('Environment', environment);
        // S3 bucket for user-generated content
        this.userContentBucket = new aws_s3_1.Bucket(this, 'UserContentBucket', {
            bucketName: `madmall-${environment}-user-content`,
            blockPublicAccess: aws_s3_1.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
            encryption: aws_s3_1.BucketEncryption.KMS,
            encryptionKey: this.contentKmsKey,
            bucketKeyEnabled: true,
            versioned: true,
            removalPolicy: environment === 'prod' ? aws_cdk_lib_1.RemovalPolicy.RETAIN : aws_cdk_lib_1.RemovalPolicy.DESTROY,
            autoDeleteObjects: environment !== 'prod',
        });
        aws_cdk_lib_1.Tags.of(this.userContentBucket).add('Name', `madmall-${environment}-user-content`);
        aws_cdk_lib_1.Tags.of(this.userContentBucket).add('Environment', environment);
        // Deny non-SSL access explicitly (belt-and-suspenders in addition to enforceSSL)
        this.userContentBucket.addToResourcePolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.DENY,
            principals: [new aws_iam_1.AccountRootPrincipal(), new aws_iam_1.ArnPrincipal('*')],
            actions: ['s3:*'],
            resources: [
                this.userContentBucket.bucketArn,
                `${this.userContentBucket.bucketArn}/*`,
            ],
            conditions: { Bool: { 'aws:SecureTransport': 'false' } },
        }));
        // Allow the authenticated role to encrypt/decrypt using the bucket KMS key
        this.contentKmsKey.grantEncryptDecrypt(authenticatedRole);
        // Optional: narrow KMS usage by condition to this bucket when used via S3
        this.contentKmsKey.addToResourcePolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            principals: [authenticatedRole],
            actions: [
                'kms:Encrypt',
                'kms:Decrypt',
                'kms:ReEncrypt*',
                'kms:GenerateDataKey*',
                'kms:DescribeKey',
            ],
            resources: ['*'],
            conditions: {
                StringEquals: {
                    'kms:EncryptionContext:aws:s3:arn': this.userContentBucket.bucketArn,
                },
            },
        }));
    }
}
exports.StorageConstruct = StorageConstruct;
//# sourceMappingURL=storage.js.map