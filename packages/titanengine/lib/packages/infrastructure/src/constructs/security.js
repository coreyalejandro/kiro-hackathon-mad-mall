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
                {
                    name: 'RateLimitByIp',
                    priority: 4,
                    action: { block: {} },
                    statement: {
                        rateBasedStatement: {
                            limit: 2000,
                            aggregateKeyType: 'IP',
                        },
                    },
                    visibilityConfig: {
                        cloudWatchMetricsEnabled: true,
                        metricName: 'RateLimitByIp',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjdXJpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9pbmZyYXN0cnVjdHVyZS9zcmMvY29uc3RydWN0cy9zZWN1cml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBdUM7QUFDdkMsNkNBQW1FO0FBRW5FLGlEQUE2RDtBQUM3RCwrQ0FBaUY7QUFDakYsbURBQStEO0FBQy9ELCtEQUErRTtBQUMvRSw2REFBK0M7QUFDL0MsK0RBQWlEO0FBQ2pELHVEQUFnRTtBQUNoRSx5RUFBMkQ7QUFDM0QsdUVBQXFFO0FBQ3JFLGlEQUF5SjtBQVd6SixNQUFhLGlCQUFrQixTQUFRLHNCQUFTO0lBSzlDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBNkI7UUFDckUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsR0FBRyxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFFakUsK0NBQStDO1FBQy9DLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxhQUFHLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUM5QyxXQUFXLEVBQUUsV0FBVyxXQUFXLGdDQUFnQztZQUNuRSxpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLFFBQVEsRUFBRSxrQkFBUSxDQUFDLGVBQWU7WUFDbEMsT0FBTyxFQUFFLGlCQUFPLENBQUMsaUJBQWlCO1lBQ2xDLGFBQWEsRUFBRSxXQUFXLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQywyQkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsMkJBQWEsQ0FBQyxPQUFPO1NBQ3JGLENBQUMsQ0FBQztRQUVILGtCQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFdBQVcs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V0FBVztZQUMvQixhQUFhLEVBQUUsMkJBQWEsQ0FBQyxNQUFNO1NBQ3BDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQWxTRCw4Q0FrU0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IER1cmF0aW9uLCBSZW1vdmFsUG9saWN5LCBTdGFjaywgVGFncyB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IFJlc3RBcGkgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgeyBLZXksIEtleVNwZWMsIEtleVVzYWdlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWttcyc7XG5pbXBvcnQgeyBCdWNrZXQsIEJsb2NrUHVibGljQWNjZXNzLCBCdWNrZXRFbmNyeXB0aW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCB7IExvZ0dyb3VwLCBSZXRlbnRpb25EYXlzIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnO1xuaW1wb3J0IHsgVHJhaWwsIFJlYWRXcml0ZVR5cGUsIEluc2lnaHRUeXBlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNsb3VkdHJhaWwnO1xuaW1wb3J0ICogYXMgd2FmdjIgZnJvbSAnYXdzLWNkay1saWIvYXdzLXdhZnYyJztcbmltcG9ydCAqIGFzIGNvbmZpZyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY29uZmlnJztcbmltcG9ydCB7IE1hbmFnZWRSdWxlSWRlbnRpZmllcnMgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY29uZmlnJztcbmltcG9ydCAqIGFzIHNlY3VyaXR5aHViIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zZWN1cml0eWh1Yic7XG5pbXBvcnQgeyBTZWNyZXQsIFNlY3JldFByb3BzIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXNlY3JldHNtYW5hZ2VyJztcbmltcG9ydCB7IFBvbGljeVN0YXRlbWVudCwgRWZmZWN0LCBBY2NvdW50Um9vdFByaW5jaXBhbCwgQXJuUHJpbmNpcGFsLCBTZXJ2aWNlUHJpbmNpcGFsLCBSb2xlLCBNYW5hZ2VkUG9saWN5LCBQb2xpY3lEb2N1bWVudCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlY3VyaXR5Q29uc3RydWN0UHJvcHMge1xuICAvKiogRW52aXJvbm1lbnQgbmFtZSAoZGV2LCBzdGFnaW5nLCBwcm9kKSAqL1xuICBlbnZpcm9ubWVudDogc3RyaW5nO1xuICAvKiogUkVTVCBBUEkgdG8gcHJvdGVjdCB3aXRoIFdBRiAqL1xuICByZXN0QXBpOiBSZXN0QXBpO1xuICAvKiogQWRkaXRpb25hbCBTMyBidWNrZXRzIHRvIGluY2x1ZGUgaW4gQ2xvdWRUcmFpbCBkYXRhIGV2ZW50cyAqL1xuICBhZGRpdGlvbmFsUzNCdWNrZXRzPzogQnVja2V0W107XG59XG5cbmV4cG9ydCBjbGFzcyBTZWN1cml0eUNvbnN0cnVjdCBleHRlbmRzIENvbnN0cnVjdCB7XG4gIHB1YmxpYyByZWFkb25seSBhdWRpdEttc0tleTogS2V5O1xuICBwdWJsaWMgcmVhZG9ubHkgYXVkaXRCdWNrZXQ6IEJ1Y2tldDtcbiAgcHVibGljIHJlYWRvbmx5IHdlYkFjbDogd2FmdjIuQ2ZuV2ViQUNMO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBTZWN1cml0eUNvbnN0cnVjdFByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgIGNvbnN0IHsgZW52aXJvbm1lbnQsIHJlc3RBcGksIGFkZGl0aW9uYWxTM0J1Y2tldHMgPSBbXSB9ID0gcHJvcHM7XG5cbiAgICAvLyBLTVMga2V5IGZvciBhdWRpdCBsb2dzIGFuZCBidWNrZXQgZW5jcnlwdGlvblxuICAgIHRoaXMuYXVkaXRLbXNLZXkgPSBuZXcgS2V5KHRoaXMsICdBdWRpdEttc0tleScsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBgTUFETWFsbCAke2Vudmlyb25tZW50fSBLTVMga2V5IGZvciBhdWRpdCBhbmQgbG9nZ2luZ2AsXG4gICAgICBlbmFibGVLZXlSb3RhdGlvbjogdHJ1ZSxcbiAgICAgIGtleVVzYWdlOiBLZXlVc2FnZS5FTkNSWVBUX0RFQ1JZUFQsXG4gICAgICBrZXlTcGVjOiBLZXlTcGVjLlNZTU1FVFJJQ19ERUZBVUxULFxuICAgICAgcmVtb3ZhbFBvbGljeTogZW52aXJvbm1lbnQgPT09ICdwcm9kJyA/IFJlbW92YWxQb2xpY3kuUkVUQUlOIDogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuXG4gICAgVGFncy5vZih0aGlzLmF1ZGl0S21zS2V5KS5hZGQoJ05hbWUnLCBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1hdWRpdC1rZXlgKTtcbiAgICBUYWdzLm9mKHRoaXMuYXVkaXRLbXNLZXkpLmFkZCgnRW52aXJvbm1lbnQnLCBlbnZpcm9ubWVudCk7XG5cbiAgICAvLyBDZW50cmFsIGF1ZGl0IGJ1Y2tldCAoQ2xvdWRUcmFpbCwgQ29uZmlnLCBvdGhlciBsb2dzKVxuICAgIHRoaXMuYXVkaXRCdWNrZXQgPSBuZXcgQnVja2V0KHRoaXMsICdBdWRpdEJ1Y2tldCcsIHtcbiAgICAgIGJ1Y2tldE5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWF1ZGl0LSR7U3RhY2sub2YodGhpcykuYWNjb3VudH0tJHtTdGFjay5vZih0aGlzKS5yZWdpb259YC50b0xvd2VyQ2FzZSgpLFxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IEJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcbiAgICAgIGVuZm9yY2VTU0w6IHRydWUsXG4gICAgICBlbmNyeXB0aW9uOiBCdWNrZXRFbmNyeXB0aW9uLktNUyxcbiAgICAgIGVuY3J5cHRpb25LZXk6IHRoaXMuYXVkaXRLbXNLZXksXG4gICAgICB2ZXJzaW9uZWQ6IHRydWUsXG4gICAgICByZW1vdmFsUG9saWN5OiBlbnZpcm9ubWVudCA9PT0gJ3Byb2QnID8gUmVtb3ZhbFBvbGljeS5SRVRBSU4gOiBSZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogZW52aXJvbm1lbnQgIT09ICdwcm9kJyxcbiAgICB9KTtcblxuICAgIFRhZ3Mub2YodGhpcy5hdWRpdEJ1Y2tldCkuYWRkKCdOYW1lJywgYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tYXVkaXQtYnVja2V0YCk7XG5cbiAgICAvLyBFeHBsaWNpdGx5IGRlbnkgbm9uLVNTTCBhY2Nlc3MgdG8gYXVkaXQgYnVja2V0XG4gICAgdGhpcy5hdWRpdEJ1Y2tldC5hZGRUb1Jlc291cmNlUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBFZmZlY3QuREVOWSxcbiAgICAgIHByaW5jaXBhbHM6IFtuZXcgQWNjb3VudFJvb3RQcmluY2lwYWwoKSwgbmV3IEFyblByaW5jaXBhbCgnKicpXSxcbiAgICAgIGFjdGlvbnM6IFsnczM6KiddLFxuICAgICAgcmVzb3VyY2VzOiBbdGhpcy5hdWRpdEJ1Y2tldC5idWNrZXRBcm4sIGAke3RoaXMuYXVkaXRCdWNrZXQuYnVja2V0QXJufS8qYF0sXG4gICAgICBjb25kaXRpb25zOiB7IEJvb2w6IHsgJ2F3czpTZWN1cmVUcmFuc3BvcnQnOiAnZmFsc2UnIH0gfSxcbiAgICB9KSk7XG5cbiAgICAvLyBDbG91ZFRyYWlsIC0gbWFuYWdlbWVudCBhbmQgZGF0YSBldmVudHNcbiAgICBjb25zdCB0cmFpbExvZ0dyb3VwID0gbmV3IExvZ0dyb3VwKHRoaXMsICdDbG91ZFRyYWlsTG9nR3JvdXAnLCB7XG4gICAgICBsb2dHcm91cE5hbWU6IGAvYXdzL2Nsb3VkdHJhaWwvbWFkbWFsbC0ke2Vudmlyb25tZW50fWAsXG4gICAgICByZXRlbnRpb246IGVudmlyb25tZW50ID09PSAncHJvZCcgPyBSZXRlbnRpb25EYXlzLk9ORV9ZRUFSIDogUmV0ZW50aW9uRGF5cy5TSVhfTU9OVEhTLFxuICAgICAgcmVtb3ZhbFBvbGljeTogZW52aXJvbm1lbnQgPT09ICdwcm9kJyA/IFJlbW92YWxQb2xpY3kuUkVUQUlOIDogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuXG4gICAgY29uc3QgdHJhaWxOYW1lID0gYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tdHJhaWxgO1xuICAgIGNvbnN0IHRyYWlsID0gbmV3IFRyYWlsKHRoaXMsICdBdWRpdFRyYWlsJywge1xuICAgICAgdHJhaWxOYW1lLFxuICAgICAgYnVja2V0OiB0aGlzLmF1ZGl0QnVja2V0LFxuICAgICAgZW5jcnlwdGlvbktleTogdGhpcy5hdWRpdEttc0tleSxcbiAgICAgIHNlbmRUb0Nsb3VkV2F0Y2hMb2dzOiB0cnVlLFxuICAgICAgY2xvdWRXYXRjaExvZ0dyb3VwOiB0cmFpbExvZ0dyb3VwLFxuICAgICAgaW5jbHVkZUdsb2JhbFNlcnZpY2VFdmVudHM6IHRydWUsXG4gICAgICBtYW5hZ2VtZW50RXZlbnRzOiBSZWFkV3JpdGVUeXBlLkFMTCxcbiAgICAgIGVuYWJsZUZpbGVWYWxpZGF0aW9uOiB0cnVlLFxuICAgICAgaXNNdWx0aVJlZ2lvblRyYWlsOiB0cnVlLFxuICAgICAgaW5zaWdodFR5cGVzOiBbSW5zaWdodFR5cGUuQVBJX0NBTExfUkFURSwgSW5zaWdodFR5cGUuQVBJX0VSUk9SX1JBVEVdLFxuICAgIH0pO1xuICAgIC8vIENhcHR1cmUgUzMgZGF0YSBldmVudHMgZm9yIGF1ZGl0IGFuZCBhcHBsaWNhdGlvbiBidWNrZXRzXG4gICAgdHJhaWwuYWRkUzNFdmVudFNlbGVjdG9yKFtcbiAgICAgIHsgYnVja2V0OiB0aGlzLmF1ZGl0QnVja2V0IH0sXG4gICAgICAuLi5hZGRpdGlvbmFsUzNCdWNrZXRzLm1hcChiID0+ICh7IGJ1Y2tldDogYiB9KSksXG4gICAgXSwgeyByZWFkV3JpdGVUeXBlOiBSZWFkV3JpdGVUeXBlLkFMTCB9KTtcblxuICAgIC8vIEtNUyBrZXkgcG9saWN5IGZvciBDbG91ZFRyYWlsIHNlcnZpY2UgdXNhZ2VcbiAgICBjb25zdCByZWdpb24gPSBTdGFjay5vZih0aGlzKS5yZWdpb247XG4gICAgY29uc3QgYWNjb3VudCA9IFN0YWNrLm9mKHRoaXMpLmFjY291bnQ7XG4gICAgY29uc3QgdHJhaWxBcm4gPSBgYXJuOmF3czpjbG91ZHRyYWlsOiR7cmVnaW9ufToke2FjY291bnR9OnRyYWlsLyR7dHJhaWxOYW1lfWA7XG4gICAgdGhpcy5hdWRpdEttc0tleS5hZGRUb1Jlc291cmNlUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgc2lkOiAnQWxsb3dDbG91ZFRyYWlsVXNlT2ZLTVNLZXknLFxuICAgICAgZWZmZWN0OiBFZmZlY3QuQUxMT1csXG4gICAgICBwcmluY2lwYWxzOiBbbmV3IFNlcnZpY2VQcmluY2lwYWwoJ2Nsb3VkdHJhaWwuYW1hem9uYXdzLmNvbScpXSxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ2ttczpEZXNjcmliZUtleScsXG4gICAgICAgICdrbXM6R2VuZXJhdGVEYXRhS2V5KicsXG4gICAgICAgICdrbXM6RW5jcnlwdCcsXG4gICAgICAgICdrbXM6RGVjcnlwdCcsXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbJyonXSxcbiAgICAgIGNvbmRpdGlvbnM6IHtcbiAgICAgICAgU3RyaW5nRXF1YWxzOiB7XG4gICAgICAgICAgJ0FXUzpTb3VyY2VBcm4nOiB0cmFpbEFybixcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSkpO1xuXG4gICAgLy8gQWxsb3cgQVdTIENvbmZpZyB0byB1c2UgdGhlIGF1ZGl0IEtNUyBrZXkgKGZvciBLTVMtZW5jcnlwdGVkIFMzIHdyaXRlcylcbiAgICB0aGlzLmF1ZGl0S21zS2V5LmFkZFRvUmVzb3VyY2VQb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG4gICAgICBzaWQ6ICdBbGxvd0NvbmZpZ1VzZU9mS01TS2V5JyxcbiAgICAgIGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuICAgICAgcHJpbmNpcGFsczogW25ldyBTZXJ2aWNlUHJpbmNpcGFsKCdjb25maWcuYW1hem9uYXdzLmNvbScpXSxcbiAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgJ2ttczpFbmNyeXB0JyxcbiAgICAgICAgJ2ttczpHZW5lcmF0ZURhdGFLZXkqJyxcbiAgICAgICAgJ2ttczpEZXNjcmliZUtleScsXG4gICAgICBdLFxuICAgICAgcmVzb3VyY2VzOiBbJyonXSxcbiAgICAgIGNvbmRpdGlvbnM6IHtcbiAgICAgICAgU3RyaW5nRXF1YWxzOiB7XG4gICAgICAgICAgJ0FXUzpTb3VyY2VBY2NvdW50JzogYWNjb3VudCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSkpO1xuXG4gICAgLy8gV0FGIFdlYkFDTCB3aXRoIEFXUyBtYW5hZ2VkIHJ1bGUgc2V0c1xuICAgIHRoaXMud2ViQWNsID0gbmV3IHdhZnYyLkNmbldlYkFDTCh0aGlzLCAnQXBpV2ViQWNsJywge1xuICAgICAgbmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tYXBpLXdhZmAsXG4gICAgICBzY29wZTogJ1JFR0lPTkFMJyxcbiAgICAgIGRlZmF1bHRBY3Rpb246IHsgYWxsb3c6IHt9IH0sXG4gICAgICB2aXNpYmlsaXR5Q29uZmlnOiB7XG4gICAgICAgIGNsb3VkV2F0Y2hNZXRyaWNzRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgbWV0cmljTmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tYXBpLXdhZmAsXG4gICAgICAgIHNhbXBsZWRSZXF1ZXN0c0VuYWJsZWQ6IHRydWUsXG4gICAgICB9LFxuICAgICAgcnVsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdBV1MtQVdTTWFuYWdlZFJ1bGVzQ29tbW9uUnVsZVNldCcsXG4gICAgICAgICAgcHJpb3JpdHk6IDAsXG4gICAgICAgICAgb3ZlcnJpZGVBY3Rpb246IHsgbm9uZToge30gfSxcbiAgICAgICAgICBzdGF0ZW1lbnQ6IHtcbiAgICAgICAgICAgIG1hbmFnZWRSdWxlR3JvdXBTdGF0ZW1lbnQ6IHtcbiAgICAgICAgICAgICAgdmVuZG9yTmFtZTogJ0FXUycsXG4gICAgICAgICAgICAgIG5hbWU6ICdBV1NNYW5hZ2VkUnVsZXNDb21tb25SdWxlU2V0JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB2aXNpYmlsaXR5Q29uZmlnOiB7XG4gICAgICAgICAgICBjbG91ZFdhdGNoTWV0cmljc0VuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICBtZXRyaWNOYW1lOiAnQ29tbW9uUnVsZVNldCcsXG4gICAgICAgICAgICBzYW1wbGVkUmVxdWVzdHNFbmFibGVkOiB0cnVlLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQVdTLUFXU01hbmFnZWRSdWxlc0tub3duQmFkSW5wdXRzUnVsZVNldCcsXG4gICAgICAgICAgcHJpb3JpdHk6IDEsXG4gICAgICAgICAgb3ZlcnJpZGVBY3Rpb246IHsgbm9uZToge30gfSxcbiAgICAgICAgICBzdGF0ZW1lbnQ6IHtcbiAgICAgICAgICAgIG1hbmFnZWRSdWxlR3JvdXBTdGF0ZW1lbnQ6IHtcbiAgICAgICAgICAgICAgdmVuZG9yTmFtZTogJ0FXUycsXG4gICAgICAgICAgICAgIG5hbWU6ICdBV1NNYW5hZ2VkUnVsZXNLbm93bkJhZElucHV0c1J1bGVTZXQnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHZpc2liaWxpdHlDb25maWc6IHtcbiAgICAgICAgICAgIGNsb3VkV2F0Y2hNZXRyaWNzRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIG1ldHJpY05hbWU6ICdLbm93bkJhZElucHV0cycsXG4gICAgICAgICAgICBzYW1wbGVkUmVxdWVzdHNFbmFibGVkOiB0cnVlLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQVdTLUFXU01hbmFnZWRSdWxlc1NRTGlSdWxlU2V0JyxcbiAgICAgICAgICBwcmlvcml0eTogMixcbiAgICAgICAgICBvdmVycmlkZUFjdGlvbjogeyBub25lOiB7fSB9LFxuICAgICAgICAgIHN0YXRlbWVudDoge1xuICAgICAgICAgICAgbWFuYWdlZFJ1bGVHcm91cFN0YXRlbWVudDoge1xuICAgICAgICAgICAgICB2ZW5kb3JOYW1lOiAnQVdTJyxcbiAgICAgICAgICAgICAgbmFtZTogJ0FXU01hbmFnZWRSdWxlc1NRTGlSdWxlU2V0JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB2aXNpYmlsaXR5Q29uZmlnOiB7XG4gICAgICAgICAgICBjbG91ZFdhdGNoTWV0cmljc0VuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICBtZXRyaWNOYW1lOiAnU1FMaScsXG4gICAgICAgICAgICBzYW1wbGVkUmVxdWVzdHNFbmFibGVkOiB0cnVlLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnQVdTLUFXU01hbmFnZWRSdWxlc0FtYXpvbklwUmVwdXRhdGlvbkxpc3QnLFxuICAgICAgICAgIHByaW9yaXR5OiAzLFxuICAgICAgICAgIG92ZXJyaWRlQWN0aW9uOiB7IG5vbmU6IHt9IH0sXG4gICAgICAgICAgc3RhdGVtZW50OiB7XG4gICAgICAgICAgICBtYW5hZ2VkUnVsZUdyb3VwU3RhdGVtZW50OiB7XG4gICAgICAgICAgICAgIHZlbmRvck5hbWU6ICdBV1MnLFxuICAgICAgICAgICAgICBuYW1lOiAnQVdTTWFuYWdlZFJ1bGVzQW1hem9uSXBSZXB1dGF0aW9uTGlzdCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgdmlzaWJpbGl0eUNvbmZpZzoge1xuICAgICAgICAgICAgY2xvdWRXYXRjaE1ldHJpY3NFbmFibGVkOiB0cnVlLFxuICAgICAgICAgICAgbWV0cmljTmFtZTogJ0lwUmVwdXRhdGlvbicsXG4gICAgICAgICAgICBzYW1wbGVkUmVxdWVzdHNFbmFibGVkOiB0cnVlLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnUmF0ZUxpbWl0QnlJcCcsXG4gICAgICAgICAgcHJpb3JpdHk6IDQsXG4gICAgICAgICAgYWN0aW9uOiB7IGJsb2NrOiB7fSB9LFxuICAgICAgICAgIHN0YXRlbWVudDoge1xuICAgICAgICAgICAgcmF0ZUJhc2VkU3RhdGVtZW50OiB7XG4gICAgICAgICAgICAgIGxpbWl0OiAyMDAwLFxuICAgICAgICAgICAgICBhZ2dyZWdhdGVLZXlUeXBlOiAnSVAnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHZpc2liaWxpdHlDb25maWc6IHtcbiAgICAgICAgICAgIGNsb3VkV2F0Y2hNZXRyaWNzRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIG1ldHJpY05hbWU6ICdSYXRlTGltaXRCeUlwJyxcbiAgICAgICAgICAgIHNhbXBsZWRSZXF1ZXN0c0VuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBhcGlTdGFnZUFybiA9IGBhcm46YXdzOmFwaWdhdGV3YXk6JHtyZWdpb259OjovcmVzdGFwaXMvJHtyZXN0QXBpLnJlc3RBcGlJZH0vc3RhZ2VzLyR7cmVzdEFwaS5kZXBsb3ltZW50U3RhZ2Uuc3RhZ2VOYW1lfWA7XG5cbiAgICBuZXcgd2FmdjIuQ2ZuV2ViQUNMQXNzb2NpYXRpb24odGhpcywgJ0FwaVdlYkFjbEFzc29jaWF0aW9uJywge1xuICAgICAgcmVzb3VyY2VBcm46IGFwaVN0YWdlQXJuLFxuICAgICAgd2ViQWNsQXJuOiB0aGlzLndlYkFjbC5hdHRyQXJuLFxuICAgIH0pO1xuXG4gICAgLy8gQVdTIENvbmZpZyAtIHJlY29yZGVyIGFuZCBkZWxpdmVyeSBjaGFubmVsXG4gICAgY29uc3QgY29uZmlnUm9sZSA9IG5ldyBSb2xlKHRoaXMsICdDb25maWdTZXJ2aWNlUm9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IFNlcnZpY2VQcmluY2lwYWwoJ2NvbmZpZy5hbWF6b25hd3MuY29tJyksXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAgICAgTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ3NlcnZpY2Utcm9sZS9BV1NDb25maWdSb2xlJyksXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgY29uc3QgcmVjb3JkZXIgPSBuZXcgY29uZmlnLkNmbkNvbmZpZ3VyYXRpb25SZWNvcmRlcih0aGlzLCAnQ29uZmlnUmVjb3JkZXInLCB7XG4gICAgICByb2xlQXJuOiBjb25maWdSb2xlLnJvbGVBcm4sXG4gICAgICByZWNvcmRpbmdHcm91cDoge1xuICAgICAgICBhbGxTdXBwb3J0ZWQ6IHRydWUsXG4gICAgICAgIGluY2x1ZGVHbG9iYWxSZXNvdXJjZVR5cGVzOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCBkZWxpdmVyeSA9IG5ldyBjb25maWcuQ2ZuRGVsaXZlcnlDaGFubmVsKHRoaXMsICdDb25maWdEZWxpdmVyeUNoYW5uZWwnLCB7XG4gICAgICBzM0J1Y2tldE5hbWU6IHRoaXMuYXVkaXRCdWNrZXQuYnVja2V0TmFtZSxcbiAgICB9KTtcbiAgICBkZWxpdmVyeS5ub2RlLmFkZERlcGVuZGVuY3kocmVjb3JkZXIpO1xuXG4gICAgLy8gQVdTIENvbmZpZyAtIGEgZmV3IGtleSBtYW5hZ2VkIHJ1bGVzXG4gICAgbmV3IGNvbmZpZy5NYW5hZ2VkUnVsZSh0aGlzLCAnQ29uZmlnUzNFbmNyeXB0aW9uJywge1xuICAgICAgaWRlbnRpZmllcjogTWFuYWdlZFJ1bGVJZGVudGlmaWVycy5TM19CVUNLRVRfU0VSVkVSX1NJREVfRU5DUllQVElPTl9FTkFCTEVELFxuICAgIH0pO1xuICAgIG5ldyBjb25maWcuTWFuYWdlZFJ1bGUodGhpcywgJ0NvbmZpZ0Nsb3VkVHJhaWxFbmFibGVkJywge1xuICAgICAgaWRlbnRpZmllcjogTWFuYWdlZFJ1bGVJZGVudGlmaWVycy5DTE9VRF9UUkFJTF9FTkFCTEVELFxuICAgIH0pO1xuICAgIG5ldyBjb25maWcuTWFuYWdlZFJ1bGUodGhpcywgJ0NvbmZpZ1Jlc3RyaWN0ZWRTU0gnLCB7XG4gICAgICBpZGVudGlmaWVyOiBNYW5hZ2VkUnVsZUlkZW50aWZpZXJzLkVDMl9TRUNVUklUWV9HUk9VUFNfSU5DT01JTkdfU1NIX0RJU0FCTEVELFxuICAgIH0pO1xuICAgIG5ldyBjb25maWcuTWFuYWdlZFJ1bGUodGhpcywgJ0NvbmZpZ0RlZmF1bHRTZ0Nsb3NlZCcsIHtcbiAgICAgIGlkZW50aWZpZXI6IE1hbmFnZWRSdWxlSWRlbnRpZmllcnMuVlBDX0RFRkFVTFRfU0VDVVJJVFlfR1JPVVBfQ0xPU0VELFxuICAgIH0pO1xuICAgIG5ldyBjb25maWcuTWFuYWdlZFJ1bGUodGhpcywgJ0NvbmZpZ1MzUHVibGljUmVhZFByb2hpYml0ZWQnLCB7XG4gICAgICBpZGVudGlmaWVyOiBNYW5hZ2VkUnVsZUlkZW50aWZpZXJzLlMzX0JVQ0tFVF9QVUJMSUNfUkVBRF9QUk9ISUJJVEVELFxuICAgIH0pO1xuICAgIG5ldyBjb25maWcuTWFuYWdlZFJ1bGUodGhpcywgJ0NvbmZpZ1MzUHVibGljV3JpdGVQcm9oaWJpdGVkJywge1xuICAgICAgaWRlbnRpZmllcjogTWFuYWdlZFJ1bGVJZGVudGlmaWVycy5TM19CVUNLRVRfUFVCTElDX1dSSVRFX1BST0hJQklURUQsXG4gICAgfSk7XG4gICAgbmV3IGNvbmZpZy5NYW5hZ2VkUnVsZSh0aGlzLCAnQ29uZmlnUzNTc2xSZXF1ZXN0c09ubHknLCB7XG4gICAgICBpZGVudGlmaWVyOiBNYW5hZ2VkUnVsZUlkZW50aWZpZXJzLlMzX0JVQ0tFVF9TU0xfUkVRVUVTVFNfT05MWSxcbiAgICB9KTtcbiAgICBuZXcgY29uZmlnLk1hbmFnZWRSdWxlKHRoaXMsICdDb25maWdEeW5hbW9QaXRyRW5hYmxlZCcsIHtcbiAgICAgIGlkZW50aWZpZXI6IE1hbmFnZWRSdWxlSWRlbnRpZmllcnMuRFlOQU1PREJfUElUUl9FTkFCTEVELFxuICAgIH0pO1xuICAgIG5ldyBjb25maWcuTWFuYWdlZFJ1bGUodGhpcywgJ0NvbmZpZ1ZwY0Zsb3dMb2dzRW5hYmxlZCcsIHtcbiAgICAgIGlkZW50aWZpZXI6IE1hbmFnZWRSdWxlSWRlbnRpZmllcnMuVlBDX0ZMT1dfTE9HU19FTkFCTEVELFxuICAgIH0pO1xuICAgIG5ldyBjb25maWcuTWFuYWdlZFJ1bGUodGhpcywgJ0NvbmZpZ0Nsb3VkVHJhaWxMb2dWYWxpZGF0aW9uJywge1xuICAgICAgaWRlbnRpZmllcjogTWFuYWdlZFJ1bGVJZGVudGlmaWVycy5DTE9VRF9UUkFJTF9MT0dfRklMRV9WQUxJREFUSU9OX0VOQUJMRUQsXG4gICAgfSk7XG4gICAgbmV3IGNvbmZpZy5NYW5hZ2VkUnVsZSh0aGlzLCAnQ29uZmlnQ2xvdWRUcmFpbEVuY3J5cHRpb24nLCB7XG4gICAgICBpZGVudGlmaWVyOiBNYW5hZ2VkUnVsZUlkZW50aWZpZXJzLkNMT1VEVFJBSUxfTVVMVElfUkVHSU9OX0VOQUJMRUQsXG4gICAgfSk7XG5cbiAgICAvLyBTZWN1cml0eSBIdWIgLSBlbmFibGUgYW5kIHN1YnNjcmliZSB0byBBV1MgRm91bmRhdGlvbmFsIFNlY3VyaXR5IEJlc3QgUHJhY3RpY2VzXG4gICAgY29uc3QgaHViID0gbmV3IHNlY3VyaXR5aHViLkNmbkh1Yih0aGlzLCAnU2VjdXJpdHlIdWInLCB7fSk7XG4gICAgbmV3IHNlY3VyaXR5aHViLkNmblN0YW5kYXJkKHRoaXMsICdTZWN1cml0eUh1YkZzYnAnLCB7XG4gICAgICBzdGFuZGFyZHNBcm46IGBhcm46YXdzOnNlY3VyaXR5aHViOiR7cmVnaW9ufTo6c3RhbmRhcmRzL2F3cy1mb3VuZGF0aW9uYWwtc2VjdXJpdHktYmVzdC1wcmFjdGljZXMvdi8xLjAuMGAsXG4gICAgfSkuYWRkRGVwZW5kZW5jeShodWIpO1xuXG4gICAgLy8gU3RhbmRhcmQgc2VjcmV0cyBwbGFjZWhvbGRlcnMgdXNpbmcgS01TIChtYW5hZ2VkIGJ5IFNlY3JldHMgTWFuYWdlciBvciBhIENNSylcbiAgICB0aGlzLmNyZWF0ZVNlY3JldChgbWFkbWFsbC8ke2Vudmlyb25tZW50fS9wZXhlbHNgLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1BleGVscyBBUEkga2V5JyxcbiAgICB9KTtcbiAgICB0aGlzLmNyZWF0ZVNlY3JldChgbWFkbWFsbC8ke2Vudmlyb25tZW50fS91bnNwbGFzaGAsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVW5zcGxhc2ggYWNjZXNzIGtleScsXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVNlY3JldChzZWNyZXROYW1lOiBzdHJpbmcsIHByb3BzPzogUGFydGlhbDxTZWNyZXRQcm9wcz4pOiBTZWNyZXQge1xuICAgIGNvbnN0IGlkID0gYFNlY3JldCR7c2VjcmV0TmFtZS5yZXBsYWNlKC9cXFcrL2csICcnKX1gO1xuICAgIHJldHVybiBuZXcgU2VjcmV0KHRoaXMsIGlkLCB7XG4gICAgICBzZWNyZXROYW1lLFxuICAgICAgZGVzY3JpcHRpb246IHByb3BzPy5kZXNjcmlwdGlvbixcbiAgICAgIHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuUkVUQUlOLFxuICAgIH0pO1xuICB9XG59XG5cbiJdfQ==