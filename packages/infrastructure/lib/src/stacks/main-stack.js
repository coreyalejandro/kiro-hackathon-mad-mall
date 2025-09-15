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
            lambdaFunctions: this.lambda.getAllConcreteFunctions(),
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
        // CDN outputs
        new aws_cdk_lib_2.CfnOutput(this, 'ContentCDNDomainName', {
            value: this.storage.cdnDistribution.distributionDomainName,
            description: 'CloudFront CDN domain name for user content',
            exportName: `madmall-${environment}-cdn-domain`,
        });
        new aws_cdk_lib_2.CfnOutput(this, 'ContentCDNDistributionId', {
            value: this.storage.cdnDistribution.distributionId,
            description: 'CloudFront distribution ID',
            exportName: `madmall-${environment}-cdn-distribution-id`,
        });
    }
}
exports.MainStack = MainStack;
// Import CfnOutput
const aws_cdk_lib_2 = require("aws-cdk-lib");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdGFja3MvbWFpbi1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2Q0FBc0Q7QUFDdEQseURBQStEO0FBQy9ELHFEQUEyRDtBQUMzRCxpREFBdUQ7QUFDdkQsMkRBQWdFO0FBQ2hFLGlFQUF1RTtBQUN2RSx5REFBK0Q7QUFDL0QscURBQTJEO0FBQzNELG1EQUF5RDtBQWlEekQsTUFBYSxTQUFVLFNBQVEsbUJBQUs7SUFVbEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFxQjtRQUM3RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEVBQ0osV0FBVyxFQUNYLGFBQWEsRUFDYixjQUFjLEVBQ2QsWUFBWSxFQUNaLFVBQVUsRUFDVixXQUFXLEVBQ1gsZUFBZSxFQUNmLGlCQUFpQixHQUFHLElBQUksRUFDeEIsVUFBVSxHQUFHLFdBQVcsS0FBSyxNQUFNLEdBQ3BDLEdBQUcsS0FBSyxDQUFDO1FBRVYsdUJBQXVCO1FBQ3ZCLGtCQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDeEMsa0JBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM5QyxrQkFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzFDLGtCQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFFL0MsbUNBQW1DO1FBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxnQ0FBbUIsQ0FBQyxJQUFJLEVBQUUs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QUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUU7WUFDM0MsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsVUFBVTtZQUNoRCxXQUFXLEVBQUUsNEJBQTRCO1lBQ3pDLFVBQVUsRUFBRSxXQUFXLFdBQVcsc0JBQXNCO1NBQ3pELENBQUMsQ0FBQztRQUVILElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUU7WUFDMUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLE1BQU07WUFDeEMsV0FBVyxFQUFFLHFDQUFxQztZQUNsRCxVQUFVLEVBQUUsV0FBVyxXQUFXLHVCQUF1QjtTQUMxRCxDQUFDLENBQUM7UUFFSCxjQUFjO1FBQ2QsSUFBSSx1QkFBUyxDQUFDLElBQUksRUFBRSxzQkFBc0IsRUFBRTtZQUMxQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsc0JBQXNCO1lBQzFELFdBQVcsRUFBRSw2Q0FBNkM7WUFDMUQsVUFBVSxFQUFFLFdBQVcsV0FBVyxhQUFhO1NBQ2hELENBQUMsQ0FBQztRQUVILElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsMEJBQTBCLEVBQUU7WUFDOUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLGNBQWM7WUFDbEQsV0FBVyxFQUFFLDRCQUE0QjtZQUN6QyxVQUFVLEVBQUUsV0FBVyxXQUFXLHNCQUFzQjtTQUN6RCxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUE1UUQsOEJBNFFDO0FBRUQsbUJBQW1CO0FBQ25CLDZDQUF3QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgU3RhY2ssIFN0YWNrUHJvcHMsIFRhZ3MgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBOZXR3b3JraW5nQ29uc3RydWN0IH0gZnJvbSAnLi4vY29uc3RydWN0cy9uZXR3b3JraW5nJztcbmltcG9ydCB7IERhdGFiYXNlQ29uc3RydWN0IH0gZnJvbSAnLi4vY29uc3RydWN0cy9kYXRhYmFzZSc7XG5pbXBvcnQgeyBMYW1iZGFDb25zdHJ1Y3QgfSBmcm9tICcuLi9jb25zdHJ1Y3RzL2xhbWJkYSc7XG5pbXBvcnQgeyBBcGlHYXRld2F5Q29uc3RydWN0IH0gZnJvbSAnLi4vY29uc3RydWN0cy9hcGktZ2F0ZXdheSc7XG5pbXBvcnQgeyBBdXRoZW50aWNhdGlvbkNvbnN0cnVjdCB9IGZyb20gJy4uL2NvbnN0cnVjdHMvYXV0aGVudGljYXRpb24nO1xuaW1wb3J0IHsgTW9uaXRvcmluZ0NvbnN0cnVjdCB9IGZyb20gJy4uL2NvbnN0cnVjdHMvbW9uaXRvcmluZyc7XG5pbXBvcnQgeyBTZWN1cml0eUNvbnN0cnVjdCB9IGZyb20gJy4uL2NvbnN0cnVjdHMvc2VjdXJpdHknO1xuaW1wb3J0IHsgU3RvcmFnZUNvbnN0cnVjdCB9IGZyb20gJy4uL2NvbnN0cnVjdHMvc3RvcmFnZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWFpblN0YWNrUHJvcHMgZXh0ZW5kcyBTdGFja1Byb3BzIHtcbiAgLyoqXG4gICAqIEVudmlyb25tZW50IG5hbWUgKGRldiwgc3RhZ2luZywgcHJvZClcbiAgICovXG4gIGVudmlyb25tZW50OiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogQ3VzdG9tIGRvbWFpbiBuYW1lIGZvciB0aGUgQVBJXG4gICAqL1xuICBhcGlEb21haW5OYW1lPzogc3RyaW5nO1xuICBcbiAgLyoqXG4gICAqIEN1c3RvbSBkb21haW4gbmFtZSBmb3IgYXV0aGVudGljYXRpb25cbiAgICovXG4gIGF1dGhEb21haW5OYW1lPzogc3RyaW5nO1xuICBcbiAgLyoqXG4gICAqIENhbGxiYWNrIFVSTHMgZm9yIE9BdXRoIGZsb3dzXG4gICAqL1xuICBjYWxsYmFja1VybHM6IHN0cmluZ1tdO1xuICBcbiAgLyoqXG4gICAqIExvZ291dCBVUkxzIGZvciBPQXV0aCBmbG93c1xuICAgKi9cbiAgbG9nb3V0VXJsczogc3RyaW5nW107XG4gIFxuICAvKipcbiAgICogRW1haWwgYWRkcmVzc2VzIGZvciBtb25pdG9yaW5nIGFsZXJ0c1xuICAgKi9cbiAgYWxlcnRFbWFpbHM6IHN0cmluZ1tdO1xuICBcbiAgLyoqXG4gICAqIFNsYWNrIHdlYmhvb2sgVVJMIGZvciBub3RpZmljYXRpb25zXG4gICAqL1xuICBzbGFja1dlYmhvb2tVcmw/OiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogV2hldGhlciB0byBlbmFibGUgc29jaWFsIGxvZ2luXG4gICAqL1xuICBlbmFibGVTb2NpYWxMb2dpbj86IGJvb2xlYW47XG4gIFxuICAvKipcbiAgICogV2hldGhlciB0byByZXF1aXJlIE1GQVxuICAgKi9cbiAgcmVxdWlyZU1mYT86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBNYWluU3RhY2sgZXh0ZW5kcyBTdGFjayB7XG4gIHB1YmxpYyByZWFkb25seSBuZXR3b3JraW5nOiBOZXR3b3JraW5nQ29uc3RydWN0O1xuICBwdWJsaWMgcmVhZG9ubHkgZGF0YWJhc2U6IERhdGFiYXNlQ29uc3RydWN0O1xuICBwdWJsaWMgcmVhZG9ubHkgbGFtYmRhOiBMYW1iZGFDb25zdHJ1Y3Q7XG4gIHB1YmxpYyByZWFkb25seSBhcGlHYXRld2F5OiBBcGlHYXRld2F5Q29uc3RydWN0O1xuICBwdWJsaWMgcmVhZG9ubHkgYXV0aGVudGljYXRpb246IEF1dGhlbnRpY2F0aW9uQ29uc3RydWN0O1xuICBwdWJsaWMgcmVhZG9ubHkgbW9uaXRvcmluZzogTW9uaXRvcmluZ0NvbnN0cnVjdDtcbiAgcHVibGljIHJlYWRvbmx5IHNlY3VyaXR5OiBTZWN1cml0eUNvbnN0cnVjdDtcbiAgcHVibGljIHJlYWRvbmx5IHN0b3JhZ2U6IFN0b3JhZ2VDb25zdHJ1Y3Q7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IE1haW5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCB7XG4gICAgICBlbnZpcm9ubWVudCxcbiAgICAgIGFwaURvbWFpbk5hbWUsXG4gICAgICBhdXRoRG9tYWluTmFtZSxcbiAgICAgIGNhbGxiYWNrVXJscyxcbiAgICAgIGxvZ291dFVybHMsXG4gICAgICBhbGVydEVtYWlscyxcbiAgICAgIHNsYWNrV2ViaG9va1VybCxcbiAgICAgIGVuYWJsZVNvY2lhbExvZ2luID0gdHJ1ZSxcbiAgICAgIHJlcXVpcmVNZmEgPSBlbnZpcm9ubWVudCA9PT0gJ3Byb2QnLFxuICAgIH0gPSBwcm9wcztcblxuICAgIC8vIEFkZCBzdGFjay1sZXZlbCB0YWdzXG4gICAgVGFncy5vZih0aGlzKS5hZGQoJ1Byb2plY3QnLCAnTUFETWFsbCcpO1xuICAgIFRhZ3Mub2YodGhpcykuYWRkKCdFbnZpcm9ubWVudCcsIGVudmlyb25tZW50KTtcbiAgICBUYWdzLm9mKHRoaXMpLmFkZCgnTWFuYWdlZEJ5JywgJ0FXUy1DREsnKTtcbiAgICBUYWdzLm9mKHRoaXMpLmFkZCgnQ29zdENlbnRlcicsICdFbmdpbmVlcmluZycpO1xuXG4gICAgLy8gQ3JlYXRlIG5ldHdvcmtpbmcgaW5mcmFzdHJ1Y3R1cmVcbiAgICB0aGlzLm5ldHdvcmtpbmcgPSBuZXcgTmV0d29ya2luZ0NvbnN0cnVjdCh0aGlzLCAnTmV0d29ya2luZycsIHtcbiAgICAgIGVudmlyb25tZW50LFxuICAgICAgY2lkcjogdGhpcy5nZXRDaWRyRm9yRW52aXJvbm1lbnQoZW52aXJvbm1lbnQpLFxuICAgICAgbWF4QXpzOiBlbnZpcm9ubWVudCA9PT0gJ3Byb2QnID8gMyA6IDIsXG4gICAgICBlbmFibGVOYXRHYXRld2F5OiB0cnVlLFxuICAgICAgZW5hYmxlRmxvd0xvZ3M6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgZGF0YWJhc2UgaW5mcmFzdHJ1Y3R1cmVcbiAgICB0aGlzLmRhdGFiYXNlID0gbmV3IERhdGFiYXNlQ29uc3RydWN0KHRoaXMsICdEYXRhYmFzZScsIHtcbiAgICAgIGVudmlyb25tZW50LFxuICAgICAgZW5hYmxlUG9pbnRJblRpbWVSZWNvdmVyeTogZW52aXJvbm1lbnQgPT09ICdwcm9kJyxcbiAgICAgIGVuYWJsZVN0cmVhbXM6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYXV0aGVudGljYXRpb24gaW5mcmFzdHJ1Y3R1cmUgKG11c3QgcHJlY2VkZSBBUEkgc28gYXV0aG9yaXplciBjYW4gYmluZClcbiAgICB0aGlzLmF1dGhlbnRpY2F0aW9uID0gbmV3IEF1dGhlbnRpY2F0aW9uQ29uc3RydWN0KHRoaXMsICdBdXRoZW50aWNhdGlvbicsIHtcbiAgICAgIGVudmlyb25tZW50LFxuICAgICAgY3VzdG9tRG9tYWluOiBhdXRoRG9tYWluTmFtZSxcbiAgICAgIGNhbGxiYWNrVXJscyxcbiAgICAgIGxvZ291dFVybHMsXG4gICAgICBlbmFibGVTb2NpYWxMb2dpbixcbiAgICAgIHJlcXVpcmVNZmEsXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgTGFtYmRhIGZ1bmN0aW9uc1xuICAgIHRoaXMubGFtYmRhID0gbmV3IExhbWJkYUNvbnN0cnVjdCh0aGlzLCAnTGFtYmRhJywge1xuICAgICAgZW52aXJvbm1lbnQsXG4gICAgICB2cGM6IHRoaXMubmV0d29ya2luZy52cGMsXG4gICAgICBzZWN1cml0eUdyb3VwOiB0aGlzLm5ldHdvcmtpbmcubGFtYmRhU2VjdXJpdHlHcm91cCxcbiAgICAgIGR5bmFtb1RhYmxlOiB0aGlzLmRhdGFiYXNlLm1haW5UYWJsZSxcbiAgICAgIGttc0tleTogdGhpcy5kYXRhYmFzZS5rbXNLZXksXG4gICAgICBhZGRpdGlvbmFsRW52aXJvbm1lbnRWYXJpYWJsZXM6IHtcbiAgICAgICAgQ09SU19BTExPV0VEX09SSUdJTlM6IHRoaXMuZ2V0Q29yc09yaWdpbnNGb3JFbnZpcm9ubWVudChlbnZpcm9ubWVudCksXG4gICAgICAgIExPR19MRVZFTDogZW52aXJvbm1lbnQgPT09ICdwcm9kJyA/ICdJTkZPJyA6ICdERUJVRycsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIHN0b3JhZ2UgKFMzIHVzZXIgY29udGVudCB3aXRoIEtNUylcbiAgICB0aGlzLnN0b3JhZ2UgPSBuZXcgU3RvcmFnZUNvbnN0cnVjdCh0aGlzLCAnU3RvcmFnZScsIHtcbiAgICAgIGVudmlyb25tZW50LFxuICAgICAgYXV0aGVudGljYXRlZFJvbGU6IHRoaXMuYXV0aGVudGljYXRpb24uYXV0aGVudGljYXRlZFJvbGUsXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgQVBJIEdhdGV3YXlcbiAgICB0aGlzLmFwaUdhdGV3YXkgPSBuZXcgQXBpR2F0ZXdheUNvbnN0cnVjdCh0aGlzLCAnQXBpR2F0ZXdheScsIHtcbiAgICAgIGVudmlyb25tZW50LFxuICAgICAgbGFtYmRhRnVuY3Rpb25zOiB0aGlzLmxhbWJkYS5mdW5jdGlvbnMsXG4gICAgICBkb21haW5OYW1lOiBhcGlEb21haW5OYW1lLFxuICAgICAgdXNlclBvb2w6IHRoaXMuYXV0aGVudGljYXRpb24udXNlclBvb2wsXG4gICAgICBjb3JzT3B0aW9uczoge1xuICAgICAgICBhbGxvd09yaWdpbnM6IHRoaXMuZ2V0Q29yc09yaWdpbnNGb3JFbnZpcm9ubWVudChlbnZpcm9ubWVudCkuc3BsaXQoJywnKSxcbiAgICAgICAgYWxsb3dNZXRob2RzOiBbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnLCAnT1BUSU9OUyddLFxuICAgICAgICBhbGxvd0hlYWRlcnM6IFtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJyxcbiAgICAgICAgICAnWC1BbXotRGF0ZScsXG4gICAgICAgICAgJ0F1dGhvcml6YXRpb24nLFxuICAgICAgICAgICdYLUFwaS1LZXknLFxuICAgICAgICAgICdYLUFtei1TZWN1cml0eS1Ub2tlbicsXG4gICAgICAgICAgJ1gtQW16LVVzZXItQWdlbnQnLFxuICAgICAgICAgICdYLUNvcnJlbGF0aW9uLUlkJyxcbiAgICAgICAgXSxcbiAgICAgICAgYWxsb3dDcmVkZW50aWFsczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICB0aHJvdHRsZVNldHRpbmdzOiB0aGlzLmdldFRocm90dGxlU2V0dGluZ3NGb3JFbnZpcm9ubWVudChlbnZpcm9ubWVudCksXG4gICAgfSk7XG5cbiAgICAvLyBOb3cgdGhhdCBhdXRoZW50aWNhdGlvbiBpcyBjcmVhdGVkLCB3aXJlIHRoZSBhdXRob3JpemVyLWJhY2tlZCBBUEkgbWV0aG9kc1xuICAgIC8vIE5vdGU6IEFQSSBjb25zdHJ1Y3QgYWxyZWFkeSByZWFkcyB0aGUgdXNlclBvb2wgcHJvdmlkZWQgYWJvdmUuXG5cbiAgICAvLyBDcmVhdGUgbW9uaXRvcmluZyBpbmZyYXN0cnVjdHVyZVxuICAgIHRoaXMubW9uaXRvcmluZyA9IG5ldyBNb25pdG9yaW5nQ29uc3RydWN0KHRoaXMsICdNb25pdG9yaW5nJywge1xuICAgICAgZW52aXJvbm1lbnQsXG4gICAgICBsYW1iZGFGdW5jdGlvbnM6IHRoaXMubGFtYmRhLmdldEFsbENvbmNyZXRlRnVuY3Rpb25zKCksXG4gICAgICByZXN0QXBpOiB0aGlzLmFwaUdhdGV3YXkucmVzdEFwaSxcbiAgICAgIGR5bmFtb1RhYmxlOiB0aGlzLmRhdGFiYXNlLm1haW5UYWJsZSxcbiAgICAgIHVzZXJQb29sOiB0aGlzLmF1dGhlbnRpY2F0aW9uLnVzZXJQb29sLFxuICAgICAgYWxlcnRFbWFpbHMsXG4gICAgICBzbGFja1dlYmhvb2tVcmwsXG4gICAgICBoZWFsdGhDaGVja1VybDogYCR7dGhpcy5hcGlHYXRld2F5LnJlc3RBcGkudXJsfWhlYWx0aGAsXG4gICAgfSk7XG5cbiAgICAvLyBTZWN1cml0eSBoYXJkZW5pbmcgKFdBRiwgQ2xvdWRUcmFpbCwgQVdTIENvbmZpZywgU2VjdXJpdHkgSHViKVxuICAgIHRoaXMuc2VjdXJpdHkgPSBuZXcgU2VjdXJpdHlDb25zdHJ1Y3QodGhpcywgJ1NlY3VyaXR5Jywge1xuICAgICAgZW52aXJvbm1lbnQsXG4gICAgICByZXN0QXBpOiB0aGlzLmFwaUdhdGV3YXkucmVzdEFwaSxcbiAgICAgIGFkZGl0aW9uYWxTM0J1Y2tldHM6IFt0aGlzLnN0b3JhZ2UudXNlckNvbnRlbnRCdWNrZXRdLFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIHVzYWdlIHBsYW5zIGZvciBBUEkgR2F0ZXdheVxuICAgIHRoaXMuYXBpR2F0ZXdheS5jcmVhdGVVc2FnZVBsYW5zKCk7XG5cbiAgICAvLyBPdXRwdXQgaW1wb3J0YW50IHZhbHVlc1xuICAgIHRoaXMuY3JlYXRlT3V0cHV0cyhlbnZpcm9ubWVudCk7XG4gIH1cblxuICBwcml2YXRlIGdldENpZHJGb3JFbnZpcm9ubWVudChlbnZpcm9ubWVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBjaWRyTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgZGV2OiAnMTAuMC4wLjAvMTYnLFxuICAgICAgc3RhZ2luZzogJzEwLjEuMC4wLzE2JyxcbiAgICAgIHByb2Q6ICcxMC4yLjAuMC8xNicsXG4gICAgfTtcbiAgICByZXR1cm4gY2lkck1hcFtlbnZpcm9ubWVudF0gfHwgJzEwLjAuMC4wLzE2JztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0Q29yc09yaWdpbnNGb3JFbnZpcm9ubWVudChlbnZpcm9ubWVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBvcmlnaW5zTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgICAgZGV2OiAnaHR0cDovL2xvY2FsaG9zdDozMDAwLGh0dHA6Ly9sb2NhbGhvc3Q6NTE3MycsXG4gICAgICBzdGFnaW5nOiAnaHR0cHM6Ly9zdGFnaW5nLm1hZG1hbGwuY29tJyxcbiAgICAgIHByb2Q6ICdodHRwczovL21hZG1hbGwuY29tLGh0dHBzOi8vd3d3Lm1hZG1hbGwuY29tJyxcbiAgICB9O1xuICAgIHJldHVybiBvcmlnaW5zTWFwW2Vudmlyb25tZW50XSB8fCAnaHR0cDovL2xvY2FsaG9zdDozMDAwJztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0VGhyb3R0bGVTZXR0aW5nc0ZvckVudmlyb25tZW50KGVudmlyb25tZW50OiBzdHJpbmcpIHtcbiAgICBjb25zdCBzZXR0aW5nc01hcDogUmVjb3JkPHN0cmluZywgeyByYXRlTGltaXQ6IG51bWJlcjsgYnVyc3RMaW1pdDogbnVtYmVyIH0+ID0ge1xuICAgICAgZGV2OiB7IHJhdGVMaW1pdDogMTAwLCBidXJzdExpbWl0OiAyMDAgfSxcbiAgICAgIHN0YWdpbmc6IHsgcmF0ZUxpbWl0OiA1MDAsIGJ1cnN0TGltaXQ6IDEwMDAgfSxcbiAgICAgIHByb2Q6IHsgcmF0ZUxpbWl0OiAyMDAwLCBidXJzdExpbWl0OiA1MDAwIH0sXG4gICAgfTtcbiAgICByZXR1cm4gc2V0dGluZ3NNYXBbZW52aXJvbm1lbnRdIHx8IHsgcmF0ZUxpbWl0OiAxMDAsIGJ1cnN0TGltaXQ6IDIwMCB9O1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVPdXRwdXRzKGVudmlyb25tZW50OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBBUEkgR2F0ZXdheSBvdXRwdXRzXG4gICAgbmV3IENmbk91dHB1dCh0aGlzLCAnQXBpR2F0ZXdheVVybCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmFwaUdhdGV3YXkucmVzdEFwaS51cmwsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBHYXRld2F5IFVSTCcsXG4gICAgICBleHBvcnROYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1hcGktdXJsYCxcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLmFwaUdhdGV3YXkuZG9tYWluTmFtZSkge1xuICAgICAgbmV3IENmbk91dHB1dCh0aGlzLCAnQXBpQ3VzdG9tRG9tYWluVXJsJywge1xuICAgICAgICB2YWx1ZTogYGh0dHBzOi8vJHt0aGlzLmFwaUdhdGV3YXkuZG9tYWluTmFtZS5kb21haW5OYW1lfWAsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIEdhdGV3YXkgY3VzdG9tIGRvbWFpbiBVUkwnLFxuICAgICAgICBleHBvcnROYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1hcGktY3VzdG9tLXVybGAsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBDb2duaXRvIG91dHB1dHNcbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdVc2VyUG9vbElkJywge1xuICAgICAgdmFsdWU6IHRoaXMuYXV0aGVudGljYXRpb24udXNlclBvb2wudXNlclBvb2xJZCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29nbml0byBVc2VyIFBvb2wgSUQnLFxuICAgICAgZXhwb3J0TmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tdXNlci1wb29sLWlkYCxcbiAgICB9KTtcblxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ1VzZXJQb29sQ2xpZW50SWQnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5hdXRoZW50aWNhdGlvbi51c2VyUG9vbENsaWVudC51c2VyUG9vbENsaWVudElkLFxuICAgICAgZGVzY3JpcHRpb246ICdDb2duaXRvIFVzZXIgUG9vbCBDbGllbnQgSUQnLFxuICAgICAgZXhwb3J0TmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tdXNlci1wb29sLWNsaWVudC1pZGAsXG4gICAgfSk7XG5cbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdJZGVudGl0eVBvb2xJZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmF1dGhlbnRpY2F0aW9uLmlkZW50aXR5UG9vbC5pZGVudGl0eVBvb2xJZCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29nbml0byBJZGVudGl0eSBQb29sIElEJyxcbiAgICAgIGV4cG9ydE5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWlkZW50aXR5LXBvb2wtaWRgLFxuICAgIH0pO1xuXG4gICAgbmV3IENmbk91dHB1dCh0aGlzLCAnQXV0aERvbWFpblVybCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmF1dGhlbnRpY2F0aW9uLnVzZXJQb29sRG9tYWluLmJhc2VVcmwoKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29nbml0byBob3N0ZWQgVUkgZG9tYWluIFVSTCcsXG4gICAgICBleHBvcnROYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1hdXRoLWRvbWFpbi11cmxgLFxuICAgIH0pO1xuXG4gICAgLy8gRHluYW1vREIgb3V0cHV0c1xuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ0R5bmFtb1RhYmxlTmFtZScsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmRhdGFiYXNlLm1haW5UYWJsZS50YWJsZU5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ0R5bmFtb0RCIG1haW4gdGFibGUgbmFtZScsXG4gICAgICBleHBvcnROYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1keW5hbW8tdGFibGUtbmFtZWAsXG4gICAgfSk7XG5cbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdEeW5hbW9UYWJsZUFybicsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmRhdGFiYXNlLm1haW5UYWJsZS50YWJsZUFybixcbiAgICAgIGRlc2NyaXB0aW9uOiAnRHluYW1vREIgbWFpbiB0YWJsZSBBUk4nLFxuICAgICAgZXhwb3J0TmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tZHluYW1vLXRhYmxlLWFybmAsXG4gICAgfSk7XG5cbiAgICAvLyBLTVMgb3V0cHV0c1xuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ0ttc0tleUlkJywge1xuICAgICAgdmFsdWU6IHRoaXMuZGF0YWJhc2Uua21zS2V5LmtleUlkLFxuICAgICAgZGVzY3JpcHRpb246ICdLTVMga2V5IElEIGZvciBlbmNyeXB0aW9uJyxcbiAgICAgIGV4cG9ydE5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWttcy1rZXktaWRgLFxuICAgIH0pO1xuXG4gICAgbmV3IENmbk91dHB1dCh0aGlzLCAnS21zS2V5QXJuJywge1xuICAgICAgdmFsdWU6IHRoaXMuZGF0YWJhc2Uua21zS2V5LmtleUFybixcbiAgICAgIGRlc2NyaXB0aW9uOiAnS01TIGtleSBBUk4gZm9yIGVuY3J5cHRpb24nLFxuICAgICAgZXhwb3J0TmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0ta21zLWtleS1hcm5gLFxuICAgIH0pO1xuXG4gICAgLy8gVlBDIG91dHB1dHNcbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdWcGNJZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLm5ldHdvcmtpbmcudnBjLnZwY0lkLFxuICAgICAgZGVzY3JpcHRpb246ICdWUEMgSUQnLFxuICAgICAgZXhwb3J0TmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tdnBjLWlkYCxcbiAgICB9KTtcblxuICAgIC8vIE1vbml0b3Jpbmcgb3V0cHV0c1xuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ0Rhc2hib2FyZFVybCcsIHtcbiAgICAgIHZhbHVlOiBgaHR0cHM6Ly9jb25zb2xlLmF3cy5hbWF6b24uY29tL2Nsb3Vkd2F0Y2gvaG9tZT9yZWdpb249JHtTdGFjay5vZih0aGlzKS5yZWdpb259I2Rhc2hib2FyZHM6bmFtZT0ke3RoaXMubW9uaXRvcmluZy5kYXNoYm9hcmQuZGFzaGJvYXJkTmFtZX1gLFxuICAgICAgZGVzY3JpcHRpb246ICdDbG91ZFdhdGNoIERhc2hib2FyZCBVUkwnLFxuICAgICAgZXhwb3J0TmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tZGFzaGJvYXJkLXVybGAsXG4gICAgfSk7XG5cbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdBbGVydFRvcGljQXJuJywge1xuICAgICAgdmFsdWU6IHRoaXMubW9uaXRvcmluZy5hbGVydFRvcGljLnRvcGljQXJuLFxuICAgICAgZGVzY3JpcHRpb246ICdTTlMgQWxlcnQgVG9waWMgQVJOJyxcbiAgICAgIGV4cG9ydE5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWFsZXJ0LXRvcGljLWFybmAsXG4gICAgfSk7XG5cbiAgICAvLyBTdG9yYWdlIG91dHB1dHNcbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdVc2VyQ29udGVudEJ1Y2tldE5hbWUnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5zdG9yYWdlLnVzZXJDb250ZW50QnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ1MzIGJ1Y2tldCBmb3IgdXNlciBjb250ZW50JyxcbiAgICAgIGV4cG9ydE5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LXVzZXItY29udGVudC1idWNrZXRgLFxuICAgIH0pO1xuXG4gICAgbmV3IENmbk91dHB1dCh0aGlzLCAnVXNlckNvbnRlbnRLbXNLZXlBcm4nLCB7XG4gICAgICB2YWx1ZTogdGhpcy5zdG9yYWdlLmNvbnRlbnRLbXNLZXkua2V5QXJuLFxuICAgICAgZGVzY3JpcHRpb246ICdLTVMga2V5IEFSTiBmb3IgdXNlciBjb250ZW50IGJ1Y2tldCcsXG4gICAgICBleHBvcnROYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS11c2VyLWNvbnRlbnQta21zLWFybmAsXG4gICAgfSk7XG5cbiAgICAvLyBDRE4gb3V0cHV0c1xuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ0NvbnRlbnRDRE5Eb21haW5OYW1lJywge1xuICAgICAgdmFsdWU6IHRoaXMuc3RvcmFnZS5jZG5EaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uRG9tYWluTmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ2xvdWRGcm9udCBDRE4gZG9tYWluIG5hbWUgZm9yIHVzZXIgY29udGVudCcsXG4gICAgICBleHBvcnROYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1jZG4tZG9tYWluYCxcbiAgICB9KTtcblxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ0NvbnRlbnRDRE5EaXN0cmlidXRpb25JZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLnN0b3JhZ2UuY2RuRGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbklkLFxuICAgICAgZGVzY3JpcHRpb246ICdDbG91ZEZyb250IGRpc3RyaWJ1dGlvbiBJRCcsXG4gICAgICBleHBvcnROYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1jZG4tZGlzdHJpYnV0aW9uLWlkYCxcbiAgICB9KTtcbiAgfVxufVxuXG4vLyBJbXBvcnQgQ2ZuT3V0cHV0XG5pbXBvcnQgeyBDZm5PdXRwdXQgfSBmcm9tICdhd3MtY2RrLWxpYic7Il19