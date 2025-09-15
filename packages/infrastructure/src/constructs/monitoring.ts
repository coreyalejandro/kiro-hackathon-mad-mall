import { Construct } from 'constructs';
import {
  Dashboard,
  GraphWidget,
  Metric,
  SingleValueWidget,
  LogQueryWidget,
  TextWidget,
  Alarm,
  ComparisonOperator,
  TreatMissingData,
} from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Topic, Subscription, SubscriptionProtocol } from 'aws-cdk-lib/aws-sns';
import { Function as LambdaFunction, IFunction } from 'aws-cdk-lib/aws-lambda';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { LogGroup, MetricFilter, FilterPattern } from 'aws-cdk-lib/aws-logs';
import { Duration, Tags, RemovalPolicy } from 'aws-cdk-lib';
import { Canary, Runtime, Test } from 'aws-cdk-lib/aws-synthetics';
import { Code as SyntheticsCode } from 'aws-cdk-lib/aws-synthetics';
import { Schedule as SyntheticsSchedule } from 'aws-cdk-lib/aws-synthetics';
import { Bucket, BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Key, KeySpec, KeyUsage } from 'aws-cdk-lib/aws-kms';

export interface MonitoringConstructProps {
  /**
   * Environment name (dev, staging, prod)
   */
  environment: string;
  
  /**
   * Lambda functions to monitor
   */
  lambdaFunctions: LambdaFunction[];
  
  /**
   * API Gateway to monitor
   */
  restApi: RestApi;
  
  /**
   * DynamoDB table to monitor
   */
  dynamoTable: Table;
  
  /**
   * Cognito User Pool to monitor
   */
  userPool: UserPool;
  
  /**
   * Email addresses for alarm notifications
   */
  alertEmails: string[];
  
  /**
   * Slack webhook URL for notifications (optional)
   */
  slackWebhookUrl?: string;

  /**
   * Public health-check URL for synthetic monitoring
   */
  healthCheckUrl?: string;
}

export class MonitoringConstruct extends Construct {
  public readonly dashboard: Dashboard;
  public readonly alertTopic: Topic;
  public readonly alarms: Alarm[] = [];

  constructor(scope: Construct, id: string, props: MonitoringConstructProps) {
    super(scope, id);

    const {
      environment,
      lambdaFunctions,
      restApi,
      dynamoTable,
      userPool,
      alertEmails,
      slackWebhookUrl,
      healthCheckUrl,
    } = props;

    // Create SNS topic for alerts
    this.alertTopic = this.createAlertTopic(environment, alertEmails, slackWebhookUrl);

    // Create CloudWatch dashboard
    this.dashboard = this.createDashboard(environment, lambdaFunctions, restApi, dynamoTable, userPool);

    // Create alarms
    this.createAlarms(environment, lambdaFunctions, restApi, dynamoTable);

    // Create custom metrics and log-based metrics
    this.createCustomMetrics(environment, lambdaFunctions);

    // Create synthetic canary for health checks if URL provided
    if (healthCheckUrl) {
      this.createSyntheticsCanary(environment, healthCheckUrl);
    }
  }

  private createAlertTopic(environment: string, alertEmails: string[], slackWebhookUrl?: string): Topic {
    const topic = new Topic(this, 'AlertTopic', {
      topicName: `madmall-${environment}-alerts`,
      displayName: `MADMall ${environment} Alerts`,
    });

    // Add email subscriptions
    alertEmails.forEach((email, index) => {
      new Subscription(this, `EmailSubscription${index}`, {
        topic,
        protocol: SubscriptionProtocol.EMAIL,
        endpoint: email,
      });
    });

    // Add Slack webhook if provided
    if (slackWebhookUrl) {
      new Subscription(this, 'SlackSubscription', {
        topic,
        protocol: SubscriptionProtocol.HTTPS,
        endpoint: slackWebhookUrl,
      });
    }

    Tags.of(topic).add('Name', `madmall-${environment}-alert-topic`);
    Tags.of(topic).add('Environment', environment);

    return topic;
  }

