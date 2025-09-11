import { Construct } from 'constructs';
import { Duration, RemovalPolicy, Stack, Tags } from 'aws-cdk-lib';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Key, KeySpec, KeyUsage } from 'aws-cdk-lib/aws-kms';
import { Bucket, BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Trail, ReadWriteType, InsightType } from 'aws-cdk-lib/aws-cloudtrail';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import * as config from 'aws-cdk-lib/aws-config';
import { ManagedRuleIdentifiers } from 'aws-cdk-lib/aws-config';
import * as securityhub from 'aws-cdk-lib/aws-securityhub';
import { Secret, SecretProps } from 'aws-cdk-lib/aws-secretsmanager';
import { PolicyStatement, Effect, AccountRootPrincipal, ArnPrincipal, ServicePrincipal, Role, ManagedPolicy, PolicyDocument } from 'aws-cdk-lib/aws-iam';

export interface SecurityConstructProps {
  /** Environment name (dev, staging, prod) */
  environment: string;
  /** REST API to protect with WAF */
  restApi: RestApi;
  /** Additional S3 buckets to include in CloudTrail data events */
  additionalS3Buckets?: Bucket[];
}

export class SecurityConstruct extends Construct {
  public readonly auditKmsKey: Key;
  public readonly auditBucket: Bucket;
  public readonly webAcl: wafv2.CfnWebACL;

