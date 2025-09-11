import { Construct } from 'constructs';
import { Duration, RemovalPolicy, Stack, Tags } from 'aws-cdk-lib';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Key, KeySpec, KeyUsage } from 'aws-cdk-lib/aws-kms';
import { Bucket, BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Trail, ReadWriteType } from 'aws-cdk-lib/aws-cloudtrail';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import * as config from 'aws-cdk-lib/aws-config';
import * as securityhub from 'aws-cdk-lib/aws-securityhub';
import { Secret, SecretProps } from 'aws-cdk-lib/aws-secretsmanager';

export interface SecurityConstructProps {
  /** Environment name (dev, staging, prod) */
  environment: string;
  /** REST API to protect with WAF */
  restApi: RestApi;
}

export class SecurityConstruct extends Construct {
  public readonly auditKmsKey: Key;
  public readonly auditBucket: Bucket;
  public readonly webAcl: wafv2.CfnWebACL;

  constructor(scope: Construct, id: string, props: SecurityConstructProps) {
    super(scope, id);

    const { environment, restApi } = props;

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

    // CloudTrail - management and data events
    const trailLogGroup = new LogGroup(this, 'CloudTrailLogGroup', {
      logGroupName: `/aws/cloudtrail/madmall-${environment}`,
      retention: environment === 'prod' ? RetentionDays.ONE_YEAR : RetentionDays.SIX_MONTHS,
      removalPolicy: environment === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    const trail = new Trail(this, 'AuditTrail', {
      trailName: `madmall-${environment}-trail`,
      bucket: this.auditBucket,
      encryptionKey: this.auditKmsKey,
      sendToCloudWatchLogs: true,
      cloudWatchLogsRetention: trailLogGroup.retention,
      includeGlobalServiceEvents: true,
      managementEvents: ReadWriteType.ALL,
      enableFileValidation: true,
    });
    // Capture S3 and Lambda data events (common)
    trail.addS3EventSelector([{ bucket: this.auditBucket }], ReadWriteType.ALL);

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

    const region = Stack.of(this).region;
    const apiStageArn = `arn:aws:apigateway:${region}::/restapis/${restApi.restApiId}/stages/${restApi.deploymentStage.stageName}`;

    new wafv2.CfnWebACLAssociation(this, 'ApiWebAclAssociation', {
      resourceArn: apiStageArn,
      webAclArn: this.webAcl.attrArn,
    });

    // AWS Config - recorder and delivery channel
    const recorder = new config.ConfigurationRecorder(this, 'ConfigRecorder');
    const delivery = new config.DeliveryChannel(this, 'ConfigDeliveryChannel', {
      s3Bucket: this.auditBucket,
    });
    delivery.node.addDependency(recorder);

    // AWS Config - a few key managed rules
    new config.ManagedRule(this, 'ConfigS3Encryption', {
      identifier: config.ManagedRuleIdentifiers.S3_BUCKET_SERVER_SIDE_ENCRYPTION_ENABLED,
    });
    new config.ManagedRule(this, 'ConfigCloudTrailEnabled', {
      identifier: config.ManagedRuleIdentifiers.CLOUD_TRAIL_ENABLED,
    });
    new config.ManagedRule(this, 'ConfigRestrictedSSH', {
      identifier: config.ManagedRuleIdentifiers.EC2_SECURITY_GROUPS_INCOMING_SSH_DISABLED,
    });
    new config.ManagedRule(this, 'ConfigDefaultSgClosed', {
      identifier: config.ManagedRuleIdentifiers.EC2_DEFAULT_SECURITY_GROUP_CLOSED,
    });

    // Security Hub - enable and subscribe to AWS Foundational Security Best Practices
    const hub = new securityhub.CfnHub(this, 'SecurityHub', {});
    new securityhub.CfnStandardsSubscription(this, 'SecurityHubFsbp', {
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