  private createDashboard(
    environment: string,
    lambdaFunctions: LambdaFunction[],
    restApi: RestApi,
    dynamoTable: Table,
    userPool: UserPool
  ): Dashboard {
    const dashboard = new Dashboard(this, 'Dashboard', {
      dashboardName: `MADMall-${environment}-Overview`,
    });

    // Add title widget
    dashboard.addWidgets(
      new TextWidget({
        markdown: `# MADMall ${environment.toUpperCase()} Environment Dashboard\n\nReal-time monitoring and observability for the MADMall platform.`,
        width: 24,
        height: 2,
      })
    );

    // API Gateway metrics
    this.addApiGatewayWidgets(dashboard, restApi, environment);

    // Lambda function metrics
    this.addLambdaWidgets(dashboard, lambdaFunctions, environment);

    // DynamoDB metrics
    this.addDynamoDbWidgets(dashboard, dynamoTable, environment);

    // Cognito metrics
    this.addCognitoWidgets(dashboard, userPool, environment);

    // Error and performance widgets
    this.addErrorAndPerformanceWidgets(dashboard, environment);

    // Cost and usage widgets
    this.addCostAndUsageWidgets(dashboard, environment);

    Tags.of(dashboard).add('Name', `madmall-${environment}-dashboard`);
    Tags.of(dashboard).add('Environment', environment);

    return dashboard;
  }

  private addApiGatewayWidgets(dashboard: Dashboard, restApi: RestApi, environment: string): void {
    dashboard.addWidgets(
      new TextWidget({
        markdown: '## API Gateway Metrics',
        width: 24,
        height: 1,
      })
    );

    // API Gateway request count and latency
    dashboard.addWidgets(
      new GraphWidget({
        title: 'API Requests',
        left: [
          new Metric({
            namespace: 'AWS/ApiGateway',
            metricName: 'Count',
            dimensionsMap: {
              ApiName: restApi.restApiName,
              Stage: environment,
            },
            statistic: 'Sum',
          }),
        ],
        width: 12,
        height: 6,
      }),
      new GraphWidget({
        title: 'API Latency',
        left: [
          new Metric({
            namespace: 'AWS/ApiGateway',
            metricName: 'Latency',
            dimensionsMap: {
              ApiName: restApi.restApiName,
              Stage: environment,
            },
            statistic: 'Average',
          }),
        ],
        width: 12,
        height: 6,
      })
    );

    // API Gateway errors
    dashboard.addWidgets(
      new GraphWidget({
        title: 'API Errors',
        left: [
          new Metric({
            namespace: 'AWS/ApiGateway',
            metricName: '4XXError',
            dimensionsMap: {
              ApiName: restApi.restApiName,
              Stage: environment,
            },
            statistic: 'Sum',
          }),
          new Metric({
            namespace: 'AWS/ApiGateway',
            metricName: '5XXError',
            dimensionsMap: {
              ApiName: restApi.restApiName,
              Stage: environment,
            },
            statistic: 'Sum',
          }),
        ],
        width: 12,
        height: 6,
      }),
      new SingleValueWidget({
        title: 'API Success Rate',
        metrics: [
          new Metric({
            namespace: 'AWS/ApiGateway',
            metricName: 'Count',
            dimensionsMap: {
              ApiName: restApi.restApiName,
              Stage: environment,
            },
            statistic: 'Sum',
          }),
        ],
        width: 12,
        height: 6,
      })
    );
  }

