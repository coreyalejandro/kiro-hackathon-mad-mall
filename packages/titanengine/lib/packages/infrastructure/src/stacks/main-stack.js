"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const networking_1 = require("../constructs/networking");
const database_1 = require("../constructs/database");
const lambda_1 = require("../constructs/lambda");
const api_gateway_1 = require("../constructs/api-gateway");
const authentication_1 = require("../constructs/authentication");
const monitoring_1 = require("../constructs/monitoring");
const security_1 = require("../constructs/security");
const storage_1 = require("../constructs/storage");
class MainStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { environment, apiDomainName, authDomainName, callbackUrls, logoutUrls, alertEmails, slackWebhookUrl, enableSocialLogin = true, requireMfa = environment === 'prod', } = props;
        // Add stack-level tags
        aws_cdk_lib_1.Tags.of(this).add('Project', 'MADMall');
        aws_cdk_lib_1.Tags.of(this).add('Environment', environment);
        aws_cdk_lib_1.Tags.of(this).add('ManagedBy', 'AWS-CDK');
        aws_cdk_lib_1.Tags.of(this).add('CostCenter', 'Engineering');
        // Create networking infrastructure
        this.networking = new networking_1.NetworkingConstruct(this, 'Networking', {
            environment,
            cidr: this.getCidrForEnvironment(environment),
            maxAzs: environment === 'prod' ? 3 : 2,
            enableNatGateway: true,
            enableFlowLogs: true,
        });
        // Create database infrastructure
        this.database = new database_1.DatabaseConstruct(this, 'Database', {
            environment,
            enablePointInTimeRecovery: environment === 'prod',
            enableStreams: true,
        });
        // Create authentication infrastructure (must precede API so authorizer can bind)
        this.authentication = new authentication_1.AuthenticationConstruct(this, 'Authentication', {
            environment,
            customDomain: authDomainName,
            callbackUrls,
            logoutUrls,
            enableSocialLogin,
            requireMfa,
        });
        // Create Lambda functions
        this.lambda = new lambda_1.LambdaConstruct(this, 'Lambda', {
            environment,
            vpc: this.networking.vpc,
            securityGroup: this.networking.lambdaSecurityGroup,
            dynamoTable: this.database.mainTable,
            kmsKey: this.database.kmsKey,
            additionalEnvironmentVariables: {
                CORS_ALLOWED_ORIGINS: this.getCorsOriginsForEnvironment(environment),
                LOG_LEVEL: environment === 'prod' ? 'INFO' : 'DEBUG',
            },
        });
        // Create storage (S3 user content with KMS)
        this.storage = new storage_1.StorageConstruct(this, 'Storage', {
            environment,
            authenticatedRole: this.authentication.authenticatedRole,
        });
        // Create API Gateway
        this.apiGateway = new api_gateway_1.ApiGatewayConstruct(this, 'ApiGateway', {
            environment,
            lambdaFunctions: this.lambda.functions,
            domainName: apiDomainName,
            userPool: this.authentication.userPool,
            corsOptions: {
                allowOrigins: this.getCorsOriginsForEnvironment(environment).split(','),
                allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowHeaders: [
                    'Content-Type',
                    'X-Amz-Date',
                    'Authorization',
                    'X-Api-Key',
                    'X-Amz-Security-Token',
                    'X-Amz-User-Agent',
                    'X-Correlation-Id',
                ],
                allowCredentials: true,
            },
            throttleSettings: this.getThrottleSettingsForEnvironment(environment),
        });
        // Now that authentication is created, wire the authorizer-backed API methods
        // Note: API construct already reads the userPool provided above.
        // Create monitoring infrastructure
        this.monitoring = new monitoring_1.MonitoringConstruct(this, 'Monitoring', {
            environment,
            lambdaFunctions: this.lambda.getAllFunctions(),
            restApi: this.apiGateway.restApi,
            dynamoTable: this.database.mainTable,
            userPool: this.authentication.userPool,
            alertEmails,
            slackWebhookUrl,
            healthCheckUrl: `${this.apiGateway.restApi.url}health`,
        });
        // Security hardening (WAF, CloudTrail, AWS Config, Security Hub)
        this.security = new security_1.SecurityConstruct(this, 'Security', {
            environment,
            restApi: this.apiGateway.restApi,
            additionalS3Buckets: [this.storage.userContentBucket],
        });
        // Create usage plans for API Gateway
        this.apiGateway.createUsagePlans();
        // Output important values
        this.createOutputs(environment);
    }
    getCidrForEnvironment(environment) {
        const cidrMap = {
            dev: '10.0.0.0/16',
            staging: '10.1.0.0/16',
            prod: '10.2.0.0/16',
        };
        return cidrMap[environment] || '10.0.0.0/16';
    }
    getCorsOriginsForEnvironment(environment) {
        const originsMap = {
            dev: 'http://localhost:3000,http://localhost:5173',
            staging: 'https://staging.madmall.com',
            prod: 'https://madmall.com,https://www.madmall.com',
        };
        return originsMap[environment] || 'http://localhost:3000';
    }
    getThrottleSettingsForEnvironment(environment) {
        const settingsMap = {
            dev: { rateLimit: 100, burstLimit: 200 },
            staging: { rateLimit: 500, burstLimit: 1000 },
            prod: { rateLimit: 2000, burstLimit: 5000 },
        };
        return settingsMap[environment] || { rateLimit: 100, burstLimit: 200 };
    }
    createOutputs(environment) {
        // API Gateway outputs
        new aws_cdk_lib_2.CfnOutput(this, 'ApiGatewayUrl', {
            value: this.apiGateway.restApi.url,
            description: 'API Gateway URL',
            exportName: `madmall-${environment}-api-url`,
        });
        if (this.apiGateway.domainName) {
            new aws_cdk_lib_2.CfnOutput(this, 'ApiCustomDomainUrl', {
                value: `https://${this.apiGateway.domainName.domainName}`,
                description: 'API Gateway custom domain URL',
                exportName: `madmall-${environment}-api-custom-url`,
            });
        }
        // Cognito outputs
        new aws_cdk_lib_2.CfnOutput(this, 'UserPoolId', {
            value: this.authentication.userPool.userPoolId,
            description: 'Cognito User Pool ID',
            exportName: `madmall-${environment}-user-pool-id`,
        });
        new aws_cdk_lib_2.CfnOutput(this, 'UserPoolClientId', {
            value: this.authentication.userPoolClient.userPoolClientId,
            description: 'Cognito User Pool Client ID',
            exportName: `madmall-${environment}-user-pool-client-id`,
        });
        new aws_cdk_lib_2.CfnOutput(this, 'IdentityPoolId', {
            value: this.authentication.identityPool.identityPoolId,
            description: 'Cognito Identity Pool ID',
            exportName: `madmall-${environment}-identity-pool-id`,
        });
        new aws_cdk_lib_2.CfnOutput(this, 'AuthDomainUrl', {
            value: this.authentication.userPoolDomain.baseUrl(),
            description: 'Cognito hosted UI domain URL',
            exportName: `madmall-${environment}-auth-domain-url`,
        });
        // DynamoDB outputs
        new aws_cdk_lib_2.CfnOutput(this, 'DynamoTableName', {
            value: this.database.mainTable.tableName,
            description: 'DynamoDB main table name',
            exportName: `madmall-${environment}-dynamo-table-name`,
        });
        new aws_cdk_lib_2.CfnOutput(this, 'DynamoTableArn', {
            value: this.database.mainTable.tableArn,
            description: 'DynamoDB main table ARN',
            exportName: `madmall-${environment}-dynamo-table-arn`,
        });
        // KMS outputs
        new aws_cdk_lib_2.CfnOutput(this, 'KmsKeyId', {
            value: this.database.kmsKey.keyId,
            description: 'KMS key ID for encryption',
            exportName: `madmall-${environment}-kms-key-id`,
        });
        new aws_cdk_lib_2.CfnOutput(this, 'KmsKeyArn', {
            value: this.database.kmsKey.keyArn,
            description: 'KMS key ARN for encryption',
            exportName: `madmall-${environment}-kms-key-arn`,
        });
        // VPC outputs
        new aws_cdk_lib_2.CfnOutput(this, 'VpcId', {
            value: this.networking.vpc.vpcId,
            description: 'VPC ID',
            exportName: `madmall-${environment}-vpc-id`,
        });
        // Monitoring outputs
        new aws_cdk_lib_2.CfnOutput(this, 'DashboardUrl', {
            value: `https://console.aws.amazon.com/cloudwatch/home?region=${aws_cdk_lib_1.Stack.of(this).region}#dashboards:name=${this.monitoring.dashboard.dashboardName}`,
            description: 'CloudWatch Dashboard URL',
            exportName: `madmall-${environment}-dashboard-url`,
        });
        new aws_cdk_lib_2.CfnOutput(this, 'AlertTopicArn', {
            value: this.monitoring.alertTopic.topicArn,
            description: 'SNS Alert Topic ARN',
            exportName: `madmall-${environment}-alert-topic-arn`,
        });
        // Storage outputs
        new aws_cdk_lib_2.CfnOutput(this, 'UserContentBucketName', {
            value: this.storage.userContentBucket.bucketName,
            description: 'S3 bucket for user content',
            exportName: `madmall-${environment}-user-content-bucket`,
        });
        new aws_cdk_lib_2.CfnOutput(this, 'UserContentKmsKeyArn', {
            value: this.storage.contentKmsKey.keyArn,
            description: 'KMS key ARN for user content bucket',
            exportName: `madmall-${environment}-user-content-kms-arn`,
        });
    }
}
exports.MainStack = MainStack;
// Import CfnOutput
const aws_cdk_lib_2 = require("aws-cdk-lib");
//# sourceMappingURL=main-stack.js.map