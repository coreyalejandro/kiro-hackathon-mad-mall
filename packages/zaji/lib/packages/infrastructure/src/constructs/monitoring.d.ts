import { Construct } from 'constructs';
import { Dashboard, Alarm } from 'aws-cdk-lib/aws-cloudwatch';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
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
export declare class MonitoringConstruct extends Construct {
    readonly dashboard: Dashboard;
    readonly alertTopic: Topic;
    readonly alarms: Alarm[];
    constructor(scope: Construct, id: string, props: MonitoringConstructProps);
    private createAlertTopic;
    private createDashboard;
    private addApiGatewayWidgets;
    private addLambdaWidgets;
    private addDynamoDbWidgets;
    private addCognitoWidgets;
    private addErrorAndPerformanceWidgets;
    private addCostAndUsageWidgets;
    private createAlarms;
    private createCustomMetrics;
    private createSyntheticsCanary;
}