  private addLambdaWidgets(dashboard: Dashboard, lambdaFunctions: LambdaFunction[], environment: string): void {
    dashboard.addWidgets(
      new TextWidget({
        markdown: '## Lambda Function Metrics',
        width: 24,
        height: 1,
      })
    );

    // Lambda invocations and duration
    const invocationMetrics = lambdaFunctions.map(fn => 
      new Metric({
        namespace: 'AWS/Lambda',
        metricName: 'Invocations',
        dimensionsMap: {
          FunctionName: fn.functionName,
        },
        statistic: 'Sum',
      })
    );

    const durationMetrics = lambdaFunctions.map(fn => 
      new Metric({
        namespace: 'AWS/Lambda',
        metricName: 'Duration',
        dimensionsMap: {
          FunctionName: fn.functionName,
        },
        statistic: 'Average',
      })
    );

    dashboard.addWidgets(
      new GraphWidget({
        title: 'Lambda Invocations',
        left: invocationMetrics,
        width: 12,
        height: 6,
      }),
      new GraphWidget({
        title: 'Lambda Duration',
        left: durationMetrics,
        width: 12,
        height: 6,
      })
    );

    // Lambda errors and throttles
    const errorMetrics = lambdaFunctions.map(fn => 
      new Metric({
        namespace: 'AWS/Lambda',
        metricName: 'Errors',
        dimensionsMap: {
          FunctionName: fn.functionName,
        },
        statistic: 'Sum',
      })
    );

    const throttleMetrics = lambdaFunctions.map(fn => 
      new Metric({
        namespace: 'AWS/Lambda',
        metricName: 'Throttles',
        dimensionsMap: {
          FunctionName: fn.functionName,
        },
        statistic: 'Sum',
      })
    );

    dashboard.addWidgets(
      new GraphWidget({
        title: 'Lambda Errors',
        left: errorMetrics,
        width: 12,
        height: 6,
      }),
      new GraphWidget({
        title: 'Lambda Throttles',
        left: throttleMetrics,
        width: 12,
        height: 6,
      })
    );
  }

  private addDynamoDbWidgets(dashboard: Dashboard, dynamoTable: Table, environment: string): void {
    dashboard.addWidgets(
      new TextWidget({
        markdown: '## DynamoDB Metrics',
        width: 24,
        height: 1,
      })
    );

    // DynamoDB read/write capacity and throttles
    dashboard.addWidgets(
      new GraphWidget({
        title: 'DynamoDB Read/Write Operations',
        left: [
          new Metric({
            namespace: 'AWS/DynamoDB',
            metricName: 'ConsumedReadCapacityUnits',
            dimensionsMap: {
              TableName: dynamoTable.tableName,
            },
            statistic: 'Sum',
          }),
          new Metric({
            namespace: 'AWS/DynamoDB',
            metricName: 'ConsumedWriteCapacityUnits',
            dimensionsMap: {
              TableName: dynamoTable.tableName,
            },
            statistic: 'Sum',
          }),
        ],
        width: 12,
        height: 6,
      }),
      new GraphWidget({
        title: 'DynamoDB Throttles',
        left: [
          new Metric({
            namespace: 'AWS/DynamoDB',
            metricName: 'ReadThrottles',
            dimensionsMap: {
              TableName: dynamoTable.tableName,
            },
            statistic: 'Sum',
          }),
          new Metric({
            namespace: 'AWS/DynamoDB',
            metricName: 'WriteThrottles',
            dimensionsMap: {
              TableName: dynamoTable.tableName,
            },
            statistic: 'Sum',
          }),
        ],
        width: 12,
        height: 6,
      })
    );
  }

  private addCognitoWidgets(dashboard: Dashboard, userPool: UserPool, environment: string): void {
    dashboard.addWidgets(
      new TextWidget({
        markdown: '## Authentication Metrics',
        width: 24,
        height: 1,
      })
    );

    // Cognito sign-ins and sign-ups
    dashboard.addWidgets(
      new GraphWidget({
        title: 'User Authentication',
        left: [
          new Metric({
            namespace: 'AWS/Cognito',
            metricName: 'SignInSuccesses',
            dimensionsMap: {
              UserPool: userPool.userPoolId,
            },
            statistic: 'Sum',
          }),
          new Metric({
            namespace: 'AWS/Cognito',
            metricName: 'SignUpSuccesses',
            dimensionsMap: {
              UserPool: userPool.userPoolId,
            },
            statistic: 'Sum',
          }),
        ],
        width: 12,
        height: 6,
      }),
      new GraphWidget({
        title: 'Authentication Failures',
        left: [
          new Metric({
            namespace: 'AWS/Cognito',
            metricName: 'SignInFailures',
            dimensionsMap: {
              UserPool: userPool.userPoolId,
            },
            statistic: 'Sum',
          }),
        ],
        width: 12,
        height: 6,
      })
    );
  }

