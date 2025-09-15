import { Construct } from 'constructs';
import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { NetworkingConstruct } from '../constructs/networking';
import { DatabaseConstruct } from '../constructs/database';
import { LambdaConstruct } from '../constructs/lambda';
import { ApiGatewayConstruct } from '../constructs/api-gateway';
import { AuthenticationConstruct } from '../constructs/authentication';
import { MonitoringConstruct } from '../constructs/monitoring';
import { SecurityConstruct } from '../constructs/security';
import { StorageConstruct } from '../constructs/storage';

export interface MainStackProps extends StackProps {
  /**
   * Environment name (dev, staging, prod)
   */
  environment: string;
  
  /**
   * Custom domain name for the API
   */
  apiDomainName?: string;
  
  /**
   * Custom domain name for authentication
   */
  authDomainName?: string;
  
  /**
   * Callback URLs for OAuth flows
   */
  callbackUrls: string[];
  
  /**
   * Logout URLs for OAuth flows
   */
  logoutUrls: string[];
  
  /**
   * Email addresses for monitoring alerts
   */
  alertEmails: string[];
  
  /**
   * Slack webhook URL for notifications
   */
  slackWebhookUrl?: string;
  
  /**
   * Whether to enable social login
   */
  enableSocialLogin?: boolean;
  
  /**
   * Whether to require MFA
   */
  requireMfa?: boolean;
}

export class MainStack extends Stack {
  public readonly networking: NetworkingConstruct;
  public readonly database: DatabaseConstruct;
  public readonly lambda: LambdaConstruct;
  public readonly apiGateway: ApiGatewayConstruct;
  public readonly authentication: AuthenticationConstruct;
  public readonly monitoring: MonitoringConstruct;
  public readonly security: SecurityConstruct;
  public readonly storage: StorageConstruct;

