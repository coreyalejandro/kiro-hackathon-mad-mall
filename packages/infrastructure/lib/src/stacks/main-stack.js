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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdGFja3MvbWFpbi1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2Q0FBc0Q7QUFDdEQseURBQStEO0FBQy9ELHFEQUEyRDtBQUMzRCxpREFBdUQ7QUFDdkQsMkRBQWdFO0FBQ2hFLGlFQUF1RTtBQUN2RSx5REFBK0Q7QUFDL0QscURBQTJEO0FBQzNELG1EQUF5RDtBQWlEekQsTUFBYSxTQUFVLFNBQVEsbUJBQUs7SUFVbEMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFxQjtRQUM3RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEVBQ0osV0FBVyxFQUNYLGFBQWEsRUFDYixjQUFjLEVBQ2QsWUFBWSxFQUNaLFVBQVUsRUFDVixXQUFXLEVBQ1gsZUFBZSxFQUNmLGlCQUFpQixHQUFHLElBQUksRUFDeEIsVUFBVSxHQUFHLFdBQVcsS0FBSyxNQUFNLEdBQ3BDLEdBQUcsS0FBSyxDQUFDO1FBRVYsdUJBQXVCO1FBQ3ZCLGtCQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDeEMsa0JBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM5QyxrQkFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzFDLGtCQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFFL0MsbUNBQW1DO1FBQ25DLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxnQ0FBbUIsQ0FBQyxJQUFJLEVBQUUs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LHVCQUFTLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFO1lBQzNDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLFVBQVU7WUFDaEQsV0FBVyxFQUFFLDRCQUE0QjtZQUN6QyxVQUFVLEVBQUUsV0FBVyxXQUFXLHNCQUFzQjtTQUN6RCxDQUFDLENBQUM7UUFFSCxJQUFJLHVCQUFTLENBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFO1lBQzFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQ3hDLFdBQVcsRUFBRSxxQ0FBcUM7WUFDbEQsVUFBVSxFQUFFLFdBQVcsV0FBVyx1QkFBdUI7U0FDMUQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBL1BELDhCQStQQztBQUVELG1CQUFtQjtBQUNuQiw2Q0FBd0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IFN0YWNrLCBTdGFja1Byb3BzLCBUYWdzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgTmV0d29ya2luZ0NvbnN0cnVjdCB9IGZyb20gJy4uL2NvbnN0cnVjdHMvbmV0d29ya2luZyc7XG5pbXBvcnQgeyBEYXRhYmFzZUNvbnN0cnVjdCB9IGZyb20gJy4uL2NvbnN0cnVjdHMvZGF0YWJhc2UnO1xuaW1wb3J0IHsgTGFtYmRhQ29uc3RydWN0IH0gZnJvbSAnLi4vY29uc3RydWN0cy9sYW1iZGEnO1xuaW1wb3J0IHsgQXBpR2F0ZXdheUNvbnN0cnVjdCB9IGZyb20gJy4uL2NvbnN0cnVjdHMvYXBpLWdhdGV3YXknO1xuaW1wb3J0IHsgQXV0aGVudGljYXRpb25Db25zdHJ1Y3QgfSBmcm9tICcuLi9jb25zdHJ1Y3RzL2F1dGhlbnRpY2F0aW9uJztcbmltcG9ydCB7IE1vbml0b3JpbmdDb25zdHJ1Y3QgfSBmcm9tICcuLi9jb25zdHJ1Y3RzL21vbml0b3JpbmcnO1xuaW1wb3J0IHsgU2VjdXJpdHlDb25zdHJ1Y3QgfSBmcm9tICcuLi9jb25zdHJ1Y3RzL3NlY3VyaXR5JztcbmltcG9ydCB7IFN0b3JhZ2VDb25zdHJ1Y3QgfSBmcm9tICcuLi9jb25zdHJ1Y3RzL3N0b3JhZ2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1haW5TdGFja1Byb3BzIGV4dGVuZHMgU3RhY2tQcm9wcyB7XG4gIC8qKlxuICAgKiBFbnZpcm9ubWVudCBuYW1lIChkZXYsIHN0YWdpbmcsIHByb2QpXG4gICAqL1xuICBlbnZpcm9ubWVudDogc3RyaW5nO1xuICBcbiAgLyoqXG4gICAqIEN1c3RvbSBkb21haW4gbmFtZSBmb3IgdGhlIEFQSVxuICAgKi9cbiAgYXBpRG9tYWluTmFtZT86IHN0cmluZztcbiAgXG4gIC8qKlxuICAgKiBDdXN0b20gZG9tYWluIG5hbWUgZm9yIGF1dGhlbnRpY2F0aW9uXG4gICAqL1xuICBhdXRoRG9tYWluTmFtZT86IHN0cmluZztcbiAgXG4gIC8qKlxuICAgKiBDYWxsYmFjayBVUkxzIGZvciBPQXV0aCBmbG93c1xuICAgKi9cbiAgY2FsbGJhY2tVcmxzOiBzdHJpbmdbXTtcbiAgXG4gIC8qKlxuICAgKiBMb2dvdXQgVVJMcyBmb3IgT0F1dGggZmxvd3NcbiAgICovXG4gIGxvZ291dFVybHM6IHN0cmluZ1tdO1xuICBcbiAgLyoqXG4gICAqIEVtYWlsIGFkZHJlc3NlcyBmb3IgbW9uaXRvcmluZyBhbGVydHNcbiAgICovXG4gIGFsZXJ0RW1haWxzOiBzdHJpbmdbXTtcbiAgXG4gIC8qKlxuICAgKiBTbGFjayB3ZWJob29rIFVSTCBmb3Igbm90aWZpY2F0aW9uc1xuICAgKi9cbiAgc2xhY2tXZWJob29rVXJsPzogc3RyaW5nO1xuICBcbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gZW5hYmxlIHNvY2lhbCBsb2dpblxuICAgKi9cbiAgZW5hYmxlU29jaWFsTG9naW4/OiBib29sZWFuO1xuICBcbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gcmVxdWlyZSBNRkFcbiAgICovXG4gIHJlcXVpcmVNZmE/OiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgTWFpblN0YWNrIGV4dGVuZHMgU3RhY2sge1xuICBwdWJsaWMgcmVhZG9ubHkgbmV0d29ya2luZzogTmV0d29ya2luZ0NvbnN0cnVjdDtcbiAgcHVibGljIHJlYWRvbmx5IGRhdGFiYXNlOiBEYXRhYmFzZUNvbnN0cnVjdDtcbiAgcHVibGljIHJlYWRvbmx5IGxhbWJkYTogTGFtYmRhQ29uc3RydWN0O1xuICBwdWJsaWMgcmVhZG9ubHkgYXBpR2F0ZXdheTogQXBpR2F0ZXdheUNvbnN0cnVjdDtcbiAgcHVibGljIHJlYWRvbmx5IGF1dGhlbnRpY2F0aW9uOiBBdXRoZW50aWNhdGlvbkNvbnN0cnVjdDtcbiAgcHVibGljIHJlYWRvbmx5IG1vbml0b3Jpbmc6IE1vbml0b3JpbmdDb25zdHJ1Y3Q7XG4gIHB1YmxpYyByZWFkb25seSBzZWN1cml0eTogU2VjdXJpdHlDb25zdHJ1Y3Q7XG4gIHB1YmxpYyByZWFkb25seSBzdG9yYWdlOiBTdG9yYWdlQ29uc3RydWN0O1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBNYWluU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3Qge1xuICAgICAgZW52aXJvbm1lbnQsXG4gICAgICBhcGlEb21haW5OYW1lLFxuICAgICAgYXV0aERvbWFpbk5hbWUsXG4gICAgICBjYWxsYmFja1VybHMsXG4gICAgICBsb2dvdXRVcmxzLFxuICAgICAgYWxlcnRFbWFpbHMsXG4gICAgICBzbGFja1dlYmhvb2tVcmwsXG4gICAgICBlbmFibGVTb2NpYWxMb2dpbiA9IHRydWUsXG4gICAgICByZXF1aXJlTWZhID0gZW52aXJvbm1lbnQgPT09ICdwcm9kJyxcbiAgICB9ID0gcHJvcHM7XG5cbiAgICAvLyBBZGQgc3RhY2stbGV2ZWwgdGFnc1xuICAgIFRhZ3Mub2YodGhpcykuYWRkKCdQcm9qZWN0JywgJ01BRE1hbGwnKTtcbiAgICBUYWdzLm9mKHRoaXMpLmFkZCgnRW52aXJvbm1lbnQnLCBlbnZpcm9ubWVudCk7XG4gICAgVGFncy5vZih0aGlzKS5hZGQoJ01hbmFnZWRCeScsICdBV1MtQ0RLJyk7XG4gICAgVGFncy5vZih0aGlzKS5hZGQoJ0Nvc3RDZW50ZXInLCAnRW5naW5lZXJpbmcnKTtcblxuICAgIC8vIENyZWF0ZSBuZXR3b3JraW5nIGluZnJhc3RydWN0dXJlXG4gICAgdGhpcy5uZXR3b3JraW5nID0gbmV3IE5ldHdvcmtpbmdDb25zdHJ1Y3QodGhpcywgJ05ldHdvcmtpbmcnLCB7XG4gICAgICBlbnZpcm9ubWVudCxcbiAgICAgIGNpZHI6IHRoaXMuZ2V0Q2lkckZvckVudmlyb25tZW50KGVudmlyb25tZW50KSxcbiAgICAgIG1heEF6czogZW52aXJvbm1lbnQgPT09ICdwcm9kJyA/IDMgOiAyLFxuICAgICAgZW5hYmxlTmF0R2F0ZXdheTogdHJ1ZSxcbiAgICAgIGVuYWJsZUZsb3dMb2dzOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIGRhdGFiYXNlIGluZnJhc3RydWN0dXJlXG4gICAgdGhpcy5kYXRhYmFzZSA9IG5ldyBEYXRhYmFzZUNvbnN0cnVjdCh0aGlzLCAnRGF0YWJhc2UnLCB7XG4gICAgICBlbnZpcm9ubWVudCxcbiAgICAgIGVuYWJsZVBvaW50SW5UaW1lUmVjb3Zlcnk6IGVudmlyb25tZW50ID09PSAncHJvZCcsXG4gICAgICBlbmFibGVTdHJlYW1zOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIGF1dGhlbnRpY2F0aW9uIGluZnJhc3RydWN0dXJlIChtdXN0IHByZWNlZGUgQVBJIHNvIGF1dGhvcml6ZXIgY2FuIGJpbmQpXG4gICAgdGhpcy5hdXRoZW50aWNhdGlvbiA9IG5ldyBBdXRoZW50aWNhdGlvbkNvbnN0cnVjdCh0aGlzLCAnQXV0aGVudGljYXRpb24nLCB7XG4gICAgICBlbnZpcm9ubWVudCxcbiAgICAgIGN1c3RvbURvbWFpbjogYXV0aERvbWFpbk5hbWUsXG4gICAgICBjYWxsYmFja1VybHMsXG4gICAgICBsb2dvdXRVcmxzLFxuICAgICAgZW5hYmxlU29jaWFsTG9naW4sXG4gICAgICByZXF1aXJlTWZhLFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIExhbWJkYSBmdW5jdGlvbnNcbiAgICB0aGlzLmxhbWJkYSA9IG5ldyBMYW1iZGFDb25zdHJ1Y3QodGhpcywgJ0xhbWJkYScsIHtcbiAgICAgIGVudmlyb25tZW50LFxuICAgICAgdnBjOiB0aGlzLm5ldHdvcmtpbmcudnBjLFxuICAgICAgc2VjdXJpdHlHcm91cDogdGhpcy5uZXR3b3JraW5nLmxhbWJkYVNlY3VyaXR5R3JvdXAsXG4gICAgICBkeW5hbW9UYWJsZTogdGhpcy5kYXRhYmFzZS5tYWluVGFibGUsXG4gICAgICBrbXNLZXk6IHRoaXMuZGF0YWJhc2Uua21zS2V5LFxuICAgICAgYWRkaXRpb25hbEVudmlyb25tZW50VmFyaWFibGVzOiB7XG4gICAgICAgIENPUlNfQUxMT1dFRF9PUklHSU5TOiB0aGlzLmdldENvcnNPcmlnaW5zRm9yRW52aXJvbm1lbnQoZW52aXJvbm1lbnQpLFxuICAgICAgICBMT0dfTEVWRUw6IGVudmlyb25tZW50ID09PSAncHJvZCcgPyAnSU5GTycgOiAnREVCVUcnLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBzdG9yYWdlIChTMyB1c2VyIGNvbnRlbnQgd2l0aCBLTVMpXG4gICAgdGhpcy5zdG9yYWdlID0gbmV3IFN0b3JhZ2VDb25zdHJ1Y3QodGhpcywgJ1N0b3JhZ2UnLCB7XG4gICAgICBlbnZpcm9ubWVudCxcbiAgICAgIGF1dGhlbnRpY2F0ZWRSb2xlOiB0aGlzLmF1dGhlbnRpY2F0aW9uLmF1dGhlbnRpY2F0ZWRSb2xlLFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIEFQSSBHYXRld2F5XG4gICAgdGhpcy5hcGlHYXRld2F5ID0gbmV3IEFwaUdhdGV3YXlDb25zdHJ1Y3QodGhpcywgJ0FwaUdhdGV3YXknLCB7XG4gICAgICBlbnZpcm9ubWVudCxcbiAgICAgIGxhbWJkYUZ1bmN0aW9uczogdGhpcy5sYW1iZGEuZnVuY3Rpb25zLFxuICAgICAgZG9tYWluTmFtZTogYXBpRG9tYWluTmFtZSxcbiAgICAgIHVzZXJQb29sOiB0aGlzLmF1dGhlbnRpY2F0aW9uLnVzZXJQb29sLFxuICAgICAgY29yc09wdGlvbnM6IHtcbiAgICAgICAgYWxsb3dPcmlnaW5zOiB0aGlzLmdldENvcnNPcmlnaW5zRm9yRW52aXJvbm1lbnQoZW52aXJvbm1lbnQpLnNwbGl0KCcsJyksXG4gICAgICAgIGFsbG93TWV0aG9kczogWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ09QVElPTlMnXSxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZScsXG4gICAgICAgICAgJ1gtQW16LURhdGUnLFxuICAgICAgICAgICdBdXRob3JpemF0aW9uJyxcbiAgICAgICAgICAnWC1BcGktS2V5JyxcbiAgICAgICAgICAnWC1BbXotU2VjdXJpdHktVG9rZW4nLFxuICAgICAgICAgICdYLUFtei1Vc2VyLUFnZW50JyxcbiAgICAgICAgICAnWC1Db3JyZWxhdGlvbi1JZCcsXG4gICAgICAgIF0sXG4gICAgICAgIGFsbG93Q3JlZGVudGlhbHM6IHRydWUsXG4gICAgICB9LFxuICAgICAgdGhyb3R0bGVTZXR0aW5nczogdGhpcy5nZXRUaHJvdHRsZVNldHRpbmdzRm9yRW52aXJvbm1lbnQoZW52aXJvbm1lbnQpLFxuICAgIH0pO1xuXG4gICAgLy8gTm93IHRoYXQgYXV0aGVudGljYXRpb24gaXMgY3JlYXRlZCwgd2lyZSB0aGUgYXV0aG9yaXplci1iYWNrZWQgQVBJIG1ldGhvZHNcbiAgICAvLyBOb3RlOiBBUEkgY29uc3RydWN0IGFscmVhZHkgcmVhZHMgdGhlIHVzZXJQb29sIHByb3ZpZGVkIGFib3ZlLlxuXG4gICAgLy8gQ3JlYXRlIG1vbml0b3JpbmcgaW5mcmFzdHJ1Y3R1cmVcbiAgICB0aGlzLm1vbml0b3JpbmcgPSBuZXcgTW9uaXRvcmluZ0NvbnN0cnVjdCh0aGlzLCAnTW9uaXRvcmluZycsIHtcbiAgICAgIGVudmlyb25tZW50LFxuICAgICAgbGFtYmRhRnVuY3Rpb25zOiB0aGlzLmxhbWJkYS5nZXRBbGxGdW5jdGlvbnMoKSxcbiAgICAgIHJlc3RBcGk6IHRoaXMuYXBpR2F0ZXdheS5yZXN0QXBpLFxuICAgICAgZHluYW1vVGFibGU6IHRoaXMuZGF0YWJhc2UubWFpblRhYmxlLFxuICAgICAgdXNlclBvb2w6IHRoaXMuYXV0aGVudGljYXRpb24udXNlclBvb2wsXG4gICAgICBhbGVydEVtYWlscyxcbiAgICAgIHNsYWNrV2ViaG9va1VybCxcbiAgICAgIGhlYWx0aENoZWNrVXJsOiBgJHt0aGlzLmFwaUdhdGV3YXkucmVzdEFwaS51cmx9aGVhbHRoYCxcbiAgICB9KTtcblxuICAgIC8vIFNlY3VyaXR5IGhhcmRlbmluZyAoV0FGLCBDbG91ZFRyYWlsLCBBV1MgQ29uZmlnLCBTZWN1cml0eSBIdWIpXG4gICAgdGhpcy5zZWN1cml0eSA9IG5ldyBTZWN1cml0eUNvbnN0cnVjdCh0aGlzLCAnU2VjdXJpdHknLCB7XG4gICAgICBlbnZpcm9ubWVudCxcbiAgICAgIHJlc3RBcGk6IHRoaXMuYXBpR2F0ZXdheS5yZXN0QXBpLFxuICAgICAgYWRkaXRpb25hbFMzQnVja2V0czogW3RoaXMuc3RvcmFnZS51c2VyQ29udGVudEJ1Y2tldF0sXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgdXNhZ2UgcGxhbnMgZm9yIEFQSSBHYXRld2F5XG4gICAgdGhpcy5hcGlHYXRld2F5LmNyZWF0ZVVzYWdlUGxhbnMoKTtcblxuICAgIC8vIE91dHB1dCBpbXBvcnRhbnQgdmFsdWVzXG4gICAgdGhpcy5jcmVhdGVPdXRwdXRzKGVudmlyb25tZW50KTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0Q2lkckZvckVudmlyb25tZW50KGVudmlyb25tZW50OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IGNpZHJNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICBkZXY6ICcxMC4wLjAuMC8xNicsXG4gICAgICBzdGFnaW5nOiAnMTAuMS4wLjAvMTYnLFxuICAgICAgcHJvZDogJzEwLjIuMC4wLzE2JyxcbiAgICB9O1xuICAgIHJldHVybiBjaWRyTWFwW2Vudmlyb25tZW50XSB8fCAnMTAuMC4wLjAvMTYnO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRDb3JzT3JpZ2luc0ZvckVudmlyb25tZW50KGVudmlyb25tZW50OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IG9yaWdpbnNNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgICBkZXY6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAsaHR0cDovL2xvY2FsaG9zdDo1MTczJyxcbiAgICAgIHN0YWdpbmc6ICdodHRwczovL3N0YWdpbmcubWFkbWFsbC5jb20nLFxuICAgICAgcHJvZDogJ2h0dHBzOi8vbWFkbWFsbC5jb20saHR0cHM6Ly93d3cubWFkbWFsbC5jb20nLFxuICAgIH07XG4gICAgcmV0dXJuIG9yaWdpbnNNYXBbZW52aXJvbm1lbnRdIHx8ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRUaHJvdHRsZVNldHRpbmdzRm9yRW52aXJvbm1lbnQoZW52aXJvbm1lbnQ6IHN0cmluZykge1xuICAgIGNvbnN0IHNldHRpbmdzTWFwOiBSZWNvcmQ8c3RyaW5nLCB7IHJhdGVMaW1pdDogbnVtYmVyOyBidXJzdExpbWl0OiBudW1iZXIgfT4gPSB7XG4gICAgICBkZXY6IHsgcmF0ZUxpbWl0OiAxMDAsIGJ1cnN0TGltaXQ6IDIwMCB9LFxuICAgICAgc3RhZ2luZzogeyByYXRlTGltaXQ6IDUwMCwgYnVyc3RMaW1pdDogMTAwMCB9LFxuICAgICAgcHJvZDogeyByYXRlTGltaXQ6IDIwMDAsIGJ1cnN0TGltaXQ6IDUwMDAgfSxcbiAgICB9O1xuICAgIHJldHVybiBzZXR0aW5nc01hcFtlbnZpcm9ubWVudF0gfHwgeyByYXRlTGltaXQ6IDEwMCwgYnVyc3RMaW1pdDogMjAwIH07XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZU91dHB1dHMoZW52aXJvbm1lbnQ6IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIEFQSSBHYXRld2F5IG91dHB1dHNcbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdBcGlHYXRld2F5VXJsJywge1xuICAgICAgdmFsdWU6IHRoaXMuYXBpR2F0ZXdheS5yZXN0QXBpLnVybCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIEdhdGV3YXkgVVJMJyxcbiAgICAgIGV4cG9ydE5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWFwaS11cmxgLFxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuYXBpR2F0ZXdheS5kb21haW5OYW1lKSB7XG4gICAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdBcGlDdXN0b21Eb21haW5VcmwnLCB7XG4gICAgICAgIHZhbHVlOiBgaHR0cHM6Ly8ke3RoaXMuYXBpR2F0ZXdheS5kb21haW5OYW1lLmRvbWFpbk5hbWV9YCxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBUEkgR2F0ZXdheSBjdXN0b20gZG9tYWluIFVSTCcsXG4gICAgICAgIGV4cG9ydE5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWFwaS1jdXN0b20tdXJsYCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIENvZ25pdG8gb3V0cHV0c1xuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ1VzZXJQb29sSWQnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5hdXRoZW50aWNhdGlvbi51c2VyUG9vbC51c2VyUG9vbElkLFxuICAgICAgZGVzY3JpcHRpb246ICdDb2duaXRvIFVzZXIgUG9vbCBJRCcsXG4gICAgICBleHBvcnROYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS11c2VyLXBvb2wtaWRgLFxuICAgIH0pO1xuXG4gICAgbmV3IENmbk91dHB1dCh0aGlzLCAnVXNlclBvb2xDbGllbnRJZCcsIHtcbiAgICAgIHZhbHVlOiB0aGlzLmF1dGhlbnRpY2F0aW9uLnVzZXJQb29sQ2xpZW50LnVzZXJQb29sQ2xpZW50SWQsXG4gICAgICBkZXNjcmlwdGlvbjogJ0NvZ25pdG8gVXNlciBQb29sIENsaWVudCBJRCcsXG4gICAgICBleHBvcnROYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS11c2VyLXBvb2wtY2xpZW50LWlkYCxcbiAgICB9KTtcblxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ0lkZW50aXR5UG9vbElkJywge1xuICAgICAgdmFsdWU6IHRoaXMuYXV0aGVudGljYXRpb24uaWRlbnRpdHlQb29sLmlkZW50aXR5UG9vbElkLFxuICAgICAgZGVzY3JpcHRpb246ICdDb2duaXRvIElkZW50aXR5IFBvb2wgSUQnLFxuICAgICAgZXhwb3J0TmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0taWRlbnRpdHktcG9vbC1pZGAsXG4gICAgfSk7XG5cbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdBdXRoRG9tYWluVXJsJywge1xuICAgICAgdmFsdWU6IHRoaXMuYXV0aGVudGljYXRpb24udXNlclBvb2xEb21haW4uYmFzZVVybCgpLFxuICAgICAgZGVzY3JpcHRpb246ICdDb2duaXRvIGhvc3RlZCBVSSBkb21haW4gVVJMJyxcbiAgICAgIGV4cG9ydE5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWF1dGgtZG9tYWluLXVybGAsXG4gICAgfSk7XG5cbiAgICAvLyBEeW5hbW9EQiBvdXRwdXRzXG4gICAgbmV3IENmbk91dHB1dCh0aGlzLCAnRHluYW1vVGFibGVOYW1lJywge1xuICAgICAgdmFsdWU6IHRoaXMuZGF0YWJhc2UubWFpblRhYmxlLnRhYmxlTmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRHluYW1vREIgbWFpbiB0YWJsZSBuYW1lJyxcbiAgICAgIGV4cG9ydE5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWR5bmFtby10YWJsZS1uYW1lYCxcbiAgICB9KTtcblxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ0R5bmFtb1RhYmxlQXJuJywge1xuICAgICAgdmFsdWU6IHRoaXMuZGF0YWJhc2UubWFpblRhYmxlLnRhYmxlQXJuLFxuICAgICAgZGVzY3JpcHRpb246ICdEeW5hbW9EQiBtYWluIHRhYmxlIEFSTicsXG4gICAgICBleHBvcnROYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1keW5hbW8tdGFibGUtYXJuYCxcbiAgICB9KTtcblxuICAgIC8vIEtNUyBvdXRwdXRzXG4gICAgbmV3IENmbk91dHB1dCh0aGlzLCAnS21zS2V5SWQnLCB7XG4gICAgICB2YWx1ZTogdGhpcy5kYXRhYmFzZS5rbXNLZXkua2V5SWQsXG4gICAgICBkZXNjcmlwdGlvbjogJ0tNUyBrZXkgSUQgZm9yIGVuY3J5cHRpb24nLFxuICAgICAgZXhwb3J0TmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0ta21zLWtleS1pZGAsXG4gICAgfSk7XG5cbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdLbXNLZXlBcm4nLCB7XG4gICAgICB2YWx1ZTogdGhpcy5kYXRhYmFzZS5rbXNLZXkua2V5QXJuLFxuICAgICAgZGVzY3JpcHRpb246ICdLTVMga2V5IEFSTiBmb3IgZW5jcnlwdGlvbicsXG4gICAgICBleHBvcnROYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1rbXMta2V5LWFybmAsXG4gICAgfSk7XG5cbiAgICAvLyBWUEMgb3V0cHV0c1xuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ1ZwY0lkJywge1xuICAgICAgdmFsdWU6IHRoaXMubmV0d29ya2luZy52cGMudnBjSWQsXG4gICAgICBkZXNjcmlwdGlvbjogJ1ZQQyBJRCcsXG4gICAgICBleHBvcnROYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS12cGMtaWRgLFxuICAgIH0pO1xuXG4gICAgLy8gTW9uaXRvcmluZyBvdXRwdXRzXG4gICAgbmV3IENmbk91dHB1dCh0aGlzLCAnRGFzaGJvYXJkVXJsJywge1xuICAgICAgdmFsdWU6IGBodHRwczovL2NvbnNvbGUuYXdzLmFtYXpvbi5jb20vY2xvdWR3YXRjaC9ob21lP3JlZ2lvbj0ke1N0YWNrLm9mKHRoaXMpLnJlZ2lvbn0jZGFzaGJvYXJkczpuYW1lPSR7dGhpcy5tb25pdG9yaW5nLmRhc2hib2FyZC5kYXNoYm9hcmROYW1lfWAsXG4gICAgICBkZXNjcmlwdGlvbjogJ0Nsb3VkV2F0Y2ggRGFzaGJvYXJkIFVSTCcsXG4gICAgICBleHBvcnROYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1kYXNoYm9hcmQtdXJsYCxcbiAgICB9KTtcblxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ0FsZXJ0VG9waWNBcm4nLCB7XG4gICAgICB2YWx1ZTogdGhpcy5tb25pdG9yaW5nLmFsZXJ0VG9waWMudG9waWNBcm4sXG4gICAgICBkZXNjcmlwdGlvbjogJ1NOUyBBbGVydCBUb3BpYyBBUk4nLFxuICAgICAgZXhwb3J0TmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tYWxlcnQtdG9waWMtYXJuYCxcbiAgICB9KTtcblxuICAgIC8vIFN0b3JhZ2Ugb3V0cHV0c1xuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ1VzZXJDb250ZW50QnVja2V0TmFtZScsIHtcbiAgICAgIHZhbHVlOiB0aGlzLnN0b3JhZ2UudXNlckNvbnRlbnRCdWNrZXQuYnVja2V0TmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnUzMgYnVja2V0IGZvciB1c2VyIGNvbnRlbnQnLFxuICAgICAgZXhwb3J0TmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tdXNlci1jb250ZW50LWJ1Y2tldGAsXG4gICAgfSk7XG5cbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdVc2VyQ29udGVudEttc0tleUFybicsIHtcbiAgICAgIHZhbHVlOiB0aGlzLnN0b3JhZ2UuY29udGVudEttc0tleS5rZXlBcm4sXG4gICAgICBkZXNjcmlwdGlvbjogJ0tNUyBrZXkgQVJOIGZvciB1c2VyIGNvbnRlbnQgYnVja2V0JyxcbiAgICAgIGV4cG9ydE5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LXVzZXItY29udGVudC1rbXMtYXJuYCxcbiAgICB9KTtcbiAgfVxufVxuXG4vLyBJbXBvcnQgQ2ZuT3V0cHV0XG5pbXBvcnQgeyBDZm5PdXRwdXQgfSBmcm9tICdhd3MtY2RrLWxpYic7Il19