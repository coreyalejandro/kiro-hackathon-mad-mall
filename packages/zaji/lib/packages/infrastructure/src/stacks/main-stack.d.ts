import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
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
export declare class MainStack extends Stack {
    readonly networking: NetworkingConstruct;
    readonly database: DatabaseConstruct;
    readonly lambda: LambdaConstruct;
    readonly apiGateway: ApiGatewayConstruct;
    readonly authentication: AuthenticationConstruct;
    readonly monitoring: MonitoringConstruct;
    readonly security: SecurityConstruct;
    readonly storage: StorageConstruct;
    constructor(scope: Construct, id: string, props: MainStackProps);
    private getCidrForEnvironment;
    private getCorsOriginsForEnvironment;
    private getThrottleSettingsForEnvironment;
    private createOutputs;
}