  constructor(scope: Construct, id: string, props: MainStackProps) {
    super(scope, id, props);

    const {
      environment,
      apiDomainName,
      authDomainName,
      callbackUrls,
      logoutUrls,
      alertEmails,
      slackWebhookUrl,
      enableSocialLogin = true,
      requireMfa = environment === 'prod',
    } = props;

    // Add stack-level tags
    Tags.of(this).add('Project', 'MADMall');
    Tags.of(this).add('Environment', environment);
    Tags.of(this).add('ManagedBy', 'AWS-CDK');
    Tags.of(this).add('CostCenter', 'Engineering');

    // Create networking infrastructure
    this.networking = new NetworkingConstruct(this, 'Networking', {
      environment,
      cidr: this.getCidrForEnvironment(environment),
      maxAzs: environment === 'prod' ? 3 : 2,
      enableNatGateway: true,
      enableFlowLogs: true,
    });

    // Create database infrastructure
    this.database = new DatabaseConstruct(this, 'Database', {
      environment,
      enablePointInTimeRecovery: environment === 'prod',
      enableStreams: true,
    });

    // Create authentication infrastructure (must precede API so authorizer can bind)
    this.authentication = new AuthenticationConstruct(this, 'Authentication', {
      environment,
      customDomain: authDomainName,
      callbackUrls,
      logoutUrls,
      enableSocialLogin,
      requireMfa,
    });

    // Create Lambda functions
    this.lambda = new LambdaConstruct(this, 'Lambda', {
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
    this.storage = new StorageConstruct(this, 'Storage', {
      environment,
      authenticatedRole: this.authentication.authenticatedRole,
    });

    // Create API Gateway
    this.apiGateway = new ApiGatewayConstruct(this, 'ApiGateway', {
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
    this.monitoring = new MonitoringConstruct(this, 'Monitoring', {
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
    this.security = new SecurityConstruct(this, 'Security', {
      environment,
      restApi: this.apiGateway.restApi,
      additionalS3Buckets: [this.storage.userContentBucket],
    });

    // Create usage plans for API Gateway
    this.apiGateway.createUsagePlans();

    // Output important values
    this.createOutputs(environment);
  }

  private getCidrForEnvironment(environment: string): string {
    const cidrMap: Record<string, string> = {
      dev: '10.0.0.0/16',
      staging: '10.1.0.0/16',
      prod: '10.2.0.0/16',
    };
    return cidrMap[environment] || '10.0.0.0/16';
  }

  private getCorsOriginsForEnvironment(environment: string): string {
    const originsMap: Record<string, string> = {
      dev: 'http://localhost:3000,http://localhost:5173',
      staging: 'https://staging.madmall.com',
      prod: 'https://madmall.com,https://www.madmall.com',
    };
    return originsMap[environment] || 'http://localhost:3000';
  }

  private getThrottleSettingsForEnvironment(environment: string) {
    const settingsMap: Record<string, { rateLimit: number; burstLimit: number }> = {
      dev: { rateLimit: 100, burstLimit: 200 },
      staging: { rateLimit: 500, burstLimit: 1000 },
      prod: { rateLimit: 2000, burstLimit: 5000 },
    };
    return settingsMap[environment] || { rateLimit: 100, burstLimit: 200 };
  }

  private createOutputs(environment: string): void {
    // API Gateway outputs
    new CfnOutput(this, 'ApiGatewayUrl', {
      value: this.apiGateway.restApi.url,
      description: 'API Gateway URL',
      exportName: `madmall-${environment}-api-url`,
    });

    if (this.apiGateway.domainName) {
      new CfnOutput(this, 'ApiCustomDomainUrl', {
        value: `https://${this.apiGateway.domainName.domainName}`,
        description: 'API Gateway custom domain URL',
        exportName: `madmall-${environment}-api-custom-url`,
      });
    }

    // Cognito outputs
    new CfnOutput(this, 'UserPoolId', {
      value: this.authentication.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `madmall-${environment}-user-pool-id`,
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: this.authentication.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `madmall-${environment}-user-pool-client-id`,
    });

    new CfnOutput(this, 'IdentityPoolId', {
      value: this.authentication.identityPool.identityPoolId,
      description: 'Cognito Identity Pool ID',
      exportName: `madmall-${environment}-identity-pool-id`,
    });

    new CfnOutput(this, 'AuthDomainUrl', {
      value: this.authentication.userPoolDomain.baseUrl(),
      description: 'Cognito hosted UI domain URL',
      exportName: `madmall-${environment}-auth-domain-url`,
    });

    // DynamoDB outputs
    new CfnOutput(this, 'DynamoTableName', {
      value: this.database.mainTable.tableName,
      description: 'DynamoDB main table name',
      exportName: `madmall-${environment}-dynamo-table-name`,
    });

    new CfnOutput(this, 'DynamoTableArn', {
      value: this.database.mainTable.tableArn,
      description: 'DynamoDB main table ARN',
      exportName: `madmall-${environment}-dynamo-table-arn`,
    });

    // KMS outputs
    new CfnOutput(this, 'KmsKeyId', {
      value: this.database.kmsKey.keyId,
      description: 'KMS key ID for encryption',
      exportName: `madmall-${environment}-kms-key-id`,
    });

    new CfnOutput(this, 'KmsKeyArn', {
      value: this.database.kmsKey.keyArn,
      description: 'KMS key ARN for encryption',
      exportName: `madmall-${environment}-kms-key-arn`,
    });

    // VPC outputs
    new CfnOutput(this, 'VpcId', {
      value: this.networking.vpc.vpcId,
      description: 'VPC ID',
      exportName: `madmall-${environment}-vpc-id`,
    });

    // Monitoring outputs
    new CfnOutput(this, 'DashboardUrl', {
      value: `https://console.aws.amazon.com/cloudwatch/home?region=${Stack.of(this).region}#dashboards:name=${this.monitoring.dashboard.dashboardName}`,
      description: 'CloudWatch Dashboard URL',
      exportName: `madmall-${environment}-dashboard-url`,
    });

    new CfnOutput(this, 'AlertTopicArn', {
      value: this.monitoring.alertTopic.topicArn,
      description: 'SNS Alert Topic ARN',
      exportName: `madmall-${environment}-alert-topic-arn`,
    });

    // Storage outputs
    new CfnOutput(this, 'UserContentBucketName', {
      value: this.storage.userContentBucket.bucketName,
      description: 'S3 bucket for user content',
      exportName: `madmall-${environment}-user-content-bucket`,
    });

    new CfnOutput(this, 'UserContentKmsKeyArn', {
      value: this.storage.contentKmsKey.keyArn,
      description: 'KMS key ARN for user content bucket',
      exportName: `madmall-${environment}-user-content-kms-arn`,
    });

    // CDN outputs
    new CfnOutput(this, 'ContentCDNDomainName', {
      value: this.storage.cdnDistribution.distributionDomainName,
      description: 'CloudFront CDN domain name for user content',
      exportName: `madmall-${environment}-cdn-domain`,
    });

    new CfnOutput(this, 'ContentCDNDistributionId', {
      value: this.storage.cdnDistribution.distributionId,
      description: 'CloudFront distribution ID',
      exportName: `madmall-${environment}-cdn-distribution-id`,
    });
  }
}

// Import CfnOutput
import { CfnOutput } from 'aws-cdk-lib';