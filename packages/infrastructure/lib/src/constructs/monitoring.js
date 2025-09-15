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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uaXRvcmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb25zdHJ1Y3RzL21vbml0b3JpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQXVDO0FBQ3ZDLCtEQVVvQztBQUNwQywrRUFBK0Q7QUFDL0QsaURBQWdGO0FBS2hGLG1EQUE2RTtBQUM3RSw2Q0FBNEQ7QUFDNUQsK0RBQW1FO0FBQ25FLCtEQUFvRTtBQUNwRSwrREFBNEU7QUFDNUUsK0NBQWlGO0FBQ2pGLGlEQUE2RDtBQTRDN0QsTUFBYSxtQkFBb0IsU0FBUSxzQkFBUztJQUtoRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQStCO1FBQ3ZFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFISCxXQUFNLEdBQVksRUFBRSxDQUFDO1FBS25DLE1BQU0sRUFDSixXQUFXLEVBQ1gsZUFBZSxFQUNmLE9BQU8sRUFDUCxXQUFXLEVBQ1gsUUFBUSxFQUNSLFdBQVcsRUFDWCxlQUFlLEVBQ2YsY0FBYyxHQUNmLEdBQUcsS0FBSyxDQUFDO1FBRVYsOEJBQThCO1FBQzlCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFbkYsOEJBQThCO1FBQzlCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFcEcsZ0JBQWdCO1FBQ2hCLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFdEUsOENBQThDO1FBQzlDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFdkQsNERBQTREO1FBQzVELElBQUks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QWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLDJCQUFhLENBQUMsT0FBTztZQUNwRixpQkFBaUIsRUFBRSxXQUFXLEtBQUssTUFBTTtTQUMxQyxDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxJQUFJLHVCQUFNLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUM5QyxVQUFVLEVBQUUsV0FBVyxXQUFXLFNBQVM7WUFDM0MsUUFBUSxFQUFFLHlCQUFrQixDQUFDLElBQUksQ0FBQyxzQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RCxPQUFPLEVBQUUsd0JBQU8sQ0FBQywrQkFBK0I7WUFDaEQsSUFBSSxFQUFFLHFCQUFJLENBQUMsTUFBTSxDQUFDO2dCQUNoQixJQUFJLEVBQUUscUJBQWMsQ0FBQyxVQUFVLENBQUM7OztlQUd6QixjQUFjOzs7Ozs7OzsyREFROEIsQ0FBQztnQkFDcEQsT0FBTyxFQUFFLGVBQWU7YUFDekIsQ0FBQztZQUNGLG9CQUFvQixFQUFFLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRTtZQUNsRCx1QkFBdUIsRUFBRSxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUU7WUFDcEQsa0JBQWtCLEVBQUUsSUFBSTtTQUN6QixDQUFDLENBQUM7UUFFSCxrQkFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFdBQVcsV0FBVyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3BFLGtCQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDbEQsQ0FBQztDQUNGO0FBbm5CRCxrREFtbkJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQge1xuICBEYXNoYm9hcmQsXG4gIEdyYXBoV2lkZ2V0LFxuICBNZXRyaWMsXG4gIFNpbmdsZVZhbHVlV2lkZ2V0LFxuICBMb2dRdWVyeVdpZGdldCxcbiAgVGV4dFdpZGdldCxcbiAgQWxhcm0sXG4gIENvbXBhcmlzb25PcGVyYXRvcixcbiAgVHJlYXRNaXNzaW5nRGF0YSxcbn0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNsb3Vkd2F0Y2gnO1xuaW1wb3J0IHsgU25zQWN0aW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNsb3Vkd2F0Y2gtYWN0aW9ucyc7XG5pbXBvcnQgeyBUb3BpYywgU3Vic2NyaXB0aW9uLCBTdWJzY3JpcHRpb25Qcm90b2NvbCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zbnMnO1xuaW1wb3J0IHsgRnVuY3Rpb24gYXMgTGFtYmRhRnVuY3Rpb24sIElGdW5jdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgUmVzdEFwaSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCB7IFRhYmxlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcbmltcG9ydCB7IFVzZXJQb29sIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNvZ25pdG8nO1xuaW1wb3J0IHsgTG9nR3JvdXAsIE1ldHJpY0ZpbHRlciwgRmlsdGVyUGF0dGVybiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJztcbmltcG9ydCB7IER1cmF0aW9uLCBUYWdzLCBSZW1vdmFsUG9saWN5IH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ2FuYXJ5LCBSdW50aW1lLCBUZXN0IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXN5bnRoZXRpY3MnO1xuaW1wb3J0IHsgQ29kZSBhcyBTeW50aGV0aWNzQ29kZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zeW50aGV0aWNzJztcbmltcG9ydCB7IFNjaGVkdWxlIGFzIFN5bnRoZXRpY3NTY2hlZHVsZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zeW50aGV0aWNzJztcbmltcG9ydCB7IEJ1Y2tldCwgQmxvY2tQdWJsaWNBY2Nlc3MsIEJ1Y2tldEVuY3J5cHRpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xuaW1wb3J0IHsgS2V5LCBLZXlTcGVjLCBLZXlVc2FnZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1rbXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE1vbml0b3JpbmdDb25zdHJ1Y3RQcm9wcyB7XG4gIC8qKlxuICAgKiBFbnZpcm9ubWVudCBuYW1lIChkZXYsIHN0YWdpbmcsIHByb2QpXG4gICAqL1xuICBlbnZpcm9ubWVudDogc3RyaW5nO1xuICBcbiAgLyoqXG4gICAqIExhbWJkYSBmdW5jdGlvbnMgdG8gbW9uaXRvclxuICAgKi9cbiAgbGFtYmRhRnVuY3Rpb25zOiBMYW1iZGFGdW5jdGlvbltdO1xuICBcbiAgLyoqXG4gICAqIEFQSSBHYXRld2F5IHRvIG1vbml0b3JcbiAgICovXG4gIHJlc3RBcGk6IFJlc3RBcGk7XG4gIFxuICAvKipcbiAgICogRHluYW1vREIgdGFibGUgdG8gbW9uaXRvclxuICAgKi9cbiAgZHluYW1vVGFibGU6IFRhYmxlO1xuICBcbiAgLyoqXG4gICAqIENvZ25pdG8gVXNlciBQb29sIHRvIG1vbml0b3JcbiAgICovXG4gIHVzZXJQb29sOiBVc2VyUG9vbDtcbiAgXG4gIC8qKlxuICAgKiBFbWFpbCBhZGRyZXNzZXMgZm9yIGFsYXJtIG5vdGlmaWNhdGlvbnNcbiAgICovXG4gIGFsZXJ0RW1haWxzOiBzdHJpbmdbXTtcbiAgXG4gIC8qKlxuICAgKiBTbGFjayB3ZWJob29rIFVSTCBmb3Igbm90aWZpY2F0aW9ucyAob3B0aW9uYWwpXG4gICAqL1xuICBzbGFja1dlYmhvb2tVcmw/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFB1YmxpYyBoZWFsdGgtY2hlY2sgVVJMIGZvciBzeW50aGV0aWMgbW9uaXRvcmluZ1xuICAgKi9cbiAgaGVhbHRoQ2hlY2tVcmw/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBNb25pdG9yaW5nQ29uc3RydWN0IGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgcHVibGljIHJlYWRvbmx5IGRhc2hib2FyZDogRGFzaGJvYXJkO1xuICBwdWJsaWMgcmVhZG9ubHkgYWxlcnRUb3BpYzogVG9waWM7XG4gIHB1YmxpYyByZWFkb25seSBhbGFybXM6IEFsYXJtW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogTW9uaXRvcmluZ0NvbnN0cnVjdFByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgIGNvbnN0IHtcbiAgICAgIGVudmlyb25tZW50LFxuICAgICAgbGFtYmRhRnVuY3Rpb25zLFxuICAgICAgcmVzdEFwaSxcbiAgICAgIGR5bmFtb1RhYmxlLFxuICAgICAgdXNlclBvb2wsXG4gICAgICBhbGVydEVtYWlscyxcbiAgICAgIHNsYWNrV2ViaG9va1VybCxcbiAgICAgIGhlYWx0aENoZWNrVXJsLFxuICAgIH0gPSBwcm9wcztcblxuICAgIC8vIENyZWF0ZSBTTlMgdG9waWMgZm9yIGFsZXJ0c1xuICAgIHRoaXMuYWxlcnRUb3BpYyA9IHRoaXMuY3JlYXRlQWxlcnRUb3BpYyhlbnZpcm9ubWVudCwgYWxlcnRFbWFpbHMsIHNsYWNrV2ViaG9va1VybCk7XG5cbiAgICAvLyBDcmVhdGUgQ2xvdWRXYXRjaCBkYXNoYm9hcmRcbiAgICB0aGlzLmRhc2hib2FyZCA9IHRoaXMuY3JlYXRlRGFzaGJvYXJkKGVudmlyb25tZW50LCBsYW1iZGFGdW5jdGlvbnMsIHJlc3RBcGksIGR5bmFtb1RhYmxlLCB1c2VyUG9vbCk7XG5cbiAgICAvLyBDcmVhdGUgYWxhcm1zXG4gICAgdGhpcy5jcmVhdGVBbGFybXMoZW52aXJvbm1lbnQsIGxhbWJkYUZ1bmN0aW9ucywgcmVzdEFwaSwgZHluYW1vVGFibGUpO1xuXG4gICAgLy8gQ3JlYXRlIGN1c3RvbSBtZXRyaWNzIGFuZCBsb2ctYmFzZWQgbWV0cmljc1xuICAgIHRoaXMuY3JlYXRlQ3VzdG9tTWV0cmljcyhlbnZpcm9ubWVudCwgbGFtYmRhRnVuY3Rpb25zKTtcblxuICAgIC8vIENyZWF0ZSBzeW50aGV0aWMgY2FuYXJ5IGZvciBoZWFsdGggY2hlY2tzIGlmIFVSTCBwcm92aWRlZFxuICAgIGlmIChoZWFsdGhDaGVja1VybCkge1xuICAgICAgdGhpcy5jcmVhdGVTeW50aGV0aWNzQ2FuYXJ5KGVudmlyb25tZW50LCBoZWFsdGhDaGVja1VybCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVBbGVydFRvcGljKGVudmlyb25tZW50OiBzdHJpbmcsIGFsZXJ0RW1haWxzOiBzdHJpbmdbXSwgc2xhY2tXZWJob29rVXJsPzogc3RyaW5nKTogVG9waWMge1xuICAgIGNvbnN0IHRvcGljID0gbmV3IFRvcGljKHRoaXMsICdBbGVydFRvcGljJywge1xuICAgICAgdG9waWNOYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1hbGVydHNgLFxuICAgICAgZGlzcGxheU5hbWU6IGBNQURNYWxsICR7ZW52aXJvbm1lbnR9IEFsZXJ0c2AsXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgZW1haWwgc3Vic2NyaXB0aW9uc1xuICAgIGFsZXJ0RW1haWxzLmZvckVhY2goKGVtYWlsLCBpbmRleCkgPT4ge1xuICAgICAgbmV3IFN1YnNjcmlwdGlvbih0aGlzLCBgRW1haWxTdWJzY3JpcHRpb24ke2luZGV4fWAsIHtcbiAgICAgICAgdG9waWMsXG4gICAgICAgIHByb3RvY29sOiBTdWJzY3JpcHRpb25Qcm90b2NvbC5FTUFJTCxcbiAgICAgICAgZW5kcG9pbnQ6IGVtYWlsLFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgU2xhY2sgd2ViaG9vayBpZiBwcm92aWRlZFxuICAgIGlmIChzbGFja1dlYmhvb2tVcmwpIHtcbiAgICAgIG5ldyBTdWJzY3JpcHRpb24odGhpcywgJ1NsYWNrU3Vic2NyaXB0aW9uJywge1xuICAgICAgICB0b3BpYyxcbiAgICAgICAgcHJvdG9jb2w6IFN1YnNjcmlwdGlvblByb3RvY29sLkhUVFBTLFxuICAgICAgICBlbmRwb2ludDogc2xhY2tXZWJob29rVXJsLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgVGFncy5vZih0b3BpYykuYWRkKCdOYW1lJywgYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tYWxlcnQtdG9waWNgKTtcbiAgICBUYWdzLm9mKHRvcGljKS5hZGQoJ0Vudmlyb25tZW50JywgZW52aXJvbm1lbnQpO1xuXG4gICAgcmV0dXJuIHRvcGljO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVEYXNoYm9hcmQoXG4gICAgZW52aXJvbm1lbnQ6IHN0cmluZyxcbiAgICBsYW1iZGFGdW5jdGlvbnM6IExhbWJkYUZ1bmN0aW9uW10sXG4gICAgcmVzdEFwaTogUmVzdEFwaSxcbiAgICBkeW5hbW9UYWJsZTogVGFibGUsXG4gICAgdXNlclBvb2w6IFVzZXJQb29sXG4gICk6IERhc2hib2FyZCB7XG4gICAgY29uc3QgZGFzaGJvYXJkID0gbmV3IERhc2hib2FyZCh0aGlzLCAnRGFzaGJvYXJkJywge1xuICAgICAgZGFzaGJvYXJkTmFtZTogYE1BRE1hbGwtJHtlbnZpcm9ubWVudH0tT3ZlcnZpZXdgLFxuICAgIH0pO1xuXG4gICAgLy8gQWRkIHRpdGxlIHdpZGdldFxuICAgIGRhc2hib2FyZC5hZGRXaWRnZXRzKFxuICAgICAgbmV3IFRleHRXaWRnZXQoe1xuICAgICAgICBtYXJrZG93bjogYCMgTUFETWFsbCAke2Vudmlyb25tZW50LnRvVXBwZXJDYXNlKCl9IEVudmlyb25tZW50IERhc2hib2FyZFxcblxcblJlYWwtdGltZSBtb25pdG9yaW5nIGFuZCBvYnNlcnZhYmlsaXR5IGZvciB0aGUgTUFETWFsbCBwbGF0Zm9ybS5gLFxuICAgICAgICB3aWR0aDogMjQsXG4gICAgICAgIGhlaWdodDogMixcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIC8vIEFQSSBHYXRld2F5IG1ldHJpY3NcbiAgICB0aGlzLmFkZEFwaUdhdGV3YXlXaWRnZXRzKGRhc2hib2FyZCwgcmVzdEFwaSwgZW52aXJvbm1lbnQpO1xuXG4gICAgLy8gTGFtYmRhIGZ1bmN0aW9uIG1ldHJpY3NcbiAgICB0aGlzLmFkZExhbWJkYVdpZGdldHMoZGFzaGJvYXJkLCBsYW1iZGFGdW5jdGlvbnMsIGVudmlyb25tZW50KTtcblxuICAgIC8vIER5bmFtb0RCIG1ldHJpY3NcbiAgICB0aGlzLmFkZER5bmFtb0RiV2lkZ2V0cyhkYXNoYm9hcmQsIGR5bmFtb1RhYmxlLCBlbnZpcm9ubWVudCk7XG5cbiAgICAvLyBDb2duaXRvIG1ldHJpY3NcbiAgICB0aGlzLmFkZENvZ25pdG9XaWRnZXRzKGRhc2hib2FyZCwgdXNlclBvb2wsIGVudmlyb25tZW50KTtcblxuICAgIC8vIEVycm9yIGFuZCBwZXJmb3JtYW5jZSB3aWRnZXRzXG4gICAgdGhpcy5hZGRFcnJvckFuZFBlcmZvcm1hbmNlV2lkZ2V0cyhkYXNoYm9hcmQsIGVudmlyb25tZW50KTtcblxuICAgIC8vIENvc3QgYW5kIHVzYWdlIHdpZGdldHNcbiAgICB0aGlzLmFkZENvc3RBbmRVc2FnZVdpZGdldHMoZGFzaGJvYXJkLCBlbnZpcm9ubWVudCk7XG5cbiAgICBUYWdzLm9mKGRhc2hib2FyZCkuYWRkKCdOYW1lJywgYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tZGFzaGJvYXJkYCk7XG4gICAgVGFncy5vZihkYXNoYm9hcmQpLmFkZCgnRW52aXJvbm1lbnQnLCBlbnZpcm9ubWVudCk7XG5cbiAgICByZXR1cm4gZGFzaGJvYXJkO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRBcGlHYXRld2F5V2lkZ2V0cyhkYXNoYm9hcmQ6IERhc2hib2FyZCwgcmVzdEFwaTogUmVzdEFwaSwgZW52aXJvbm1lbnQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGRhc2hib2FyZC5hZGRXaWRnZXRzKFxuICAgICAgbmV3IFRleHRXaWRnZXQoe1xuICAgICAgICBtYXJrZG93bjogJyMjIEFQSSBHYXRld2F5IE1ldHJpY3MnLFxuICAgICAgICB3aWR0aDogMjQsXG4gICAgICAgIGhlaWdodDogMSxcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIC8vIEFQSSBHYXRld2F5IHJlcXVlc3QgY291bnQgYW5kIGxhdGVuY3lcbiAgICBkYXNoYm9hcmQuYWRkV2lkZ2V0cyhcbiAgICAgIG5ldyBHcmFwaFdpZGdldCh7XG4gICAgICAgIHRpdGxlOiAnQVBJIFJlcXVlc3RzJyxcbiAgICAgICAgbGVmdDogW1xuICAgICAgICAgIG5ldyBNZXRyaWMoe1xuICAgICAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0FwaUdhdGV3YXknLFxuICAgICAgICAgICAgbWV0cmljTmFtZTogJ0NvdW50JyxcbiAgICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICAgICAgQXBpTmFtZTogcmVzdEFwaS5yZXN0QXBpTmFtZSxcbiAgICAgICAgICAgICAgU3RhZ2U6IGVudmlyb25tZW50LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICAgIHdpZHRoOiAxMixcbiAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgfSksXG4gICAgICBuZXcgR3JhcGhXaWRnZXQoe1xuICAgICAgICB0aXRsZTogJ0FQSSBMYXRlbmN5JyxcbiAgICAgICAgbGVmdDogW1xuICAgICAgICAgIG5ldyBNZXRyaWMoe1xuICAgICAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0FwaUdhdGV3YXknLFxuICAgICAgICAgICAgbWV0cmljTmFtZTogJ0xhdGVuY3knLFxuICAgICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgICBBcGlOYW1lOiByZXN0QXBpLnJlc3RBcGlOYW1lLFxuICAgICAgICAgICAgICBTdGFnZTogZW52aXJvbm1lbnQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RhdGlzdGljOiAnQXZlcmFnZScsXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICAgIHdpZHRoOiAxMixcbiAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgLy8gQVBJIEdhdGV3YXkgZXJyb3JzXG4gICAgZGFzaGJvYXJkLmFkZFdpZGdldHMoXG4gICAgICBuZXcgR3JhcGhXaWRnZXQoe1xuICAgICAgICB0aXRsZTogJ0FQSSBFcnJvcnMnLFxuICAgICAgICBsZWZ0OiBbXG4gICAgICAgICAgbmV3IE1ldHJpYyh7XG4gICAgICAgICAgICBuYW1lc3BhY2U6ICdBV1MvQXBpR2F0ZXdheScsXG4gICAgICAgICAgICBtZXRyaWNOYW1lOiAnNFhYRXJyb3InLFxuICAgICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgICBBcGlOYW1lOiByZXN0QXBpLnJlc3RBcGlOYW1lLFxuICAgICAgICAgICAgICBTdGFnZTogZW52aXJvbm1lbnQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RhdGlzdGljOiAnU3VtJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBuZXcgTWV0cmljKHtcbiAgICAgICAgICAgIG5hbWVzcGFjZTogJ0FXUy9BcGlHYXRld2F5JyxcbiAgICAgICAgICAgIG1ldHJpY05hbWU6ICc1WFhFcnJvcicsXG4gICAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICAgIEFwaU5hbWU6IHJlc3RBcGkucmVzdEFwaU5hbWUsXG4gICAgICAgICAgICAgIFN0YWdlOiBlbnZpcm9ubWVudCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgICB3aWR0aDogMTIsXG4gICAgICAgIGhlaWdodDogNixcbiAgICAgIH0pLFxuICAgICAgbmV3IFNpbmdsZVZhbHVlV2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdBUEkgU3VjY2VzcyBSYXRlJyxcbiAgICAgICAgbWV0cmljczogW1xuICAgICAgICAgIG5ldyBNZXRyaWMoe1xuICAgICAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0FwaUdhdGV3YXknLFxuICAgICAgICAgICAgbWV0cmljTmFtZTogJ0NvdW50JyxcbiAgICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICAgICAgQXBpTmFtZTogcmVzdEFwaS5yZXN0QXBpTmFtZSxcbiAgICAgICAgICAgICAgU3RhZ2U6IGVudmlyb25tZW50LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICAgIHdpZHRoOiAxMixcbiAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRMYW1iZGFXaWRnZXRzKGRhc2hib2FyZDogRGFzaGJvYXJkLCBsYW1iZGFGdW5jdGlvbnM6IExhbWJkYUZ1bmN0aW9uW10sIGVudmlyb25tZW50OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBkYXNoYm9hcmQuYWRkV2lkZ2V0cyhcbiAgICAgIG5ldyBUZXh0V2lkZ2V0KHtcbiAgICAgICAgbWFya2Rvd246ICcjIyBMYW1iZGEgRnVuY3Rpb24gTWV0cmljcycsXG4gICAgICAgIHdpZHRoOiAyNCxcbiAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgLy8gTGFtYmRhIGludm9jYXRpb25zIGFuZCBkdXJhdGlvblxuICAgIGNvbnN0IGludm9jYXRpb25NZXRyaWNzID0gbGFtYmRhRnVuY3Rpb25zLm1hcChmbiA9PiBcbiAgICAgIG5ldyBNZXRyaWMoe1xuICAgICAgICBuYW1lc3BhY2U6ICdBV1MvTGFtYmRhJyxcbiAgICAgICAgbWV0cmljTmFtZTogJ0ludm9jYXRpb25zJyxcbiAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgIEZ1bmN0aW9uTmFtZTogZm4uZnVuY3Rpb25OYW1lLFxuICAgICAgICB9LFxuICAgICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgY29uc3QgZHVyYXRpb25NZXRyaWNzID0gbGFtYmRhRnVuY3Rpb25zLm1hcChmbiA9PiBcbiAgICAgIG5ldyBNZXRyaWMoe1xuICAgICAgICBuYW1lc3BhY2U6ICdBV1MvTGFtYmRhJyxcbiAgICAgICAgbWV0cmljTmFtZTogJ0R1cmF0aW9uJyxcbiAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgIEZ1bmN0aW9uTmFtZTogZm4uZnVuY3Rpb25OYW1lLFxuICAgICAgICB9LFxuICAgICAgICBzdGF0aXN0aWM6ICdBdmVyYWdlJyxcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIGRhc2hib2FyZC5hZGRXaWRnZXRzKFxuICAgICAgbmV3IEdyYXBoV2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdMYW1iZGEgSW52b2NhdGlvbnMnLFxuICAgICAgICBsZWZ0OiBpbnZvY2F0aW9uTWV0cmljcyxcbiAgICAgICAgd2lkdGg6IDEyLFxuICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICB9KSxcbiAgICAgIG5ldyBHcmFwaFdpZGdldCh7XG4gICAgICAgIHRpdGxlOiAnTGFtYmRhIER1cmF0aW9uJyxcbiAgICAgICAgbGVmdDogZHVyYXRpb25NZXRyaWNzLFxuICAgICAgICB3aWR0aDogMTIsXG4gICAgICAgIGhlaWdodDogNixcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIC8vIExhbWJkYSBlcnJvcnMgYW5kIHRocm90dGxlc1xuICAgIGNvbnN0IGVycm9yTWV0cmljcyA9IGxhbWJkYUZ1bmN0aW9ucy5tYXAoZm4gPT4gXG4gICAgICBuZXcgTWV0cmljKHtcbiAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0xhbWJkYScsXG4gICAgICAgIG1ldHJpY05hbWU6ICdFcnJvcnMnLFxuICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgRnVuY3Rpb25OYW1lOiBmbi5mdW5jdGlvbk5hbWUsXG4gICAgICAgIH0sXG4gICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICB9KVxuICAgICk7XG5cbiAgICBjb25zdCB0aHJvdHRsZU1ldHJpY3MgPSBsYW1iZGFGdW5jdGlvbnMubWFwKGZuID0+IFxuICAgICAgbmV3IE1ldHJpYyh7XG4gICAgICAgIG5hbWVzcGFjZTogJ0FXUy9MYW1iZGEnLFxuICAgICAgICBtZXRyaWNOYW1lOiAnVGhyb3R0bGVzJyxcbiAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgIEZ1bmN0aW9uTmFtZTogZm4uZnVuY3Rpb25OYW1lLFxuICAgICAgICB9LFxuICAgICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgZGFzaGJvYXJkLmFkZFdpZGdldHMoXG4gICAgICBuZXcgR3JhcGhXaWRnZXQoe1xuICAgICAgICB0aXRsZTogJ0xhbWJkYSBFcnJvcnMnLFxuICAgICAgICBsZWZ0OiBlcnJvck1ldHJpY3MsXG4gICAgICAgIHdpZHRoOiAxMixcbiAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgfSksXG4gICAgICBuZXcgR3JhcGhXaWRnZXQoe1xuICAgICAgICB0aXRsZTogJ0xhbWJkYSBUaHJvdHRsZXMnLFxuICAgICAgICBsZWZ0OiB0aHJvdHRsZU1ldHJpY3MsXG4gICAgICAgIHdpZHRoOiAxMixcbiAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGREeW5hbW9EYldpZGdldHMoZGFzaGJvYXJkOiBEYXNoYm9hcmQsIGR5bmFtb1RhYmxlOiBUYWJsZSwgZW52aXJvbm1lbnQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGRhc2hib2FyZC5hZGRXaWRnZXRzKFxuICAgICAgbmV3IFRleHRXaWRnZXQoe1xuICAgICAgICBtYXJrZG93bjogJyMjIER5bmFtb0RCIE1ldHJpY3MnLFxuICAgICAgICB3aWR0aDogMjQsXG4gICAgICAgIGhlaWdodDogMSxcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIC8vIER5bmFtb0RCIHJlYWQvd3JpdGUgY2FwYWNpdHkgYW5kIHRocm90dGxlc1xuICAgIGRhc2hib2FyZC5hZGRXaWRnZXRzKFxuICAgICAgbmV3IEdyYXBoV2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdEeW5hbW9EQiBSZWFkL1dyaXRlIE9wZXJhdGlvbnMnLFxuICAgICAgICBsZWZ0OiBbXG4gICAgICAgICAgbmV3IE1ldHJpYyh7XG4gICAgICAgICAgICBuYW1lc3BhY2U6ICdBV1MvRHluYW1vREInLFxuICAgICAgICAgICAgbWV0cmljTmFtZTogJ0NvbnN1bWVkUmVhZENhcGFjaXR5VW5pdHMnLFxuICAgICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgICBUYWJsZU5hbWU6IGR5bmFtb1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG5ldyBNZXRyaWMoe1xuICAgICAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0R5bmFtb0RCJyxcbiAgICAgICAgICAgIG1ldHJpY05hbWU6ICdDb25zdW1lZFdyaXRlQ2FwYWNpdHlVbml0cycsXG4gICAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICAgIFRhYmxlTmFtZTogZHluYW1vVGFibGUudGFibGVOYW1lLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICAgIHdpZHRoOiAxMixcbiAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgfSksXG4gICAgICBuZXcgR3JhcGhXaWRnZXQoe1xuICAgICAgICB0aXRsZTogJ0R5bmFtb0RCIFRocm90dGxlcycsXG4gICAgICAgIGxlZnQ6IFtcbiAgICAgICAgICBuZXcgTWV0cmljKHtcbiAgICAgICAgICAgIG5hbWVzcGFjZTogJ0FXUy9EeW5hbW9EQicsXG4gICAgICAgICAgICBtZXRyaWNOYW1lOiAnUmVhZFRocm90dGxlcycsXG4gICAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICAgIFRhYmxlTmFtZTogZHluYW1vVGFibGUudGFibGVOYW1lLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IE1ldHJpYyh7XG4gICAgICAgICAgICBuYW1lc3BhY2U6ICdBV1MvRHluYW1vREInLFxuICAgICAgICAgICAgbWV0cmljTmFtZTogJ1dyaXRlVGhyb3R0bGVzJyxcbiAgICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICAgICAgVGFibGVOYW1lOiBkeW5hbW9UYWJsZS50YWJsZU5hbWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RhdGlzdGljOiAnU3VtJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgICAgd2lkdGg6IDEyLFxuICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGFkZENvZ25pdG9XaWRnZXRzKGRhc2hib2FyZDogRGFzaGJvYXJkLCB1c2VyUG9vbDogVXNlclBvb2wsIGVudmlyb25tZW50OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBkYXNoYm9hcmQuYWRkV2lkZ2V0cyhcbiAgICAgIG5ldyBUZXh0V2lkZ2V0KHtcbiAgICAgICAgbWFya2Rvd246ICcjIyBBdXRoZW50aWNhdGlvbiBNZXRyaWNzJyxcbiAgICAgICAgd2lkdGg6IDI0LFxuICAgICAgICBoZWlnaHQ6IDEsXG4gICAgICB9KVxuICAgICk7XG5cbiAgICAvLyBDb2duaXRvIHNpZ24taW5zIGFuZCBzaWduLXVwc1xuICAgIGRhc2hib2FyZC5hZGRXaWRnZXRzKFxuICAgICAgbmV3IEdyYXBoV2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdVc2VyIEF1dGhlbnRpY2F0aW9uJyxcbiAgICAgICAgbGVmdDogW1xuICAgICAgICAgIG5ldyBNZXRyaWMoe1xuICAgICAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0NvZ25pdG8nLFxuICAgICAgICAgICAgbWV0cmljTmFtZTogJ1NpZ25JblN1Y2Nlc3NlcycsXG4gICAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICAgIFVzZXJQb29sOiB1c2VyUG9vbC51c2VyUG9vbElkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IE1ldHJpYyh7XG4gICAgICAgICAgICBuYW1lc3BhY2U6ICdBV1MvQ29nbml0bycsXG4gICAgICAgICAgICBtZXRyaWNOYW1lOiAnU2lnblVwU3VjY2Vzc2VzJyxcbiAgICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICAgICAgVXNlclBvb2w6IHVzZXJQb29sLnVzZXJQb29sSWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RhdGlzdGljOiAnU3VtJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgICAgd2lkdGg6IDEyLFxuICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICB9KSxcbiAgICAgIG5ldyBHcmFwaFdpZGdldCh7XG4gICAgICAgIHRpdGxlOiAnQXV0aGVudGljYXRpb24gRmFpbHVyZXMnLFxuICAgICAgICBsZWZ0OiBbXG4gICAgICAgICAgbmV3IE1ldHJpYyh7XG4gICAgICAgICAgICBuYW1lc3BhY2U6ICdBV1MvQ29nbml0bycsXG4gICAgICAgICAgICBtZXRyaWNOYW1lOiAnU2lnbkluRmFpbHVyZXMnLFxuICAgICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgICBVc2VyUG9vbDogdXNlclBvb2wudXNlclBvb2xJZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgICB3aWR0aDogMTIsXG4gICAgICAgIGhlaWdodDogNixcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkRXJyb3JBbmRQZXJmb3JtYW5jZVdpZGdldHMoZGFzaGJvYXJkOiBEYXNoYm9hcmQsIGVudmlyb25tZW50OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBkYXNoYm9hcmQuYWRkV2lkZ2V0cyhcbiAgICAgIG5ldyBUZXh0V2lkZ2V0KHtcbiAgICAgICAgbWFya2Rvd246ICcjIyBFcnJvciBUcmFja2luZyBhbmQgUGVyZm9ybWFuY2UnLFxuICAgICAgICB3aWR0aDogMjQsXG4gICAgICAgIGhlaWdodDogMSxcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIC8vIExvZy1iYXNlZCBlcnJvciB0cmFja2luZ1xuICAgIGRhc2hib2FyZC5hZGRXaWRnZXRzKFxuICAgICAgbmV3IExvZ1F1ZXJ5V2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdSZWNlbnQgRXJyb3JzJyxcbiAgICAgICAgbG9nR3JvdXBOYW1lczogW2AvYXdzL2xhbWJkYS9tYWRtYWxsLSR7ZW52aXJvbm1lbnR9LSpgXSxcbiAgICAgICAgcXVlcnlMaW5lczogW1xuICAgICAgICAgICdmaWVsZHMgQHRpbWVzdGFtcCwgQG1lc3NhZ2UnLFxuICAgICAgICAgICdmaWx0ZXIgQG1lc3NhZ2UgbGlrZSAvRVJST1IvJyxcbiAgICAgICAgICAnc29ydCBAdGltZXN0YW1wIGRlc2MnLFxuICAgICAgICAgICdsaW1pdCAxMDAnLFxuICAgICAgICBdLFxuICAgICAgICB3aWR0aDogMjQsXG4gICAgICAgIGhlaWdodDogNixcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkQ29zdEFuZFVzYWdlV2lkZ2V0cyhkYXNoYm9hcmQ6IERhc2hib2FyZCwgZW52aXJvbm1lbnQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGRhc2hib2FyZC5hZGRXaWRnZXRzKFxuICAgICAgbmV3IFRleHRXaWRnZXQoe1xuICAgICAgICBtYXJrZG93bjogJyMjIENvc3QgYW5kIFVzYWdlIE9wdGltaXphdGlvbicsXG4gICAgICAgIHdpZHRoOiAyNCxcbiAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgLy8gQ29zdCBtZXRyaWNzICh0aGVzZSB3b3VsZCBuZWVkIHRvIGJlIGNvbmZpZ3VyZWQgd2l0aCBDb3N0IEV4cGxvcmVyIEFQSSlcbiAgICBkYXNoYm9hcmQuYWRkV2lkZ2V0cyhcbiAgICAgIG5ldyBTaW5nbGVWYWx1ZVdpZGdldCh7XG4gICAgICAgIHRpdGxlOiAnRXN0aW1hdGVkIERhaWx5IENvc3QnLFxuICAgICAgICBtZXRyaWNzOiBbXG4gICAgICAgICAgLy8gUGxhY2Vob2xkZXIgLSB3b3VsZCBuZWVkIGFjdHVhbCBjb3N0IG1ldHJpY3NcbiAgICAgICAgICBuZXcgTWV0cmljKHtcbiAgICAgICAgICAgIG5hbWVzcGFjZTogJ0FXUy9CaWxsaW5nJyxcbiAgICAgICAgICAgIG1ldHJpY05hbWU6ICdFc3RpbWF0ZWRDaGFyZ2VzJyxcbiAgICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICAgICAgQ3VycmVuY3k6ICdVU0QnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0YXRpc3RpYzogJ01heGltdW0nLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgICB3aWR0aDogMTIsXG4gICAgICAgIGhlaWdodDogNixcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQWxhcm1zKFxuICAgIGVudmlyb25tZW50OiBzdHJpbmcsXG4gICAgbGFtYmRhRnVuY3Rpb25zOiBMYW1iZGFGdW5jdGlvbltdLFxuICAgIHJlc3RBcGk6IFJlc3RBcGksXG4gICAgZHluYW1vVGFibGU6IFRhYmxlXG4gICk6IHZvaWQge1xuICAgIC8vIEFQSSBHYXRld2F5IGFsYXJtc1xuICAgIGNvbnN0IGFwaUVycm9yQWxhcm0gPSBuZXcgQWxhcm0odGhpcywgJ0FwaUVycm9yQWxhcm0nLCB7XG4gICAgICBhbGFybU5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWFwaS1lcnJvcnNgLFxuICAgICAgYWxhcm1EZXNjcmlwdGlvbjogJ0hpZ2ggZXJyb3IgcmF0ZSBpbiBBUEkgR2F0ZXdheScsXG4gICAgICBtZXRyaWM6IG5ldyBNZXRyaWMoe1xuICAgICAgICBuYW1lc3BhY2U6ICdBV1MvQXBpR2F0ZXdheScsXG4gICAgICAgIG1ldHJpY05hbWU6ICc1WFhFcnJvcicsXG4gICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICBBcGlOYW1lOiByZXN0QXBpLnJlc3RBcGlOYW1lLFxuICAgICAgICAgIFN0YWdlOiBlbnZpcm9ubWVudCxcbiAgICAgICAgfSxcbiAgICAgICAgc3RhdGlzdGljOiAnU3VtJyxcbiAgICAgIH0pLFxuICAgICAgdGhyZXNob2xkOiAxMCxcbiAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiAyLFxuICAgICAgY29tcGFyaXNvbk9wZXJhdG9yOiBDb21wYXJpc29uT3BlcmF0b3IuR1JFQVRFUl9USEFOX1RIUkVTSE9MRCxcbiAgICAgIHRyZWF0TWlzc2luZ0RhdGE6IFRyZWF0TWlzc2luZ0RhdGEuTk9UX0JSRUFDSElORyxcbiAgICB9KTtcblxuICAgIGFwaUVycm9yQWxhcm0uYWRkQWxhcm1BY3Rpb24obmV3IFNuc0FjdGlvbih0aGlzLmFsZXJ0VG9waWMpKTtcbiAgICB0aGlzLmFsYXJtcy5wdXNoKGFwaUVycm9yQWxhcm0pO1xuXG4gICAgLy8gTGFtYmRhIGZ1bmN0aW9uIGFsYXJtc1xuICAgIGxhbWJkYUZ1bmN0aW9ucy5mb3JFYWNoKChmbiwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IGVycm9yQWxhcm0gPSBuZXcgQWxhcm0odGhpcywgYExhbWJkYUVycm9yQWxhcm0ke2luZGV4fWAsIHtcbiAgICAgICAgYWxhcm1OYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1sYW1iZGEtJHtmbi5mdW5jdGlvbk5hbWV9LWVycm9yc2AsXG4gICAgICAgIGFsYXJtRGVzY3JpcHRpb246IGBIaWdoIGVycm9yIHJhdGUgaW4gTGFtYmRhIGZ1bmN0aW9uICR7Zm4uZnVuY3Rpb25OYW1lfWAsXG4gICAgICAgIG1ldHJpYzogbmV3IE1ldHJpYyh7XG4gICAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0xhbWJkYScsXG4gICAgICAgICAgbWV0cmljTmFtZTogJ0Vycm9ycycsXG4gICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgRnVuY3Rpb25OYW1lOiBmbi5mdW5jdGlvbk5hbWUsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgICB9KSxcbiAgICAgICAgdGhyZXNob2xkOiA1LFxuICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogMixcbiAgICAgICAgY29tcGFyaXNvbk9wZXJhdG9yOiBDb21wYXJpc29uT3BlcmF0b3IuR1JFQVRFUl9USEFOX1RIUkVTSE9MRCxcbiAgICAgICAgdHJlYXRNaXNzaW5nRGF0YTogVHJlYXRNaXNzaW5nRGF0YS5OT1RfQlJFQUNISU5HLFxuICAgICAgfSk7XG5cbiAgICAgIGVycm9yQWxhcm0uYWRkQWxhcm1BY3Rpb24obmV3IFNuc0FjdGlvbih0aGlzLmFsZXJ0VG9waWMpKTtcbiAgICAgIHRoaXMuYWxhcm1zLnB1c2goZXJyb3JBbGFybSk7XG5cbiAgICAgIGNvbnN0IGR1cmF0aW9uQWxhcm0gPSBuZXcgQWxhcm0odGhpcywgYExhbWJkYUR1cmF0aW9uQWxhcm0ke2luZGV4fWAsIHtcbiAgICAgICAgYWxhcm1OYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1sYW1iZGEtJHtmbi5mdW5jdGlvbk5hbWV9LWR1cmF0aW9uYCxcbiAgICAgICAgYWxhcm1EZXNjcmlwdGlvbjogYEhpZ2ggZHVyYXRpb24gaW4gTGFtYmRhIGZ1bmN0aW9uICR7Zm4uZnVuY3Rpb25OYW1lfWAsXG4gICAgICAgIG1ldHJpYzogbmV3IE1ldHJpYyh7XG4gICAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0xhbWJkYScsXG4gICAgICAgICAgbWV0cmljTmFtZTogJ0R1cmF0aW9uJyxcbiAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICBGdW5jdGlvbk5hbWU6IGZuLmZ1bmN0aW9uTmFtZSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHN0YXRpc3RpYzogJ0F2ZXJhZ2UnLFxuICAgICAgICB9KSxcbiAgICAgICAgdGhyZXNob2xkOiAxMDAwMCwgLy8gMTAgc2Vjb25kc1xuICAgICAgICBldmFsdWF0aW9uUGVyaW9kczogMyxcbiAgICAgICAgY29tcGFyaXNvbk9wZXJhdG9yOiBDb21wYXJpc29uT3BlcmF0b3IuR1JFQVRFUl9USEFOX1RIUkVTSE9MRCxcbiAgICAgICAgdHJlYXRNaXNzaW5nRGF0YTogVHJlYXRNaXNzaW5nRGF0YS5OT1RfQlJFQUNISU5HLFxuICAgICAgfSk7XG5cbiAgICAgIGR1cmF0aW9uQWxhcm0uYWRkQWxhcm1BY3Rpb24obmV3IFNuc0FjdGlvbih0aGlzLmFsZXJ0VG9waWMpKTtcbiAgICAgIHRoaXMuYWxhcm1zLnB1c2goZHVyYXRpb25BbGFybSk7XG4gICAgfSk7XG5cbiAgICAvLyBEeW5hbW9EQiBhbGFybXNcbiAgICBjb25zdCBkeW5hbW9UaHJvdHRsZUFsYXJtID0gbmV3IEFsYXJtKHRoaXMsICdEeW5hbW9UaHJvdHRsZUFsYXJtJywge1xuICAgICAgYWxhcm1OYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1keW5hbW8tdGhyb3R0bGVzYCxcbiAgICAgIGFsYXJtRGVzY3JpcHRpb246ICdEeW5hbW9EQiB0aHJvdHRsaW5nIGRldGVjdGVkJyxcbiAgICAgIG1ldHJpYzogbmV3IE1ldHJpYyh7XG4gICAgICAgIG5hbWVzcGFjZTogJ0FXUy9EeW5hbW9EQicsXG4gICAgICAgIG1ldHJpY05hbWU6ICdSZWFkVGhyb3R0bGVzJyxcbiAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgIFRhYmxlTmFtZTogZHluYW1vVGFibGUudGFibGVOYW1lLFxuICAgICAgICB9LFxuICAgICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgfSksXG4gICAgICB0aHJlc2hvbGQ6IDEsXG4gICAgICBldmFsdWF0aW9uUGVyaW9kczogMSxcbiAgICAgIGNvbXBhcmlzb25PcGVyYXRvcjogQ29tcGFyaXNvbk9wZXJhdG9yLkdSRUFURVJfVEhBTl9PUl9FUVVBTF9UT19USFJFU0hPTEQsXG4gICAgICB0cmVhdE1pc3NpbmdEYXRhOiBUcmVhdE1pc3NpbmdEYXRhLk5PVF9CUkVBQ0hJTkcsXG4gICAgfSk7XG5cbiAgICBkeW5hbW9UaHJvdHRsZUFsYXJtLmFkZEFsYXJtQWN0aW9uKG5ldyBTbnNBY3Rpb24odGhpcy5hbGVydFRvcGljKSk7XG4gICAgdGhpcy5hbGFybXMucHVzaChkeW5hbW9UaHJvdHRsZUFsYXJtKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQ3VzdG9tTWV0cmljcyhlbnZpcm9ubWVudDogc3RyaW5nLCBsYW1iZGFGdW5jdGlvbnM6IExhbWJkYUZ1bmN0aW9uW10pOiB2b2lkIHtcbiAgICAvLyBDcmVhdGUgY3VzdG9tIG1ldHJpYyBmaWx0ZXJzIGZvciBhcHBsaWNhdGlvbi1zcGVjaWZpYyBtZXRyaWNzXG4gICAgbGFtYmRhRnVuY3Rpb25zLmZvckVhY2goKGZuLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgbG9nR3JvdXAgPSBMb2dHcm91cC5mcm9tTG9nR3JvdXBOYW1lKFxuICAgICAgICB0aGlzLFxuICAgICAgICBgTGFtYmRhTG9nR3JvdXAke2luZGV4fWAsXG4gICAgICAgIGAvYXdzL2xhbWJkYS8ke2ZuLmZ1bmN0aW9uTmFtZX1gXG4gICAgICApO1xuXG4gICAgICAvLyBCdXNpbmVzcyBsb2dpYyBlcnJvciBtZXRyaWNcbiAgICAgIG5ldyBNZXRyaWNGaWx0ZXIodGhpcywgYEJ1c2luZXNzRXJyb3JNZXRyaWMke2luZGV4fWAsIHtcbiAgICAgICAgbG9nR3JvdXAsXG4gICAgICAgIG1ldHJpY05hbWVzcGFjZTogJ01BRE1hbGwvQXBwbGljYXRpb24nLFxuICAgICAgICBtZXRyaWNOYW1lOiAnQnVzaW5lc3NMb2dpY0Vycm9ycycsXG4gICAgICAgIGZpbHRlclBhdHRlcm46IEZpbHRlclBhdHRlcm4uc3RyaW5nVmFsdWUoJyQubGV2ZWwnLCAnPScsICdFUlJPUicpLFxuICAgICAgICBtZXRyaWNWYWx1ZTogJzEnLFxuICAgICAgICBkZWZhdWx0VmFsdWU6IDAsXG4gICAgICB9KTtcblxuICAgICAgLy8gVXNlciBhY3Rpb24gbWV0cmljXG4gICAgICBuZXcgTWV0cmljRmlsdGVyKHRoaXMsIGBVc2VyQWN0aW9uTWV0cmljJHtpbmRleH1gLCB7XG4gICAgICAgIGxvZ0dyb3VwLFxuICAgICAgICBtZXRyaWNOYW1lc3BhY2U6ICdNQURNYWxsL0FwcGxpY2F0aW9uJyxcbiAgICAgICAgbWV0cmljTmFtZTogJ1VzZXJBY3Rpb25zJyxcbiAgICAgICAgZmlsdGVyUGF0dGVybjogRmlsdGVyUGF0dGVybi5zdHJpbmdWYWx1ZSgnJC5ldmVudFR5cGUnLCAnPScsICdVU0VSX0FDVElPTicpLFxuICAgICAgICBtZXRyaWNWYWx1ZTogJzEnLFxuICAgICAgICBkZWZhdWx0VmFsdWU6IDAsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlU3ludGhldGljc0NhbmFyeShlbnZpcm9ubWVudDogc3RyaW5nLCBoZWFsdGhDaGVja1VybDogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gS01TIGtleSBmb3IgU3ludGhldGljcyBhcnRpZmFjdHMgYnVja2V0XG4gICAgY29uc3QgY2FuYXJ5S21zS2V5ID0gbmV3IEtleSh0aGlzLCAnU3ludGhldGljc0ttc0tleScsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiBgTUFETWFsbCAke2Vudmlyb25tZW50fSBLTVMga2V5IGZvciBTeW50aGV0aWNzIGFydGlmYWN0c2AsXG4gICAgICBlbmFibGVLZXlSb3RhdGlvbjogdHJ1ZSxcbiAgICAgIGtleVVzYWdlOiBLZXlVc2FnZS5FTkNSWVBUX0RFQ1JZUFQsXG4gICAgICBrZXlTcGVjOiBLZXlTcGVjLlNZTU1FVFJJQ19ERUZBVUxULFxuICAgICAgcmVtb3ZhbFBvbGljeTogZW52aXJvbm1lbnQgPT09ICdwcm9kJyA/IFJlbW92YWxQb2xpY3kuUkVUQUlOIDogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYXJ0aWZhY3RzQnVja2V0ID0gbmV3IEJ1Y2tldCh0aGlzLCAnU3ludGhldGljc0J1Y2tldCcsIHtcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBCbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG4gICAgICBlbmZvcmNlU1NMOiB0cnVlLFxuICAgICAgZW5jcnlwdGlvbjogQnVja2V0RW5jcnlwdGlvbi5LTVMsXG4gICAgICBlbmNyeXB0aW9uS2V5OiBjYW5hcnlLbXNLZXksXG4gICAgICB2ZXJzaW9uZWQ6IHRydWUsXG4gICAgICByZW1vdmFsUG9saWN5OiBlbnZpcm9ubWVudCA9PT0gJ3Byb2QnID8gUmVtb3ZhbFBvbGljeS5SRVRBSU4gOiBSZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogZW52aXJvbm1lbnQgIT09ICdwcm9kJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGNhbmFyeSA9IG5ldyBDYW5hcnkodGhpcywgJ0hlYWx0aENhbmFyeScsIHtcbiAgICAgIGNhbmFyeU5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWhlYWx0aGAsXG4gICAgICBzY2hlZHVsZTogU3ludGhldGljc1NjaGVkdWxlLnJhdGUoRHVyYXRpb24ubWludXRlcyg1KSksXG4gICAgICBydW50aW1lOiBSdW50aW1lLlNZTlRIRVRJQ1NfTk9ERUpTX1BVUFBFVEVFUl82XzIsXG4gICAgICB0ZXN0OiBUZXN0LmN1c3RvbSh7XG4gICAgICAgIGNvZGU6IFN5bnRoZXRpY3NDb2RlLmZyb21JbmxpbmUoYGNvbnN0IHN5bnRoZXRpY3MgPSByZXF1aXJlKCdTeW50aGV0aWNzJyk7XG5jb25zdCBsb2cgPSByZXF1aXJlKCdTeW50aGV0aWNzTG9nZ2VyJyk7XG5jb25zdCBodHRwcyA9IHJlcXVpcmUoJ2h0dHBzJyk7XG5jb25zdCB1cmwgPSAnJHtoZWFsdGhDaGVja1VybH0nO1xuY29uc3QgcmVxdWVzdCA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgbGV0IHJlcXVlc3RPcHRpb25zID0geyBob3N0bmFtZTogbmV3IFVSTCh1cmwpLmhvc3RuYW1lLCBwYXRoOiBuZXcgVVJMKHVybCkucGF0aG5hbWUsIG1ldGhvZDogJ0dFVCcgfTtcbiAgbGV0IGhlYWRlcnMgPSB7ICdVc2VyLUFnZW50JzogJ01BRE1hbGwtQ2FuYXJ5JyB9O1xuICByZXF1ZXN0T3B0aW9uc1snaGVhZGVycyddID0gaGVhZGVycztcbiAgbGV0IHN0ZXBDb25maWcgPSB7IGluY2x1ZGVSZXF1ZXN0SGVhZGVyczogdHJ1ZSwgaW5jbHVkZVJlc3BvbnNlSGVhZGVyczogdHJ1ZSwgcmVzdHJpY3RlZEhlYWRlcnM6IFtdIH07XG4gIGF3YWl0IHN5bnRoZXRpY3MuZXhlY3V0ZUh0dHBTdGVwKCdIZWFsdGhDaGVjaycsIHJlcXVlc3RPcHRpb25zLCBzdGVwQ29uZmlnKTtcbn07XG5leHBvcnRzLmhhbmRsZXIgPSBhc3luYyAoKSA9PiB7IHJldHVybiBhd2FpdCByZXF1ZXN0KCk7IH07YCksXG4gICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgIH0pLFxuICAgICAgZW52aXJvbm1lbnRWYXJpYWJsZXM6IHsgRU5WSVJPTk1FTlQ6IGVudmlyb25tZW50IH0sXG4gICAgICBhcnRpZmFjdHNCdWNrZXRMb2NhdGlvbjogeyBidWNrZXQ6IGFydGlmYWN0c0J1Y2tldCB9LFxuICAgICAgc3RhcnRBZnRlckNyZWF0aW9uOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgVGFncy5vZihjYW5hcnkpLmFkZCgnTmFtZScsIGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWhlYWx0aC1jYW5hcnlgKTtcbiAgICBUYWdzLm9mKGNhbmFyeSkuYWRkKCdFbnZpcm9ubWVudCcsIGVudmlyb25tZW50KTtcbiAgfVxufSJdfQ==