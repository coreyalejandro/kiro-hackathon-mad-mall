import { Construct } from 'constructs';
import { RemovalPolicy, Stack, Tags } from 'aws-cdk-lib';
import { Bucket, BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Key, KeySpec, KeyUsage } from 'aws-cdk-lib/aws-kms';
import { Role, PolicyStatement, Effect, ServicePrincipal, AccountRootPrincipal, ArnPrincipal } from 'aws-cdk-lib/aws-iam';

export interface StorageConstructProps {
	/** Environment name (dev, staging, prod) */
	environment: string;
	/** Authenticated Cognito role requiring S3 access to per-user prefixes */
	authenticatedRole: Role;
}

export class StorageConstruct extends Construct {
	public readonly contentKmsKey: Key;
	public readonly userContentBucket: Bucket;

	constructor(scope: Construct, id: string, props: StorageConstructProps) {
		super(scope, id);

		const { environment, authenticatedRole } = props;

		// KMS key for user content bucket
		this.contentKmsKey = new Key(this, 'ContentKmsKey', {
			description: `MADMall ${environment} KMS key for S3 user content`,
			enableKeyRotation: true,
			keyUsage: KeyUsage.ENCRYPT_DECRYPT,
			keySpec: KeySpec.SYMMETRIC_DEFAULT,
			removalPolicy: environment === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
		});

		Tags.of(this.contentKmsKey).add('Name', `madmall-${environment}-content-key`);
		Tags.of(this.contentKmsKey).add('Environment', environment);

		// S3 bucket for user-generated content
		this.userContentBucket = new Bucket(this, 'UserContentBucket', {
			bucketName: `madmall-${environment}-user-content`,
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			enforceSSL: true,
			encryption: BucketEncryption.KMS,
			encryptionKey: this.contentKmsKey,
			bucketKeyEnabled: true,
			versioned: true,
			removalPolicy: environment === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
			autoDeleteObjects: environment !== 'prod',
		});

		Tags.of(this.userContentBucket).add('Name', `madmall-${environment}-user-content`);
		Tags.of(this.userContentBucket).add('Environment', environment);

		// Deny non-SSL access explicitly (belt-and-suspenders in addition to enforceSSL)
		this.userContentBucket.addToResourcePolicy(new PolicyStatement({
			effect: Effect.DENY,
			principals: [new AccountRootPrincipal(), new ArnPrincipal('*')],
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
		this.contentKmsKey.addToResourcePolicy(new PolicyStatement({
			effect: Effect.ALLOW,
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