  private addErrorAndPerformanceWidgets(dashboard: Dashboard, environment: string): void {
    dashboard.addWidgets(
      new TextWidget({
        markdown: '## Error Tracking and Performance',
        width: 24,
        height: 1,
      })
    );

    // Log-based error tracking
    dashboard.addWidgets(
      new LogQueryWidget({
        title: 'Recent Errors',
        logGroupNames: [`/aws/lambda/madmall-${environment}-*`],
        queryLines: [
          'fields @timestamp, @message',
          'filter @message like /ERROR/',
          'sort @timestamp desc',
          'limit 100',
        ],
        width: 24,
        height: 6,
      })
    );
  }

  private addCostAndUsageWidgets(dashboard: Dashboard, environment: string): void {
    dashboard.addWidgets(
      new TextWidget({
        markdown: '## Cost and Usage Optimization',
        width: 24,
        height: 1,
      })
    );

    // Cost metrics (these would need to be configured with Cost Explorer API)
    dashboard.addWidgets(
      new SingleValueWidget({
        title: 'Estimated Daily Cost',
        metrics: [
          // Placeholder - would need actual cost metrics
          new Metric({
            namespace: 'AWS/Billing',
            metricName: 'EstimatedCharges',
            dimensionsMap: {
              Currency: 'USD',
            },
            statistic: 'Maximum',
          }),
        ],
        width: 12,
        height: 6,
      })
    );
  }

