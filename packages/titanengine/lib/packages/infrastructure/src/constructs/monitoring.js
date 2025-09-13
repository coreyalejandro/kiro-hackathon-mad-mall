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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uaXRvcmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2luZnJhc3RydWN0dXJlL3NyYy9jb25zdHJ1Y3RzL21vbml0b3JpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQXVDO0FBQ3ZDLCtEQVdvQztBQUNwQywrRUFBK0Q7QUFDL0QsaURBQWdGO0FBS2hGLG1EQUE2RTtBQUM3RSw2Q0FBNEQ7QUFDNUQsK0RBQW1FO0FBQ25FLCtEQUFvRTtBQUNwRSwrREFBNEU7QUFDNUUsK0NBQWlGO0FBQ2pGLGlEQUE2RDtBQTRDN0QsTUFBYSxtQkFBb0IsU0FBUSxzQkFBUztJQUtoRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQStCO1FBQ3ZFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFISCxXQUFNLEdBQVksRUFBRSxDQUFDO1FBS25DLE1BQU0sRUFDSixXQUFXLEVBQ1gsZUFBZSxFQUNmLE9BQU8sRUFDUCxXQUFXLEVBQ1gsUUFBUSxFQUNSLFdBQVcsRUFDWCxlQUFlLEVBQ2YsY0FBYyxHQUNmLEdBQUcsS0FBSyxDQUFDO1FBRVYsOEJBQThCO1FBQzlCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFbkYsOEJBQThCO1FBQzlCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFcEcsZ0JBQWdCO1FBQ2hCLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFdEUsOENBQThDO1FBQzlDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7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LE1BQU0sQ0FBQyxDQUFDLENBQUMsMkJBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLDJCQUFhLENBQUMsT0FBTztZQUNwRixpQkFBaUIsRUFBRSxXQUFXLEtBQUssTUFBTTtTQUMxQyxDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxJQUFJLHVCQUFNLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUM5QyxVQUFVLEVBQUUsV0FBVyxXQUFXLFNBQVM7WUFDM0MsUUFBUSxFQUFFLHlCQUFrQixDQUFDLElBQUksQ0FBQyxzQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RCxPQUFPLEVBQUUsd0JBQU8sQ0FBQywrQkFBK0I7WUFDaEQsSUFBSSxFQUFFLHFCQUFJLENBQUMsTUFBTSxDQUFDO2dCQUNoQixJQUFJLEVBQUUscUJBQWMsQ0FBQyxVQUFVLENBQUM7OztlQUd6QixjQUFjOzs7Ozs7OzsyREFROEIsQ0FBQztnQkFDcEQsT0FBTyxFQUFFLGVBQWU7YUFDekIsQ0FBQztZQUNGLG9CQUFvQixFQUFFLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRTtZQUNsRCx1QkFBdUIsRUFBRSxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUU7WUFDcEQsa0JBQWtCLEVBQUUsSUFBSTtTQUN6QixDQUFDLENBQUM7UUFFSCxrQkFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFdBQVcsV0FBVyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3BFLGtCQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDbEQsQ0FBQztDQUNGO0FBbm5CRCxrREFtbkJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQge1xuICBEYXNoYm9hcmQsXG4gIEdyYXBoV2lkZ2V0LFxuICBNZXRyaWMsXG4gIFNpbmdsZVZhbHVlV2lkZ2V0LFxuICBMb2dRdWVyeVdpZGdldCxcbiAgVGV4dFdpZGdldCxcbiAgQWxhcm0sXG4gIENvbXBhcmlzb25PcGVyYXRvcixcbiAgVHJlYXRNaXNzaW5nRGF0YSxcbiAgQWxhcm1XaWRnZXQsXG59IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZHdhdGNoJztcbmltcG9ydCB7IFNuc0FjdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZHdhdGNoLWFjdGlvbnMnO1xuaW1wb3J0IHsgVG9waWMsIFN1YnNjcmlwdGlvbiwgU3Vic2NyaXB0aW9uUHJvdG9jb2wgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc25zJztcbmltcG9ydCB7IEZ1bmN0aW9uIGFzIExhbWJkYUZ1bmN0aW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBSZXN0QXBpIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xuaW1wb3J0IHsgVGFibGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0IHsgVXNlclBvb2wgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY29nbml0byc7XG5pbXBvcnQgeyBMb2dHcm91cCwgTWV0cmljRmlsdGVyLCBGaWx0ZXJQYXR0ZXJuIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnO1xuaW1wb3J0IHsgRHVyYXRpb24sIFRhZ3MsIFJlbW92YWxQb2xpY3kgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDYW5hcnksIFJ1bnRpbWUsIFRlc3QgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtc3ludGhldGljcyc7XG5pbXBvcnQgeyBDb2RlIGFzIFN5bnRoZXRpY3NDb2RlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXN5bnRoZXRpY3MnO1xuaW1wb3J0IHsgU2NoZWR1bGUgYXMgU3ludGhldGljc1NjaGVkdWxlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXN5bnRoZXRpY3MnO1xuaW1wb3J0IHsgQnVja2V0LCBCbG9ja1B1YmxpY0FjY2VzcywgQnVja2V0RW5jcnlwdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgeyBLZXksIEtleVNwZWMsIEtleVVzYWdlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWttcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTW9uaXRvcmluZ0NvbnN0cnVjdFByb3BzIHtcbiAgLyoqXG4gICAqIEVudmlyb25tZW50IG5hbWUgKGRldiwgc3RhZ2luZywgcHJvZClcbiAgICovXG4gIGVudmlyb25tZW50OiBzdHJpbmc7XG4gIFxuICAvKipcbiAgICogTGFtYmRhIGZ1bmN0aW9ucyB0byBtb25pdG9yXG4gICAqL1xuICBsYW1iZGFGdW5jdGlvbnM6IExhbWJkYUZ1bmN0aW9uW107XG4gIFxuICAvKipcbiAgICogQVBJIEdhdGV3YXkgdG8gbW9uaXRvclxuICAgKi9cbiAgcmVzdEFwaTogUmVzdEFwaTtcbiAgXG4gIC8qKlxuICAgKiBEeW5hbW9EQiB0YWJsZSB0byBtb25pdG9yXG4gICAqL1xuICBkeW5hbW9UYWJsZTogVGFibGU7XG4gIFxuICAvKipcbiAgICogQ29nbml0byBVc2VyIFBvb2wgdG8gbW9uaXRvclxuICAgKi9cbiAgdXNlclBvb2w6IFVzZXJQb29sO1xuICBcbiAgLyoqXG4gICAqIEVtYWlsIGFkZHJlc3NlcyBmb3IgYWxhcm0gbm90aWZpY2F0aW9uc1xuICAgKi9cbiAgYWxlcnRFbWFpbHM6IHN0cmluZ1tdO1xuICBcbiAgLyoqXG4gICAqIFNsYWNrIHdlYmhvb2sgVVJMIGZvciBub3RpZmljYXRpb25zIChvcHRpb25hbClcbiAgICovXG4gIHNsYWNrV2ViaG9va1VybD86IHN0cmluZztcblxuICAvKipcbiAgICogUHVibGljIGhlYWx0aC1jaGVjayBVUkwgZm9yIHN5bnRoZXRpYyBtb25pdG9yaW5nXG4gICAqL1xuICBoZWFsdGhDaGVja1VybD86IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIE1vbml0b3JpbmdDb25zdHJ1Y3QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgZGFzaGJvYXJkOiBEYXNoYm9hcmQ7XG4gIHB1YmxpYyByZWFkb25seSBhbGVydFRvcGljOiBUb3BpYztcbiAgcHVibGljIHJlYWRvbmx5IGFsYXJtczogQWxhcm1bXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBNb25pdG9yaW5nQ29uc3RydWN0UHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgY29uc3Qge1xuICAgICAgZW52aXJvbm1lbnQsXG4gICAgICBsYW1iZGFGdW5jdGlvbnMsXG4gICAgICByZXN0QXBpLFxuICAgICAgZHluYW1vVGFibGUsXG4gICAgICB1c2VyUG9vbCxcbiAgICAgIGFsZXJ0RW1haWxzLFxuICAgICAgc2xhY2tXZWJob29rVXJsLFxuICAgICAgaGVhbHRoQ2hlY2tVcmwsXG4gICAgfSA9IHByb3BzO1xuXG4gICAgLy8gQ3JlYXRlIFNOUyB0b3BpYyBmb3IgYWxlcnRzXG4gICAgdGhpcy5hbGVydFRvcGljID0gdGhpcy5jcmVhdGVBbGVydFRvcGljKGVudmlyb25tZW50LCBhbGVydEVtYWlscywgc2xhY2tXZWJob29rVXJsKTtcblxuICAgIC8vIENyZWF0ZSBDbG91ZFdhdGNoIGRhc2hib2FyZFxuICAgIHRoaXMuZGFzaGJvYXJkID0gdGhpcy5jcmVhdGVEYXNoYm9hcmQoZW52aXJvbm1lbnQsIGxhbWJkYUZ1bmN0aW9ucywgcmVzdEFwaSwgZHluYW1vVGFibGUsIHVzZXJQb29sKTtcblxuICAgIC8vIENyZWF0ZSBhbGFybXNcbiAgICB0aGlzLmNyZWF0ZUFsYXJtcyhlbnZpcm9ubWVudCwgbGFtYmRhRnVuY3Rpb25zLCByZXN0QXBpLCBkeW5hbW9UYWJsZSk7XG5cbiAgICAvLyBDcmVhdGUgY3VzdG9tIG1ldHJpY3MgYW5kIGxvZy1iYXNlZCBtZXRyaWNzXG4gICAgdGhpcy5jcmVhdGVDdXN0b21NZXRyaWNzKGVudmlyb25tZW50LCBsYW1iZGFGdW5jdGlvbnMpO1xuXG4gICAgLy8gQ3JlYXRlIHN5bnRoZXRpYyBjYW5hcnkgZm9yIGhlYWx0aCBjaGVja3MgaWYgVVJMIHByb3ZpZGVkXG4gICAgaWYgKGhlYWx0aENoZWNrVXJsKSB7XG4gICAgICB0aGlzLmNyZWF0ZVN5bnRoZXRpY3NDYW5hcnkoZW52aXJvbm1lbnQsIGhlYWx0aENoZWNrVXJsKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUFsZXJ0VG9waWMoZW52aXJvbm1lbnQ6IHN0cmluZywgYWxlcnRFbWFpbHM6IHN0cmluZ1tdLCBzbGFja1dlYmhvb2tVcmw/OiBzdHJpbmcpOiBUb3BpYyB7XG4gICAgY29uc3QgdG9waWMgPSBuZXcgVG9waWModGhpcywgJ0FsZXJ0VG9waWMnLCB7XG4gICAgICB0b3BpY05hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWFsZXJ0c2AsXG4gICAgICBkaXNwbGF5TmFtZTogYE1BRE1hbGwgJHtlbnZpcm9ubWVudH0gQWxlcnRzYCxcbiAgICB9KTtcblxuICAgIC8vIEFkZCBlbWFpbCBzdWJzY3JpcHRpb25zXG4gICAgYWxlcnRFbWFpbHMuZm9yRWFjaCgoZW1haWwsIGluZGV4KSA9PiB7XG4gICAgICBuZXcgU3Vic2NyaXB0aW9uKHRoaXMsIGBFbWFpbFN1YnNjcmlwdGlvbiR7aW5kZXh9YCwge1xuICAgICAgICB0b3BpYyxcbiAgICAgICAgcHJvdG9jb2w6IFN1YnNjcmlwdGlvblByb3RvY29sLkVNQUlMLFxuICAgICAgICBlbmRwb2ludDogZW1haWwsXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIEFkZCBTbGFjayB3ZWJob29rIGlmIHByb3ZpZGVkXG4gICAgaWYgKHNsYWNrV2ViaG9va1VybCkge1xuICAgICAgbmV3IFN1YnNjcmlwdGlvbih0aGlzLCAnU2xhY2tTdWJzY3JpcHRpb24nLCB7XG4gICAgICAgIHRvcGljLFxuICAgICAgICBwcm90b2NvbDogU3Vic2NyaXB0aW9uUHJvdG9jb2wuSFRUUFMsXG4gICAgICAgIGVuZHBvaW50OiBzbGFja1dlYmhvb2tVcmwsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBUYWdzLm9mKHRvcGljKS5hZGQoJ05hbWUnLCBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1hbGVydC10b3BpY2ApO1xuICAgIFRhZ3Mub2YodG9waWMpLmFkZCgnRW52aXJvbm1lbnQnLCBlbnZpcm9ubWVudCk7XG5cbiAgICByZXR1cm4gdG9waWM7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZURhc2hib2FyZChcbiAgICBlbnZpcm9ubWVudDogc3RyaW5nLFxuICAgIGxhbWJkYUZ1bmN0aW9uczogTGFtYmRhRnVuY3Rpb25bXSxcbiAgICByZXN0QXBpOiBSZXN0QXBpLFxuICAgIGR5bmFtb1RhYmxlOiBUYWJsZSxcbiAgICB1c2VyUG9vbDogVXNlclBvb2xcbiAgKTogRGFzaGJvYXJkIHtcbiAgICBjb25zdCBkYXNoYm9hcmQgPSBuZXcgRGFzaGJvYXJkKHRoaXMsICdEYXNoYm9hcmQnLCB7XG4gICAgICBkYXNoYm9hcmROYW1lOiBgTUFETWFsbC0ke2Vudmlyb25tZW50fS1PdmVydmlld2AsXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgdGl0bGUgd2lkZ2V0XG4gICAgZGFzaGJvYXJkLmFkZFdpZGdldHMoXG4gICAgICBuZXcgVGV4dFdpZGdldCh7XG4gICAgICAgIG1hcmtkb3duOiBgIyBNQURNYWxsICR7ZW52aXJvbm1lbnQudG9VcHBlckNhc2UoKX0gRW52aXJvbm1lbnQgRGFzaGJvYXJkXFxuXFxuUmVhbC10aW1lIG1vbml0b3JpbmcgYW5kIG9ic2VydmFiaWxpdHkgZm9yIHRoZSBNQURNYWxsIHBsYXRmb3JtLmAsXG4gICAgICAgIHdpZHRoOiAyNCxcbiAgICAgICAgaGVpZ2h0OiAyLFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgLy8gQVBJIEdhdGV3YXkgbWV0cmljc1xuICAgIHRoaXMuYWRkQXBpR2F0ZXdheVdpZGdldHMoZGFzaGJvYXJkLCByZXN0QXBpLCBlbnZpcm9ubWVudCk7XG5cbiAgICAvLyBMYW1iZGEgZnVuY3Rpb24gbWV0cmljc1xuICAgIHRoaXMuYWRkTGFtYmRhV2lkZ2V0cyhkYXNoYm9hcmQsIGxhbWJkYUZ1bmN0aW9ucywgZW52aXJvbm1lbnQpO1xuXG4gICAgLy8gRHluYW1vREIgbWV0cmljc1xuICAgIHRoaXMuYWRkRHluYW1vRGJXaWRnZXRzKGRhc2hib2FyZCwgZHluYW1vVGFibGUsIGVudmlyb25tZW50KTtcblxuICAgIC8vIENvZ25pdG8gbWV0cmljc1xuICAgIHRoaXMuYWRkQ29nbml0b1dpZGdldHMoZGFzaGJvYXJkLCB1c2VyUG9vbCwgZW52aXJvbm1lbnQpO1xuXG4gICAgLy8gRXJyb3IgYW5kIHBlcmZvcm1hbmNlIHdpZGdldHNcbiAgICB0aGlzLmFkZEVycm9yQW5kUGVyZm9ybWFuY2VXaWRnZXRzKGRhc2hib2FyZCwgZW52aXJvbm1lbnQpO1xuXG4gICAgLy8gQ29zdCBhbmQgdXNhZ2Ugd2lkZ2V0c1xuICAgIHRoaXMuYWRkQ29zdEFuZFVzYWdlV2lkZ2V0cyhkYXNoYm9hcmQsIGVudmlyb25tZW50KTtcblxuICAgIFRhZ3Mub2YoZGFzaGJvYXJkKS5hZGQoJ05hbWUnLCBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS1kYXNoYm9hcmRgKTtcbiAgICBUYWdzLm9mKGRhc2hib2FyZCkuYWRkKCdFbnZpcm9ubWVudCcsIGVudmlyb25tZW50KTtcblxuICAgIHJldHVybiBkYXNoYm9hcmQ7XG4gIH1cblxuICBwcml2YXRlIGFkZEFwaUdhdGV3YXlXaWRnZXRzKGRhc2hib2FyZDogRGFzaGJvYXJkLCByZXN0QXBpOiBSZXN0QXBpLCBlbnZpcm9ubWVudDogc3RyaW5nKTogdm9pZCB7XG4gICAgZGFzaGJvYXJkLmFkZFdpZGdldHMoXG4gICAgICBuZXcgVGV4dFdpZGdldCh7XG4gICAgICAgIG1hcmtkb3duOiAnIyMgQVBJIEdhdGV3YXkgTWV0cmljcycsXG4gICAgICAgIHdpZHRoOiAyNCxcbiAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgLy8gQVBJIEdhdGV3YXkgcmVxdWVzdCBjb3VudCBhbmQgbGF0ZW5jeVxuICAgIGRhc2hib2FyZC5hZGRXaWRnZXRzKFxuICAgICAgbmV3IEdyYXBoV2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdBUEkgUmVxdWVzdHMnLFxuICAgICAgICBsZWZ0OiBbXG4gICAgICAgICAgbmV3IE1ldHJpYyh7XG4gICAgICAgICAgICBuYW1lc3BhY2U6ICdBV1MvQXBpR2F0ZXdheScsXG4gICAgICAgICAgICBtZXRyaWNOYW1lOiAnQ291bnQnLFxuICAgICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgICBBcGlOYW1lOiByZXN0QXBpLnJlc3RBcGlOYW1lLFxuICAgICAgICAgICAgICBTdGFnZTogZW52aXJvbm1lbnQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RhdGlzdGljOiAnU3VtJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgICAgd2lkdGg6IDEyLFxuICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICB9KSxcbiAgICAgIG5ldyBHcmFwaFdpZGdldCh7XG4gICAgICAgIHRpdGxlOiAnQVBJIExhdGVuY3knLFxuICAgICAgICBsZWZ0OiBbXG4gICAgICAgICAgbmV3IE1ldHJpYyh7XG4gICAgICAgICAgICBuYW1lc3BhY2U6ICdBV1MvQXBpR2F0ZXdheScsXG4gICAgICAgICAgICBtZXRyaWNOYW1lOiAnTGF0ZW5jeScsXG4gICAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICAgIEFwaU5hbWU6IHJlc3RBcGkucmVzdEFwaU5hbWUsXG4gICAgICAgICAgICAgIFN0YWdlOiBlbnZpcm9ubWVudCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGF0aXN0aWM6ICdBdmVyYWdlJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgICAgd2lkdGg6IDEyLFxuICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICB9KVxuICAgICk7XG5cbiAgICAvLyBBUEkgR2F0ZXdheSBlcnJvcnNcbiAgICBkYXNoYm9hcmQuYWRkV2lkZ2V0cyhcbiAgICAgIG5ldyBHcmFwaFdpZGdldCh7XG4gICAgICAgIHRpdGxlOiAnQVBJIEVycm9ycycsXG4gICAgICAgIGxlZnQ6IFtcbiAgICAgICAgICBuZXcgTWV0cmljKHtcbiAgICAgICAgICAgIG5hbWVzcGFjZTogJ0FXUy9BcGlHYXRld2F5JyxcbiAgICAgICAgICAgIG1ldHJpY05hbWU6ICc0WFhFcnJvcicsXG4gICAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICAgIEFwaU5hbWU6IHJlc3RBcGkucmVzdEFwaU5hbWUsXG4gICAgICAgICAgICAgIFN0YWdlOiBlbnZpcm9ubWVudCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIG5ldyBNZXRyaWMoe1xuICAgICAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0FwaUdhdGV3YXknLFxuICAgICAgICAgICAgbWV0cmljTmFtZTogJzVYWEVycm9yJyxcbiAgICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICAgICAgQXBpTmFtZTogcmVzdEFwaS5yZXN0QXBpTmFtZSxcbiAgICAgICAgICAgICAgU3RhZ2U6IGVudmlyb25tZW50LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICAgIHdpZHRoOiAxMixcbiAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgfSksXG4gICAgICBuZXcgU2luZ2xlVmFsdWVXaWRnZXQoe1xuICAgICAgICB0aXRsZTogJ0FQSSBTdWNjZXNzIFJhdGUnLFxuICAgICAgICBtZXRyaWNzOiBbXG4gICAgICAgICAgbmV3IE1ldHJpYyh7XG4gICAgICAgICAgICBuYW1lc3BhY2U6ICdBV1MvQXBpR2F0ZXdheScsXG4gICAgICAgICAgICBtZXRyaWNOYW1lOiAnQ291bnQnLFxuICAgICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgICBBcGlOYW1lOiByZXN0QXBpLnJlc3RBcGlOYW1lLFxuICAgICAgICAgICAgICBTdGFnZTogZW52aXJvbm1lbnQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RhdGlzdGljOiAnU3VtJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgICAgd2lkdGg6IDEyLFxuICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGFkZExhbWJkYVdpZGdldHMoZGFzaGJvYXJkOiBEYXNoYm9hcmQsIGxhbWJkYUZ1bmN0aW9uczogTGFtYmRhRnVuY3Rpb25bXSwgZW52aXJvbm1lbnQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGRhc2hib2FyZC5hZGRXaWRnZXRzKFxuICAgICAgbmV3IFRleHRXaWRnZXQoe1xuICAgICAgICBtYXJrZG93bjogJyMjIExhbWJkYSBGdW5jdGlvbiBNZXRyaWNzJyxcbiAgICAgICAgd2lkdGg6IDI0LFxuICAgICAgICBoZWlnaHQ6IDEsXG4gICAgICB9KVxuICAgICk7XG5cbiAgICAvLyBMYW1iZGEgaW52b2NhdGlvbnMgYW5kIGR1cmF0aW9uXG4gICAgY29uc3QgaW52b2NhdGlvbk1ldHJpY3MgPSBsYW1iZGFGdW5jdGlvbnMubWFwKGZuID0+IFxuICAgICAgbmV3IE1ldHJpYyh7XG4gICAgICAgIG5hbWVzcGFjZTogJ0FXUy9MYW1iZGEnLFxuICAgICAgICBtZXRyaWNOYW1lOiAnSW52b2NhdGlvbnMnLFxuICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgRnVuY3Rpb25OYW1lOiBmbi5mdW5jdGlvbk5hbWUsXG4gICAgICAgIH0sXG4gICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICB9KVxuICAgICk7XG5cbiAgICBjb25zdCBkdXJhdGlvbk1ldHJpY3MgPSBsYW1iZGFGdW5jdGlvbnMubWFwKGZuID0+IFxuICAgICAgbmV3IE1ldHJpYyh7XG4gICAgICAgIG5hbWVzcGFjZTogJ0FXUy9MYW1iZGEnLFxuICAgICAgICBtZXRyaWNOYW1lOiAnRHVyYXRpb24nLFxuICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgRnVuY3Rpb25OYW1lOiBmbi5mdW5jdGlvbk5hbWUsXG4gICAgICAgIH0sXG4gICAgICAgIHN0YXRpc3RpYzogJ0F2ZXJhZ2UnLFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgZGFzaGJvYXJkLmFkZFdpZGdldHMoXG4gICAgICBuZXcgR3JhcGhXaWRnZXQoe1xuICAgICAgICB0aXRsZTogJ0xhbWJkYSBJbnZvY2F0aW9ucycsXG4gICAgICAgIGxlZnQ6IGludm9jYXRpb25NZXRyaWNzLFxuICAgICAgICB3aWR0aDogMTIsXG4gICAgICAgIGhlaWdodDogNixcbiAgICAgIH0pLFxuICAgICAgbmV3IEdyYXBoV2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdMYW1iZGEgRHVyYXRpb24nLFxuICAgICAgICBsZWZ0OiBkdXJhdGlvbk1ldHJpY3MsXG4gICAgICAgIHdpZHRoOiAxMixcbiAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgLy8gTGFtYmRhIGVycm9ycyBhbmQgdGhyb3R0bGVzXG4gICAgY29uc3QgZXJyb3JNZXRyaWNzID0gbGFtYmRhRnVuY3Rpb25zLm1hcChmbiA9PiBcbiAgICAgIG5ldyBNZXRyaWMoe1xuICAgICAgICBuYW1lc3BhY2U6ICdBV1MvTGFtYmRhJyxcbiAgICAgICAgbWV0cmljTmFtZTogJ0Vycm9ycycsXG4gICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICBGdW5jdGlvbk5hbWU6IGZuLmZ1bmN0aW9uTmFtZSxcbiAgICAgICAgfSxcbiAgICAgICAgc3RhdGlzdGljOiAnU3VtJyxcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIGNvbnN0IHRocm90dGxlTWV0cmljcyA9IGxhbWJkYUZ1bmN0aW9ucy5tYXAoZm4gPT4gXG4gICAgICBuZXcgTWV0cmljKHtcbiAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0xhbWJkYScsXG4gICAgICAgIG1ldHJpY05hbWU6ICdUaHJvdHRsZXMnLFxuICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgRnVuY3Rpb25OYW1lOiBmbi5mdW5jdGlvbk5hbWUsXG4gICAgICAgIH0sXG4gICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICB9KVxuICAgICk7XG5cbiAgICBkYXNoYm9hcmQuYWRkV2lkZ2V0cyhcbiAgICAgIG5ldyBHcmFwaFdpZGdldCh7XG4gICAgICAgIHRpdGxlOiAnTGFtYmRhIEVycm9ycycsXG4gICAgICAgIGxlZnQ6IGVycm9yTWV0cmljcyxcbiAgICAgICAgd2lkdGg6IDEyLFxuICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICB9KSxcbiAgICAgIG5ldyBHcmFwaFdpZGdldCh7XG4gICAgICAgIHRpdGxlOiAnTGFtYmRhIFRocm90dGxlcycsXG4gICAgICAgIGxlZnQ6IHRocm90dGxlTWV0cmljcyxcbiAgICAgICAgd2lkdGg6IDEyLFxuICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIGFkZER5bmFtb0RiV2lkZ2V0cyhkYXNoYm9hcmQ6IERhc2hib2FyZCwgZHluYW1vVGFibGU6IFRhYmxlLCBlbnZpcm9ubWVudDogc3RyaW5nKTogdm9pZCB7XG4gICAgZGFzaGJvYXJkLmFkZFdpZGdldHMoXG4gICAgICBuZXcgVGV4dFdpZGdldCh7XG4gICAgICAgIG1hcmtkb3duOiAnIyMgRHluYW1vREIgTWV0cmljcycsXG4gICAgICAgIHdpZHRoOiAyNCxcbiAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgLy8gRHluYW1vREIgcmVhZC93cml0ZSBjYXBhY2l0eSBhbmQgdGhyb3R0bGVzXG4gICAgZGFzaGJvYXJkLmFkZFdpZGdldHMoXG4gICAgICBuZXcgR3JhcGhXaWRnZXQoe1xuICAgICAgICB0aXRsZTogJ0R5bmFtb0RCIFJlYWQvV3JpdGUgT3BlcmF0aW9ucycsXG4gICAgICAgIGxlZnQ6IFtcbiAgICAgICAgICBuZXcgTWV0cmljKHtcbiAgICAgICAgICAgIG5hbWVzcGFjZTogJ0FXUy9EeW5hbW9EQicsXG4gICAgICAgICAgICBtZXRyaWNOYW1lOiAnQ29uc3VtZWRSZWFkQ2FwYWNpdHlVbml0cycsXG4gICAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICAgIFRhYmxlTmFtZTogZHluYW1vVGFibGUudGFibGVOYW1lLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IE1ldHJpYyh7XG4gICAgICAgICAgICBuYW1lc3BhY2U6ICdBV1MvRHluYW1vREInLFxuICAgICAgICAgICAgbWV0cmljTmFtZTogJ0NvbnN1bWVkV3JpdGVDYXBhY2l0eVVuaXRzJyxcbiAgICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICAgICAgVGFibGVOYW1lOiBkeW5hbW9UYWJsZS50YWJsZU5hbWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RhdGlzdGljOiAnU3VtJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgICAgd2lkdGg6IDEyLFxuICAgICAgICBoZWlnaHQ6IDYsXG4gICAgICB9KSxcbiAgICAgIG5ldyBHcmFwaFdpZGdldCh7XG4gICAgICAgIHRpdGxlOiAnRHluYW1vREIgVGhyb3R0bGVzJyxcbiAgICAgICAgbGVmdDogW1xuICAgICAgICAgIG5ldyBNZXRyaWMoe1xuICAgICAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0R5bmFtb0RCJyxcbiAgICAgICAgICAgIG1ldHJpY05hbWU6ICdSZWFkVGhyb3R0bGVzJyxcbiAgICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICAgICAgVGFibGVOYW1lOiBkeW5hbW9UYWJsZS50YWJsZU5hbWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RhdGlzdGljOiAnU3VtJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBuZXcgTWV0cmljKHtcbiAgICAgICAgICAgIG5hbWVzcGFjZTogJ0FXUy9EeW5hbW9EQicsXG4gICAgICAgICAgICBtZXRyaWNOYW1lOiAnV3JpdGVUaHJvdHRsZXMnLFxuICAgICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgICBUYWJsZU5hbWU6IGR5bmFtb1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgICB3aWR0aDogMTIsXG4gICAgICAgIGhlaWdodDogNixcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkQ29nbml0b1dpZGdldHMoZGFzaGJvYXJkOiBEYXNoYm9hcmQsIHVzZXJQb29sOiBVc2VyUG9vbCwgZW52aXJvbm1lbnQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGRhc2hib2FyZC5hZGRXaWRnZXRzKFxuICAgICAgbmV3IFRleHRXaWRnZXQoe1xuICAgICAgICBtYXJrZG93bjogJyMjIEF1dGhlbnRpY2F0aW9uIE1ldHJpY3MnLFxuICAgICAgICB3aWR0aDogMjQsXG4gICAgICAgIGhlaWdodDogMSxcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIC8vIENvZ25pdG8gc2lnbi1pbnMgYW5kIHNpZ24tdXBzXG4gICAgZGFzaGJvYXJkLmFkZFdpZGdldHMoXG4gICAgICBuZXcgR3JhcGhXaWRnZXQoe1xuICAgICAgICB0aXRsZTogJ1VzZXIgQXV0aGVudGljYXRpb24nLFxuICAgICAgICBsZWZ0OiBbXG4gICAgICAgICAgbmV3IE1ldHJpYyh7XG4gICAgICAgICAgICBuYW1lc3BhY2U6ICdBV1MvQ29nbml0bycsXG4gICAgICAgICAgICBtZXRyaWNOYW1lOiAnU2lnbkluU3VjY2Vzc2VzJyxcbiAgICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICAgICAgVXNlclBvb2w6IHVzZXJQb29sLnVzZXJQb29sSWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RhdGlzdGljOiAnU3VtJyxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBuZXcgTWV0cmljKHtcbiAgICAgICAgICAgIG5hbWVzcGFjZTogJ0FXUy9Db2duaXRvJyxcbiAgICAgICAgICAgIG1ldHJpY05hbWU6ICdTaWduVXBTdWNjZXNzZXMnLFxuICAgICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgICBVc2VyUG9vbDogdXNlclBvb2wudXNlclBvb2xJZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgICAgIH0pLFxuICAgICAgICBdLFxuICAgICAgICB3aWR0aDogMTIsXG4gICAgICAgIGhlaWdodDogNixcbiAgICAgIH0pLFxuICAgICAgbmV3IEdyYXBoV2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdBdXRoZW50aWNhdGlvbiBGYWlsdXJlcycsXG4gICAgICAgIGxlZnQ6IFtcbiAgICAgICAgICBuZXcgTWV0cmljKHtcbiAgICAgICAgICAgIG5hbWVzcGFjZTogJ0FXUy9Db2duaXRvJyxcbiAgICAgICAgICAgIG1ldHJpY05hbWU6ICdTaWduSW5GYWlsdXJlcycsXG4gICAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICAgIFVzZXJQb29sOiB1c2VyUG9vbC51c2VyUG9vbElkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICAgIHdpZHRoOiAxMixcbiAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRFcnJvckFuZFBlcmZvcm1hbmNlV2lkZ2V0cyhkYXNoYm9hcmQ6IERhc2hib2FyZCwgZW52aXJvbm1lbnQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGRhc2hib2FyZC5hZGRXaWRnZXRzKFxuICAgICAgbmV3IFRleHRXaWRnZXQoe1xuICAgICAgICBtYXJrZG93bjogJyMjIEVycm9yIFRyYWNraW5nIGFuZCBQZXJmb3JtYW5jZScsXG4gICAgICAgIHdpZHRoOiAyNCxcbiAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgLy8gTG9nLWJhc2VkIGVycm9yIHRyYWNraW5nXG4gICAgZGFzaGJvYXJkLmFkZFdpZGdldHMoXG4gICAgICBuZXcgTG9nUXVlcnlXaWRnZXQoe1xuICAgICAgICB0aXRsZTogJ1JlY2VudCBFcnJvcnMnLFxuICAgICAgICBsb2dHcm91cE5hbWVzOiBbYC9hd3MvbGFtYmRhL21hZG1hbGwtJHtlbnZpcm9ubWVudH0tKmBdLFxuICAgICAgICBxdWVyeUxpbmVzOiBbXG4gICAgICAgICAgJ2ZpZWxkcyBAdGltZXN0YW1wLCBAbWVzc2FnZScsXG4gICAgICAgICAgJ2ZpbHRlciBAbWVzc2FnZSBsaWtlIC9FUlJPUi8nLFxuICAgICAgICAgICdzb3J0IEB0aW1lc3RhbXAgZGVzYycsXG4gICAgICAgICAgJ2xpbWl0IDEwMCcsXG4gICAgICAgIF0sXG4gICAgICAgIHdpZHRoOiAyNCxcbiAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRDb3N0QW5kVXNhZ2VXaWRnZXRzKGRhc2hib2FyZDogRGFzaGJvYXJkLCBlbnZpcm9ubWVudDogc3RyaW5nKTogdm9pZCB7XG4gICAgZGFzaGJvYXJkLmFkZFdpZGdldHMoXG4gICAgICBuZXcgVGV4dFdpZGdldCh7XG4gICAgICAgIG1hcmtkb3duOiAnIyMgQ29zdCBhbmQgVXNhZ2UgT3B0aW1pemF0aW9uJyxcbiAgICAgICAgd2lkdGg6IDI0LFxuICAgICAgICBoZWlnaHQ6IDEsXG4gICAgICB9KVxuICAgICk7XG5cbiAgICAvLyBDb3N0IG1ldHJpY3MgKHRoZXNlIHdvdWxkIG5lZWQgdG8gYmUgY29uZmlndXJlZCB3aXRoIENvc3QgRXhwbG9yZXIgQVBJKVxuICAgIGRhc2hib2FyZC5hZGRXaWRnZXRzKFxuICAgICAgbmV3IFNpbmdsZVZhbHVlV2lkZ2V0KHtcbiAgICAgICAgdGl0bGU6ICdFc3RpbWF0ZWQgRGFpbHkgQ29zdCcsXG4gICAgICAgIG1ldHJpY3M6IFtcbiAgICAgICAgICAvLyBQbGFjZWhvbGRlciAtIHdvdWxkIG5lZWQgYWN0dWFsIGNvc3QgbWV0cmljc1xuICAgICAgICAgIG5ldyBNZXRyaWMoe1xuICAgICAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0JpbGxpbmcnLFxuICAgICAgICAgICAgbWV0cmljTmFtZTogJ0VzdGltYXRlZENoYXJnZXMnLFxuICAgICAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgICAgICBDdXJyZW5jeTogJ1VTRCcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RhdGlzdGljOiAnTWF4aW11bScsXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICAgIHdpZHRoOiAxMixcbiAgICAgICAgaGVpZ2h0OiA2LFxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVBbGFybXMoXG4gICAgZW52aXJvbm1lbnQ6IHN0cmluZyxcbiAgICBsYW1iZGFGdW5jdGlvbnM6IExhbWJkYUZ1bmN0aW9uW10sXG4gICAgcmVzdEFwaTogUmVzdEFwaSxcbiAgICBkeW5hbW9UYWJsZTogVGFibGVcbiAgKTogdm9pZCB7XG4gICAgLy8gQVBJIEdhdGV3YXkgYWxhcm1zXG4gICAgY29uc3QgYXBpRXJyb3JBbGFybSA9IG5ldyBBbGFybSh0aGlzLCAnQXBpRXJyb3JBbGFybScsIHtcbiAgICAgIGFsYXJtTmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tYXBpLWVycm9yc2AsXG4gICAgICBhbGFybURlc2NyaXB0aW9uOiAnSGlnaCBlcnJvciByYXRlIGluIEFQSSBHYXRld2F5JyxcbiAgICAgIG1ldHJpYzogbmV3IE1ldHJpYyh7XG4gICAgICAgIG5hbWVzcGFjZTogJ0FXUy9BcGlHYXRld2F5JyxcbiAgICAgICAgbWV0cmljTmFtZTogJzVYWEVycm9yJyxcbiAgICAgICAgZGltZW5zaW9uc01hcDoge1xuICAgICAgICAgIEFwaU5hbWU6IHJlc3RBcGkucmVzdEFwaU5hbWUsXG4gICAgICAgICAgU3RhZ2U6IGVudmlyb25tZW50LFxuICAgICAgICB9LFxuICAgICAgICBzdGF0aXN0aWM6ICdTdW0nLFxuICAgICAgfSksXG4gICAgICB0aHJlc2hvbGQ6IDEwLFxuICAgICAgZXZhbHVhdGlvblBlcmlvZHM6IDIsXG4gICAgICBjb21wYXJpc29uT3BlcmF0b3I6IENvbXBhcmlzb25PcGVyYXRvci5HUkVBVEVSX1RIQU5fVEhSRVNIT0xELFxuICAgICAgdHJlYXRNaXNzaW5nRGF0YTogVHJlYXRNaXNzaW5nRGF0YS5OT1RfQlJFQUNISU5HLFxuICAgIH0pO1xuXG4gICAgYXBpRXJyb3JBbGFybS5hZGRBbGFybUFjdGlvbihuZXcgU25zQWN0aW9uKHRoaXMuYWxlcnRUb3BpYykpO1xuICAgIHRoaXMuYWxhcm1zLnB1c2goYXBpRXJyb3JBbGFybSk7XG5cbiAgICAvLyBMYW1iZGEgZnVuY3Rpb24gYWxhcm1zXG4gICAgbGFtYmRhRnVuY3Rpb25zLmZvckVhY2goKGZuLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgZXJyb3JBbGFybSA9IG5ldyBBbGFybSh0aGlzLCBgTGFtYmRhRXJyb3JBbGFybSR7aW5kZXh9YCwge1xuICAgICAgICBhbGFybU5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWxhbWJkYS0ke2ZuLmZ1bmN0aW9uTmFtZX0tZXJyb3JzYCxcbiAgICAgICAgYWxhcm1EZXNjcmlwdGlvbjogYEhpZ2ggZXJyb3IgcmF0ZSBpbiBMYW1iZGEgZnVuY3Rpb24gJHtmbi5mdW5jdGlvbk5hbWV9YCxcbiAgICAgICAgbWV0cmljOiBuZXcgTWV0cmljKHtcbiAgICAgICAgICBuYW1lc3BhY2U6ICdBV1MvTGFtYmRhJyxcbiAgICAgICAgICBtZXRyaWNOYW1lOiAnRXJyb3JzJyxcbiAgICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgICBGdW5jdGlvbk5hbWU6IGZuLmZ1bmN0aW9uTmFtZSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICAgIH0pLFxuICAgICAgICB0aHJlc2hvbGQ6IDUsXG4gICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiAyLFxuICAgICAgICBjb21wYXJpc29uT3BlcmF0b3I6IENvbXBhcmlzb25PcGVyYXRvci5HUkVBVEVSX1RIQU5fVEhSRVNIT0xELFxuICAgICAgICB0cmVhdE1pc3NpbmdEYXRhOiBUcmVhdE1pc3NpbmdEYXRhLk5PVF9CUkVBQ0hJTkcsXG4gICAgICB9KTtcblxuICAgICAgZXJyb3JBbGFybS5hZGRBbGFybUFjdGlvbihuZXcgU25zQWN0aW9uKHRoaXMuYWxlcnRUb3BpYykpO1xuICAgICAgdGhpcy5hbGFybXMucHVzaChlcnJvckFsYXJtKTtcblxuICAgICAgY29uc3QgZHVyYXRpb25BbGFybSA9IG5ldyBBbGFybSh0aGlzLCBgTGFtYmRhRHVyYXRpb25BbGFybSR7aW5kZXh9YCwge1xuICAgICAgICBhbGFybU5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWxhbWJkYS0ke2ZuLmZ1bmN0aW9uTmFtZX0tZHVyYXRpb25gLFxuICAgICAgICBhbGFybURlc2NyaXB0aW9uOiBgSGlnaCBkdXJhdGlvbiBpbiBMYW1iZGEgZnVuY3Rpb24gJHtmbi5mdW5jdGlvbk5hbWV9YCxcbiAgICAgICAgbWV0cmljOiBuZXcgTWV0cmljKHtcbiAgICAgICAgICBuYW1lc3BhY2U6ICdBV1MvTGFtYmRhJyxcbiAgICAgICAgICBtZXRyaWNOYW1lOiAnRHVyYXRpb24nLFxuICAgICAgICAgIGRpbWVuc2lvbnNNYXA6IHtcbiAgICAgICAgICAgIEZ1bmN0aW9uTmFtZTogZm4uZnVuY3Rpb25OYW1lLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgc3RhdGlzdGljOiAnQXZlcmFnZScsXG4gICAgICAgIH0pLFxuICAgICAgICB0aHJlc2hvbGQ6IDEwMDAwLCAvLyAxMCBzZWNvbmRzXG4gICAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiAzLFxuICAgICAgICBjb21wYXJpc29uT3BlcmF0b3I6IENvbXBhcmlzb25PcGVyYXRvci5HUkVBVEVSX1RIQU5fVEhSRVNIT0xELFxuICAgICAgICB0cmVhdE1pc3NpbmdEYXRhOiBUcmVhdE1pc3NpbmdEYXRhLk5PVF9CUkVBQ0hJTkcsXG4gICAgICB9KTtcblxuICAgICAgZHVyYXRpb25BbGFybS5hZGRBbGFybUFjdGlvbihuZXcgU25zQWN0aW9uKHRoaXMuYWxlcnRUb3BpYykpO1xuICAgICAgdGhpcy5hbGFybXMucHVzaChkdXJhdGlvbkFsYXJtKTtcbiAgICB9KTtcblxuICAgIC8vIER5bmFtb0RCIGFsYXJtc1xuICAgIGNvbnN0IGR5bmFtb1Rocm90dGxlQWxhcm0gPSBuZXcgQWxhcm0odGhpcywgJ0R5bmFtb1Rocm90dGxlQWxhcm0nLCB7XG4gICAgICBhbGFybU5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWR5bmFtby10aHJvdHRsZXNgLFxuICAgICAgYWxhcm1EZXNjcmlwdGlvbjogJ0R5bmFtb0RCIHRocm90dGxpbmcgZGV0ZWN0ZWQnLFxuICAgICAgbWV0cmljOiBuZXcgTWV0cmljKHtcbiAgICAgICAgbmFtZXNwYWNlOiAnQVdTL0R5bmFtb0RCJyxcbiAgICAgICAgbWV0cmljTmFtZTogJ1JlYWRUaHJvdHRsZXMnLFxuICAgICAgICBkaW1lbnNpb25zTWFwOiB7XG4gICAgICAgICAgVGFibGVOYW1lOiBkeW5hbW9UYWJsZS50YWJsZU5hbWUsXG4gICAgICAgIH0sXG4gICAgICAgIHN0YXRpc3RpYzogJ1N1bScsXG4gICAgICB9KSxcbiAgICAgIHRocmVzaG9sZDogMSxcbiAgICAgIGV2YWx1YXRpb25QZXJpb2RzOiAxLFxuICAgICAgY29tcGFyaXNvbk9wZXJhdG9yOiBDb21wYXJpc29uT3BlcmF0b3IuR1JFQVRFUl9USEFOX09SX0VRVUFMX1RPX1RIUkVTSE9MRCxcbiAgICAgIHRyZWF0TWlzc2luZ0RhdGE6IFRyZWF0TWlzc2luZ0RhdGEuTk9UX0JSRUFDSElORyxcbiAgICB9KTtcblxuICAgIGR5bmFtb1Rocm90dGxlQWxhcm0uYWRkQWxhcm1BY3Rpb24obmV3IFNuc0FjdGlvbih0aGlzLmFsZXJ0VG9waWMpKTtcbiAgICB0aGlzLmFsYXJtcy5wdXNoKGR5bmFtb1Rocm90dGxlQWxhcm0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVDdXN0b21NZXRyaWNzKGVudmlyb25tZW50OiBzdHJpbmcsIGxhbWJkYUZ1bmN0aW9uczogTGFtYmRhRnVuY3Rpb25bXSk6IHZvaWQge1xuICAgIC8vIENyZWF0ZSBjdXN0b20gbWV0cmljIGZpbHRlcnMgZm9yIGFwcGxpY2F0aW9uLXNwZWNpZmljIG1ldHJpY3NcbiAgICBsYW1iZGFGdW5jdGlvbnMuZm9yRWFjaCgoZm4sIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBsb2dHcm91cCA9IExvZ0dyb3VwLmZyb21Mb2dHcm91cE5hbWUoXG4gICAgICAgIHRoaXMsXG4gICAgICAgIGBMYW1iZGFMb2dHcm91cCR7aW5kZXh9YCxcbiAgICAgICAgYC9hd3MvbGFtYmRhLyR7Zm4uZnVuY3Rpb25OYW1lfWBcbiAgICAgICk7XG5cbiAgICAgIC8vIEJ1c2luZXNzIGxvZ2ljIGVycm9yIG1ldHJpY1xuICAgICAgbmV3IE1ldHJpY0ZpbHRlcih0aGlzLCBgQnVzaW5lc3NFcnJvck1ldHJpYyR7aW5kZXh9YCwge1xuICAgICAgICBsb2dHcm91cCxcbiAgICAgICAgbWV0cmljTmFtZXNwYWNlOiAnTUFETWFsbC9BcHBsaWNhdGlvbicsXG4gICAgICAgIG1ldHJpY05hbWU6ICdCdXNpbmVzc0xvZ2ljRXJyb3JzJyxcbiAgICAgICAgZmlsdGVyUGF0dGVybjogRmlsdGVyUGF0dGVybi5zdHJpbmdWYWx1ZSgnJC5sZXZlbCcsICc9JywgJ0VSUk9SJyksXG4gICAgICAgIG1ldHJpY1ZhbHVlOiAnMScsXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogMCxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBVc2VyIGFjdGlvbiBtZXRyaWNcbiAgICAgIG5ldyBNZXRyaWNGaWx0ZXIodGhpcywgYFVzZXJBY3Rpb25NZXRyaWMke2luZGV4fWAsIHtcbiAgICAgICAgbG9nR3JvdXAsXG4gICAgICAgIG1ldHJpY05hbWVzcGFjZTogJ01BRE1hbGwvQXBwbGljYXRpb24nLFxuICAgICAgICBtZXRyaWNOYW1lOiAnVXNlckFjdGlvbnMnLFxuICAgICAgICBmaWx0ZXJQYXR0ZXJuOiBGaWx0ZXJQYXR0ZXJuLnN0cmluZ1ZhbHVlKCckLmV2ZW50VHlwZScsICc9JywgJ1VTRVJfQUNUSU9OJyksXG4gICAgICAgIG1ldHJpY1ZhbHVlOiAnMScsXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogMCxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVTeW50aGV0aWNzQ2FuYXJ5KGVudmlyb25tZW50OiBzdHJpbmcsIGhlYWx0aENoZWNrVXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBLTVMga2V5IGZvciBTeW50aGV0aWNzIGFydGlmYWN0cyBidWNrZXRcbiAgICBjb25zdCBjYW5hcnlLbXNLZXkgPSBuZXcgS2V5KHRoaXMsICdTeW50aGV0aWNzS21zS2V5Jywge1xuICAgICAgZGVzY3JpcHRpb246IGBNQURNYWxsICR7ZW52aXJvbm1lbnR9IEtNUyBrZXkgZm9yIFN5bnRoZXRpY3MgYXJ0aWZhY3RzYCxcbiAgICAgIGVuYWJsZUtleVJvdGF0aW9uOiB0cnVlLFxuICAgICAga2V5VXNhZ2U6IEtleVVzYWdlLkVOQ1JZUFRfREVDUllQVCxcbiAgICAgIGtleVNwZWM6IEtleVNwZWMuU1lNTUVUUklDX0RFRkFVTFQsXG4gICAgICByZW1vdmFsUG9saWN5OiBlbnZpcm9ubWVudCA9PT0gJ3Byb2QnID8gUmVtb3ZhbFBvbGljeS5SRVRBSU4gOiBSZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG5cbiAgICBjb25zdCBhcnRpZmFjdHNCdWNrZXQgPSBuZXcgQnVja2V0KHRoaXMsICdTeW50aGV0aWNzQnVja2V0Jywge1xuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IEJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcbiAgICAgIGVuZm9yY2VTU0w6IHRydWUsXG4gICAgICBlbmNyeXB0aW9uOiBCdWNrZXRFbmNyeXB0aW9uLktNUyxcbiAgICAgIGVuY3J5cHRpb25LZXk6IGNhbmFyeUttc0tleSxcbiAgICAgIHZlcnNpb25lZDogdHJ1ZSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGVudmlyb25tZW50ID09PSAncHJvZCcgPyBSZW1vdmFsUG9saWN5LlJFVEFJTiA6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIGF1dG9EZWxldGVPYmplY3RzOiBlbnZpcm9ubWVudCAhPT0gJ3Byb2QnLFxuICAgIH0pO1xuXG4gICAgY29uc3QgY2FuYXJ5ID0gbmV3IENhbmFyeSh0aGlzLCAnSGVhbHRoQ2FuYXJ5Jywge1xuICAgICAgY2FuYXJ5TmFtZTogYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0taGVhbHRoYCxcbiAgICAgIHNjaGVkdWxlOiBTeW50aGV0aWNzU2NoZWR1bGUucmF0ZShEdXJhdGlvbi5taW51dGVzKDUpKSxcbiAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuU1lOVEhFVElDU19OT0RFSlNfUFVQUEVURUVSXzZfMixcbiAgICAgIHRlc3Q6IFRlc3QuY3VzdG9tKHtcbiAgICAgICAgY29kZTogU3ludGhldGljc0NvZGUuZnJvbUlubGluZShgY29uc3Qgc3ludGhldGljcyA9IHJlcXVpcmUoJ1N5bnRoZXRpY3MnKTtcbmNvbnN0IGxvZyA9IHJlcXVpcmUoJ1N5bnRoZXRpY3NMb2dnZXInKTtcbmNvbnN0IGh0dHBzID0gcmVxdWlyZSgnaHR0cHMnKTtcbmNvbnN0IHVybCA9ICcke2hlYWx0aENoZWNrVXJsfSc7XG5jb25zdCByZXF1ZXN0ID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuICBsZXQgcmVxdWVzdE9wdGlvbnMgPSB7IGhvc3RuYW1lOiBuZXcgVVJMKHVybCkuaG9zdG5hbWUsIHBhdGg6IG5ldyBVUkwodXJsKS5wYXRobmFtZSwgbWV0aG9kOiAnR0VUJyB9O1xuICBsZXQgaGVhZGVycyA9IHsgJ1VzZXItQWdlbnQnOiAnTUFETWFsbC1DYW5hcnknIH07XG4gIHJlcXVlc3RPcHRpb25zWydoZWFkZXJzJ10gPSBoZWFkZXJzO1xuICBsZXQgc3RlcENvbmZpZyA9IHsgaW5jbHVkZVJlcXVlc3RIZWFkZXJzOiB0cnVlLCBpbmNsdWRlUmVzcG9uc2VIZWFkZXJzOiB0cnVlLCByZXN0cmljdGVkSGVhZGVyczogW10gfTtcbiAgYXdhaXQgc3ludGhldGljcy5leGVjdXRlSHR0cFN0ZXAoJ0hlYWx0aENoZWNrJywgcmVxdWVzdE9wdGlvbnMsIHN0ZXBDb25maWcpO1xufTtcbmV4cG9ydHMuaGFuZGxlciA9IGFzeW5jICgpID0+IHsgcmV0dXJuIGF3YWl0IHJlcXVlc3QoKTsgfTtgKSxcbiAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgfSksXG4gICAgICBlbnZpcm9ubWVudFZhcmlhYmxlczogeyBFTlZJUk9OTUVOVDogZW52aXJvbm1lbnQgfSxcbiAgICAgIGFydGlmYWN0c0J1Y2tldExvY2F0aW9uOiB7IGJ1Y2tldDogYXJ0aWZhY3RzQnVja2V0IH0sXG4gICAgICBzdGFydEFmdGVyQ3JlYXRpb246IHRydWUsXG4gICAgfSk7XG5cbiAgICBUYWdzLm9mKGNhbmFyeSkuYWRkKCdOYW1lJywgYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0taGVhbHRoLWNhbmFyeWApO1xuICAgIFRhZ3Mub2YoY2FuYXJ5KS5hZGQoJ0Vudmlyb25tZW50JywgZW52aXJvbm1lbnQpO1xuICB9XG59Il19