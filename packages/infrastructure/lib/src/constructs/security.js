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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29uc3RydWN0cy9zZWN1cml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBdUM7QUFDdkMsNkNBQW1FO0FBRW5FLGlEQUE2RDtBQUM3RCwrQ0FBaUY7QUFDakYsbURBQStEO0FBQy9ELCtEQUErRTtBQUMvRSw2REFBK0M7QUFDL0MsK0RBQWlEO0FBQ2pELHVEQUFnRTtBQUNoRSx5RUFBMkQ7QUFDM0QsdUVBQXFFO0FBQ3JFLGlEQUF5SjtBQVd6SixNQUFhLGlCQUFrQixTQUFRLHNCQUFTO0lBSzlDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBNkI7UUFDckUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsR0FBRyxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFFakUsK0NBQStDO1FBQy9DLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxhQUFHLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUM5QyxXQUFXLEVBQUUsV0FBVyxXQUFXLGdDQUFnQztZQUNuRSxpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLFFBQVEsRUFBRSxrQkFBUSxDQUFDLGVBQWU7WUFDbEMsT0FBTyxFQUFFLGlCQUFPLENBQUMsaUJBQWlCO1lBQ2xDLGFBQWEsRUFBRSxXQUFXLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQywyQkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsMkJBQWEsQ0FBQyxPQUFPO1NBQ3JGLENBQUMsQ0FBQztRQUVILGtCQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFdBQVcsV0FBVyxZQUFZLENBQUMsQ0FBQztRQUMx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QUNsRixNQUFNLEdBQUcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1RCxJQUFJLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQ25ELFlBQVksRUFBRSx1QkFBdUIsTUFBTSw4REFBOEQ7U0FDMUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV0QixnRkFBZ0Y7UUFDaEYsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLFdBQVcsU0FBUyxFQUFFO1lBQ2pELFdBQVcsRUFBRSxnQkFBZ0I7U0FDOUIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLFdBQVcsV0FBVyxFQUFFO1lBQ25ELFdBQVcsRUFBRSxxQkFBcUI7U0FDbkMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLFlBQVksQ0FBQyxVQUFrQixFQUFFLEtBQTRCO1FBQ25FLE1BQU0sRUFBRSxHQUFHLFNBQVMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNyRCxPQUFPLElBQUksMkJBQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFO1lBQzFCLFVBQVU7WUFDVixXQUFXLEVBQUUsS0FBSyxFQUFFLFdBQVc7WUFDL0IsYUFBYSxFQUFFLDJCQUFhLENBQUMsTUFBTTtTQUNwQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFsUkQsOENBa1JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBEdXJhdGlvbiwgUmVtb3ZhbFBvbGljeSwgU3RhY2ssIFRhZ3MgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBSZXN0QXBpIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xuaW1wb3J0IHsgS2V5LCBLZXlTcGVjLCBLZXlVc2FnZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1rbXMnO1xuaW1wb3J0IHsgQnVja2V0LCBCbG9ja1B1YmxpY0FjY2VzcywgQnVja2V0RW5jcnlwdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgeyBMb2dHcm91cCwgUmV0ZW50aW9uRGF5cyB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJztcbmltcG9ydCB7IFRyYWlsLCBSZWFkV3JpdGVUeXBlLCBJbnNpZ2h0VHlwZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZHRyYWlsJztcbmltcG9ydCAqIGFzIHdhZnYyIGZyb20gJ2F3cy1jZGstbGliL2F3cy13YWZ2Mic7XG5pbXBvcnQgKiBhcyBjb25maWcgZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvbmZpZyc7XG5pbXBvcnQgeyBNYW5hZ2VkUnVsZUlkZW50aWZpZXJzIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvbmZpZyc7XG5pbXBvcnQgKiBhcyBzZWN1cml0eWh1YiBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc2VjdXJpdHlodWInO1xuaW1wb3J0IHsgU2VjcmV0LCBTZWNyZXRQcm9wcyB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zZWNyZXRzbWFuYWdlcic7XG5pbXBvcnQgeyBQb2xpY3lTdGF0ZW1lbnQsIEVmZmVjdCwgQWNjb3VudFJvb3RQcmluY2lwYWwsIEFyblByaW5jaXBhbCwgU2VydmljZVByaW5jaXBhbCwgUm9sZSwgTWFuYWdlZFBvbGljeSwgUG9saWN5RG9jdW1lbnQgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcblxuZXhwb3J0IGludGVyZmFjZSBTZWN1cml0eUNvbnN0cnVjdFByb3BzIHtcbiAgLyoqIEVudmlyb25tZW50IG5hbWUgKGRldiwgc3RhZ2luZywgcHJvZCkgKi9cbiAgZW52aXJvbm1lbnQ6IHN0cmluZztcbiAgLyoqIFJFU1QgQVBJIHRvIHByb3RlY3Qgd2l0aCBXQUYgKi9cbiAgcmVzdEFwaTogUmVzdEFwaTtcbiAgLyoqIEFkZGl0aW9uYWwgUzMgYnVja2V0cyB0byBpbmNsdWRlIGluIENsb3VkVHJhaWwgZGF0YSBldmVudHMgKi9cbiAgYWRkaXRpb25hbFMzQnVja2V0cz86IEJ1Y2tldFtdO1xufVxuXG5leHBvcnQgY2xhc3MgU2VjdXJpdHlDb25zdHJ1Y3QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgYXVkaXRLbXNLZXk6IEtleTtcbiAgcHVibGljIHJlYWRvbmx5IGF1ZGl0QnVja2V0OiBCdWNrZXQ7XG4gIHB1YmxpYyByZWFkb25seSB3ZWJBY2w6IHdhZnYyLkNmbldlYkFDTDtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogU2VjdXJpdHlDb25zdHJ1Y3RQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICBjb25zdCB7IGVudmlyb25tZW50LCByZXN0QXBpLCBhZGRpdGlvbmFsUzNCdWNrZXRzID0gW10gfSA9IHByb3BzO1xuXG4gICAgLy8gS01TIGtleSBmb3IgYXVkaXQgbG9ncyBhbmQgYnVja2V0IGVuY3J5cHRpb25cbiAgICB0aGlzLmF1ZGl0S21zS2V5ID0gbmV3IEtleSh0aGlzLCAnQXVkaXRLbXNLZXknLCB7XG4gICAgICBkZXNjcmlwdGlvbjogYE1BRE1hbGwgJHtlbnZpcm9ubWVudH0gS01TIGtleSBmb3IgYXVkaXQgYW5kIGxvZ2dpbmdgLFxuICAgICAgZW5hYmxlS2V5Um90YXRpb246IHRydWUsXG4gICAgICBrZXlVc2FnZTogS2V5VXNhZ2UuRU5DUllQVF9ERUNSWVBULFxuICAgICAga2V5U3BlYzogS2V5U3BlYy5TWU1NRVRSSUNfREVGQVVMVCxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGVudmlyb25tZW50ID09PSAncHJvZCcgPyBSZW1vdmFsUG9saWN5LlJFVEFJTiA6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICB9KTtcblxuICAgIFRhZ3Mub2YodGhpcy5hdWRpdEttc0tleSkuYWRkKCdOYW1lJywgYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tYXVkaXQta2V5YCk7XG4gICAgVGFncy5vZih0aGlzLmF1ZGl0S21zS2V5KS5hZGQoJ0Vudmlyb25tZW50JywgZW52aXJvbm1lbnQpO1xuXG4gICAgLy8gQ2VudHJhbCBhdWRpdCBidWNrZXQgKENsb3VkVHJhaWwsIENvbmZpZywgb3RoZXIgbG9ncylcbiAgICB0aGlzLmF1ZGl0QnVja2V0ID0gbmV3IEJ1Y2tldCh0aGlzLCAnQXVkaXRCdWNrZXQnLCB7XG4gICAgICBidWNrZXROYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1hdWRpdC0ke1N0YWNrLm9mKHRoaXMpLmFjY291bnR9LSR7U3RhY2sub2YodGhpcykucmVnaW9ufWAudG9Mb3dlckNhc2UoKSxcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBCbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG4gICAgICBlbmZvcmNlU1NMOiB0cnVlLFxuICAgICAgZW5jcnlwdGlvbjogQnVja2V0RW5jcnlwdGlvbi5LTVMsXG4gICAgICBlbmNyeXB0aW9uS2V5OiB0aGlzLmF1ZGl0S21zS2V5LFxuICAgICAgdmVyc2lvbmVkOiB0cnVlLFxuICAgICAgcmVtb3ZhbFBvbGljeTogZW52aXJvbm1lbnQgPT09ICdwcm9kJyA/IFJlbW92YWxQb2xpY3kuUkVUQUlOIDogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgYXV0b0RlbGV0ZU9iamVjdHM6IGVudmlyb25tZW50ICE9PSAncHJvZCcsXG4gICAgfSk7XG5cbiAgICBUYWdzLm9mKHRoaXMuYXVkaXRCdWNrZXQpLmFkZCgnTmFtZScsIGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWF1ZGl0LWJ1Y2tldGApO1xuXG4gICAgLy8gRXhwbGljaXRseSBkZW55IG5vbi1TU0wgYWNjZXNzIHRvIGF1ZGl0IGJ1Y2tldFxuICAgIHRoaXMuYXVkaXRCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogRWZmZWN0LkRFTlksXG4gICAgICBwcmluY2lwYWxzOiBbbmV3IEFjY291bnRSb290UHJpbmNpcGFsKCksIG5ldyBBcm5QcmluY2lwYWwoJyonKV0sXG4gICAgICBhY3Rpb25zOiBbJ3MzOionXSxcbiAgICAgIHJlc291cmNlczogW3RoaXMuYXVkaXRCdWNrZXQuYnVja2V0QXJuLCBgJHt0aGlzLmF1ZGl0QnVja2V0LmJ1Y2tldEFybn0vKmBdLFxuICAgICAgY29uZGl0aW9uczogeyBCb29sOiB7ICdhd3M6U2VjdXJlVHJhbnNwb3J0JzogJ2ZhbHNlJyB9IH0sXG4gICAgfSkpO1xuXG4gICAgLy8gQ2xvdWRUcmFpbCAtIG1hbmFnZW1lbnQgYW5kIGRhdGEgZXZlbnRzXG4gICAgY29uc3QgdHJhaWxMb2dHcm91cCA9IG5ldyBMb2dHcm91cCh0aGlzLCAnQ2xvdWRUcmFpbExvZ0dyb3VwJywge1xuICAgICAgbG9nR3JvdXBOYW1lOiBgL2F3cy9jbG91ZHRyYWlsL21hZG1hbGwtJHtlbnZpcm9ubWVudH1gLFxuICAgICAgcmV0ZW50aW9uOiBlbnZpcm9ubWVudCA9PT0gJ3Byb2QnID8gUmV0ZW50aW9uRGF5cy5PTkVfWUVBUiA6IFJldGVudGlvbkRheXMuU0lYX01PTlRIUyxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGVudmlyb25tZW50ID09PSAncHJvZCcgPyBSZW1vdmFsUG9saWN5LlJFVEFJTiA6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHRyYWlsTmFtZSA9IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LXRyYWlsYDtcbiAgICBjb25zdCB0cmFpbCA9IG5ldyBUcmFpbCh0aGlzLCAnQXVkaXRUcmFpbCcsIHtcbiAgICAgIHRyYWlsTmFtZSxcbiAgICAgIGJ1Y2tldDogdGhpcy5hdWRpdEJ1Y2tldCxcbiAgICAgIGVuY3J5cHRpb25LZXk6IHRoaXMuYXVkaXRLbXNLZXksXG4gICAgICBzZW5kVG9DbG91ZFdhdGNoTG9nczogdHJ1ZSxcbiAgICAgIGNsb3VkV2F0Y2hMb2dHcm91cDogdHJhaWxMb2dHcm91cCxcbiAgICAgIGluY2x1ZGVHbG9iYWxTZXJ2aWNlRXZlbnRzOiB0cnVlLFxuICAgICAgbWFuYWdlbWVudEV2ZW50czogUmVhZFdyaXRlVHlwZS5BTEwsXG4gICAgICBlbmFibGVGaWxlVmFsaWRhdGlvbjogdHJ1ZSxcbiAgICAgIGlzTXVsdGlSZWdpb25UcmFpbDogdHJ1ZSxcbiAgICAgIGluc2lnaHRUeXBlczogW0luc2lnaHRUeXBlLkFQSV9DQUxMX1JBVEUsIEluc2lnaHRUeXBlLkFQSV9FUlJPUl9SQVRFXSxcbiAgICB9KTtcbiAgICAvLyBDYXB0dXJlIFMzIGRhdGEgZXZlbnRzIGZvciBhdWRpdCBhbmQgYXBwbGljYXRpb24gYnVja2V0c1xuICAgIHRyYWlsLmFkZFMzRXZlbnRTZWxlY3RvcihbXG4gICAgICB7IGJ1Y2tldDogdGhpcy5hdWRpdEJ1Y2tldCB9LFxuICAgICAgLi4uYWRkaXRpb25hbFMzQnVja2V0cy5tYXAoYiA9PiAoeyBidWNrZXQ6IGIgfSkpLFxuICAgIF0sIHsgcmVhZFdyaXRlVHlwZTogUmVhZFdyaXRlVHlwZS5BTEwgfSk7XG5cbiAgICAvLyBLTVMga2V5IHBvbGljeSBmb3IgQ2xvdWRUcmFpbCBzZXJ2aWNlIHVzYWdlXG4gICAgY29uc3QgcmVnaW9uID0gU3RhY2sub2YodGhpcykucmVnaW9uO1xuICAgIGNvbnN0IGFjY291bnQgPSBTdGFjay5vZih0aGlzKS5hY2NvdW50O1xuICAgIGNvbnN0IHRyYWlsQXJuID0gYGFybjphd3M6Y2xvdWR0cmFpbDoke3JlZ2lvbn06JHthY2NvdW50fTp0cmFpbC8ke3RyYWlsTmFtZX1gO1xuICAgIHRoaXMuYXVkaXRLbXNLZXkuYWRkVG9SZXNvdXJjZVBvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIHNpZDogJ0FsbG93Q2xvdWRUcmFpbFVzZU9mS01TS2V5JyxcbiAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgcHJpbmNpcGFsczogW25ldyBTZXJ2aWNlUHJpbmNpcGFsKCdjbG91ZHRyYWlsLmFtYXpvbmF3cy5jb20nKV0sXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdrbXM6RGVzY3JpYmVLZXknLFxuICAgICAgICAna21zOkdlbmVyYXRlRGF0YUtleSonLFxuICAgICAgICAna21zOkVuY3J5cHQnLFxuICAgICAgICAna21zOkRlY3J5cHQnLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogWycqJ10sXG4gICAgICBjb25kaXRpb25zOiB7XG4gICAgICAgIFN0cmluZ0VxdWFsczoge1xuICAgICAgICAgICdBV1M6U291cmNlQXJuJzogdHJhaWxBcm4sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pKTtcblxuICAgIC8vIEFsbG93IEFXUyBDb25maWcgdG8gdXNlIHRoZSBhdWRpdCBLTVMga2V5IChmb3IgS01TLWVuY3J5cHRlZCBTMyB3cml0ZXMpXG4gICAgdGhpcy5hdWRpdEttc0tleS5hZGRUb1Jlc291cmNlUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgc2lkOiAnQWxsb3dDb25maWdVc2VPZktNU0tleScsXG4gICAgICBlZmZlY3Q6IEVmZmVjdC5BTExPVyxcbiAgICAgIHByaW5jaXBhbHM6IFtuZXcgU2VydmljZVByaW5jaXBhbCgnY29uZmlnLmFtYXpvbmF3cy5jb20nKV0sXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgICdrbXM6RW5jcnlwdCcsXG4gICAgICAgICdrbXM6R2VuZXJhdGVEYXRhS2V5KicsXG4gICAgICAgICdrbXM6RGVzY3JpYmVLZXknLFxuICAgICAgXSxcbiAgICAgIHJlc291cmNlczogWycqJ10sXG4gICAgICBjb25kaXRpb25zOiB7XG4gICAgICAgIFN0cmluZ0VxdWFsczoge1xuICAgICAgICAgICdBV1M6U291cmNlQWNjb3VudCc6IGFjY291bnQsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pKTtcblxuICAgIC8vIFdBRiBXZWJBQ0wgd2l0aCBBV1MgbWFuYWdlZCBydWxlIHNldHNcbiAgICB0aGlzLndlYkFjbCA9IG5ldyB3YWZ2Mi5DZm5XZWJBQ0wodGhpcywgJ0FwaVdlYkFjbCcsIHtcbiAgICAgIG5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWFwaS13YWZgLFxuICAgICAgc2NvcGU6ICdSRUdJT05BTCcsXG4gICAgICBkZWZhdWx0QWN0aW9uOiB7IGFsbG93OiB7fSB9LFxuICAgICAgdmlzaWJpbGl0eUNvbmZpZzoge1xuICAgICAgICBjbG91ZFdhdGNoTWV0cmljc0VuYWJsZWQ6IHRydWUsXG4gICAgICAgIG1ldHJpY05hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWFwaS13YWZgLFxuICAgICAgICBzYW1wbGVkUmVxdWVzdHNFbmFibGVkOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIHJ1bGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQVdTLUFXU01hbmFnZWRSdWxlc0NvbW1vblJ1bGVTZXQnLFxuICAgICAgICAgIHByaW9yaXR5OiAwLFxuICAgICAgICAgIG92ZXJyaWRlQWN0aW9uOiB7IG5vbmU6IHt9IH0sXG4gICAgICAgICAgc3RhdGVtZW50OiB7XG4gICAgICAgICAgICBtYW5hZ2VkUnVsZUdyb3VwU3RhdGVtZW50OiB7XG4gICAgICAgICAgICAgIHZlbmRvck5hbWU6ICdBV1MnLFxuICAgICAgICAgICAgICBuYW1lOiAnQVdTTWFuYWdlZFJ1bGVzQ29tbW9uUnVsZVNldCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmlzaWJpbGl0eUNvbmZpZzoge1xuICAgICAgICAgICAgY2xvdWRXYXRjaE1ldHJpY3NFbmFibGVkOiB0cnVlLFxuICAgICAgICAgICAgbWV0cmljTmFtZTogJ0NvbW1vblJ1bGVTZXQnLFxuICAgICAgICAgICAgc2FtcGxlZFJlcXVlc3RzRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0FXUy1BV1NNYW5hZ2VkUnVsZXNLbm93bkJhZElucHV0c1J1bGVTZXQnLFxuICAgICAgICAgIHByaW9yaXR5OiAxLFxuICAgICAgICAgIG92ZXJyaWRlQWN0aW9uOiB7IG5vbmU6IHt9IH0sXG4gICAgICAgICAgc3RhdGVtZW50OiB7XG4gICAgICAgICAgICBtYW5hZ2VkUnVsZUdyb3VwU3RhdGVtZW50OiB7XG4gICAgICAgICAgICAgIHZlbmRvck5hbWU6ICdBV1MnLFxuICAgICAgICAgICAgICBuYW1lOiAnQVdTTWFuYWdlZFJ1bGVzS25vd25CYWRJbnB1dHNSdWxlU2V0JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB2aXNpYmlsaXR5Q29uZmlnOiB7XG4gICAgICAgICAgICBjbG91ZFdhdGNoTWV0cmljc0VuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICBtZXRyaWNOYW1lOiAnS25vd25CYWRJbnB1dHMnLFxuICAgICAgICAgICAgc2FtcGxlZFJlcXVlc3RzRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0FXUy1BV1NNYW5hZ2VkUnVsZXNTUUxpUnVsZVNldCcsXG4gICAgICAgICAgcHJpb3JpdHk6IDIsXG4gICAgICAgICAgb3ZlcnJpZGVBY3Rpb246IHsgbm9uZToge30gfSxcbiAgICAgICAgICBzdGF0ZW1lbnQ6IHtcbiAgICAgICAgICAgIG1hbmFnZWRSdWxlR3JvdXBTdGF0ZW1lbnQ6IHtcbiAgICAgICAgICAgICAgdmVuZG9yTmFtZTogJ0FXUycsXG4gICAgICAgICAgICAgIG5hbWU6ICdBV1NNYW5hZ2VkUnVsZXNTUUxpUnVsZVNldCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmlzaWJpbGl0eUNvbmZpZzoge1xuICAgICAgICAgICAgY2xvdWRXYXRjaE1ldHJpY3NFbmFibGVkOiB0cnVlLFxuICAgICAgICAgICAgbWV0cmljTmFtZTogJ1NRTGknLFxuICAgICAgICAgICAgc2FtcGxlZFJlcXVlc3RzRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ0FXUy1BV1NNYW5hZ2VkUnVsZXNBbWF6b25JcFJlcHV0YXRpb25MaXN0JyxcbiAgICAgICAgICBwcmlvcml0eTogMyxcbiAgICAgICAgICBvdmVycmlkZUFjdGlvbjogeyBub25lOiB7fSB9LFxuICAgICAgICAgIHN0YXRlbWVudDoge1xuICAgICAgICAgICAgbWFuYWdlZFJ1bGVHcm91cFN0YXRlbWVudDoge1xuICAgICAgICAgICAgICB2ZW5kb3JOYW1lOiAnQVdTJyxcbiAgICAgICAgICAgICAgbmFtZTogJ0FXU01hbmFnZWRSdWxlc0FtYXpvbklwUmVwdXRhdGlvbkxpc3QnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHZpc2liaWxpdHlDb25maWc6IHtcbiAgICAgICAgICAgIGNsb3VkV2F0Y2hNZXRyaWNzRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIG1ldHJpY05hbWU6ICdJcFJlcHV0YXRpb24nLFxuICAgICAgICAgICAgc2FtcGxlZFJlcXVlc3RzRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGFwaVN0YWdlQXJuID0gYGFybjphd3M6YXBpZ2F0ZXdheToke3JlZ2lvbn06Oi9yZXN0YXBpcy8ke3Jlc3RBcGkucmVzdEFwaUlkfS9zdGFnZXMvJHtyZXN0QXBpLmRlcGxveW1lbnRTdGFnZS5zdGFnZU5hbWV9YDtcblxuICAgIG5ldyB3YWZ2Mi5DZm5XZWJBQ0xBc3NvY2lhdGlvbih0aGlzLCAnQXBpV2ViQWNsQXNzb2NpYXRpb24nLCB7XG4gICAgICByZXNvdXJjZUFybjogYXBpU3RhZ2VBcm4sXG4gICAgICB3ZWJBY2xBcm46IHRoaXMud2ViQWNsLmF0dHJBcm4sXG4gICAgfSk7XG5cbiAgICAvLyBBV1MgQ29uZmlnIC0gcmVjb3JkZXIgYW5kIGRlbGl2ZXJ5IGNoYW5uZWxcbiAgICBjb25zdCBjb25maWdSb2xlID0gbmV3IFJvbGUodGhpcywgJ0NvbmZpZ1NlcnZpY2VSb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgU2VydmljZVByaW5jaXBhbCgnY29uZmlnLmFtYXpvbmF3cy5jb20nKSxcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICBNYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnc2VydmljZS1yb2xlL0FXU0NvbmZpZ1JvbGUnKSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICBjb25zdCByZWNvcmRlciA9IG5ldyBjb25maWcuQ2ZuQ29uZmlndXJhdGlvblJlY29yZGVyKHRoaXMsICdDb25maWdSZWNvcmRlcicsIHtcbiAgICAgIHJvbGVBcm46IGNvbmZpZ1JvbGUucm9sZUFybixcbiAgICAgIHJlY29yZGluZ0dyb3VwOiB7XG4gICAgICAgIGFsbFN1cHBvcnRlZDogdHJ1ZSxcbiAgICAgICAgaW5jbHVkZUdsb2JhbFJlc291cmNlVHlwZXM6IHRydWUsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IGRlbGl2ZXJ5ID0gbmV3IGNvbmZpZy5DZm5EZWxpdmVyeUNoYW5uZWwodGhpcywgJ0NvbmZpZ0RlbGl2ZXJ5Q2hhbm5lbCcsIHtcbiAgICAgIHMzQnVja2V0TmFtZTogdGhpcy5hdWRpdEJ1Y2tldC5idWNrZXROYW1lLFxuICAgIH0pO1xuICAgIGRlbGl2ZXJ5Lm5vZGUuYWRkRGVwZW5kZW5jeShyZWNvcmRlcik7XG5cbiAgICAvLyBBV1MgQ29uZmlnIC0gYSBmZXcga2V5IG1hbmFnZWQgcnVsZXNcbiAgICBuZXcgY29uZmlnLk1hbmFnZWRSdWxlKHRoaXMsICdDb25maWdTM0VuY3J5cHRpb24nLCB7XG4gICAgICBpZGVudGlmaWVyOiBNYW5hZ2VkUnVsZUlkZW50aWZpZXJzLlMzX0JVQ0tFVF9TRVJWRVJfU0lERV9FTkNSWVBUSU9OX0VOQUJMRUQsXG4gICAgfSk7XG4gICAgbmV3IGNvbmZpZy5NYW5hZ2VkUnVsZSh0aGlzLCAnQ29uZmlnQ2xvdWRUcmFpbEVuYWJsZWQnLCB7XG4gICAgICBpZGVudGlmaWVyOiBNYW5hZ2VkUnVsZUlkZW50aWZpZXJzLkNMT1VEX1RSQUlMX0VOQUJMRUQsXG4gICAgfSk7XG4gICAgbmV3IGNvbmZpZy5NYW5hZ2VkUnVsZSh0aGlzLCAnQ29uZmlnUmVzdHJpY3RlZFNTSCcsIHtcbiAgICAgIGlkZW50aWZpZXI6IE1hbmFnZWRSdWxlSWRlbnRpZmllcnMuRUMyX1NFQ1VSSVRZX0dST1VQU19JTkNPTUlOR19TU0hfRElTQUJMRUQsXG4gICAgfSk7XG4gICAgbmV3IGNvbmZpZy5NYW5hZ2VkUnVsZSh0aGlzLCAnQ29uZmlnRGVmYXVsdFNnQ2xvc2VkJywge1xuICAgICAgaWRlbnRpZmllcjogTWFuYWdlZFJ1bGVJZGVudGlmaWVycy5WUENfREVGQVVMVF9TRUNVUklUWV9HUk9VUF9DTE9TRUQsXG4gICAgfSk7XG4gICAgbmV3IGNvbmZpZy5NYW5hZ2VkUnVsZSh0aGlzLCAnQ29uZmlnUzNQdWJsaWNSZWFkUHJvaGliaXRlZCcsIHtcbiAgICAgIGlkZW50aWZpZXI6IE1hbmFnZWRSdWxlSWRlbnRpZmllcnMuUzNfQlVDS0VUX1BVQkxJQ19SRUFEX1BST0hJQklURUQsXG4gICAgfSk7XG4gICAgbmV3IGNvbmZpZy5NYW5hZ2VkUnVsZSh0aGlzLCAnQ29uZmlnUzNQdWJsaWNXcml0ZVByb2hpYml0ZWQnLCB7XG4gICAgICBpZGVudGlmaWVyOiBNYW5hZ2VkUnVsZUlkZW50aWZpZXJzLlMzX0JVQ0tFVF9QVUJMSUNfV1JJVEVfUFJPSElCSVRFRCxcbiAgICB9KTtcbiAgICBuZXcgY29uZmlnLk1hbmFnZWRSdWxlKHRoaXMsICdDb25maWdTM1NzbFJlcXVlc3RzT25seScsIHtcbiAgICAgIGlkZW50aWZpZXI6IE1hbmFnZWRSdWxlSWRlbnRpZmllcnMuUzNfQlVDS0VUX1NTTF9SRVFVRVNUU19PTkxZLFxuICAgIH0pO1xuICAgIG5ldyBjb25maWcuTWFuYWdlZFJ1bGUodGhpcywgJ0NvbmZpZ0R5bmFtb1BpdHJFbmFibGVkJywge1xuICAgICAgaWRlbnRpZmllcjogTWFuYWdlZFJ1bGVJZGVudGlmaWVycy5EWU5BTU9EQl9QSVRSX0VOQUJMRUQsXG4gICAgfSk7XG4gICAgbmV3IGNvbmZpZy5NYW5hZ2VkUnVsZSh0aGlzLCAnQ29uZmlnVnBjRmxvd0xvZ3NFbmFibGVkJywge1xuICAgICAgaWRlbnRpZmllcjogTWFuYWdlZFJ1bGVJZGVudGlmaWVycy5WUENfRkxPV19MT0dTX0VOQUJMRUQsXG4gICAgfSk7XG4gICAgbmV3IGNvbmZpZy5NYW5hZ2VkUnVsZSh0aGlzLCAnQ29uZmlnQ2xvdWRUcmFpbExvZ1ZhbGlkYXRpb24nLCB7XG4gICAgICBpZGVudGlmaWVyOiBNYW5hZ2VkUnVsZUlkZW50aWZpZXJzLkNMT1VEX1RSQUlMX0xPR19GSUxFX1ZBTElEQVRJT05fRU5BQkxFRCxcbiAgICB9KTtcbiAgICBuZXcgY29uZmlnLk1hbmFnZWRSdWxlKHRoaXMsICdDb25maWdDbG91ZFRyYWlsRW5jcnlwdGlvbicsIHtcbiAgICAgIGlkZW50aWZpZXI6IE1hbmFnZWRSdWxlSWRlbnRpZmllcnMuQ0xPVURUUkFJTF9NVUxUSV9SRUdJT05fRU5BQkxFRCxcbiAgICB9KTtcblxuICAgIC8vIFNlY3VyaXR5IEh1YiAtIGVuYWJsZSBhbmQgc3Vic2NyaWJlIHRvIEFXUyBGb3VuZGF0aW9uYWwgU2VjdXJpdHkgQmVzdCBQcmFjdGljZXNcbiAgICBjb25zdCBodWIgPSBuZXcgc2VjdXJpdHlodWIuQ2ZuSHViKHRoaXMsICdTZWN1cml0eUh1YicsIHt9KTtcbiAgICBuZXcgc2VjdXJpdHlodWIuQ2ZuU3RhbmRhcmQodGhpcywgJ1NlY3VyaXR5SHViRnNicCcsIHtcbiAgICAgIHN0YW5kYXJkc0FybjogYGFybjphd3M6c2VjdXJpdHlodWI6JHtyZWdpb259OjpzdGFuZGFyZHMvYXdzLWZvdW5kYXRpb25hbC1zZWN1cml0eS1iZXN0LXByYWN0aWNlcy92LzEuMC4wYCxcbiAgICB9KS5hZGREZXBlbmRlbmN5KGh1Yik7XG5cbiAgICAvLyBTdGFuZGFyZCBzZWNyZXRzIHBsYWNlaG9sZGVycyB1c2luZyBLTVMgKG1hbmFnZWQgYnkgU2VjcmV0cyBNYW5hZ2VyIG9yIGEgQ01LKVxuICAgIHRoaXMuY3JlYXRlU2VjcmV0KGBtYWRtYWxsLyR7ZW52aXJvbm1lbnR9L3BleGVsc2AsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnUGV4ZWxzIEFQSSBrZXknLFxuICAgIH0pO1xuICAgIHRoaXMuY3JlYXRlU2VjcmV0KGBtYWRtYWxsLyR7ZW52aXJvbm1lbnR9L3Vuc3BsYXNoYCwge1xuICAgICAgZGVzY3JpcHRpb246ICdVbnNwbGFzaCBhY2Nlc3Mga2V5JyxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlU2VjcmV0KHNlY3JldE5hbWU6IHN0cmluZywgcHJvcHM/OiBQYXJ0aWFsPFNlY3JldFByb3BzPik6IFNlY3JldCB7XG4gICAgY29uc3QgaWQgPSBgU2VjcmV0JHtzZWNyZXROYW1lLnJlcGxhY2UoL1xcVysvZywgJycpfWA7XG4gICAgcmV0dXJuIG5ldyBTZWNyZXQodGhpcywgaWQsIHtcbiAgICAgIHNlY3JldE5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogcHJvcHM/LmRlc2NyaXB0aW9uLFxuICAgICAgcmVtb3ZhbFBvbGljeTogUmVtb3ZhbFBvbGljeS5SRVRBSU4sXG4gICAgfSk7XG4gIH1cbn1cblxuIl19