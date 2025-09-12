"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringConstruct = void 0;
const constructs_1 = require("constructs");
const aws_cloudwatch_1 = require("aws-cdk-lib/aws-cloudwatch");
const aws_cloudwatch_actions_1 = require("aws-cdk-lib/aws-cloudwatch-actions");
const aws_sns_1 = require("aws-cdk-lib/aws-sns");
const aws_logs_1 = require("aws-cdk-lib/aws-logs");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_synthetics_1 = require("aws-cdk-lib/aws-synthetics");
const aws_synthetics_2 = require("aws-cdk-lib/aws-synthetics");
const aws_synthetics_3 = require("aws-cdk-lib/aws-synthetics");
const aws_s3_1 = require("aws-cdk-lib/aws-s3");
const aws_kms_1 = require("aws-cdk-lib/aws-kms");
class MonitoringConstruct extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        this.alarms = [];
        const { environment, lambdaFunctions, restApi, dynamoTable, userPool, alertEmails, slackWebhookUrl, healthCheckUrl, } = props;
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
    createAlertTopic(environment, alertEmails, slackWebhookUrl) {
        const topic = new aws_sns_1.Topic(this, 'AlertTopic', {
            topicName: `madmall-${environment}-alerts`,
            displayName: `MADMall ${environment} Alerts`,
        });
        // Add email subscriptions
        alertEmails.forEach((email, index) => {
            new aws_sns_1.Subscription(this, `EmailSubscription${index}`, {
                topic,
                protocol: aws_sns_1.SubscriptionProtocol.EMAIL,
                endpoint: email,
            });
        });
        // Add Slack webhook if provided
        if (slackWebhookUrl) {
            new aws_sns_1.Subscription(this, 'SlackSubscription', {
                topic,
                protocol: aws_sns_1.SubscriptionProtocol.HTTPS,
                endpoint: slackWebhookUrl,
            });
        }
        aws_cdk_lib_1.Tags.of(topic).add('Name', `madmall-${environment}-alert-topic`);
        aws_cdk_lib_1.Tags.of(topic).add('Environment', environment);
        return topic;
    }
    createDashboard(environment, lambdaFunctions, restApi, dynamoTable, userPool) {
        const dashboard = new aws_cloudwatch_1.Dashboard(this, 'Dashboard', {
            dashboardName: `MADMall-${environment}-Overview`,
        });
        // Add title widget
        dashboard.addWidgets(new aws_cloudwatch_1.TextWidget({
            markdown: `# MADMall ${environment.toUpperCase()} Environment Dashboard\n\nReal-time monitoring and observability for the MADMall platform.`,
            width: 24,
            height: 2,
        }));
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
        aws_cdk_lib_1.Tags.of(dashboard).add('Name', `madmall-${environment}-dashboard`);
        aws_cdk_lib_1.Tags.of(dashboard).add('Environment', environment);
        return dashboard;
    }
    addApiGatewayWidgets(dashboard, restApi, environment) {
        dashboard.addWidgets(new aws_cloudwatch_1.TextWidget({
            markdown: '## API Gateway Metrics',
            width: 24,
            height: 1,
        }));
        // API Gateway request count and latency
        dashboard.addWidgets(new aws_cloudwatch_1.GraphWidget({
            title: 'API Requests',
            left: [
                new aws_cloudwatch_1.Metric({
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
        }), new aws_cloudwatch_1.GraphWidget({
            title: 'API Latency',
            left: [
                new aws_cloudwatch_1.Metric({
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
        }));
        // API Gateway errors
        dashboard.addWidgets(new aws_cloudwatch_1.GraphWidget({
            title: 'API Errors',
            left: [
                new aws_cloudwatch_1.Metric({
                    namespace: 'AWS/ApiGateway',
                    metricName: '4XXError',
                    dimensionsMap: {
                        ApiName: restApi.restApiName,
                        Stage: environment,
                    },
                    statistic: 'Sum',
                }),
                new aws_cloudwatch_1.Metric({
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
        }), new aws_cloudwatch_1.SingleValueWidget({
            title: 'API Success Rate',
            metrics: [
                new aws_cloudwatch_1.Metric({
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
        }));
    }
    addLambdaWidgets(dashboard, lambdaFunctions, environment) {
        dashboard.addWidgets(new aws_cloudwatch_1.TextWidget({
            markdown: '## Lambda Function Metrics',
            width: 24,
            height: 1,
        }));
        // Lambda invocations and duration
        const invocationMetrics = lambdaFunctions.map(fn => new aws_cloudwatch_1.Metric({
            namespace: 'AWS/Lambda',
            metricName: 'Invocations',
            dimensionsMap: {
                FunctionName: fn.functionName,
            },
            statistic: 'Sum',
        }));
        const durationMetrics = lambdaFunctions.map(fn => new aws_cloudwatch_1.Metric({
            namespace: 'AWS/Lambda',
            metricName: 'Duration',
            dimensionsMap: {
                FunctionName: fn.functionName,
            },
            statistic: 'Average',
        }));
        dashboard.addWidgets(new aws_cloudwatch_1.GraphWidget({
            title: 'Lambda Invocations',
            left: invocationMetrics,
            width: 12,
            height: 6,
        }), new aws_cloudwatch_1.GraphWidget({
            title: 'Lambda Duration',
            left: durationMetrics,
            width: 12,
            height: 6,
        }));
        // Lambda errors and throttles
        const errorMetrics = lambdaFunctions.map(fn => new aws_cloudwatch_1.Metric({
            namespace: 'AWS/Lambda',
            metricName: 'Errors',
            dimensionsMap: {
                FunctionName: fn.functionName,
            },
            statistic: 'Sum',
        }));
        const throttleMetrics = lambdaFunctions.map(fn => new aws_cloudwatch_1.Metric({
            namespace: 'AWS/Lambda',
            metricName: 'Throttles',
            dimensionsMap: {
                FunctionName: fn.functionName,
            },
            statistic: 'Sum',
        }));
        dashboard.addWidgets(new aws_cloudwatch_1.GraphWidget({
            title: 'Lambda Errors',
            left: errorMetrics,
            width: 12,
            height: 6,
        }), new aws_cloudwatch_1.GraphWidget({
            title: 'Lambda Throttles',
            left: throttleMetrics,
            width: 12,
            height: 6,
        }));
    }
    addDynamoDbWidgets(dashboard, dynamoTable, environment) {
        dashboard.addWidgets(new aws_cloudwatch_1.TextWidget({
            markdown: '## DynamoDB Metrics',
            width: 24,
            height: 1,
        }));
        // DynamoDB read/write capacity and throttles
        dashboard.addWidgets(new aws_cloudwatch_1.GraphWidget({
            title: 'DynamoDB Read/Write Operations',
            left: [
                new aws_cloudwatch_1.Metric({
                    namespace: 'AWS/DynamoDB',
                    metricName: 'ConsumedReadCapacityUnits',
                    dimensionsMap: {
                        TableName: dynamoTable.tableName,
                    },
                    statistic: 'Sum',
                }),
                new aws_cloudwatch_1.Metric({
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
        }), new aws_cloudwatch_1.GraphWidget({
            title: 'DynamoDB Throttles',
            left: [
                new aws_cloudwatch_1.Metric({
                    namespace: 'AWS/DynamoDB',
                    metricName: 'ReadThrottles',
                    dimensionsMap: {
                        TableName: dynamoTable.tableName,
                    },
                    statistic: 'Sum',
                }),
                new aws_cloudwatch_1.Metric({
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
        }));
    }
    addCognitoWidgets(dashboard, userPool, environment) {
        dashboard.addWidgets(new aws_cloudwatch_1.TextWidget({
            markdown: '## Authentication Metrics',
            width: 24,
            height: 1,
        }));
        // Cognito sign-ins and sign-ups
        dashboard.addWidgets(new aws_cloudwatch_1.GraphWidget({
            title: 'User Authentication',
            left: [
                new aws_cloudwatch_1.Metric({
                    namespace: 'AWS/Cognito',
                    metricName: 'SignInSuccesses',
                    dimensionsMap: {
                        UserPool: userPool.userPoolId,
                    },
                    statistic: 'Sum',
                }),
                new aws_cloudwatch_1.Metric({
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
        }), new aws_cloudwatch_1.GraphWidget({
            title: 'Authentication Failures',
            left: [
                new aws_cloudwatch_1.Metric({
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
        }));
    }
    addErrorAndPerformanceWidgets(dashboard, environment) {
        dashboard.addWidgets(new aws_cloudwatch_1.TextWidget({
            markdown: '## Error Tracking and Performance',
            width: 24,
            height: 1,
        }));
        // Log-based error tracking
        dashboard.addWidgets(new aws_cloudwatch_1.LogQueryWidget({
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
        }));
    }
    addCostAndUsageWidgets(dashboard, environment) {
        dashboard.addWidgets(new aws_cloudwatch_1.TextWidget({
            markdown: '## Cost and Usage Optimization',
            width: 24,
            height: 1,
        }));
        // Cost metrics (these would need to be configured with Cost Explorer API)
        dashboard.addWidgets(new aws_cloudwatch_1.SingleValueWidget({
            title: 'Estimated Daily Cost',
            metrics: [
                // Placeholder - would need actual cost metrics
                new aws_cloudwatch_1.Metric({
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
        }));
    }
    createAlarms(environment, lambdaFunctions, restApi, dynamoTable) {
        // API Gateway alarms
        const apiErrorAlarm = new aws_cloudwatch_1.Alarm(this, 'ApiErrorAlarm', {
            alarmName: `madmall-${environment}-api-errors`,
            alarmDescription: 'High error rate in API Gateway',
            metric: new aws_cloudwatch_1.Metric({
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
            comparisonOperator: aws_cloudwatch_1.ComparisonOperator.GREATER_THAN_THRESHOLD,
            treatMissingData: aws_cloudwatch_1.TreatMissingData.NOT_BREACHING,
        });
        apiErrorAlarm.addAlarmAction(new aws_cloudwatch_actions_1.SnsAction(this.alertTopic));
        this.alarms.push(apiErrorAlarm);
        // Lambda function alarms
        lambdaFunctions.forEach((fn, index) => {
            const errorAlarm = new aws_cloudwatch_1.Alarm(this, `LambdaErrorAlarm${index}`, {
                alarmName: `madmall-${environment}-lambda-${fn.functionName}-errors`,
                alarmDescription: `High error rate in Lambda function ${fn.functionName}`,
                metric: new aws_cloudwatch_1.Metric({
                    namespace: 'AWS/Lambda',
                    metricName: 'Errors',
                    dimensionsMap: {
                        FunctionName: fn.functionName,
                    },
                    statistic: 'Sum',
                }),
                threshold: 5,
                evaluationPeriods: 2,
                comparisonOperator: aws_cloudwatch_1.ComparisonOperator.GREATER_THAN_THRESHOLD,
                treatMissingData: aws_cloudwatch_1.TreatMissingData.NOT_BREACHING,
            });
            errorAlarm.addAlarmAction(new aws_cloudwatch_actions_1.SnsAction(this.alertTopic));
            this.alarms.push(errorAlarm);
            const durationAlarm = new aws_cloudwatch_1.Alarm(this, `LambdaDurationAlarm${index}`, {
                alarmName: `madmall-${environment}-lambda-${fn.functionName}-duration`,
                alarmDescription: `High duration in Lambda function ${fn.functionName}`,
                metric: new aws_cloudwatch_1.Metric({
                    namespace: 'AWS/Lambda',
                    metricName: 'Duration',
                    dimensionsMap: {
                        FunctionName: fn.functionName,
                    },
                    statistic: 'Average',
                }),
                threshold: 10000, // 10 seconds
                evaluationPeriods: 3,
                comparisonOperator: aws_cloudwatch_1.ComparisonOperator.GREATER_THAN_THRESHOLD,
                treatMissingData: aws_cloudwatch_1.TreatMissingData.NOT_BREACHING,
            });
            durationAlarm.addAlarmAction(new aws_cloudwatch_actions_1.SnsAction(this.alertTopic));
            this.alarms.push(durationAlarm);
        });
        // DynamoDB alarms
        const dynamoThrottleAlarm = new aws_cloudwatch_1.Alarm(this, 'DynamoThrottleAlarm', {
            alarmName: `madmall-${environment}-dynamo-throttles`,
            alarmDescription: 'DynamoDB throttling detected',
            metric: new aws_cloudwatch_1.Metric({
                namespace: 'AWS/DynamoDB',
                metricName: 'ReadThrottles',
                dimensionsMap: {
                    TableName: dynamoTable.tableName,
                },
                statistic: 'Sum',
            }),
            threshold: 1,
            evaluationPeriods: 1,
            comparisonOperator: aws_cloudwatch_1.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
            treatMissingData: aws_cloudwatch_1.TreatMissingData.NOT_BREACHING,
        });
        dynamoThrottleAlarm.addAlarmAction(new aws_cloudwatch_actions_1.SnsAction(this.alertTopic));
        this.alarms.push(dynamoThrottleAlarm);
    }
    createCustomMetrics(environment, lambdaFunctions) {
        // Create custom metric filters for application-specific metrics
        lambdaFunctions.forEach((fn, index) => {
            const logGroup = aws_logs_1.LogGroup.fromLogGroupName(this, `LambdaLogGroup${index}`, `/aws/lambda/${fn.functionName}`);
            // Business logic error metric
            new aws_logs_1.MetricFilter(this, `BusinessErrorMetric${index}`, {
                logGroup,
                metricNamespace: 'MADMall/Application',
                metricName: 'BusinessLogicErrors',
                filterPattern: aws_logs_1.FilterPattern.stringValue('$.level', '=', 'ERROR'),
                metricValue: '1',
                defaultValue: 0,
            });
            // User action metric
            new aws_logs_1.MetricFilter(this, `UserActionMetric${index}`, {
                logGroup,
                metricNamespace: 'MADMall/Application',
                metricName: 'UserActions',
                filterPattern: aws_logs_1.FilterPattern.stringValue('$.eventType', '=', 'USER_ACTION'),
                metricValue: '1',
                defaultValue: 0,
            });
        });
    }
    createSyntheticsCanary(environment, healthCheckUrl) {
        // KMS key for Synthetics artifacts bucket
        const canaryKmsKey = new aws_kms_1.Key(this, 'SyntheticsKmsKey', {
            description: `MADMall ${environment} KMS key for Synthetics artifacts`,
            enableKeyRotation: true,
            keyUsage: aws_kms_1.KeyUsage.ENCRYPT_DECRYPT,
            keySpec: aws_kms_1.KeySpec.SYMMETRIC_DEFAULT,
            removalPolicy: environment === 'prod' ? aws_cdk_lib_1.RemovalPolicy.RETAIN : aws_cdk_lib_1.RemovalPolicy.DESTROY,
        });
        const artifactsBucket = new aws_s3_1.Bucket(this, 'SyntheticsBucket', {
            blockPublicAccess: aws_s3_1.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
            encryption: aws_s3_1.BucketEncryption.KMS,
            encryptionKey: canaryKmsKey,
            versioned: true,
            removalPolicy: environment === 'prod' ? aws_cdk_lib_1.RemovalPolicy.RETAIN : aws_cdk_lib_1.RemovalPolicy.DESTROY,
            autoDeleteObjects: environment !== 'prod',
        });
        const canary = new aws_synthetics_1.Canary(this, 'HealthCanary', {
            canaryName: `madmall-${environment}-health`,
            schedule: aws_synthetics_3.Schedule.rate(aws_cdk_lib_1.Duration.minutes(5)),
            runtime: aws_synthetics_1.Runtime.SYNTHETICS_NODEJS_PUPPETEER_6_2,
            test: aws_synthetics_1.Test.custom({
                code: aws_synthetics_2.Code.fromInline(`const synthetics = require('Synthetics');
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
        aws_cdk_lib_1.Tags.of(canary).add('Name', `madmall-${environment}-health-canary`);
        aws_cdk_lib_1.Tags.of(canary).add('Environment', environment);
    }
}
exports.MonitoringConstruct = MonitoringConstruct;
//# sourceMappingURL=monitoring.js.map