  constructor(scope: Construct, id: string, props: SecurityConstructProps) {
    super(scope, id);

    const { environment, restApi, additionalS3Buckets = [] } = props;

    // KMS key for audit logs and bucket encryption
    this.auditKmsKey = new Key(this, 'AuditKmsKey', {
      description: `MADMall ${environment} KMS key for audit and logging`,
      enableKeyRotation: true,
      keyUsage: KeyUsage.ENCRYPT_DECRYPT,
      keySpec: KeySpec.SYMMETRIC_DEFAULT,
      removalPolicy: environment === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    Tags.of(this.auditKmsKey).add('Name', `madmall-${environment}-audit-key`);
    Tags.of(this.auditKmsKey).add('Environment', environment);

    // Central audit bucket (CloudTrail, Config, other logs)
    this.auditBucket = new Bucket(this, 'AuditBucket', {
      bucketName: `madmall-${environment}-audit-${Stack.of(this).account}-${Stack.of(this).region}`.toLowerCase(),
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      encryption: BucketEncryption.KMS,
      encryptionKey: this.auditKmsKey,
      versioned: true,
      removalPolicy: environment === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== 'prod',
    });

    Tags.of(this.auditBucket).add('Name', `madmall-${environment}-audit-bucket`);

    // Explicitly deny non-SSL access to audit bucket
    this.auditBucket.addToResourcePolicy(new PolicyStatement({
      effect: Effect.DENY,
      principals: [new AccountRootPrincipal(), new ArnPrincipal('*')],
      actions: ['s3:*'],
      resources: [this.auditBucket.bucketArn, `${this.auditBucket.bucketArn}/*`],
      conditions: { Bool: { 'aws:SecureTransport': 'false' } },
    }));

    // CloudTrail - management and data events
    const trailLogGroup = new LogGroup(this, 'CloudTrailLogGroup', {
      logGroupName: `/aws/cloudtrail/madmall-${environment}`,
      retention: environment === 'prod' ? RetentionDays.ONE_YEAR : RetentionDays.SIX_MONTHS,
      removalPolicy: environment === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    const trailName = `madmall-${environment}-trail`;
    const trail = new Trail(this, 'AuditTrail', {
      trailName,
      bucket: this.auditBucket,
      encryptionKey: this.auditKmsKey,
      sendToCloudWatchLogs: true,
      cloudWatchLogGroup: trailLogGroup,
      includeGlobalServiceEvents: true,
      managementEvents: ReadWriteType.ALL,
      enableFileValidation: true,
      isMultiRegionTrail: true,
      insightTypes: [InsightType.API_CALL_RATE, InsightType.API_ERROR_RATE],
    });
    // Capture S3 data events for audit and application buckets
    trail.addS3EventSelector([
      { bucket: this.auditBucket },
      ...additionalS3Buckets.map(b => ({ bucket: b })),
    ], { readWriteType: ReadWriteType.ALL });

    // KMS key policy for CloudTrail service usage
    const region = Stack.of(this).region;
    const account = Stack.of(this).account;
    const trailArn = `arn:aws:cloudtrail:${region}:${account}:trail/${trailName}`;
    this.auditKmsKey.addToResourcePolicy(new PolicyStatement({
      sid: 'AllowCloudTrailUseOfKMSKey',
      effect: Effect.ALLOW,
      principals: [new ServicePrincipal('cloudtrail.amazonaws.com')],
      actions: [
        'kms:DescribeKey',
        'kms:GenerateDataKey*',
        'kms:Encrypt',
        'kms:Decrypt',
      ],
      resources: ['*'],
      conditions: {
        StringEquals: {
          'AWS:SourceArn': trailArn,
        },
      },
    }));

    // Allow AWS Config to use the audit KMS key (for KMS-encrypted S3 writes)
    this.auditKmsKey.addToResourcePolicy(new PolicyStatement({
      sid: 'AllowConfigUseOfKMSKey',
      effect: Effect.ALLOW,
      principals: [new ServicePrincipal('config.amazonaws.com')],
      actions: [
        'kms:Encrypt',
        'kms:GenerateDataKey*',
        'kms:DescribeKey',
      ],
      resources: ['*'],
      conditions: {
        StringEquals: {
          'AWS:SourceAccount': account,
        },
      },
    }));

    // WAF WebACL with AWS managed rule sets
    this.webAcl = new wafv2.CfnWebACL(this, 'ApiWebAcl', {
      name: `madmall-${environment}-api-waf`,
      scope: 'REGIONAL',
      defaultAction: { allow: {} },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `madmall-${environment}-api-waf`,
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          name: 'AWS-AWSManagedRulesCommonRuleSet',
          priority: 0,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesCommonRuleSet',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'CommonRuleSet',
            sampledRequestsEnabled: true,
          },
        },
        {
          name: 'AWS-AWSManagedRulesKnownBadInputsRuleSet',
          priority: 1,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesKnownBadInputsRuleSet',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'KnownBadInputs',
            sampledRequestsEnabled: true,
          },
        },
        {
          name: 'AWS-AWSManagedRulesSQLiRuleSet',
          priority: 2,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesSQLiRuleSet',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'SQLi',
            sampledRequestsEnabled: true,
          },
        },
        {
          name: 'AWS-AWSManagedRulesAmazonIpReputationList',
          priority: 3,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesAmazonIpReputationList',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'IpReputation',
            sampledRequestsEnabled: true,
          },
        },
      ],
    });

    const apiStageArn = `arn:aws:apigateway:${region}::/restapis/${restApi.restApiId}/stages/${restApi.deploymentStage.stageName}`;

    new wafv2.CfnWebACLAssociation(this, 'ApiWebAclAssociation', {
      resourceArn: apiStageArn,
      webAclArn: this.webAcl.attrArn,
    });

    // AWS Config - recorder and delivery channel
    const configRole = new Role(this, 'ConfigServiceRole', {
      assumedBy: new ServicePrincipal('config.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSConfigRole'),
      ],
    });

    const recorder = new config.CfnConfigurationRecorder(this, 'ConfigRecorder', {
      roleArn: configRole.roleArn,
      recordingGroup: {
        allSupported: true,
        includeGlobalResourceTypes: true,
      },
    });
    const delivery = new config.CfnDeliveryChannel(this, 'ConfigDeliveryChannel', {
      s3BucketName: this.auditBucket.bucketName,
    });
    delivery.node.addDependency(recorder);

    // AWS Config - a few key managed rules
    new config.ManagedRule(this, 'ConfigS3Encryption', {
      identifier: ManagedRuleIdentifiers.S3_BUCKET_SERVER_SIDE_ENCRYPTION_ENABLED,
    });
    new config.ManagedRule(this, 'ConfigCloudTrailEnabled', {
      identifier: ManagedRuleIdentifiers.CLOUD_TRAIL_ENABLED,
    });
    new config.ManagedRule(this, 'ConfigRestrictedSSH', {
      identifier: ManagedRuleIdentifiers.EC2_SECURITY_GROUPS_INCOMING_SSH_DISABLED,
    });
    new config.ManagedRule(this, 'ConfigDefaultSgClosed', {
      identifier: ManagedRuleIdentifiers.VPC_DEFAULT_SECURITY_GROUP_CLOSED,
    });
    new config.ManagedRule(this, 'ConfigS3PublicReadProhibited', {
      identifier: ManagedRuleIdentifiers.S3_BUCKET_PUBLIC_READ_PROHIBITED,
    });
    new config.ManagedRule(this, 'ConfigS3PublicWriteProhibited', {
      identifier: ManagedRuleIdentifiers.S3_BUCKET_PUBLIC_WRITE_PROHIBITED,
    });
    new config.ManagedRule(this, 'ConfigS3SslRequestsOnly', {
      identifier: ManagedRuleIdentifiers.S3_BUCKET_SSL_REQUESTS_ONLY,
    });
    new config.ManagedRule(this, 'ConfigDynamoPitrEnabled', {
      identifier: ManagedRuleIdentifiers.DYNAMODB_PITR_ENABLED,
    });
    new config.ManagedRule(this, 'ConfigVpcFlowLogsEnabled', {
      identifier: ManagedRuleIdentifiers.VPC_FLOW_LOGS_ENABLED,
    });
    new config.ManagedRule(this, 'ConfigCloudTrailLogValidation', {
      identifier: ManagedRuleIdentifiers.CLOUD_TRAIL_LOG_FILE_VALIDATION_ENABLED,
    });
    new config.ManagedRule(this, 'ConfigCloudTrailEncryption', {
      identifier: ManagedRuleIdentifiers.CLOUDTRAIL_MULTI_REGION_ENABLED,
    });

    // Security Hub - enable and subscribe to AWS Foundational Security Best Practices
    const hub = new securityhub.CfnHub(this, 'SecurityHub', {});
    new securityhub.CfnStandard(this, 'SecurityHubFsbp', {
      standardsArn: `arn:aws:securityhub:${region}::standards/aws-foundational-security-best-practices/v/1.0.0`,
    }).addDependency(hub);

    // Standard secrets placeholders using KMS (managed by Secrets Manager or a CMK)
    this.createSecret(`madmall/${environment}/pexels`, {
      description: 'Pexels API key',
    });
    this.createSecret(`madmall/${environment}/unsplash`, {
      description: 'Unsplash access key',
    });
  }

  private createSecret(secretName: string, props?: Partial<SecretProps>): Secret {
    const id = `Secret${secretName.replace(/\W+/g, '')}`;
    return new Secret(this, id, {
      secretName,
      description: props?.description,
      removalPolicy: RemovalPolicy.RETAIN,
    });
  }
}

