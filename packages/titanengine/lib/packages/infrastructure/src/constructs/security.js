"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityConstruct = void 0;
const constructs_1 = require("constructs");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_kms_1 = require("aws-cdk-lib/aws-kms");
const aws_s3_1 = require("aws-cdk-lib/aws-s3");
const aws_logs_1 = require("aws-cdk-lib/aws-logs");
const aws_cloudtrail_1 = require("aws-cdk-lib/aws-cloudtrail");
const wafv2 = __importStar(require("aws-cdk-lib/aws-wafv2"));
const config = __importStar(require("aws-cdk-lib/aws-config"));
const aws_config_1 = require("aws-cdk-lib/aws-config");
const securityhub = __importStar(require("aws-cdk-lib/aws-securityhub"));
const aws_secretsmanager_1 = require("aws-cdk-lib/aws-secretsmanager");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
class SecurityConstruct extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const { environment, restApi, additionalS3Buckets = [] } = props;
        // KMS key for audit logs and bucket encryption
        this.auditKmsKey = new aws_kms_1.Key(this, 'AuditKmsKey', {
            description: `MADMall ${environment} KMS key for audit and logging`,
            enableKeyRotation: true,
            keyUsage: aws_kms_1.KeyUsage.ENCRYPT_DECRYPT,
            keySpec: aws_kms_1.KeySpec.SYMMETRIC_DEFAULT,
            removalPolicy: environment === 'prod' ? aws_cdk_lib_1.RemovalPolicy.RETAIN : aws_cdk_lib_1.RemovalPolicy.DESTROY,
        });
        aws_cdk_lib_1.Tags.of(this.auditKmsKey).add('Name', `madmall-${environment}-audit-key`);
        aws_cdk_lib_1.Tags.of(this.auditKmsKey).add('Environment', environment);
        // Central audit bucket (CloudTrail, Config, other logs)
        this.auditBucket = new aws_s3_1.Bucket(this, 'AuditBucket', {
            bucketName: `madmall-${environment}-audit-${aws_cdk_lib_1.Stack.of(this).account}-${aws_cdk_lib_1.Stack.of(this).region}`.toLowerCase(),
            blockPublicAccess: aws_s3_1.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
            encryption: aws_s3_1.BucketEncryption.KMS,
            encryptionKey: this.auditKmsKey,
            versioned: true,
            removalPolicy: environment === 'prod' ? aws_cdk_lib_1.RemovalPolicy.RETAIN : aws_cdk_lib_1.RemovalPolicy.DESTROY,
            autoDeleteObjects: environment !== 'prod',
        });
        aws_cdk_lib_1.Tags.of(this.auditBucket).add('Name', `madmall-${environment}-audit-bucket`);
        // Explicitly deny non-SSL access to audit bucket
        this.auditBucket.addToResourcePolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.DENY,
            principals: [new aws_iam_1.AccountRootPrincipal(), new aws_iam_1.ArnPrincipal('*')],
            actions: ['s3:*'],
            resources: [this.auditBucket.bucketArn, `${this.auditBucket.bucketArn}/*`],
            conditions: { Bool: { 'aws:SecureTransport': 'false' } },
        }));
        // CloudTrail - management and data events
        const trailLogGroup = new aws_logs_1.LogGroup(this, 'CloudTrailLogGroup', {
            logGroupName: `/aws/cloudtrail/madmall-${environment}`,
            retention: environment === 'prod' ? aws_logs_1.RetentionDays.ONE_YEAR : aws_logs_1.RetentionDays.SIX_MONTHS,
            removalPolicy: environment === 'prod' ? aws_cdk_lib_1.RemovalPolicy.RETAIN : aws_cdk_lib_1.RemovalPolicy.DESTROY,
        });
        const trailName = `madmall-${environment}-trail`;
        const trail = new aws_cloudtrail_1.Trail(this, 'AuditTrail', {
            trailName,
            bucket: this.auditBucket,
            encryptionKey: this.auditKmsKey,
            sendToCloudWatchLogs: true,
            cloudWatchLogGroup: trailLogGroup,
            includeGlobalServiceEvents: true,
            managementEvents: aws_cloudtrail_1.ReadWriteType.ALL,
            enableFileValidation: true,
            isMultiRegionTrail: true,
            insightTypes: [aws_cloudtrail_1.InsightType.API_CALL_RATE, aws_cloudtrail_1.InsightType.API_ERROR_RATE],
        });
        // Capture S3 data events for audit and application buckets
        trail.addS3EventSelector([
            { bucket: this.auditBucket },
            ...additionalS3Buckets.map(b => ({ bucket: b })),
        ], { readWriteType: aws_cloudtrail_1.ReadWriteType.ALL });
        // KMS key policy for CloudTrail service usage
        const region = aws_cdk_lib_1.Stack.of(this).region;
        const account = aws_cdk_lib_1.Stack.of(this).account;
        const trailArn = `arn:aws:cloudtrail:${region}:${account}:trail/${trailName}`;
        this.auditKmsKey.addToResourcePolicy(new aws_iam_1.PolicyStatement({
            sid: 'AllowCloudTrailUseOfKMSKey',
            effect: aws_iam_1.Effect.ALLOW,
            principals: [new aws_iam_1.ServicePrincipal('cloudtrail.amazonaws.com')],
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
        this.auditKmsKey.addToResourcePolicy(new aws_iam_1.PolicyStatement({
            sid: 'AllowConfigUseOfKMSKey',
            effect: aws_iam_1.Effect.ALLOW,
            principals: [new aws_iam_1.ServicePrincipal('config.amazonaws.com')],
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
        const configRole = new aws_iam_1.Role(this, 'ConfigServiceRole', {
            assumedBy: new aws_iam_1.ServicePrincipal('config.amazonaws.com'),
            managedPolicies: [
                aws_iam_1.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSConfigRole'),
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
            identifier: aws_config_1.ManagedRuleIdentifiers.S3_BUCKET_SERVER_SIDE_ENCRYPTION_ENABLED,
        });
        new config.ManagedRule(this, 'ConfigCloudTrailEnabled', {
            identifier: aws_config_1.ManagedRuleIdentifiers.CLOUD_TRAIL_ENABLED,
        });
        new config.ManagedRule(this, 'ConfigRestrictedSSH', {
            identifier: aws_config_1.ManagedRuleIdentifiers.EC2_SECURITY_GROUPS_INCOMING_SSH_DISABLED,
        });
        new config.ManagedRule(this, 'ConfigDefaultSgClosed', {
            identifier: aws_config_1.ManagedRuleIdentifiers.VPC_DEFAULT_SECURITY_GROUP_CLOSED,
        });
        new config.ManagedRule(this, 'ConfigS3PublicReadProhibited', {
            identifier: aws_config_1.ManagedRuleIdentifiers.S3_BUCKET_PUBLIC_READ_PROHIBITED,
        });
        new config.ManagedRule(this, 'ConfigS3PublicWriteProhibited', {
            identifier: aws_config_1.ManagedRuleIdentifiers.S3_BUCKET_PUBLIC_WRITE_PROHIBITED,
        });
        new config.ManagedRule(this, 'ConfigS3SslRequestsOnly', {
            identifier: aws_config_1.ManagedRuleIdentifiers.S3_BUCKET_SSL_REQUESTS_ONLY,
        });
        new config.ManagedRule(this, 'ConfigDynamoPitrEnabled', {
            identifier: aws_config_1.ManagedRuleIdentifiers.DYNAMODB_PITR_ENABLED,
        });
        new config.ManagedRule(this, 'ConfigVpcFlowLogsEnabled', {
            identifier: aws_config_1.ManagedRuleIdentifiers.VPC_FLOW_LOGS_ENABLED,
        });
        new config.ManagedRule(this, 'ConfigCloudTrailLogValidation', {
            identifier: aws_config_1.ManagedRuleIdentifiers.CLOUD_TRAIL_LOG_FILE_VALIDATION_ENABLED,
        });
        new config.ManagedRule(this, 'ConfigCloudTrailEncryption', {
            identifier: aws_config_1.ManagedRuleIdentifiers.CLOUDTRAIL_MULTI_REGION_ENABLED,
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
    createSecret(secretName, props) {
        const id = `Secret${secretName.replace(/\W+/g, '')}`;
        return new aws_secretsmanager_1.Secret(this, id, {
            secretName,
            description: props?.description,
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.RETAIN,
        });
    }
}
exports.SecurityConstruct = SecurityConstruct;
//# sourceMappingURL=security.js.map