  private createAlarms(
    environment: string,
    lambdaFunctions: LambdaFunction[],
    restApi: RestApi,
    dynamoTable: Table
  ): void {
    // API Gateway alarms
    const apiErrorAlarm = new Alarm(this, 'ApiErrorAlarm', {
      alarmName: `madmall-${environment}-api-errors`,
      alarmDescription: 'High error rate in API Gateway',
      metric: new Metric({
        namespace: 'AWS/ApiGateway',
        metricName: '5XXError',
        dimensionsMap: {
          ApiName: restApi.restApiName,
          Stage: environment,
        },
        statistic: 'Sum',
      }),
      threshold: 10,
      evaluationPeriods: 2,
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
    });

    apiErrorAlarm.addAlarmAction(new SnsAction(this.alertTopic));
    this.alarms.push(apiErrorAlarm);

    // Lambda function alarms
    lambdaFunctions.forEach((fn, index) => {
      const errorAlarm = new Alarm(this, `LambdaErrorAlarm${index}`, {
        alarmName: `madmall-${environment}-lambda-${fn.functionName}-errors`,
        alarmDescription: `High error rate in Lambda function ${fn.functionName}`,
        metric: new Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Errors',
          dimensionsMap: {
            FunctionName: fn.functionName,
          },
          statistic: 'Sum',
        }),
        threshold: 5,
        evaluationPeriods: 2,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: TreatMissingData.NOT_BREACHING,
      });

      errorAlarm.addAlarmAction(new SnsAction(this.alertTopic));
      this.alarms.push(errorAlarm);

      const durationAlarm = new Alarm(this, `LambdaDurationAlarm${index}`, {
        alarmName: `madmall-${environment}-lambda-${fn.functionName}-duration`,
        alarmDescription: `High duration in Lambda function ${fn.functionName}`,
        metric: new Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Duration',
          dimensionsMap: {
            FunctionName: fn.functionName,
          },
          statistic: 'Average',
        }),
        threshold: 10000, // 10 seconds
        evaluationPeriods: 3,
        comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: TreatMissingData.NOT_BREACHING,
      });

      durationAlarm.addAlarmAction(new SnsAction(this.alertTopic));
      this.alarms.push(durationAlarm);
    });

    // DynamoDB alarms
    const dynamoThrottleAlarm = new Alarm(this, 'DynamoThrottleAlarm', {
      alarmName: `madmall-${environment}-dynamo-throttles`,
      alarmDescription: 'DynamoDB throttling detected',
      metric: new Metric({
        namespace: 'AWS/DynamoDB',
        metricName: 'ReadThrottles',
        dimensionsMap: {
          TableName: dynamoTable.tableName,
        },
        statistic: 'Sum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
    });

    dynamoThrottleAlarm.addAlarmAction(new SnsAction(this.alertTopic));
    this.alarms.push(dynamoThrottleAlarm);
  }

  private createCustomMetrics(environment: string, lambdaFunctions: LambdaFunction[]): void {
    // Create custom metric filters for application-specific metrics
    lambdaFunctions.forEach((fn, index) => {
      const logGroup = LogGroup.fromLogGroupName(
        this,
        `LambdaLogGroup${index}`,
        `/aws/lambda/${fn.functionName}`
      );

      // Business logic error metric
      new MetricFilter(this, `BusinessErrorMetric${index}`, {
        logGroup,
        metricNamespace: 'MADMall/Application',
        metricName: 'BusinessLogicErrors',
        filterPattern: FilterPattern.stringValue('$.level', '=', 'ERROR'),
        metricValue: '1',
        defaultValue: 0,
      });

      // User action metric
      new MetricFilter(this, `UserActionMetric${index}`, {
        logGroup,
        metricNamespace: 'MADMall/Application',
        metricName: 'UserActions',
        filterPattern: FilterPattern.stringValue('$.eventType', '=', 'USER_ACTION'),
        metricValue: '1',
        defaultValue: 0,
      });
    });
  }

  private createSyntheticsCanary(environment: string, healthCheckUrl: string): void {
    // KMS key for Synthetics artifacts bucket
    const canaryKmsKey = new Key(this, 'SyntheticsKmsKey', {
      description: `MADMall ${environment} KMS key for Synthetics artifacts`,
      enableKeyRotation: true,
      keyUsage: KeyUsage.ENCRYPT_DECRYPT,
      keySpec: KeySpec.SYMMETRIC_DEFAULT,
      removalPolicy: environment === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    const artifactsBucket = new Bucket(this, 'SyntheticsBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      encryption: BucketEncryption.KMS,
      encryptionKey: canaryKmsKey,
      versioned: true,
      removalPolicy: environment === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== 'prod',
    });

    const canary = new Canary(this, 'HealthCanary', {
      canaryName: `madmall-${environment}-health`,
      schedule: SyntheticsSchedule.rate(Duration.minutes(5)),
      runtime: Runtime.SYNTHETICS_NODEJS_PUPPETEER_6_2,
      test: Test.custom({
        code: SyntheticsCode.fromInline(`const synthetics = require('Synthetics');
const log = require('SyntheticsLogger');
const https = require('https');
const url = '${healthCheckUrl}';
const request = async function () {
  let requestOptions = { hostname: new URL(url).hostname, path: new URL(url).pathname, method: 'GET' };
  let headers = { 'User-Agent': 'MADMall-Canary' };
  requestOptions['headers'] = headers;
  let stepConfig = { includeRequestHeaders: true, includeResponseHeaders: true, restrictedHeaders: [] };
  await synthetics.executeHttpStep('HealthCheck', requestOptions, stepConfig);
};
exports.handler = async () => { return await request(); };`),
        handler: 'index.handler',
      }),
      environmentVariables: { ENVIRONMENT: environment },
      artifactsBucketLocation: { bucket: artifactsBucket },
      startAfterCreation: true,
    });

    Tags.of(canary).add('Name', `madmall-${environment}-health-canary`);
    Tags.of(canary).add('Environment', environment);
  }
}